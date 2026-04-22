// src/app/api/admin/pods/for-invoice-creation/route.ts
/**
 * GET PODs approved by both admin and client, ready for invoice creation
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { ObjectId } from 'mongodb'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role)) {
      return NextResponse.json(
        { error: 'Only admins can view PODs for invoice creation' },
        { status: 403 }
      )
    }

    const adminRole = (session.user as any).adminRole
    if (!requirePermission(adminRole, 'invoices')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const db = await getDatabase()

    // First, let's see what PODs exist and their status
    const allPODs = await db.collection('documents').find({
      docType: 'POD'
    }).toArray()
    
    console.log('[ForInvoiceCreation] Total PODs found:', allPODs.length)
    console.log('[ForInvoiceCreation] POD statuses:', allPODs.map(p => ({
      id: p._id.toString(),
      adminStatus: p.adminApprovalStatus,
      clientStatus: p.clientApprovalStatus,
      invoiceStatus: p.invoiceStatus,
      loadId: p.loadId?.toString(),
      originalName: p.originalName
    })))

    // Also check if there are PODs in a different collection
    const podCollection = await db.collection('pods').find({}).toArray()
    console.log('[ForInvoiceCreation] PODs in pods collection:', podCollection.length)
    if (podCollection.length > 0) {
      console.log('[ForInvoiceCreation] Sample POD from pods collection:', podCollection[0])
    }

    // Get PODs approved by BOTH admin and client, ready for invoicing
    const readyPODs = await db.collection('documents').find({
      docType: 'POD',
      adminApprovalStatus: 'APPROVED',
      clientApprovalStatus: 'APPROVED', // Must be approved by client too
      // Only exclude if explicitly marked as invoiced
      invoiceStatus: { $ne: 'INVOICED' }
    })
    .sort({ createdAt: -1 })
    .toArray()

    console.log('[ForInvoiceCreation] Found', readyPODs.length, 'PODs ready for invoicing')
    console.log('[ForInvoiceCreation] Ready PODs:', readyPODs.map(p => ({
      id: p._id.toString(),
      adminStatus: p.adminApprovalStatus,
      clientStatus: p.clientApprovalStatus,
      loadId: p.loadId?.toString()
    })))

    // Enrich with load and transporter details
    const enrichedPODs = await Promise.all(
      readyPODs.map(async (pod: any) => {
        try {
          console.log('[ForInvoiceCreation] Processing POD:', pod._id.toString(), 'loadId:', pod.loadId)
          
          let loadId = pod.loadId
          if (typeof loadId === 'string') {
            loadId = new ObjectId(loadId)
          }
          
          const load = await db.collection('loads').findOne({
            _id: loadId
          })
          
          console.log('[ForInvoiceCreation] Load found:', !!load, load?.ref)

          let userId = pod.userId
          if (typeof userId === 'string') {
            userId = new ObjectId(userId)
          }

          const transporter = await db.collection('users').findOne({
            _id: userId
          })
          
          console.log('[ForInvoiceCreation] Transporter found:', !!transporter, transporter?.companyName)

          return {
            _id: pod._id.toString(),
            loadRef: load?.ref || 'Unknown Load',
            origin: load?.origin || 'Unknown',
            destination: load?.destination || 'Unknown',
            transporterName: transporter?.companyName || 'Unknown Transporter',
            transporterId: transporter?._id.toString(),
            podFileName: pod.originalName || 'POD Document',
            podUrl: pod.fileUrl,
            loadId: pod.loadId?.toString(),
            amount: load?.finalPrice || 0,
            currency: load?.currency || 'ZAR',
            invoiceStatus: pod.invoiceStatus || 'NOT_INVOICED',
            invoicedAt: pod.invoicedAt || null,
            clientApprovalStatus: pod.clientApprovalStatus || 'PENDING_CLIENT',
            adminApprovalStatus: pod.adminApprovalStatus || 'PENDING_ADMIN'
          }
        } catch (err) {
          console.error('[ForInvoiceCreation] Error processing POD:', pod._id, err)
          return {
            _id: pod._id.toString(),
            loadRef: 'Error Loading',
            origin: 'Error',
            destination: 'Error',
            transporterName: 'Error',
            transporterId: null,
            podFileName: pod.originalName || 'POD Document',
            podUrl: pod.fileUrl,
            loadId: pod.loadId?.toString(),
            amount: 0,
            currency: 'ZAR',
            invoiceStatus: 'ERROR',
            invoicedAt: null,
            clientApprovalStatus: pod.clientApprovalStatus,
            adminApprovalStatus: pod.adminApprovalStatus
          }
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: enrichedPODs,
      count: enrichedPODs.length,
    })

  } catch (error: any) {
    console.error('[ForInvoiceCreation] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch PODs', details: error.message },
      { status: 500 }
    )
  }
}
