'use client'
// src/app/client/chat/page.tsx
import { useEffect, useState, useCallback } from 'react'
import { Topbar, PageLayout, Skeleton } from '@/components/ui'

export default function ClientChatPage() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/chat/conversations')
      const data = await res.json()
      setConversations(data.data || [])
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchMessages = useCallback(async () => {
    if (!selectedUser) return
    try {
      const conversationId = `${Date.now()}-${selectedUser.id}`
      const res = await fetch(`/api/chat/messages?conversationId=${conversationId}`)
      const data = await res.json()
      setMessages(data.data || [])
    } catch (err) {
      console.error('Failed to fetch messages:', err)
    }
  }, [selectedUser])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages()
    }
  }, [selectedUser, fetchMessages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser) return

    try {
      setSending(true)
      const conversationId = `${Date.now()}-${selectedUser.id}`
      
      const res = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          recipientId: selectedUser.id,
          message: newMessage,
        }),
      })

      if (!res.ok) throw new Error('Failed to send message')

      setNewMessage('')
      await fetchMessages()
    } catch (err) {
      console.error('Send error:', err)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <Topbar title="Chat" />
      <PageLayout>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-200px)]">
          {/* Conversations List */}
          <div className="lg:col-span-1 card overflow-y-auto">
            <div className="border-b border-gray-100 pb-3 mb-4">
              <h3 className="font-condensed font-bold text-sm text-[#1a2a5e] uppercase tracking-wide">Transporters</h3>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="p-3 rounded">
                    <Skeleton className="h-3 w-24 mb-2" />
                    <Skeleton className="h-2 w-32" />
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-gray-400">No transporters available</p>
            ) : (
              <div className="space-y-2">
                {conversations.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full p-3 rounded text-left transition-colors ${
                      selectedUser?.id === user.id
                        ? 'bg-[#3ab54a] text-white'
                        : 'hover:bg-gray-50 text-[#1a2a5e]'
                    }`}
                  >
                    <p className="text-xs font-semibold">{user.name}</p>
                    <p className="text-[10px] opacity-75 truncate">{user.email}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3 card flex flex-col">
            {selectedUser ? (
              <>
                {/* Header */}
                <div className="border-b border-gray-100 pb-3 mb-4">
                  <h3 className="font-condensed font-bold text-sm text-[#1a2a5e] uppercase tracking-wide">{selectedUser.name}</h3>
                  <p className="text-xs text-gray-500">{selectedUser.phone}</p>
                </div>

                {/* Message List */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-center text-gray-400 text-xs py-8">No messages yet. Start the conversation!</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === selectedUser.id ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.senderId === selectedUser.id
                              ? 'bg-gray-100 text-[#1a2a5e]'
                              : 'bg-[#3ab54a] text-white'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:border-[#3ab54a]"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="px-4 py-2 bg-[#3ab54a] text-white rounded font-semibold text-sm hover:bg-[#2d9e3c] disabled:opacity-60"
                  >
                    {sending ? '...' : 'Send'}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Select a transporter to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </PageLayout>
    </>
  )
}
