/**
 * Socket.io Server Setup for Real-Time Chat
 * Run this separately: node socket-server.js
 */

const http = require('http')
const socketIo = require('socket.io')
require('dotenv').config()

// Create HTTP server
const server = http.createServer()

const io = new socketIo.Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
})

// Store active conversations and user sockets
const activeConversations = new Map()
const userSockets = new Map()

io.on('connection', (socket) => {
  console.log('[Socket] User connected:', socket.id)

  const userId = socket.handshake.auth.userId
  if (userId) {
    userSockets.set(userId, socket)
    console.log('[Socket] User linked:', userId, '->', socket.id)
  }

  // Join conversation room
  socket.on('join_conversation', ({ conversationId }) => {
    socket.join(`conversation:${conversationId}`)
    
    if (!activeConversations.has(conversationId)) {
      activeConversations.set(conversationId, new Set())
    }
    activeConversations.get(conversationId).add(socket.id)
    
    console.log(`[Socket] ✅ User ${userId} joined conversation:${conversationId}`)
    console.log(`[Socket] 📊 Total subscribers in conversation:${conversationId}: ${io.sockets.adapter.rooms.get(`conversation:${conversationId}`)?.size || 0}`)
    console.log(`[Socket] 👥 Active users in room:`, Array.from(io.sockets.adapter.rooms.get(`conversation:${conversationId}`) || []))
    
    // Notify other users in room that someone joined
    socket.to(`conversation:${conversationId}`).emit('user_joined', {
      conversationId,
      userId,
    })
  })

  // Leave conversation room
  socket.on('leave_conversation', ({ conversationId }) => {
    socket.leave(`conversation:${conversationId}`)
    
    const users = activeConversations.get(conversationId)
    if (users) {
      users.delete(socket.id)
      if (users.size === 0) {
        activeConversations.delete(conversationId)
      }
    }
    
    console.log(`[Socket] User ${userId} left ${conversationId}`)
  })

  // Send message - broadcast to conversation room
  socket.on('send_message', ({ conversationId, message }) => {
    try {
      console.log(`[Socket] 📨 Received send_message from ${userId} for ${conversationId}`)
      console.log(`[Socket] Message type:`, typeof message, 'Value:', message)
      console.log(`[Socket] Room subscribers in conversation:${conversationId}:`, io.sockets.adapter.rooms.get(`conversation:${conversationId}`)?.size || 0)
      
      let messageObj
      
      // If message is already an object, use it
      if (typeof message === 'object' && message !== null) {
        messageObj = message
        console.log(`[Socket] Message is already object:`, messageObj)
      }
      // If message is a JSON string, parse it
      else if (typeof message === 'string' && message.startsWith('{')) {
        try {
          messageObj = JSON.parse(message)
          console.log(`[Socket] Parsed message object:`, messageObj)
        } catch (e) {
          console.error('[Socket] JSON parse error:', e)
          // If parsing fails, create proper message object
          messageObj = {
            _id: 'socket-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            conversationId,
            senderId: userId,
            message: message,
            timestamp: new Date().toISOString(),
          }
        }
      }
      // Plain text message - create proper object
      else if (typeof message === 'string') {
        messageObj = {
          _id: 'socket-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          conversationId,
          senderId: userId,
          message: message,
          timestamp: new Date().toISOString(),
        }
        console.log(`[Socket] Created message object from string:`, messageObj)
      }
      // Fallback for any other type
      else {
        console.error('[Socket] Unexpected message type:', typeof message, message)
        messageObj = {
          _id: 'socket-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
          conversationId,
          senderId: userId,
          message: String(message),
          timestamp: new Date().toISOString(),
        }
      }
      
      // Broadcast message to ALL users in conversation room (both sender and receiver)
      const room = `conversation:${conversationId}`
      
      // CRITICAL: Emit with proper event name and single object parameter
      io.to(room).emit('message_received', messageObj)
      
      const roomSize = io.sockets.adapter.rooms.get(room)?.size || 0
      console.log(`[Socket] ✅ Message broadcast complete for ${conversationId} - Subscribers: ${roomSize}`)
      console.log(`[Socket] Broadcasted message object:`, JSON.stringify(messageObj, null, 2))
    } catch (err) {
      console.error('[Socket] Message send error:', err)
      socket.emit('error', { message: 'Failed to send message' })
    }
  })

  // Typing indicator
  socket.on('typing', ({ conversationId, isTyping }) => {
    socket.to(`conversation:${conversationId}`).emit('user_typing', {
      conversationId,
      userId,
      isTyping,
    })
  })

  // Disconnect handler
  socket.on('disconnect', () => {
    if (userId) {
      userSockets.delete(userId)
      console.log(`[Socket] User ${userId} removed from socket map`)
    }
    
    // Remove from all conversations
    for (const [convId, users] of activeConversations.entries()) {
      if (users.has(socket.id)) {
        users.delete(socket.id)
        if (users.size === 0) {
          activeConversations.delete(convId)
        }
      }
    }
    
    console.log('[Socket] User disconnected:', socket.id)
  })

  // Error handler
  socket.on('error', (err) => {
    console.error('[Socket] Socket error:', err)
  })
})

// Start server
server.listen(3002, () => {
  console.log('[Socket] 🚀 Socket.io server listening on port 3002')
  console.log('[Socket] ✅ Ready for real-time chat connections')
})
