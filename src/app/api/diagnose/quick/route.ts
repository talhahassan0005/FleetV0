// Quick diagnostic - check PODs and Invoices in database
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDatabase()

    // Check all PODs
    const allPODs = await db.collection('documents').find({
      docType: 'POD'
    }).limit(10).toArray()

    console.log('[QuickDiag] Total PODs:', allPODs.length)
    allPODs.forEach(pod => {
      console.log(`[QuickDiag] POD: ${pod.originalName} | Load: ${pod.loadId} | Created: ${pod.createdAt}`)
    })

    // Check all Invoices
    const allInvoices = await db.collection('documents').find({
      docType: 'INVOICE'
    }).limit(10).toArray()

    console.log('[QuickDiag] Total Invoices:', allInvoices.length)
    allInvoices.forEach(inv => {
      console.log(`[QuickDiag] Invoice: ${inv.originalName} | Load: ${inv.loadId} | Created: ${inv.createdAt}`)
    })

    return Response.json({
      podsCount: allPODs.length,
      invoicesCount: allInvoices.length,
      pods: allPODs.map(p => ({
        id: p._id.toString(),
        name: p.originalName,
        loadId: p.loadId?.toString(),
        created: p.createdAt,
      })),
      invoices: allInvoices.map(i => ({
        id: i._id.toString(),
        name: i.originalName,
        loadId: i.loadId?.toString(),
        created: i.createdAt,
      })),
    })
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
