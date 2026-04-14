import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getQBInvoiceStatus } from '@/lib/quickbooks';
import { getDatabase } from '@/lib/prisma';

/**
 * POST /api/quickbooks/sync
 * Sync payment data from QB back to MongoDB
 * 
 * Can be called:
 * 1. Manually by admin
 * 2. Automatically by cron job
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.email) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const db = await getDatabase();

    // Verify user is admin
    const admin = await db.collection('users').findOne({
      email: (session.user as any).email,
    });

    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    if (!admin.quickbooks?.isConnected) {
      return NextResponse.json(
        { error: 'QB not connected' },
        { status: 400 }
      );
    }

    const accessToken = admin.quickbooks.accessToken;
    const realmId = admin.quickbooks.realmId;

    console.log('[QB Sync] 🔄 Starting payment sync from QuickBooks...');

    // Get all invoices with QB references
    const invoicesWithQB = await db.collection('invoices')
      .find({
        'qb_sync.invoiceId': { $exists: true, $ne: null },
      })
      .toArray();

    const syncResults = {
      totalInvoices: invoicesWithQB.length,
      updated: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Sync each invoice
    for (const invoice of invoicesWithQB) {
      try {
        // Get invoice status from QB
        const qbStatus = await getQBInvoiceStatus(
          accessToken,
          realmId,
          invoice.qb_sync.invoiceId
        );

        // Map QB status to our status
        let paymentStatus = 'UNPAID';
        if (qbStatus.status === 'PAID') paymentStatus = 'PAID';
        if (qbStatus.status === 'PARTIAL_PAID') paymentStatus = 'PARTIAL_PAID';

        // Update invoice in MongoDB
        await db.collection('invoices').updateOne(
          { _id: invoice._id },
          {
            $set: {
              paymentStatus: paymentStatus,
              totalPaidAmount: qbStatus.paidAmount,
              remainingBalance: qbStatus.balance,
              'qb_sync.lastSyncedAt': new Date(),
              'qb_sync.paymentStatus': qbStatus.status,
            },
          }
        );

        syncResults.updated++;
        console.log(`[QB Sync] ✅ Updated invoice: ${invoice.invoiceNumber}`);
      } catch (error) {
        const message = `Failed to sync invoice ${invoice._id}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        syncResults.errors.push(message);
        syncResults.failed++;
        console.error(`[QB Sync] ❌ ${message}`);
      }
    }

    console.log('[QB Sync] 📊 Payment sync results:', syncResults);

    return NextResponse.json({
      success: true,
      message: 'Payment sync completed',
      results: syncResults,
    });
  } catch (error) {
    console.error('QB Payment Sync Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to sync payments',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/quickbooks/sync
 * Get sync status - for dashboard
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.email) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const db = await getDatabase();

    const user = await db.collection('users').findOne({
      email: (session.user as any).email,
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin only' },
        { status: 403 }
      );
    }

    // Get sync statistics
    const totalInvoices = await db.collection('invoices').countDocuments();
    const syncedInvoices = await db.collection('invoices').countDocuments({
      'qb_sync.invoiceId': { $exists: true, $ne: null },
    });
    const lastSyncDoc = await db.collection('invoices')
      .findOne(
        { 'qb_sync.lastSyncedAt': { $exists: true } },
        { sort: { 'qb_sync.lastSyncedAt': -1 } }
      );

    return NextResponse.json({
      success: true,
      syncStatus: {
        totalInvoices,
        syncedInvoices,
        syncPercentage: totalInvoices > 0 ? Math.round((syncedInvoices / totalInvoices) * 100) : 0,
        lastSyncTime: lastSyncDoc?.qb_sync?.lastSyncedAt,
        qbConnected: user.quickbooks?.isConnected,
      },
    });
  } catch (error) {
    console.error('QB Sync Status Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to get sync status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
