// src/app/api/client/loads-with-pods/route.ts
export const dynamic = 'force-dynamic'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || session.user.role !== 'CLIENT') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = await getDatabase()
    const clientId = new ObjectId(session.user.id)

    console.log('[ClientLoadsWithPODs] 📦 Fetching loads for client:', session.user.email)

    // Get all loads for this client
    const loads = await db.collection('loads').find({
      clientId: clientId,
    }).sort({ createdAt: -1 }).toArray()

    console.log('[ClientLoadsWithPODs] Found', loads.length, 'loads')

    // For each load, fetch POD and Invoice data from documents collection
    const loadsWithDetails = await Promise.all(
      loads.map(async (load) => {
        // Get POD documents that client needs to approve (admin already approved them)
        const podDocs = await db.collection('documents').find({
          loadId: load._id,
          docType: 'POD',
          adminApprovalStatus: 'APPROVED', // Only PODs that admin has approved
          clientApprovalStatus: { $ne: 'APPROVED' } // Exclude already approved by client
        }).toArray()

        // Get QB invoices for this load
        const qbInvoices = await db.collection('invoices').find({
          loadId: load._id,
          invoiceType: 'CLIENT_INVOICE'
        }).toArray()

        console.log(`[ClientLoadsWithPODs] Load ${load.ref}: PODs=${podDocs.length}, Invoices=${qbInvoices.length}`)
        
        if (podDocs.length > 0) {
          console.log(`[ClientLoadsWithPODs]   POD details:`, podDocs.map(doc => ({
            id: doc._id.toString(),
            name: doc.originalName,
            uploadedBy: doc.uploadedByRole,
            adminApprovalStatus: doc.adminApprovalStatus,
            clientApprovalStatus: doc.clientApprovalStatus,
            createdAt: doc.createdAt,
          })))
        }

        return {
          _id: load._id.toString(),
          ref: load.ref,
          origin: load.origin,
          destination: load.destination,
          cargoType: load.cargoType,
          weight: load.weight,
          finalPrice: load.finalPrice,
          currency: load.currency,
          status: load.status,
          collectionDate: load.collectionDate,
          invoices: podDocs.map(doc => ({
            _id: doc._id.toString(),
            filename: doc.originalName,
            fileUrl: (() => { try { const p = JSON.parse(doc.fileUrl); return p.url || doc.fileUrl } catch { return doc.fileUrl } })(),
            uploadedAt: doc.createdAt,
            uploadedBy: doc.uploadedByRole,
            approved: doc.clientApprovalStatus === 'APPROVED',
            clientApprovalStatus: doc.clientApprovalStatus,
            rejectionReason: doc.rejectionReason,
          })),
          invoiceCount: podDocs.length, // Count of PODs pending client approval
          qbInvoices: qbInvoices.map(inv => ({
            _id: inv._id.toString(),
            invoiceNumber: inv.invoiceNumber,
            amount: inv.amount,
            currency: inv.currency,
            paymentStatus: inv.paymentStatus,
            clientApprovalStatus: inv.clientApprovalStatus,
            qbLink: inv.qbLink || inv.qb_sync?.invoiceLink,
          })),
          hasInvoice: qbInvoices.length > 0,
          invoiceStatus: qbInvoices.length > 0 ? qbInvoices[0].clientApprovalStatus : null,
        }
      })
    )

    console.log('[ClientLoadsWithPODs] 📊 Summary:')
    console.log('[ClientLoadsWithPODs]   Total loads:', loadsWithDetails.length)
    console.log('[ClientLoadsWithPODs]   Loads with invoices:', loadsWithDetails.filter(l => l.invoiceCount > 0).length)
    console.log('[ClientLoadsWithPODs]   Total invoices:', loadsWithDetails.reduce((acc, l) => acc + l.invoiceCount, 0))

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
