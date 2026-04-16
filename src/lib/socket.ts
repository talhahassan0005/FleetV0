import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

/**
 * Initialize Socket.io connection
 * Call this once when app loads (in a useEffect)
 */
export function initializeSocket(userId: string): Socket {
  if (socket && socket.connected) {
    console.log('[Socket] Reusing existing connection:', socket.id)
    return socket
  }

  // FIX: Force socket URL to port 3002, don't rely on env var
  const socketUrl = typeof window !== 'undefined' 
    ? `http://${window.location.hostname}:3002`
    : 'http://localhost:3002'

  console.log('[Socket] Initializing connection to:', socketUrl)

  socket = io(socketUrl, {
    auth: {
      userId,
    },
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
    // CRITICAL: Force websocket only, disable polling to avoid 404 on Next.js server
    transports: ['websocket'],
    upgrade: false,
    // Add path to ensure correct routing
    path: '/socket.io/',
  })

  socket.on('connect', () => {
    console.log('[Socket Client] ✅ Connected:', socket?.id)
    console.log('[Socket Client] 🔌 Connection status:', {
      connected: socket?.connected,
      id: socket?.id,
      transport: socket?.io?.engine?.transport?.name
    })
  })

  socket.on('disconnect', (reason) => {
    console.log('[Socket Client] ❌ Disconnected:', reason)
  })

  socket.on('connect_error', (error) => {
    console.error('[Socket Client] ❌ Connection error:', error.message)
  })

  socket.on('error', (error) => {
    console.error('[Socket Client] ❌ Socket error:', error)
  })

  return socket
}

/**
 * Get existing socket connection
 */
export function getSocket(): Socket | null {
  return socket
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

/**
 * Join a conversation room
 */
export function joinConversation(conversationId: string): void {
  if (socket && socket.connected) {
    socket.emit('join_conversation', { conversationId })
    console.log('[Socket Client] ✅ Joining conversation:', conversationId)
  } else {
    console.error('[Socket Client] ❌ Cannot join - socket not connected:', socket?.connected)
  }
}

/**
 * Leave a conversation room
 */
export function leaveConversation(conversationId: string): void {
  if (socket) {
    socket.emit('leave_conversation', { conversationId })
    console.log('[Socket] Left conversation:', conversationId)
  }
}

/**
 * Send a message via socket
 */
export function sendMessage(conversationId: string, message: string): void {
  if (socket && socket.connected) {
    console.log('[Socket Client] Emitting send_message:')
    console.log('  - conversationId:', conversationId)
    console.log('  - message type:', typeof message)
    console.log('  - message value:', message)
    console.log('  - message length:', message?.length)
    
    socket.emit('send_message', {
      conversationId,
      message,
    })
  } else {
    console.error('[Socket Client] Cannot send - socket not connected:', socket?.connected)
  }
}

/**
 * Listen for new messages
 */
export function onMessageReceived(callback: (data: any) => void): void {
  if (socket && socket.connected) {
    console.log('[Socket Client] 👂 Setting up message listener')
    // Remove any existing listeners first to avoid duplicates
    socket.off('message_received')
    socket.on('message_received', (data) => {
      console.log('[Socket Client] 📨 RAW Message received:')
      console.log('[Socket Client] - Type:', typeof data)
      console.log('[Socket Client] - Value:', data)
      console.log('[Socket Client] - JSON:', JSON.stringify(data, null, 2))
      callback(data)
    })
  } else {
    console.error('[Socket Client] ❌ Cannot listen - socket not connected')
  }
}

/**
 * Remove message listener
 */
export function offMessageReceived(
  callback: (data: any) => void
): void {
  if (socket) {
    socket.off('message_received', callback)
  }
}

/**
 * Listen for typing indicators
 */
export function onUserTyping(
  callback: (data: { conversationId: string; userId: string; isTyping: boolean }) => void
): void {
  if (socket) {
    socket.on('user_typing', callback)
  }
}

/**
 * Send typing indicator
 */
export function sendTypingIndicator(conversationId: string, isTyping: boolean): void {
  if (socket) {
    socket.emit('typing', {
      conversationId,
      isTyping,
    })
  }
}
