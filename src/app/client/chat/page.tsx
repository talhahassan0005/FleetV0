'use client'
// src/app/client/chat/page.tsx
import { useEffect, useState, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Topbar, PageLayout, Skeleton } from '@/components/ui'
import { MessageCircle, Plus, X, Truck } from 'lucide-react'
import { getSocket, SOCKET_EVENTS } from '@/lib/socket'
import type { Socket } from 'socket.io-client'

interface Participant {
  id: string
  name: string
  email: string
  userType: string
}

interface Conversation {
  _id: string
  participants: Participant[]
  loadId: string
  loadRef?: {
    pickupLocation?: string
    deliveryLocation?: string
  }
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: number
  isActive: boolean
}

interface Message {
  _id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: string
  message: string
  timestamp: string
  isRead: boolean
}

export default function ClientChatPage() {
  const { data: session, status } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [typing, setTyping] = useState<string | null>(null)
  const [showNewChat, setShowNewChat] = useState(false)
  const [myLoads, setMyLoads] = useState<any[]>([])
  const [loadingLoads, setLoadingLoads] = useState(false)
  const [startingChat, setStartingChat] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize socket connection
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return

    const socket = getSocket()
    socketRef.current = socket

    // Fetch initial conversations
    const fetchInitialConversations = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/chat/conversations')
        if (!res.ok) throw new Error('Failed to fetch conversations')
        const data = await res.json()
        setConversations(data.data || [])
      } catch (err) {
        console.error('Failed to fetch conversations:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchInitialConversations()

    // Listen for real-time conversation updates
    socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, (updatedConversation: Conversation) => {
      setConversations((prevConvs) =>
        prevConvs.map((conv) =>
          conv._id === updatedConversation._id ? updatedConversation : conv
        )
      )
    })

    socket.on(SOCKET_EVENTS.CONVERSATION_CREATED, (newConv: Conversation) => {
      setConversations((prevConvs) => [newConv, ...prevConvs])
    })

    socket.on(SOCKET_EVENTS.MESSAGE_RECEIVED, (newMsg: Message) => {
      if (selectedConversation?._id === newMsg.conversationId) {
        setMessages((prevMsgs) => [...prevMsgs, newMsg])
      }
    })

    socket.on(SOCKET_EVENTS.TYPING_START, (data: { conversationId: string; userName: string }) => {
      if (selectedConversation?._id === data.conversationId) {
        setTyping(data.userName)
      }
    })

    socket.on(SOCKET_EVENTS.TYPING_END, (data: { conversationId: string }) => {
      if (selectedConversation?._id === data.conversationId) {
        setTyping(null)
      }
    })

    return () => {
      socket.off(SOCKET_EVENTS.CONVERSATION_UPDATED)
      socket.off(SOCKET_EVENTS.CONVERSATION_CREATED)
      socket.off(SOCKET_EVENTS.MESSAGE_RECEIVED)
      socket.off(SOCKET_EVENTS.TYPING_START)
      socket.off(SOCKET_EVENTS.TYPING_END)
    }
  }, [status, session?.user?.id, selectedConversation?._id])

  // Load messages when conversation is selected
  useEffect(() => {
    if (!selectedConversation?._id) return

    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages?conversationId=${selectedConversation._id}`)
        if (!res.ok) throw new Error('Failed to fetch messages')
        const data = await res.json()
        setMessages(data.data || [])
      } catch (err) {
        console.error('Failed to fetch messages:', err)
      }
    }

    fetchMessages()

    // Join conversation room for socket updates
    if (socketRef.current) {
      socketRef.current.emit(SOCKET_EVENTS.JOIN_CONVERSATION, {
        conversationId: selectedConversation._id,
      })
    }

    return () => {
      // Leave room when switching conversations
      if (socketRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.LEAVE_CONVERSATION, {
          conversationId: selectedConversation._id,
        })
      }
    }
  }, [selectedConversation?._id])

  if (status === 'loading') {
    return (
      <>
        <Topbar title="Chat" />
        <PageLayout>
          <Skeleton className="h-96 w-full" />
        </PageLayout>
      </>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <>
        <Topbar title="Chat" />
        <PageLayout>
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-500">Please log in to access chat</p>
          </div>
        </PageLayout>
      </>
    )
  }

  // Get the other participant (the transporter)
  const otherParticipant = selectedConversation?.participants.find(
    (p: Participant) => p.id !== session?.user?.id
  )

  const handleNewChat = async () => {
    setShowNewChat(true)
    setLoadingLoads(true)
    try {
      const res = await fetch('/api/chat/my-loads')
      const data = await res.json()
      setMyLoads(data.loads || [])
    } catch (err) {
      console.error('Error fetching loads:', err)
    } finally {
      setLoadingLoads(false)
    }
  }

  const handleStartChatFromLoad = async (loadId: string) => {
    setStartingChat(loadId)
    try {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loadId }),
      })
      const data = await res.json()
      if (data.data) {
        setConversations((prev) => {
          const exists = prev.find((c) => c._id === data.data._id)
          if (exists) return prev
          return [data.data, ...prev]
        })
        setSelectedConversation(data.data)
        setShowNewChat(false)
      } else {
        alert(data.error || 'Could not start chat')
      }
    } catch (err) {
      console.error('Error starting chat:', err)
      alert('Failed to start chat')
    } finally {
      setStartingChat(null)
    }
  }

  // Send message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    const messageText = newMessage.trim()
    setNewMessage('')

    try {
      setSending(true)
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConversation._id,
          message: messageText,
        }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      const data = await res.json()
      
      // Emit socket event to broadcast message to other participants
      if (socketRef.current) {
        socketRef.current.emit(SOCKET_EVENTS.MESSAGE_SENT, {
          conversationId: selectedConversation._id,
          message: data.data,
        })
      }
    } catch (err) {
      console.error('Send error:', err)
      alert('Failed to send message')
      setNewMessage(messageText) // Restore message on error
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Topbar title="Chat" />
      <PageLayout>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[calc(100vh-200px)]">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
                  <MessageCircle className="w-5 h-5 text-[#3ab54a]" />
                  My Chats
                </h2>
                <button
                  onClick={handleNewChat}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#3ab54a] text-white rounded-lg text-xs font-medium hover:bg-[#2d9e3c] transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  New Chat
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">Chat with your transporters</p>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-3 animate-pulse">
                      <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-2 bg-gray-100 rounded w-32"></div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  <p className="mb-2">No active chats yet</p>
                  <p className="text-xs text-gray-400">Start a chat from a load detail page</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {conversations.map((conv) => {
                    const other = conv.participants.find((p: Participant) => p.id !== session?.user?.id)
                    const isSelected = selectedConversation?._id === conv._id
                    
                    return (
                      <button
                        key={conv._id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full text-left p-4 transition-colors hover:bg-gray-50 ${
                          isSelected ? 'bg-green-50 border-l-4 border-[#3ab54a]' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm text-[#1a2a5e] truncate">
                              {other?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              Load: {conv.loadId}
                            </p>
                            {conv.lastMessage && (
                              <p className="text-xs text-gray-600 truncate mt-1">
                                {conv.lastMessage}
                              </p>
                            )}
                          </div>
                          {conv.unreadCount && conv.unreadCount > 0 && (
                            <div className="bg-[#3ab54a] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                              {conv.unreadCount}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col">
            {selectedConversation && otherParticipant ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-gray-200 p-4 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#1a2a5e]">{otherParticipant.name}</h3>
                    <p className="text-xs text-gray-500">
                      Transporter • Load {selectedConversation.loadId}
                    </p>
                    {selectedConversation.loadRef && (
                      <p className="text-xs text-gray-400 mt-1">
                        {selectedConversation.loadRef.pickupLocation} → {selectedConversation.loadRef.deliveryLocation}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {selectedConversation.isActive && (
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded font-semibold">
                        Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <p className="text-center">
                        <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        No messages yet. Start the conversation!
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
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isOwn
                                ? 'bg-[#3ab54a] text-white rounded-br-none'
                                : 'bg-white text-[#1a2a5e] border border-gray-200 rounded-bl-none'
                            }`}
                          >
                            <p className="text-sm">{msg.message}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-green-100' : 'text-gray-500'}`}>
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
                <form onSubmit={handleSendMessage} className="border-t border-gray-200 p-4 bg-white">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#3ab54a] disabled:bg-gray-100"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      className="px-6 py-2 bg-[#3ab54a] text-white rounded-lg font-semibold text-sm hover:bg-[#2d9e3c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {sending ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                  {typing && (
                    <p className="text-xs text-gray-500 mt-2">
                      {typing} is typing...
                    </p>
                  )}
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p className="font-semibold mb-1">No conversation selected</p>
                  <p className="text-sm text-gray-400">Select a transporter from the list to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* New Chat Modal */}
        {showNewChat && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
              {/* Modal header */}
              <div className="flex items-center justify-between p-5 border-b">
                <div>
                  <h3 className="font-bold text-gray-900">Start New Chat</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Select a load to chat about</p>
                </div>
                <button
                  onClick={() => setShowNewChat(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Loads list */}
              <div className="max-h-96 overflow-y-auto">
                {loadingLoads ? (
                  <div className="p-8 text-center text-gray-400">
                    <div className="w-6 h-6 border-2 border-[#3ab54a] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading your loads...
                  </div>
                ) : myLoads.length === 0 ? (
                  <div className="p-8 text-center">
                    <Truck className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">No active loads found</p>
                    <p className="text-gray-300 text-xs mt-1">
                      You need an active load with an assigned transporter to chat
                    </p>
                  </div>
                ) : (
                  myLoads.map((load) => {
                    const alreadyHasChat = conversations.find((c) =>
                      c.loadId?.toString() === load._id?.toString()
                    )
                    return (
                      <div key={load._id} className="p-4 border-b border-gray-100 hover:bg-gray-50 transition">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Truck className="w-4 h-4 text-[#3ab54a]" />
                              <span className="font-semibold text-gray-900 text-sm">{load.ref || load.loadRef || 'Load'}</span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                  load.status === 'IN_TRANSIT'
                                    ? 'bg-blue-100 text-blue-700'
                                    : load.status === 'DELIVERED'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {load.status?.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              📍 {load.origin} → {load.destination}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              🚛 Transporter: {load.transporterName || 'Assigned'}
                            </p>
                          </div>
                          <div className="ml-3">
                            {alreadyHasChat ? (
                              <button
                                onClick={() => {
                                  setSelectedConversation(alreadyHasChat)
                                  setShowNewChat(false)
                                }}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-200 transition"
                              >
                                Open Chat
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStartChatFromLoad(load._id)}
                                disabled={startingChat === load._id}
                                className="px-3 py-1.5 bg-[#3ab54a] text-white rounded-lg text-xs font-medium hover:bg-[#2d9e3c] disabled:opacity-50 transition flex items-center gap-1"
                              >
                                {startingChat === load._id ? (
                                  <>
                                    <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                    Starting...
                                  </>
                                ) : (
                                  <>
                                    <MessageCircle className="w-3 h-3" />
                                    Start Chat
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                <p className="text-xs text-gray-400 text-center">💡 Chat is available for loads with an assigned transporter</p>
              </div>
            </div>
          </div>
        )}      </PageLayout>
    </>
  )
}
