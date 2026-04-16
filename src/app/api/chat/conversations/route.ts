// src/app/api/chat/conversations/route.ts
/**
 * Chat Conversations API
 * GET — Fetch conversations for logged-in user (Client/Transporter/Admin)
 * POST — Create conversation between Client and Transporter for a specific load
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { authOptions } from '@/lib/auth'

/**
 * HELPER: Generate consistent conversation ID from two user IDs
 * This ensures both users use the SAME ID regardless of who initiates
 * Format: sorted(userId1, userId2) to ensure consistency
 */
function generateConversationId(userId1: string, userId2: string): string {
  const ids = [userId1, userId2].sort()
  return ids.join('_')
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(session.user.id)

    // Get conversations where user is a participant
    const conversations = await db.collection('conversations')
      .find({ 
        'participants.userId': userId,
        isActive: true 
      })
      .sort({ lastMessageAt: -1 })
      .toArray()

    return NextResponse.json({ success: true, data: conversations })
  } catch (err: any) {
    console.error('[Chat] Error fetching conversations:', err)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { loadId } = await req.json()
    if (!loadId) {
      return NextResponse.json({ error: 'loadId required' }, { status: 400 })
    }

    const db = await getDatabase()
    const loadObjectId = new ObjectId(loadId)
    const requesterId = new ObjectId(session.user.id)

    // Get load details
    const load = await db.collection('loads').findOne({ _id: loadObjectId })
    if (!load) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }

    // Get client and transporter of this load
    const clientId = new ObjectId(load.clientId)
    const transporterId = load.assignedTransporterId ? new ObjectId(load.assignedTransporterId) : null

    if (!clientId || !transporterId) {
      return NextResponse.json({ 
        error: 'Load must have both client and transporter assigned' 
      }, { status: 400 })
    }

    // Verify requester is part of this load (Client, Transporter, or Admin)
    const isClient = clientId.toString() === requesterId.toString()
    const isTransporter = transporterId.toString() === requesterId.toString()
    const isAdmin = session.user.role === 'ADMIN'

    if (!isClient && !isTransporter && !isAdmin) {
      return NextResponse.json({ error: 'You are not part of this load' }, { status: 403 })
    }

    // Check if conversation already exists for this load
    const existing = await db.collection('conversations').findOne({
      loadId: loadObjectId,
      isActive: true,
    })

    if (existing) {
      return NextResponse.json({ success: true, data: existing })
    }

    // Fetch client and transporter details
    const [client, transporter] = await Promise.all([
      db.collection('users').findOne({ _id: clientId }),
      db.collection('users').findOne({ _id: transporterId }),
    ])

    // Create new conversation
    const conversation = await db.collection('conversations').insertOne({
      participants: [
        {
          userId: clientId,
          role: 'CLIENT',
          name: client?.companyName || client?.contactName || client?.email,
        },
        {
          userId: transporterId,
          role: 'TRANSPORTER',
          name: transporter?.companyName || transporter?.contactName || transporter?.email,
        },
      ],
      loadId: loadObjectId,
      loadRef: load.ref,
      isActive: true,
      unreadCount: {
        [clientId.toString()]: 0,
        [transporterId.toString()]: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const newConversation = await db.collection('conversations').findOne({ 
      _id: conversation.insertedId 
    })

    // Emit socket.io event to notify participants of new conversation
    if (global.ioInstance) {
      global.ioInstance.to(clientId.toString()).emit('conversation:created', newConversation)
      global.ioInstance.to(transporterId.toString()).emit('conversation:created', newConversation)
    }

    return NextResponse.json({ success: true, data: newConversation })
  } catch (error: any) {
    console.error('[Chat] Error creating conversation:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
