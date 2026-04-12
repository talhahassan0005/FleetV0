// src/app/api/admin/pods/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import { POD, Load, User } from '@/lib/models'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.role || session.user.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()

    const url = new URL(req.url)
    const statusFilter = url.searchParams.get('status')

    // Build query
    let query: any = {}
    if (statusFilter) {
      query.status = statusFilter
    }

    // Fetch PODs and populate related data
    const pods = await POD.find(query)
      .populate('loadId', 'ref origin destination')
      .populate('transporterId', 'companyName email')
      .sort({ createdAt: -1 })

    // Get client names from loads
    const podsWithClientNames = await Promise.all(
      pods.map(async (pod) => {
        const load = await Load.findById(pod.loadId).populate('clientId', 'email companyName')
        return {
          _id: pod._id,
          loadRef: pod.loadId?.ref || 'Unknown',
          transporterName: pod.transporterId?.companyName || 'Unknown',
          clientName: load?.clientId?.companyName || 'Unknown',
          deliveryDate: pod.deliveryDate,
          deliveryTime: pod.deliveryTime,
          notes: pod.notes,
          status: pod.status,
          loadId: pod.loadId?._id,
          uploadedAt: pod.createdAt,
          podFile: pod.podFile,
          mimeType: pod.mimeType,
        }
      })
    )

    return Response.json({
      success: true,
      pods: podsWithClientNames,
      count: podsWithClientNames.length,
    })
  } catch (error) {
    console.error('[AdminPODs] Error:', error)
    return Response.json({ error: 'Failed to fetch PODs' }, { status: 500 })
  }
}
