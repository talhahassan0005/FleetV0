// src/app/api/chat/conversations/route.ts
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
    const userId = session.user.id

    // Get all conversations for this user
    const conversations = await db
      .collection('conversations')
      .find({
        'participants.userId': userId,
        isActive: true,
      })
      .sort({ lastMessageAt: -1 })
      .toArray()

    // Transform for client - get other user details
    const transformedConversations = await Promise.all(
      conversations.map(async (conv: any) => {
        const otherParticipant = conv.participants.find(
          (p: any) => p.userId !== userId
        )

        // Get other user's full details
        let otherUserDetails: any = null
        if (otherParticipant?.userId) {
          try {
            const otherUser = await db
              .collection('users')
              .findOne({
                _id: new ObjectId(otherParticipant.userId),
              })
            
            if (otherUser) {
              otherUserDetails = {
                _id: otherUser._id,
                userId: otherUser._id.toString(),
                name: otherUser.companyName || otherUser.name || otherUser.email,
                email: otherUser.email,
                role: otherUser.role,
                companyName: otherUser.companyName,
              }
            }
          } catch (err) {
            console.error('Failed to fetch other user details:', err)
          }
        }

        return {
          _id: conv._id.toString(),
          conversationId: conv.conversationId,
          participants: conv.participants,
          otherParticipant: otherUserDetails || {
            userId: otherParticipant?.userId,
            name: otherParticipant?.name || 'Unknown',
            email: otherParticipant?.email || '',
          },
          loadId: conv.loadId?.toString?.(),
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          unreadCount: conv.unreadCount?.[userId] || 0,
          isActive: conv.isActive,
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: transformedConversations,
    })
  } catch (err: any) {
    console.error('[GetConversations] Error:', err)
    return NextResponse.json(
      { error: 'Failed to fetch conversations', details: err.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { otherUserId, loadId } = await req.json()

    if (!otherUserId) {
      return NextResponse.json(
        { error: 'Missing otherUserId' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const userId = session.user.id

    // Generate consistent conversation ID
    const conversationId = generateConversationId(userId, otherUserId)

    // Get both users' details
    let currentUser: any = null
    let otherUser: any = null

    try {
      currentUser = await db.collection('users').findOne({
        _id: new ObjectId(userId),
      })
      otherUser = await db.collection('users').findOne({
        _id: new ObjectId(otherUserId),
      })
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }

    if (!currentUser || !otherUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Create or get conversation
    let conversation = await db.collection('conversations').findOne({
      conversationId,
    })

    if (!conversation) {
      // Create new conversation
      const result = await db.collection('conversations').insertOne({
        conversationId,
        participants: [
          {
            userId,
            userRole: session.user.role,
            name: currentUser.companyName || currentUser.name || currentUser.email,
            email: currentUser.email,
          },
          {
            userId: otherUserId,
            userRole: otherUser.role,
            name: otherUser.companyName || otherUser.name || otherUser.email,
            email: otherUser.email,
          },
        ],
        unreadCount: {
          [userId]: 0,
          [otherUserId]: 0,
        },
        isActive: true,
        ...(loadId && { loadId: new ObjectId(loadId) }),
        createdAt: new Date(),
        lastMessageAt: null,
        lastMessage: null,
      })

      conversation = {
        _id: result.insertedId,
        conversationId,
        participants: [
          {
            userId,
            userRole: session.user.role,
            name: currentUser.companyName || currentUser.name || currentUser.email,
            email: currentUser.email,
          },
          {
            userId: otherUserId,
            userRole: otherUser.role,
            name: otherUser.companyName || otherUser.name || otherUser.email,
            email: otherUser.email,
          },
        ],
      }
    }

    const responseData = {
      _id: conversation._id.toString(),
      conversationId: conversation.conversationId,
      participants: conversation.participants,
      otherParticipant: {
        _id: otherUser._id,
        userId: otherUser._id.toString(),
        name: otherUser.companyName || otherUser.name || otherUser.email,
        email: otherUser.email,
        role: otherUser.role,
        companyName: otherUser.companyName,
      },
      loadId: conversation.loadId?.toString?.(),
      lastMessage: conversation.lastMessage,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount: conversation.unreadCount?.[userId] || 0,
      isActive: conversation.isActive,
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    })
  } catch (err: any) {
    console.error('[CreateConversation] Error:', err)
    return NextResponse.json(
      { error: 'Failed to create conversation', details: err.message },
      { status: 500 }
    )
  }
}
