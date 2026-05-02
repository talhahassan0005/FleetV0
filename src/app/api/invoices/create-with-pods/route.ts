// src/app/api/invoices/create-with-pods/route.ts
/**
 * NEW INVOICE WORKFLOW
 * 
 * Transporter uploads POD + Invoice
 * Admin reviews & approves POD
 * → Auto-forwards POD to Client
 * → Creates two invoices:
 *    1. Transporter Invoice (from transporter's submission)
 *    2. Client Invoice (transporter amount + markup from QuickBooks)
 * Client reviews & approves POD
 * Client receives invoice, makes payment
 * Admin tracks payment status
 */

export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getDatabase } from '@/lib/prisma'
import { ObjectId } from 'mongodb'
import { sendEmail } from '@/lib/email'
import { invoiceGeneratedEmail } from '@/lib/email'
import { createQBCustomer, createQBVendor, createQBInvoice, createQBBill, makeQBAPICallWithRefresh, generateQBInvoiceLink, generateQBBillLink } from '@/lib/quickbooks'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || !['SUPER_ADMIN','FINANCE_ADMIN','OPERATIONS_ADMIN','POD_MANAGER'].includes(session?.user?.role ?? '')) {
      return NextResponse.json(
        { error: 'Only admins can create invoices' },
        { status: 403 }
      )
    }

    const db = await getDatabase()
    const body = await req.json()

    const {
      loadId,
      podId,
      transporterId,
      tonnageForThisInvoice,
      transporterInvoiceNumber,
      transporterAmount,
      markupPercentage = 10, // Default 10% markup
      currency, // Add currency from request
      notes = ''
    } = body

    if (!loadId || !podId || !transporterId || !tonnageForThisInvoice || !transporterInvoiceNumber || !transporterAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get load details
    const load = await db.collection('loads').findOne({
      _id: new ObjectId(loadId)
    })

    if (!load) {
      return NextResponse.json(
        { error: 'Load not found' },
        { status: 404 }
      )
    }

    // Get POD details
    const pod = await db.collection('documents').findOne({
      _id: new ObjectId(podId),
      docType: 'POD'
    })

    if (!pod) {
      return NextResponse.json(
        { error: 'POD not found' },
        { status: 404 }
      )
    }

    // Verify POD is approved by Admin
    if (pod.adminApprovalStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'POD must be approved by admin first' },
        { status: 400 }
      )
    }

    // CRITICAL FIX: Check if POD is already invoiced
    if (pod.invoiceStatus === 'INVOICED') {
      return NextResponse.json(
        { error: 'This POD has already been invoiced. Cannot create duplicate invoice.' },
        { status: 400 }
      )
    }

    // Get transporter details
    const transporter = await db.collection('users').findOne({
      _id: new ObjectId(transporterId)
    })

    if (!transporter) {
      return NextResponse.json(
        { error: 'Transporter not found' },
        { status: 404 }
      )
    }

    // Get client details
    const client = await db.collection('users').findOne({
      _id: load.clientId
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      )
    }

    // Calculate tonnage progress
    // Fetch ALL non-cancelled client invoices for this load BEFORE creating new one
    const existingInvoices = await db.collection('invoices').find({
      loadId: new ObjectId(loadId),
      invoiceType: 'CLIENT_INVOICE',
      status: { $nin: ['CANCELLED', 'REJECTED'] }
    }).toArray();

    const previousTonnage = existingInvoices.reduce(
      (sum: number, inv: any) => sum + (Number(inv.tonnageForThisInvoice) || Number(inv.tonnage) || 0), 0
    );
    const currentTonnage = Number(tonnageForThisInvoice) || 0;
    const totalTonnageDelivered = previousTonnage + currentTonnage;
    const loadWeight = Number(load.totalTonnage) || Number(load.weight) || 1;

    const progressPercentage = Math.min(
      Math.round((totalTonnageDelivered / loadWeight) * 100),
      100
    );

    // Cap tonnage display at load weight to prevent overflow
    const displayTonnage = Math.min(totalTonnageDelivered, loadWeight);

    const tonnageDeliveredSoFar = previousTonnage;
    const totalLoadTonnage = loadWeight;

    // Calculate client amount (transporter amount + markup)
    const markupAmount = transporterAmount * (markupPercentage / 100)
    const clientAmount = transporterAmount + markupAmount

    // Generate invoice numbers
    const invoiceCount = existingInvoices.length + 1
    const transporterInvNum = `${transporterInvoiceNumber}` // From transporter's QBs
    const clientInvNum = `${load.ref}-INV-${invoiceCount}` // FleetXchange's number

    // ============================================
    // QuickBooks Pre-Validation (BEFORE DB inserts)
    // If QB is not configured or fails, block invoice creation entirely
    // ============================================
    let qbInvoiceId: string | null = null;
    let qbInvoiceSyncToken: string | null = null;
    let qbInvoiceLink: string | null = null;
    let qbBillLink: string | null = null;
    let qbRealmId: string | null = null;
    let qbClientCustomerId: string | null = null;
    let qbTransporterVendorId: string | null = null;
    let qbCredentials: any = null;

    try {
      console.log(`[Invoice] 🔍 Searching for QB credentials for currency ${currency || load.currency}...`);
      
      const { getQBCredentialsByCurrency } = await import('@/lib/quickbooks');
      qbCredentials = await getQBCredentialsByCurrency(currency || load.currency);
      console.log('[Invoice] QB credential lookup result:', qbCredentials ? '✅ FOUND' : '❌ NOT FOUND');

      if (!qbCredentials) {
        return NextResponse.json(
          { 
            error: `QuickBooks is not connected for currency ${currency || load.currency}. Please connect a QuickBooks account for this currency before creating invoices.`,
            qbError: true 
          },
          { status: 422 }
        );
      }

      // VALIDATION: Ensure QB account currency matches selected currency
      if (qbCredentials.country) {
        const qbCurrency = qbCredentials.country === 'ZA' ? 'ZAR' : 
                          qbCredentials.country === 'BW' ? 'BWP' :
                          qbCredentials.country === 'ZW' ? 'ZWL' :
                          qbCredentials.country === 'US' ? 'USD' : 'ZAR';
        
        const selectedCurrency = currency || load.currency;
        if (qbCurrency !== selectedCurrency) {
          return NextResponse.json(
            { 
              error: `Currency mismatch: Selected currency (${selectedCurrency}) does not match the connected QuickBooks account (${qbCurrency}). Please connect a QB account for ${selectedCurrency}.`,
              qbError: true 
            },
            { status: 422 }
          );
        }
        console.log(`[Invoice] ✅ Currency validation passed: ${selectedCurrency} matches QB account`);
      }

      qbRealmId = qbCredentials.realmId;
      const realmId = qbRealmId as string; // Safe: we just verified qbCredentials is not null
      console.log('[Invoice] ✅ QB credentials found. Starting QB customer/vendor sync...');
      console.log('[Invoice] 👤 Client QB ID:', client.quickbooks?.customerId || 'NOT SET');
      console.log('[Invoice] 🚚 Transporter QB ID:', transporter.quickbooks?.vendorId || 'NOT SET');

      // Ensure client exists in QB
      if (!client.quickbooks?.customerId) {
        console.log('[Invoice] 👤 Creating QB Customer for client:', client.companyName);
        const qbCustomer = await createQBCustomer(realmId, {
          displayName: client.companyName || client.email,
          email: client.email,
          phone: client.phone,
        }, load.currency);

        if (!qbCustomer?.id) {
          throw new Error('QB Customer creation failed: No ID returned');
        }

        await db.collection('users').updateOne(
          { _id: client._id },
          {
            $set: {
              'quickbooks.customerId': qbCustomer.id,
              'quickbooks.customerSyncToken': qbCustomer.syncToken,
              'quickbooks.customerSyncedAt': new Date(),
            },
          }
        );
        if (!client.quickbooks) client.quickbooks = {};
        client.quickbooks.customerId = qbCustomer.id;
        console.log('[Invoice] ✅ QB Customer created:', qbCustomer.id);
      } else {
        // Verify customer exists in QB
        try {
          const verifyResult = await makeQBAPICallWithRefresh(
            `/customer/${client.quickbooks.customerId}`,
            'GET',
            realmId,
            undefined,
            load.currency
          );
          if (!verifyResult?.Customer?.Id) throw new Error('Customer not found in QB');
          console.log('[Invoice] ✅ Customer verified in QB');
        } catch {
          const qbCustomer = await createQBCustomer(realmId, {
            displayName: client.companyName || client.email,
            email: client.email,
            phone: client.phone,
          }, load.currency);
          await db.collection('users').updateOne(
            { _id: client._id },
            { $set: { 'quickbooks.customerId': qbCustomer.id, 'quickbooks.customerSyncToken': qbCustomer.syncToken, 'quickbooks.customerSyncedAt': new Date() } }
          );
          client.quickbooks.customerId = qbCustomer.id;
          console.log('[Invoice] ✅ QB Customer recreated:', qbCustomer.id);
        }
      }
      qbClientCustomerId = client.quickbooks.customerId;

      // Ensure transporter exists in QB as vendor
      if (!transporter.quickbooks?.vendorId) {
        console.log('[Invoice] 🚚 Creating QB Vendor for transporter:', transporter.companyName);
        const qbVendor = await createQBVendor(realmId, {
          displayName: transporter.companyName || transporter.email,
          email: transporter.email,
          phone: transporter.phone,
          bankAccount: transporter.bankAccount,
        }, load.currency);

        if (!qbVendor?.id) throw new Error('QB Vendor creation failed: No ID returned');

        await db.collection('users').updateOne(
          { _id: transporter._id },
          { $set: { 'quickbooks.vendorId': qbVendor.id, 'quickbooks.vendorSyncToken': qbVendor.syncToken, 'quickbooks.vendorSyncedAt': new Date() } }
        );
        if (!transporter.quickbooks) transporter.quickbooks = {};
        transporter.quickbooks.vendorId = qbVendor.id;
        console.log('[Invoice] ✅ QB Vendor created:', qbVendor.id);
      } else {
        try {
          const verifyResult = await makeQBAPICallWithRefresh(
            `/vendor/${transporter.quickbooks.vendorId}`,
            'GET',
            realmId,
            undefined,
            load.currency
          );
          if (!verifyResult?.Vendor?.Id) throw new Error('Vendor not found in QB');
          console.log('[Invoice] ✅ Vendor verified in QB');
        } catch {
          const qbVendor = await createQBVendor(realmId, {
            displayName: transporter.companyName || transporter.email,
            email: transporter.email,
            phone: transporter.phone,
            bankAccount: transporter.bankAccount,
          }, load.currency);
          await db.collection('users').updateOne(
            { _id: transporter._id },
            { $set: { 'quickbooks.vendorId': qbVendor.id, 'quickbooks.vendorSyncToken': qbVendor.syncToken, 'quickbooks.vendorSyncedAt': new Date() } }
          );
          transporter.quickbooks.vendorId = qbVendor.id;
          console.log('[Invoice] ✅ QB Vendor recreated:', qbVendor.id);
        }
      }
      qbTransporterVendorId = transporter.quickbooks.vendorId;

      // Create QB Invoice (before DB insert)
      console.log('[Invoice] 📝 Creating QB Invoice for client...');
      const qbInvoice = await createQBInvoice(realmId, {
        customerId: qbClientCustomerId,
        customerDisplayName: client.companyName || client.email,
        lineItems: [
          {
            description: `Load ${load.ref} - Tonnage: ${tonnageForThisInvoice}t`,
            amount: clientAmount,
          },
        ],
        invoiceNumber: clientInvNum,
        memo: `Load Ref: ${load.ref}, Transporter: ${transporter.companyName}`,
      }, load.currency);

      if (!qbInvoice?.invoiceId) {
        throw new Error('QB Invoice creation failed: No invoice ID returned from QuickBooks');
      }
      console.log('[Invoice] ✅ QB Invoice created with ID:', qbInvoice.invoiceId);

      qbInvoiceId = qbInvoice.invoiceId;
      qbInvoiceSyncToken = qbInvoice.syncToken;
      qbInvoiceLink = generateQBInvoiceLink(qbInvoice.invoiceId);
      qbBillLink = null; // Bills skipped — transporter invoice is internal only

      // Finalize QB Invoice (send/mark as sent)
      try {
        await makeQBAPICallWithRefresh(
          `/invoice/${qbInvoiceId}/send`,
          'POST',
          realmId,
          { sendTo: client.email },
          load.currency
        );
        console.log('[Invoice] ✅ QB Invoice finalized and sent to client');
      } catch (emailErr: any) {
        console.warn('[Invoice] ⚠️ QB Invoice send failed (non-critical), marking as EmailSent:', emailErr.message);
        try {
          await makeQBAPICallWithRefresh(
            `/invoice/${qbInvoiceId}`,
            'POST',
            realmId,
            { Id: qbInvoiceId, SyncToken: qbInvoiceSyncToken, EmailStatus: 'EmailSent' },
            load.currency
          );
        } catch (updateErr: any) {
          console.warn('[Invoice] ⚠️ Alternative finalization also failed (non-critical):', updateErr.message);
        }
      }

      console.log('[Invoice] 🎉 QB pre-validation & invoice creation complete. Proceeding to DB inserts...');

    } catch (qbError: any) {
      console.error('[Invoice] ❌ QB error (blocking invoice creation):', qbError.message);
      // QB failed — do NOT create any DB records, return error to admin
      return NextResponse.json(
        {
          error: `Invoice creation blocked: QuickBooks error — ${qbError.message}. No invoice was created. Please fix the QuickBooks issue and try again.`,
          qbError: true,
          details: qbError.message,
        },
        { status: 422 }
      );
    }

    // ============================================
    // DB Inserts — Only reached if QB succeeded
    // ============================================
    const transporterInvoiceResult = await db.collection('invoices').insertOne({
      // Core fields
      loadId: load._id,
      transporterId: new ObjectId(transporterId),
      clientId: load.clientId,
      podId: new ObjectId(podId),
      
      // This invoice details
      tonnageForThisInvoice,
      totalLoadTonnage,
      tonnageDeliveredSoFar,
      progressPercentage,
      
      // Transporter side (what we receive from them)
      transporterInvoice: {
        invoiceNumber: transporterInvNum,
        amount: transporterAmount,
        date: new Date(),
        uploadedBy: transporter.companyName,
        currency: currency || load.currency || 'ZAR' // Add currency to transporter invoice
      },
      
      // Markup details
      markupPercentage,
      markupAmount,
      
      // Flagged as transporter's original invoice
      invoiceType: 'TRANSPORTER_INVOICE',
      invoiceNumber: transporterInvNum,
      amount: transporterAmount,
      
      status: 'PENDING_CLIENT_APPROVAL',
      paymentStatus: 'UNPAID',
      currency: currency || load.currency || 'ZAR', // Use selected currency first
      clientApprovalStatus: 'PENDING_CLIENT_APPROVAL',
      rejectionReason: null,
      
      notes: `Original invoice from transporter. Markup: ${markupPercentage}%`,
      issuedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log('[Invoice] 📄 Created transporter invoice:', transporterInvoiceResult.insertedId.toString())

    // Create Client Invoice Record (what client sees with markup)
    const clientInvoiceResult = await db.collection('invoices').insertOne({
      // Core fields
      loadId: load._id,
      transporterId: new ObjectId(transporterId),
      clientId: load.clientId,
      podId: new ObjectId(podId),
      
      // This invoice details
      tonnageForThisInvoice,
      totalLoadTonnage,
      tonnageDeliveredSoFar,
      progressPercentage,
      
      // Client side (what they need to pay)
      clientInvoice: {
        invoiceNumber: clientInvNum,
        amount: clientAmount,
        date: new Date(),
        markup: markupAmount,
        markupPercentage,
        sentVia: 'quickbooks',
        currency: currency || load.currency || 'ZAR' // Add currency to client invoice
      },
      
      // Original transporter invoice reference
      linkedTransporterInvoiceId: transporterInvoiceResult.insertedId,
      
      // Flagged as client invoice
      invoiceType: 'CLIENT_INVOICE',
      invoiceNumber: clientInvNum,
      amount: clientAmount,
      
      status: 'SENT_TO_CLIENT',
      paymentStatus: 'UNPAID',
      currency: currency || load.currency || 'ZAR', // Use selected currency first
      clientApprovalStatus: 'PENDING_CLIENT_APPROVAL',
      rejectionReason: null,
      
      notes: `Invoice for client. Based on transporter invoice ${transporterInvNum} + ${markupPercentage}% markup`,
      issuedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log('[Invoice] 📄 Created client invoice:', clientInvoiceResult.insertedId.toString())

    // Save QB Invoice link to client invoice record (QB already created above)
    if (qbInvoiceId) {
      await db.collection('invoices').updateOne(
        { _id: clientInvoiceResult.insertedId },
        {
          $set: {
            qbLink: qbInvoiceLink,
            'qbSync.invoiceId': qbInvoiceId,
            'qbSync.syncToken': qbInvoiceSyncToken,
            'qbSync.lastSyncedAt': new Date(),
            updatedAt: new Date(),
          }
        }
      );
      console.log('[Invoice] 💾 QB Invoice link saved to DB:', qbInvoiceLink);
    }

    // Send email to client ONLY - Transporter already submitted their invoice, no need to notify them
    if (client.email) {
      try {
        let emailContent = invoiceGeneratedEmail(
          client.companyName || 'Client',
          load.ref,
          clientInvNum,
          clientAmount,
          currency || load.currency || 'ZAR',
          tonnageForThisInvoice,
          progressPercentage
        );

        // Add QB link to email if available
        if (qbInvoiceLink) {
          emailContent += `\n\n📊 View Invoice in QuickBooks: <a href="${qbInvoiceLink}">${qbInvoiceLink}</a>`;
        }

        await sendEmail(
          client.email,
          `📄 New Invoice: ${load.ref} - ${clientInvNum}`,
          emailContent
        );
        console.log('[Invoice] 📧 Client notification sent');
      } catch (emailErr) {
        console.error('[Invoice] ⚠️ Error sending client email:', emailErr);
      }
    }

    // Create load update
    await db.collection('loadUpdates').insertOne({
      loadId: load._id,
      userId: new ObjectId(session.user.id),
      message: `Invoices generated for ${tonnageForThisInvoice} tons (Progress: ${progressPercentage}%)`,
      createdAt: new Date(),
    })

    // CRITICAL FIX: Update POD status to INVOICED to prevent duplicate invoice creation
    console.log('[Invoice] 📝 Updating POD status to INVOICED...');
    const podUpdateResult = await db.collection('documents').updateOne(
      { _id: new ObjectId(podId), docType: 'POD' },
      {
        $set: {
          invoiceStatus: 'INVOICED',
          invoicedAt: new Date(),
          updatedAt: new Date(),
        }
      }
    );
    console.log('[Invoice] 📝 POD status update result:', {
      matched: podUpdateResult.matchedCount,
      modified: podUpdateResult.modifiedCount
    });
    if (podUpdateResult.modifiedCount === 0) {
      console.warn('[Invoice] ⚠️ POD status was not updated - POD may not exist or already invoiced');
    }

    // Re-fetch both invoices to get updated qbLink:
    console.log('[Invoice] 🔄 Re-fetching invoices to get updated qbLink...');
    const [updatedClientInvoice, updatedTransporterInvoice] = await Promise.all([
      db.collection('invoices').findOne({ _id: clientInvoiceResult.insertedId }),
      db.collection('invoices').findOne({ _id: transporterInvoiceResult.insertedId }),
    ]);
    console.log('[Invoice] 🔄 Client invoice qbLink after re-fetch:', updatedClientInvoice?.qbLink || 'NULL');
    console.log('[Invoice] 🔄 Transporter invoice qbLink after re-fetch:', updatedTransporterInvoice?.qbLink || 'NULL');

    // Use qbLink from database (already saved during QB invoice creation)
    const finalClientQbLink = updatedClientInvoice?.qbLink || null;
    const finalTransporterQbLink = updatedTransporterInvoice?.qbLink || null;
    console.log('[Invoice] 🔗 Final client QB link for response:', finalClientQbLink);
    console.log('[Invoice] 🔗 Final transporter QB link for response:', finalTransporterQbLink);

    return NextResponse.json({
      success: true,
      message: 'Invoices created successfully',
      data: {
        transporterInvoice: {
          _id: updatedTransporterInvoice?._id.toString(),
          invoiceNumber: updatedTransporterInvoice?.invoiceNumber,
          amount: updatedTransporterInvoice?.amount,
          status: updatedTransporterInvoice?.status,
          qbLink: finalTransporterQbLink,
        },
        clientInvoice: {
          _id: updatedClientInvoice?._id.toString(),
          invoiceNumber: updatedClientInvoice?.invoiceNumber,
          amount: updatedClientInvoice?.amount,
          status: updatedClientInvoice?.status,
          qbLink: finalClientQbLink,
        },
        progressPercentage,
        tonnageDelivered: `${displayTonnage}/${totalLoadTonnage}`,
        totalTonnageDelivered,
        totalLoadTonnage,
      }
    })

  } catch (error: any) {
    console.error('[Invoice] 💥 Error:', error)
    return NextResponse.json(
      { error: 'Failed to create invoices', details: error.message },
      { status: 500 }
    )
  }
}