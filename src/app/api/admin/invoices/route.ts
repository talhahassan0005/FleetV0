// src/app/api/admin/invoices/route.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectToDatabase from '@/lib/db'
import { Invoice, Load, User } from '@/lib/models'

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

    // Fetch invoices
    const invoices = await Invoice.find(query)
      .populate('transporterId', 'companyName email')
      .populate('clientId', 'companyName email')
      .sort({ createdAt: -1 })

    // Get load references
    const invoicesWithLoadRef = await Promise.all(
      invoices.map(async (invoice) => {
        const load = await Load.findById(invoice.loadId)
        return {
          _id: invoice._id,
          invoiceNumber: invoice.invoiceNumber,
          loadRef: load?.ref || 'Unknown',
          transporterName: invoice.transporterId?.companyName || 'Unknown',
          clientName: invoice.clientId?.companyName || 'Unknown',
          amount: invoice.amount,
          currency: invoice.currency,
          status: invoice.status,
          approvedByClient: invoice.approvedByClient,
          approvedByAdmin: invoice.approvedByAdmin,
          createdAt: invoice.createdAt,
          itemDescription: invoice.itemDescription,
          notes: invoice.notes,
          dueDate: invoice.dueDate,
        }
      })
    )

    return Response.json({
      success: true,
      invoices: invoicesWithLoadRef,
      count: invoicesWithLoadRef.length,
    })
  } catch (error) {
    console.error('[AdminInvoices] Error:', error)
    return Response.json({ error: 'Failed to fetch invoices' }, { status: 500 })
  }
}
