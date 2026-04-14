import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createQBCustomer, createQBVendor } from '@/lib/quickbooks';
import { getDatabase } from '@/lib/prisma';
import { ObjectId } from 'mongodb';

/**
 * POST /api/quickbooks/customers/sync
 * Sync all users (clients & transporters) to QB as Customers & Vendors
 * 
 * Admin-only endpoint
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

    console.log('[QB Sync] 🚀 Starting customer sync...');

    // Get all clients
    const clients = await db.collection('users').find({ role: 'CLIENT' }).toArray();

    // Get all transporters
    const transporters = await db.collection('users').find({ role: 'TRANSPORTER' }).toArray();

    const syncResults = {
      clientsCreated: 0,
      clientsFailed: 0,
      transportersCreated: 0,
      transportersFailed: 0,
      errors: [] as string[],
    };

    // Sync Clients to QB Customers
    for (const client of clients) {
      try {
        if (!client.quickbooks?.customerId) {
          const result = await createQBCustomer(
            accessToken,
            realmId,
            {
              displayName: client.companyName || client.email,
              email: client.email,
              phone: client.phone,
              billingAddress: {
                line1: client.address?.street,
                city: client.address?.city,
                countrySubDivisionCode: client.address?.province,
                postalCode: client.address?.postalCode,
                country: client.address?.country || 'ZA',
              },
            }
          );

          // Save QB customer ID to user
          await db.collection('users').updateOne(
            { _id: client._id },
            {
              $set: {
                'quickbooks.customerId': result.id,
                'quickbooks.customerSyncToken': result.syncToken,
                'quickbooks.customerSyncedAt': new Date(),
              },
            }
          );

          console.log(`[QB Sync] ✅ Synced client: ${client.email}`);
          syncResults.clientsCreated++;
        }
      } catch (error) {
        const message = `Failed to sync client ${client.email}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        console.error(`[QB Sync] ❌ ${message}`);
        syncResults.errors.push(message);
        syncResults.clientsFailed++;
      }
    }

    // Sync Transporters to QB Vendors
    for (const transporter of transporters) {
      try {
        if (!transporter.quickbooks?.vendorId) {
          const result = await createQBVendor(
            accessToken,
            realmId,
            {
              displayName: transporter.companyName || transporter.email,
              email: transporter.email,
              phone: transporter.phone,
              bankAccount: transporter.bankAccount,
            }
          );

          // Save QB vendor ID to user
          await db.collection('users').updateOne(
            { _id: transporter._id },
            {
              $set: {
                'quickbooks.vendorId': result.id,
                'quickbooks.vendorSyncToken': result.syncToken,
                'quickbooks.vendorSyncedAt': new Date(),
              },
            }
          );

          console.log(`[QB Sync] ✅ Synced transporter: ${transporter.email}`);
          syncResults.transportersCreated++;
        }
      } catch (error) {
        const message = `Failed to sync transporter ${transporter.email}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        console.error(`[QB Sync] ❌ ${message}`);
        syncResults.errors.push(message);
        syncResults.transportersFailed++;
      }
    }

    console.log('[QB Sync] 📊 Sync results:', syncResults);

    return NextResponse.json({
      success: true,
      message: 'User sync completed',
      results: syncResults,
    });
  } catch (error) {
    console.error('QB Customer Sync Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to sync customers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/quickbooks/customers/sync
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
    const totalClients = await db.collection('users').countDocuments({ role: 'CLIENT' });
    const syncedClients = await db.collection('users').countDocuments({ 
      role: 'CLIENT',
      'quickbooks.customerId': { $exists: true, $ne: null }
    });

    const totalTransporters = await db.collection('users').countDocuments({ role: 'TRANSPORTER' });
    const syncedTransporters = await db.collection('users').countDocuments({ 
      role: 'TRANSPORTER',
      'quickbooks.vendorId': { $exists: true, $ne: null }
    });

    const syncStatus = {
      clients: {
        total: totalClients,
        synced: syncedClients,
        percentage: totalClients > 0 ? Math.round((syncedClients / totalClients) * 100) : 0,
      },
      transporters: {
        total: totalTransporters,
        synced: syncedTransporters,
        percentage: totalTransporters > 0 ? Math.round((syncedTransporters / totalTransporters) * 100) : 0,
      },
      qbConnected: user.quickbooks?.isConnected || false,
    };

    return NextResponse.json({
      success: true,
      syncStatus: syncStatus,
    });
  } catch (error) {
    console.error('QB Customer Sync Status Error:', error);

    return NextResponse.json(
      {
        error: 'Failed to get sync status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
