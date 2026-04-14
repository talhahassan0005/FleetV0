// Diagnostic endpoint to check invoices in database
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
    const userId = new ObjectId(session.user.id)
    
    const role = session.user.role
    console.log('[DiagnoseInvoices] User:', session.user.email, 'Role:', role)

    if (role === 'CLIENT') {
      // Get client's loads
      const clientLoads = await db.collection('loads').find({
        clientId: userId
      }).toArray()
      
      console.log('[DiagnoseInvoices] Client has', clientLoads.length, 'loads')
      console.log('[DiagnoseInvoices] Load IDs:', clientLoads.map(l => l._id.toString()))

      // Get all invoices for client's loads
      const loadIds = clientLoads.map(l => l._id)
      const invoices = await db.collection('documents').find({
        loadId: { $in: loadIds },
        docType: 'INVOICE'
      }).toArray()

      console.log('[DiagnoseInvoices] Found', invoices.length, 'invoices for client')
      
      return Response.json({
        role: 'CLIENT',
        clientId: userId.toString(),
        loadsCount: clientLoads.length,
        loads: clientLoads.map(l => ({
          _id: l._id.toString(),
          ref: l.ref,
          status: l.status,
        })),
        invoicesCount: invoices.length,
        invoices: invoices.map(inv => ({
          _id: inv._id.toString(),
          loadId: inv.loadId?.toString(),
          docType: inv.docType,
          originalName: inv.originalName,
          uploadedByRole: inv.uploadedByRole,
          createdAt: inv.createdAt,
        })),
      })
    } else if (role === 'TRANSPORTER') {
      // Get transporter's invoices
      const invoices = await db.collection('documents').find({
        userId: userId,
        docType: 'INVOICE'
      }).toArray()

      console.log('[DiagnoseInvoices] Transporter has', invoices.length, 'invoices')

      return Response.json({
        role: 'TRANSPORTER',
        transporterId: userId.toString(),
        invoicesCount: invoices.length,
        invoices: invoices.map(inv => ({
          _id: inv._id.toString(),
          loadId: inv.loadId?.toString(),
          originalName: inv.originalName,
          createdAt: inv.createdAt,
        })),
      })
    } else {
      // Admin
      const allInvoices = await db.collection('documents').find({
        docType: 'INVOICE'
      }).limit(20).toArray()

      console.log('[DiagnoseInvoices] Admin view - Found', allInvoices.length, 'invoices (limited to 20)')

      return Response.json({
        role: 'ADMIN',
        invoicesCount: allInvoices.length,
        invoices: allInvoices.map(inv => ({
          _id: inv._id.toString(),
          loadId: inv.loadId?.toString(),
          userId: inv.userId?.toString(),
          originalName: inv.originalName,
          createdAt: inv.createdAt,
        })),
      })
    }
  } catch (error: any) {
    console.error('[DiagnoseInvoices] Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
