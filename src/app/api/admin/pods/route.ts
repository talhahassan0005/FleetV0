// src/app/api/admin/pods/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDatabase()

    const url = new URL(req.url)
    const statusFilter = url.searchParams.get('status')

    // Build query for documents collection (POD type)
    let query: any = { docType: 'POD' }
    
    // Map status filter to approval status
    if (statusFilter) {
      if (statusFilter === 'PENDING') {
        query.adminApprovalStatus = 'PENDING_ADMIN'
      } else if (statusFilter === 'APPROVED') {
        query.adminApprovalStatus = 'APPROVED'
      }
    }

    // Fetch PODs from documents collection
    const pods = await db.collection('documents')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    // Enrich with load, transporter, and client details
    const podsWithDetails = await Promise.all(
      pods.map(async (pod: any) => {
        try {
          // Get load details
          const load = await db.collection('loads').findOne({ _id: pod.loadId })
          
          // Get transporter details
          const transporter = await db.collection('users').findOne({ _id: pod.userId })
          
          // Get client details from load
          const client = load ? await db.collection('users').findOne({ _id: load.clientId }) : null

          return {
            _id: pod._id.toString(),
            loadRef: load?.ref || 'Unknown',
            transporterName: transporter?.companyName || transporter?.name || 'Unknown',
            clientName: client?.companyName || client?.name || 'Unknown',
            deliveryDate: pod.createdAt, // Using upload date as delivery date
            deliveryTime: null,
            notes: pod.adminComments || '',
            status: pod.adminApprovalStatus === 'APPROVED' ? 'APPROVED' : 'PENDING',
            loadId: pod.loadId?.toString(),
            uploadedAt: pod.createdAt,
            podFile: pod.fileUrl, // ← This is the fix - use fileUrl from documents
            mimeType: pod.fileMimeType || 'application/pdf',
          }
        } catch (err) {
          console.error('[AdminPODs] Error enriching POD:', err)
          return {
            _id: pod._id.toString(),
            loadRef: 'Error',
            transporterName: 'Unknown',
            clientName: 'Unknown',
            deliveryDate: pod.createdAt,
            deliveryTime: null,
            notes: '',
            status: 'PENDING',
            loadId: pod.loadId?.toString(),
            uploadedAt: pod.createdAt,
            podFile: pod.fileUrl,
            mimeType: pod.fileMimeType || 'application/pdf',
          }
        }
      })
    )

    return Response.json({
      success: true,
      pods: podsWithDetails,
      count: podsWithDetails.length,
    })
  } catch (error) {
    console.error('[AdminPODs] Error:', error)
    return Response.json({ error: 'Failed to fetch PODs' }, { status: 500 })
  }
}
