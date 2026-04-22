// src/app/api/diagnose/pods-fileurls/route.ts
// Diagnostic endpoint to check fileUrl values in POD documents

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role ?? '')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await getDatabase()
    const pods = await db.collection('documents')
      .find({ docType: 'POD' })
      .limit(10)
      .toArray()

    const fileUrls = pods.map((pod: any) => ({
      _id: pod._id.toString(),
      filename: pod.filename || 'N/A',
      fileUrl: pod.fileUrl || 'NO_FILE_URL',
      fileUrlStartsWith: pod.fileUrl?.substring(0, 50) || 'MISSING',
      isCloudinaryUrl: pod.fileUrl?.startsWith('http') ? 'YES' : 'NO',
    }))

    return NextResponse.json({
      success: true,
      message: `Found ${pods.length} POD documents`,
      data: fileUrls,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
