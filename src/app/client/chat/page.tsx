'use client'
// src/app/client/chat/page.tsx - Socket.io Real-Time Chat
import { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { Topbar, PageLayout, Skeleton } from '@/components/ui'
import { 
  initializeSocket, 
  getSocket, 
  disconnectSocket,
  joinConversation,
  leaveConversation,
  sendMessage as sendSocketMessage,
  onMessageReceived,
  offMessageReceived,
  sendTypingIndicator,
} from '@/lib/socket'

interface Message {
  _id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: string
  receiverId: string
  message: string
  timestamp: string
  isRead: boolean
}

interface Conversation {
  _id: string
  conversationId: string
  participants: any[]
  otherParticipant: any
  lastMessage?: string
  lastMessageAt?: string
  unreadCount: number
  isActive: boolean
}

/**
 * GENERATOR: Consistent conversation ID from two user IDs
 * Must match the backend generateConversationId function
 */
function generateConversationId(userId1: string, userId2: string): string {
  const ids = [userId1, userId2].sort()
  return ids.join('_')
}

// Safe format time helper
const formatTime = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
};

export default function ClientChatPage() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [showNewChat, setShowNewChat] = useState(false)
  const [loadingLoads, setLoadingLoads] = useState(false)
  const [availableLoads, setAvailableLoads] = useState<any[]>([])
  const [startingChat, setStartingChat] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<ReturnType<typeof getSocket>>(null)

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // FIX #1 & #2: Fetch conversations from backend
  const fetchConversations = useCallback(async () => {
    if (!session?.user?.id) return
    try {
      setLoading(true)
      const res = await fetch('/api/chat/conversations')
      const data = await res.json()
      if (data.success) {
        setConversations(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [session?.user?.id])

  // Initialize socket ONCE on page load
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id && !socketRef.current) {
      console.log('[Chat] 🔌 Initializing socket for user:', session.user.id)
      
      // Initialize socket connection
      const socket = initializeSocket(session.user.id)
      socketRef.current = socket

      // Wait for socket to connect
      const handleConnect = () => {
        console.log('[Chat] ✅ Socket connected, ready for chat')
      }

      if (socket.connected) {
        console.log('[Chat] ✅ Socket already connected')
      } else {
        socket.once('connect', handleConnect)
      }

      return () => {
        socket.off('connect', handleConnect)
      }
    }
  }, [status, session?.user?.id])

  // Fetch conversations separately
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchConversations()
    }
  }, [status, session?.user?.id, fetchConversations])

  // FIX #1: Use consistent conversation ID (sorted user IDs, not Date.now()!)
  const fetchMessages = useCallback(async () => {
    if (!selectedConversation?.conversationId) return
    try {
      const res = await fetch(
        `/api/chat/messages?conversationId=${selectedConversation.conversationId}`
      )
      const data = await res.json()
      if (data.success) {
        setMessages(data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    }
  }, [selectedConversation?.conversationId])

  // Listen for socket messages when conversation selected
  useEffect(() => {
    if (selectedConversation && socketRef.current?.connected) {
      console.log('[Chat] 💬 Setting up conversation:', selectedConversation.conversationId)
      console.log('[Chat] ✅ Socket connected:', socketRef.current?.connected)
      
      // Fetch initial messages
      fetchMessages()

      // Join conversation room immediately
      joinConversation(selectedConversation.conversationId)

      // Set up message listener
      const handleNewMessage = (messageData: any) => {
        console.log('[Chat] 📨 Received message in UI:', messageData)
        setMessages((prev) => {
          const exists = prev.some((m) => m._id === messageData._id)
          if (exists) {
            console.log('[Chat] ⚠️ Duplicate message, skipping')
            return prev
          }

          if (messageData.senderId === session?.user?.id) {
            return prev.map((m) =>
              m._id.startsWith('temp-') &&
              m.message === messageData.message &&
              m.senderId === session?.user?.id
                ? messageData
                : m
            )
          }

          console.log('[Chat] ✅ Adding new message to UI')
          return [...prev, messageData]
        })
        scrollToBottom()
      }

      onMessageReceived(handleNewMessage)

      return () => {
        console.log('[Chat] 🧹 Cleaning up conversation:', selectedConversation.conversationId)
        leaveConversation(selectedConversation.conversationId)
      }
    } else if (selectedConversation && !socketRef.current?.connected) {
      console.error('[Chat] ❌ Cannot setup - socket not connected!')
    }
  }, [selectedConversation?.conversationId, fetchMessages, session?.user?.id])

  // Start a conversation with a transporter
  const handleStartChat = async (transporterId: string) => {
    try {
      setSending(true)
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherUserId: transporterId }),
      })

      const data = await res.json()
      if (data.success) {
        setSelectedConversation(data.data)
        // Add to conversations list if not already there
        setConversations((prev) => {
          const exists = prev.find((c) => c._id === data.data._id)
          return exists ? prev : [data.data, ...prev]
        })
        setShowNewChat(false)
      }
    } catch (err) {
      console.error('Failed to start chat:', err)
      alert('Failed to start chat')
    } finally {
      setSending(false)
    }
  }

  // Open new chat modal and fetch available loads
  const handleOpenNewChat = async () => {
    setLoadingLoads(true)
    try {
      const res = await fetch('/api/client/loads')
      const data = await res.json()
      if (data.success) {
        setAvailableLoads(data.data || [])
        setShowNewChat(true) // Only open modal after data is loaded
      }
    } catch (err) {
      console.error('Failed to fetch loads:', err)
      alert('Failed to load your loads')
    } finally {
      setLoadingLoads(false)
    }
  }

  // FIX #1: Send message via Socket.io only (no HTTP API needed)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation || !session?.user?.id) return

    const messageText = newMessage.trim()
    const conversationId = selectedConversation.conversationId

    try {
      setSending(true)

      // Create optimistic message for immediate UI update
      const receiverId = selectedConversation.otherParticipant?.userId 
        || selectedConversation.otherParticipant?._id?.toString() 
        || selectedConversation.otherParticipant?._id
      
      const optimisticMessage: Message = {
        _id: `temp-${Date.now()}`,
        conversationId,
        senderId: session.user.id,
        senderName: session.user.name || 'You',
        senderRole: session.user.role,
        receiverId: receiverId || '',
        message: messageText,
        timestamp: new Date().toISOString(),
        isRead: false,
      }

      // Immediately add to UI
      setMessages((prev) => [...prev, optimisticMessage])
      setNewMessage('')
      scrollToBottom()

      // Send via socket.io for real-time delivery
      console.log('[Chat] Sending message via socket:', conversationId, messageText.substring(0, 50))
      sendSocketMessage(conversationId, messageText)

      // CRITICAL FIX #1: Also save to DB via HTTP POST to ensure persistence
      try {
        // Get receiverId - handle both formats (userId field or _id field)
        const otherUserId = selectedConversation.otherParticipant?.userId 
          || selectedConversation.otherParticipant?._id?.toString() 
          || selectedConversation.otherParticipant?._id
        
        console.log('[Chat] Receiver ID:', otherUserId, 'from otherParticipant:', selectedConversation.otherParticipant)
        
        if (!otherUserId) {
          console.error('[Chat] Cannot determine receiverId from otherParticipant')
          throw new Error('Receiver ID not found')
        }
        
        const res = await fetch('/api/chat/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            conversationId: selectedConversation.conversationId,
            receiverId: otherUserId,
            message: messageText,
          }),
        })
        
        if (!res.ok) {
          console.error('[Chat] HTTP save failed:', await res.text())
        }
      } catch (err) {
        console.error('[Chat] HTTP save error:', err)
      }

      // Update conversation's last message
      setConversations((prev) =>
        prev.map((c) =>
          c._id === selectedConversation._id
            ? {
                ...c,
                lastMessage: messageText,
                lastMessageAt: new Date().toISOString(),
              }
            : c
        )
      )
    } catch (err) {
      console.error('Send error:', err)
    } finally {
      setSending(false)
    }
  }

  if (!mounted) {
    return (
      <>
        <Topbar title="Chat" />
        <PageLayout>
          <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </PageLayout>
      </>
    )
  }

  // After mounted, check auth status
  if (status === 'loading') {
    return (
      <>
        <Topbar title="Chat" />
        <PageLayout>
          <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden items-center justify-center">
            <p className="text-gray-500">Loading...</p>
          </div>
        </PageLayout>
      </>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <>
        <Topbar title="Chat" />
        <PageLayout>
          <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden items-center justify-center">
            <p className="text-gray-500">Please log in to access chat</p>
          </div>
        </PageLayout>
      </>
    )
  }

  return (
    <>
      <Topbar title="Chat" />
      <PageLayout>
        <div className="flex h-[calc(100vh-160px)] bg-white overflow-hidden flex-col md:flex-row">
          {/* Conversations List */}
          <div className={`${selectedConversation ? 'hidden md:flex' : 'flex'} w-full md:w-96 flex-shrink-0 border-r border-gray-200 flex-col bg-gray-50`}>
            <div className="border-b border-gray-200 px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base md:text-lg text-[#1a2a5e]">Messages</h3>
                <p className="text-xs md:text-sm text-gray-500 mt-0.5">Your conversations</p>
              </div>
              <button
                onClick={handleOpenNewChat}
                className="p-2 bg-[#3ab54a] text-white rounded-lg text-lg md:text-xl font-medium hover:bg-[#2d9e3c] transition"
                title="Start new chat"
              >
                +
              </button>
            </div>

            {loading ? (
              <div className="space-y-3 p-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="p-3 rounded-lg">
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-3 w-36" />
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-6 text-center">
                <div>
                  <p className="text-base text-gray-500 mb-2">No conversations yet</p>
                  <p className="text-sm text-gray-400">Click <strong>+</strong> to start a new chat with a transporter</p>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-2 md:px-3 py-3 md:py-4 space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-3 md:p-4 rounded-lg text-left transition-all duration-200 ${
                      selectedConversation?._id === conv._id
                        ? 'bg-[#3ab54a] text-white shadow-md'
                        : 'hover:bg-gray-100 text-[#1a2a5e]'
                    }`}
                  >
                    <p className="font-semibold text-sm md:text-base">{conv.otherParticipant?.name || 'Unknown'}</p>
                    <p className={`text-xs md:text-sm mt-1 truncate ${
                      selectedConversation?._id === conv._id ? 'opacity-90' : 'opacity-75 text-gray-600'
                    }`}>
                      {conv.otherParticipant?.email || ''}
                    </p>
                    {conv.lastMessage && (
                      <p className={`text-xs md:text-sm mt-2 truncate ${
                        selectedConversation?._id === conv._id ? 'text-white opacity-80' : 'text-gray-600'
                      }`}>
                        {conv.lastMessage}
                      </p>
                    )}
                    {conv.unreadCount > 0 && (
                      <span className={`inline-block mt-3 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        selectedConversation?._id === conv._id 
                          ? 'bg-white text-[#3ab54a]' 
                          : 'bg-red-500 text-white'
                      }`}>
                        {conv.unreadCount} new
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-white relative">
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="border-b border-gray-200 px-4 md:px-6 py-4 md:py-5 bg-white sticky top-0 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-base md:text-lg text-[#1a2a5e]">{selectedConversation.otherParticipant?.name}</h3>
                    <p className="text-xs md:text-sm text-gray-500 mt-1">{selectedConversation.otherParticipant?.email}</p>
                  </div>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden ml-4 p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    title="Back to conversations"
                  >
                    ←
                  </button>
                </div>

                {/* Messages List */}
                <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 md:py-5 space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p className="text-center">
                        <p className="font-semibold mb-1">No messages yet</p>
                        <p className="text-xs md:text-sm">Start the conversation by sending a message</p>
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isOwn = msg.senderId === session?.user?.id
                      return (
                        <div
                          key={msg._id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] md:max-w-xs px-4 md:px-5 py-2 md:py-3 rounded-lg ${
                              isOwn
                                ? 'bg-[#3ab54a] text-white rounded-br-none'
                                : 'bg-gray-100 text-[#1a2a5e] rounded-bl-none'
                            }`}
                          >
                            {!isOwn && <p className="text-xs font-semibold mb-1 opacity-80">{msg.senderName}</p>}
                            <p className="text-xs md:text-sm break-words">{msg.message}</p>
                            <p className={`text-xs opacity-70 mt-2 ${
                              isOwn ? 'text-green-100' : 'text-gray-500'
                            }`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <form onSubmit={handleSendMessage} className="border-t border-gray-200 px-3 md:px-6 py-3 md:py-5 bg-white">
                  <div className="flex gap-2 md:gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message here..."
                      className="flex-1 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg text-xs md:text-sm focus:outline-none focus:border-[#3ab54a] focus:ring-2 focus:ring-[#3ab54a]/20 disabled:bg-gray-100"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-4 md:px-6 py-2 md:py-3 bg-[#3ab54a] text-white rounded-lg font-semibold text-xs md:text-sm hover:bg-[#2d9e3c] disabled:opacity-60 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {sending ? '...' : 'Send'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <div className="text-center px-4">
                  <p className="font-semibold text-base md:text-lg mb-3">Select a conversation</p>
                  <p className="text-xs md:text-sm text-gray-500">Choose a transporter from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Chat Modal - Select Load & Transporter */}
        {showNewChat && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 md:p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] md:max-h-[80vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b gap-3">
                <div>
                  <h3 className="font-bold text-base md:text-lg text-gray-900">Start New Chat</h3>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">Select a transporter to chat</p>
                </div>
                <button
                  onClick={() => setShowNewChat(false)}
                  className="p-1 flex-shrink-0 hover:bg-gray-100 rounded-lg transition"
                >
                  ✕
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 overflow-y-auto">
                {loadingLoads ? (
                  <div className="p-4 md:p-6 text-center">
                    <p className="text-sm md:text-base text-gray-500">Loading your loads...</p>
                  </div>
                ) : availableLoads.length === 0 ? (
                  <div className="p-4 md:p-6 text-center">
                    <p className="text-sm md:text-base text-gray-500">
                      No loads with quotes found. Submit a load and wait for transporter quotes to chat.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 md:p-4 space-y-4">
                    {availableLoads.map((transporter: any) => (
                      <div key={transporter._id} className="border border-gray-200 rounded-lg p-3 md:p-4 bg-gray-50">
                        {/* Transporter Info Header */}
                        <div className="mb-3 pb-3 border-b flex items-center justify-between gap-2">
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 text-sm md:text-base">
                              🚛 {transporter.name}
                            </p>
                            <p className="text-xs md:text-sm text-gray-600 mt-1">{transporter.email}</p>
                            {transporter.companyName && (
                              <p className="text-xs md:text-sm text-gray-500 mt-0.5">{transporter.companyName}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleStartChat(transporter._id)}
                            disabled={startingChat === transporter._id}
                            className="px-3 md:px-4 py-2 bg-[#3ab54a] text-white rounded-lg text-xs md:text-sm font-medium hover:bg-[#2d9e3c] disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                            title={`Chat with ${transporter.name}`}
                          >
                            {startingChat === transporter._id ? '...' : 'Chat'}
                          </button>
                        </div>

                        {/* Loads for this Transporter */}
                        <div className="space-y-2">
                          <p className="text-xs md:text-sm text-gray-600 font-medium mb-2">
                            {transporter.loads?.length || 0} load{transporter.loads?.length !== 1 ? 's' : ''}
                          </p>
                          {transporter.loads?.map((load: any) => (
                            <div
                              key={load._id}
                              className="flex items-start justify-between gap-2 p-2 md:p-3 bg-white rounded border border-gray-100 hover:border-[#3ab54a]/50 transition flex-col sm:flex-row"
                            >
                              <div className="flex-1 min-w-0 w-full">
                                <p className="text-sm md:text-base font-medium text-gray-900 truncate">
                                  📦 {load.ref}
                                </p>
                                <p className="text-xs md:text-sm text-gray-600 mt-0.5 truncate">
                                  {load.origin} → {load.destination}
                                </p>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-medium">
                                    {load.status}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                      load.quoteStatus === 'ACCEPTED'
                                        ? 'bg-green-100 text-green-700'
                                        : load.quoteStatus === 'REJECTED'
                                          ? 'bg-red-100 text-red-700'
                                          : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                  >
                                    {load.quoteStatus}
                                  </span>
                                  {load.quoteAmount && (
                                    <span className="text-xs md:text-sm text-gray-600">
                                      Quote: {load.quoteAmount.toLocaleString()} {load.currency}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </PageLayout>
    </>
  )
}
