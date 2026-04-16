/**
 * QuickBooks Payment Sync Job
 * Runs every hour to sync payment status from QB back to MongoDB
 * 
 * Usage:
 * import '@/jobs/quickbooks-sync';
 * 
 * This will automatically start sync every hour
 */

import { MongoClient } from 'mongodb';

const MONGO_URL = process.env.MONGO_URL || '';
const SYNC_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

let syncInProgress = false;

/**
 * Get QB admin credentials from database
 */
async function getQBAdminCredentials(db: any) {
  const admin = await db.collection('users').findOne({
    role: 'ADMIN',
    $or: [
      { 'quickbooks.isConnected': true },
      { 'quickbooksAccounts.isConnected': true },
    ]
  });

  if (!admin) {
    throw new Error('No QB connected admin found');
  }

  // Try quickbooksAccounts first (new multi-country)
  const activeAccount = admin.quickbooksAccounts?.find((acc: any) => acc.isConnected);
  if (activeAccount?.accessToken) {
    return {
      accessToken: activeAccount.accessToken,
      realmId: activeAccount.realmId,
    };
  }

  // Fallback to legacy single account
  if (admin.quickbooks?.accessToken) {
    return {
      accessToken: admin.quickbooks.accessToken,
      realmId: admin.quickbooks.realmId,
    };
  }

  throw new Error('No QB connected admin found');
}

/**
 * Fetch invoice status from QB
 */
async function getQBInvoiceStatus(
  accessToken: string,
  realmId: string,
  invoiceId: string
): Promise<{ paidAmount: number; balance: number; status: string }> {
  const QB_API_BASE_URL = `https://quickbooks.api.intuit.com/v2/companyinfo/${realmId}`;

  const response = await fetch(`${QB_API_BASE_URL}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `SELECT * FROM Invoice WHERE Id = '${invoiceId}'`,
    }),
  });

  if (!response.ok) {
    throw new Error(`QB API error: ${response.statusText}`);
  }

  const result = await response.json();
  const invoice = result.QueryResponse?.Invoice?.[0];

  if (!invoice) {
    throw new Error(`Invoice ${invoiceId} not found in QB`);
  }

  const totalAmount = invoice.TotalAmt || 0;
  const balance = invoice.Balance || totalAmount;
  const paidAmount = totalAmount - balance;

  return {
    paidAmount,
    balance,
    status: balance === 0 ? 'PAID' : balance === totalAmount ? 'UNPAID' : 'PARTIAL_PAID',
  };
}

/**
 * Main sync function
 */
async function syncPaymentsFromQB() {
  if (syncInProgress) {
    console.log('[QB Sync] ⏭️ Sync already in progress, skipping...');
    return;
  }

  syncInProgress = true;

  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    const db = client.db('FleetXChange');

    console.log('[QB Sync] 🔄 Starting payment sync from QuickBooks...');

    // Get QB admin credentials
    let credentials;
    try {
      credentials = await getQBAdminCredentials(db);
    } catch (error) {
      // QB not connected yet - this is normal during initial setup
      console.log('[QB Sync] ℹ️ QB not connected - sync will resume when admin connects QB');
      await client.close();
      syncInProgress = false;
      return;
    }

    // Find all invoices with QB references
    const invoicesCollection = db.collection('invoices');
    const invoicesWithQB = await invoicesCollection
      .find({
        'qb_sync.invoiceId': { $exists: true, $ne: null },
      })
      .toArray();

    console.log(`[QB Sync] 📋 Found ${invoicesWithQB.length} invoices to sync`);

    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    // Sync each invoice
    for (const invoice of invoicesWithQB) {
      try {
        // Skip if recently synced (within 30 minutes)
        if (invoice.qb_sync?.lastSyncedAt) {
          const lastSync = new Date(invoice.qb_sync.lastSyncedAt);
          const timeSinceSync = Date.now() - lastSync.getTime();
          if (timeSinceSync < 30 * 60 * 1000) {
            console.log(`[QB Sync] ⏭️ Skipping ${invoice.qb_sync.invoiceId} (recently synced)`);
            continue;
          }
        }

        // Get invoice status from QB
        const qbStatus = await getQBInvoiceStatus(
          credentials.accessToken,
          credentials.realmId,
          invoice.qb_sync.invoiceId
        );

        // Map QB status to our system
        let paymentStatus = 'UNPAID';
        if (qbStatus.status === 'PAID') paymentStatus = 'PAID';
        if (qbStatus.status === 'PARTIAL_PAID') paymentStatus = 'PARTIAL_PAID';

        // Update invoice in MongoDB
        const result = await invoicesCollection.updateOne(
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

        if (result.modifiedCount > 0) {
          updated++;
          console.log(
            `[QB Sync] ✅ Updated invoice ${invoice.qb_sync.invoiceId}: ${qbStatus.status}`
          );

          // Send email if payment is completed
          if (paymentStatus === 'PAID' && invoice.paymentStatus !== 'PAID') {
            const client = await db.collection('users').findOne({
              _id: invoice.clientId,
            });

            if (client?.email) {
              console.log(
                `[QB Sync] 📧 Would send payment confirmation to ${client.email}`
              );
              // TODO: Send email via sendEmail function
            }
          }
        }
      } catch (error) {
        failed++;
        const message = `Failed to sync invoice ${invoice.qb_sync.invoiceId}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        errors.push(message);
        console.error(`[QB Sync] ❌ ${message}`);
      }
    }

    console.log(
      `[QB Sync] ✅ Sync completed: ${updated} updated, ${failed} failed`
    );

    if (errors.length > 0) {
      console.error('[QB Sync] Errors:', errors);
    }

    await client.close();
  } catch (error) {
    console.error('[QB Sync] ❌ Fatal error during sync:', error);
  } finally {
    syncInProgress = false;
  }
}

/**
 * Initialize sync job
 * This runs once when the module is imported
 */
function initializeSyncJob() {
  // Increase max listeners to prevent warnings during hot reload
  process.setMaxListeners(20);

  // Run first sync after 5 minutes
  setTimeout(() => {
    console.log('[QB Sync] 🚀 Starting QB payment sync job...');
    syncPaymentsFromQB();
  }, 5 * 60 * 1000);

  // Then run every hour
  const intervalId = setInterval(() => {
    syncPaymentsFromQB();
  }, SYNC_INTERVAL);

  // Handle graceful shutdown
  if (typeof process !== 'undefined') {
    if (!process.listeners('SIGTERM').length) {
      process.on('SIGTERM', () => {
        clearInterval(intervalId);
        console.log('[QB Sync] 🛑 Scheduled sync job stopped');
      });
    }
  }

  console.log('[QB Sync] ⏰ Job scheduled to run every hour');
}

// Initialize on import
initializeSyncJob();

export { syncPaymentsFromQB };
export default syncPaymentsFromQB;
