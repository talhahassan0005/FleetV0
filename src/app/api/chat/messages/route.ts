// src/app/api/chat/messages/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Mock messages storage - in production use a database
const messages = new Map<string, any[]>()

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const conversationId = req.nextUrl.searchParams.get('conversationId')
    if (!conversationId) {
      return NextResponse.json({ error: 'Missing conversationId' }, { status: 400 })
    }

    const conversationMessages = messages.get(conversationId) || []

    return NextResponse.json({
      success: true,
      data: conversationMessages,
    })
  } catch (err: any) {
    console.error('Messages fetch error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { conversationId, recipientId, message } = await req.json()

    if (!conversationId || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const newMessage = {
      id: `${Date.now()}-${Math.random()}`,
      senderId: session.user.id,
      senderName: session.user.companyName || session.user.email,
      recipientId,
      message,
      timestamp: new Date(),
      read: false,
    }

    if (!messages.has(conversationId)) {
      messages.set(conversationId, [])
    }

    messages.get(conversationId)?.push(newMessage)

    return NextResponse.json(
      {
        success: true,
        data: newMessage,
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('Message send error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
