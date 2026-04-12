// src/app/api/client/loads-with-pods/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import { Load, POD, Invoice, User } from '@/lib/models'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== 'CLIENT') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectToDatabase()

    // Get all loads for this client
    const loads = await Load.find({
      clientId: session.user.id,
    }).sort({ createdAt: -1 })

    // For each load, fetch POD and Invoice data
    const loadsWithDetails = await Promise.all(
      loads.map(async (load) => {
        const pod = await POD.findOne({ loadId: load._id })
        const invoice = await Invoice.findOne({ loadId: load._id })

        return {
          _id: load._id,
          ref: load.ref,
          origin: load.origin,
          destination: load.destination,
          cargoType: load.cargoType,
          weight: load.weight,
          finalPrice: load.finalPrice,
          currency: load.currency,
          status: load.status,
          collectionDate: load.collectionDate,
          pod: pod ? {
            _id: pod._id,
            status: pod.status,
            deliveryDate: pod.deliveryDate,
          } : null,
          invoice: invoice ? {
            _id: invoice._id,
            invoiceNumber: invoice.invoiceNumber,
            amount: invoice.amount,
            status: invoice.status,
            approvedByClient: invoice.approvedByClient,
            approvedByAdmin: invoice.approvedByAdmin,
            createdAt: invoice.createdAt,
          } : null,
        }
      })
    )

    return Response.json({
      success: true,
      loads: loadsWithDetails,
      count: loadsWithDetails.length,
    })
  } catch (error) {
    console.error('[ClientLoadsWithPODs] Error:', error)
    return Response.json({ error: 'Failed to fetch loads' }, { status: 500 })
  }
}
