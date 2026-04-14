import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const initSocket = () => {
  if (socket?.connected) return socket

  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  })

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id)
  })

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected')
  })

  socket.on('error', (error) => {
    console.error('[Socket] Error:', error)
  })

  return socket
}

export const getSocket = () => {
  if (!socket) {
    return initSocket()
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

// Socket event types
export const SOCKET_EVENTS = {
  // Conversation room management
  JOIN_CONVERSATION: 'conversation:join',
  LEAVE_CONVERSATION: 'conversation:leave',
  
  // Chat events
  CONVERSATION_CREATED: 'conversation:created',
  CONVERSATION_UPDATED: 'conversation:updated',
  MESSAGE_SENT: 'message:sent',
  MESSAGE_RECEIVED: 'message:received',
  TYPING_START: 'typing:start',
  TYPING_END: 'typing:end',
  
  // Invoice events
  INVOICE_CREATED: 'invoice:created',
  INVOICE_UPDATED: 'invoice:updated',
  
  // Load events
  LOAD_UPDATED: 'load:updated',
}
