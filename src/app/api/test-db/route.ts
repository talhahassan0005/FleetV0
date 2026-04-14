import { NextRequest, NextResponse } from 'next/server'
import connectToDatabase from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    console.log('Testing MongoDB connection...')
    const conn = await connectToDatabase()
    console.log('Connection successful:', !!conn)
    return NextResponse.json({ message: 'MongoDB connected successfully', connected: true }, { status: 200 })
  } catch (err: any) {
    console.error('MongoDB test error:', err)
    return NextResponse.json({ 
      error: 'MongoDB connection failed', 
      message: err.message,
      code: err.code 
    }, { status: 500 })
  }
}
