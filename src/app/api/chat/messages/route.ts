// src/app/api/chat/messages/route.ts
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import { Message, Conversation, User } from '@/lib/models'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = req.nextUrl.searchParams.get('conversationId')
    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
    }

    await connectToDatabase()

    // FIX #1: Fetch messages from MongoDB using consistent conversationId
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .select('-__v')
      .lean()

    // Transform for client
    const transformedMessages = messages.map((msg: any) => ({
      _id: msg._id,
      conversationId: msg.conversationId,
      senderId: msg.senderId?.toString(),
      senderName: msg.senderName,
      senderRole: msg.senderRole,
      receiverId: msg.receiverId?.toString(),
      message: msg.message || msg.content,
      timestamp: msg.createdAt,
      createdAt: msg.createdAt,
      isRead: msg.isRead,
      loadId: msg.loadId?.toString() || null,
      loadRef: msg.loadRef || null,
      readBy: msg.readBy || []
    }))

    return NextResponse.json({
      success: true,
      data: transformedMessages,
    })
  } catch (err: any) {
    console.error('Messages fetch error:', err)
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { conversationId, receiverId, message, content, loadId, loadRef } = body
    
    const messageContent = message || content;

    console.log('[Messages API] POST request:', { conversationId, receiverId, messageContent: messageContent?.substring(0, 50), loadId, loadRef })

    if (!conversationId || !messageContent || !receiverId) {
      console.error('[Messages API] Missing fields:', { conversationId: !!conversationId, messageContent: !!messageContent, receiverId: !!receiverId })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectToDatabase()

    // Get sender info with fallback
    let senderName = session.user.name || session.user.email || 'User'
    let senderRole = session.user.role || 'CLIENT'
    
    try {
      const sender = await User.findById(session.user.id).select('companyName name email role').lean()
      if (sender) {
        senderName = sender.companyName || sender.name || sender.email || senderName
        senderRole = sender.role || senderRole
      }
    } catch (e) {
      console.warn('[Messages API] User lookup failed, using session defaults')
    }

    // FIX #1: Create message with consistent conversationId
    const messageData: any = {
      conversationId,
      senderId: new ObjectId(session.user.id),
      senderName,
      senderRole,
      receiverId: new ObjectId(receiverId),
      message: messageContent.trim(),
      isRead: false,
      readBy: [new ObjectId(session.user.id)],
      createdAt: new Date()
    }
    
    // Add load reference if provided
    if (loadRef) {
      messageData.loadRef = loadRef
    }
    
    if (loadId) {
      try {
        messageData.loadId = new ObjectId(loadId)
      } catch (e) {
        // Invalid ObjectId, ignore
      }
    }

    const newMessage = new Message(messageData)
    await newMessage.save()

    // FIX #2: Update conversation lastMessage stats
    await Conversation.findOneAndUpdate(
      { conversationId },
      {
        $set: {
          lastMessage: messageContent.substring(0, 100),
          lastMessageAt: new Date(),
          lastMessageSenderId: new ObjectId(session.user.id),
        },
      },
      { upsert: false } // Don't auto-create here, creation happens in /conversations endpoint
    )

    const savedMessage = await Message.findById(newMessage._id).lean()

    return NextResponse.json(
      {
        success: true,
        data: {
          _id: savedMessage._id,
          conversationId: savedMessage.conversationId,
          senderId: savedMessage.senderId,
          senderName: savedMessage.senderName,
          senderRole: savedMessage.senderRole,
          receiverId: savedMessage.receiverId,
          message: savedMessage.message,
          timestamp: savedMessage.createdAt,
          createdAt: savedMessage.createdAt,
          isRead: savedMessage.isRead,
          loadRef: savedMessage.loadRef || null,
          loadId: savedMessage.loadId || null,
          readBy: savedMessage.readBy || []
        },
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('Message send error:', err)
    return NextResponse.json({ error: 'Server error', details: err.message }, { status: 500 })
  }
}
