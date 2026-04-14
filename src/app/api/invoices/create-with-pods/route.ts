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

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
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

    // Create Transporter Invoice Record
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
      currency: load.currency || 'ZAR',
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
      },
      
      // Original transporter invoice reference
      linkedTransporterInvoiceId: transporterInvoiceResult.insertedId,
      
      // Flagged as client invoice
      invoiceType: 'CLIENT_INVOICE',
      invoiceNumber: clientInvNum,
      amount: clientAmount,
      
      status: 'SENT_TO_CLIENT',
      paymentStatus: 'UNPAID',
      currency: load.currency || 'ZAR',
      clientApprovalStatus: 'PENDING_CLIENT_APPROVAL',
      rejectionReason: null,
      
      notes: `Invoice for client. Based on transporter invoice ${transporterInvNum} + ${markupPercentage}% markup`,
      issuedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    console.log('[Invoice] 📄 Created client invoice:', clientInvoiceResult.insertedId.toString())

    // ============================================
    // QuickBooks Integration
    // ============================================
    let qbInvoiceLink: string | null = null;
    let qbBillLink: string | null = null;

    try {
      console.log(`[Invoice] 🔍 Searching for QB credentials for currency ${load.currency}...`);
      
      const { getQBCredentialsByCurrency } = await import('@/lib/quickbooks');
      let qbCredentials;
      try {
        qbCredentials = await getQBCredentialsByCurrency(load.currency);
        console.log('[Invoice] QB credential lookup result:', qbCredentials ? '✅ FOUND' : '❌ NOT FOUND');
      } catch (err: any) {
        console.error('[Invoice] ⚠️ QB credential lookup error:', err.message);
        qbCredentials = null;
      }

      if (qbCredentials) {
        console.log('[Invoice] ✅ QB credentials found! Starting QB sync...');
        const realmId = qbCredentials.realmId;

        console.log('[Invoice] ✅ QB credentials found. Starting QB sync...');
        console.log('[Invoice] 👤 Client QB ID:', client.quickbooks?.customerId || 'NOT SET');
        console.log('[Invoice] 🚚 Transporter QB ID:', transporter.quickbooks?.vendorId || 'NOT SET');

        try {
          // Ensure client exists in QB
          if (!client.quickbooks?.customerId) {
            console.log('[Invoice] 👤 Creating QB Customer for client:', client.companyName);
            try {
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
              
              if (!client.quickbooks) {
                client.quickbooks = {};
              }
              client.quickbooks.customerId = qbCustomer.id;
              client.quickbooks.customerSyncToken = qbCustomer.syncToken;
              console.log('[Invoice] ✅ QB Customer created:', qbCustomer.id);
            } catch (customerError: any) {
              console.error('[Invoice] ❌ QB Customer creation error:', customerError.message);
              throw customerError;
            }
          } else {
            console.log('[Invoice] ✅ QB Customer already exists:', client.quickbooks.customerId);
          }

          // Ensure transporter exists in QB
          if (!transporter.quickbooks?.vendorId) {
            console.log('[Invoice] 🚚 Creating QB Vendor for transporter:', transporter.companyName);
            try {
              const qbVendor = await createQBVendor(realmId, {
                displayName: transporter.companyName || transporter.email,
                email: transporter.email,
                phone: transporter.phone,
                bankAccount: transporter.bankAccount,
              }, load.currency);

              if (!qbVendor?.id) {
                throw new Error('QB Vendor creation failed: No ID returned');
              }

              await db.collection('users').updateOne(
                { _id: transporter._id },
                {
                  $set: {
                    'quickbooks.vendorId': qbVendor.id,
                    'quickbooks.vendorSyncToken': qbVendor.syncToken,
                    'quickbooks.vendorSyncedAt': new Date(),
                  },
                }
              );
              
              if (!transporter.quickbooks) {
                transporter.quickbooks = {};
              }
              transporter.quickbooks.vendorId = qbVendor.id;
              transporter.quickbooks.vendorSyncToken = qbVendor.syncToken;
              console.log('[Invoice] ✅ QB Vendor created:', qbVendor.id);
            } catch (vendorError: any) {
              console.error('[Invoice] ❌ QB Vendor creation error:', vendorError.message);
              throw vendorError;
            }
          } else {
            console.log('[Invoice] ✅ QB Vendor already exists:', transporter.quickbooks.vendorId);
          }

          // Create QB Invoice and Bill
          console.log('[Invoice] 📝 Creating QB Invoice for client...');
          console.log('[Invoice] Using customerId:', client.quickbooks?.customerId);
          console.log('[Invoice] Invoice payload:', {
            customerId: client.quickbooks?.customerId,
            customerDisplayName: client.companyName || client.email,
            lineItems: [
              {
                description: `Load ${load.ref} - Tonnage: ${tonnageForThisInvoice}t`,
                amount: clientAmount,
              },
            ],
            invoiceNumber: clientInvNum,
          });
          
          const qbInvoice = await createQBInvoice(realmId, {
            customerId: client.quickbooks?.customerId,
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
            throw new Error('QB Invoice creation failed: No invoice ID returned');
          }
          console.log('[Invoice] ✅ QB Invoice created:', qbInvoice.invoiceId);
          console.log('[Invoice] QB Invoice Response:', JSON.stringify(qbInvoice, null, 2));

          // Finalize QB Invoice to make it visible in QB UI
          // Invoices created without sending are in DRAFT status and not visible in QB UI
          // We need to mark them as sent for them to show up
          console.log('[Invoice] 📧 Finalizing invoice in QB...');
          try {
            // Send invoice with email - this finalizes it and makes it visible in QB UI
            const sendResponse = await makeQBAPICallWithRefresh(
              `/invoice/${qbInvoice.invoiceId}/send`,
              'POST',
              realmId,
              { sendTo: client.email }, // Body with sendTo parameter
              load.currency
            );
            console.log('[Invoice] ✅ QB Invoice finalized and sent:', {
              invoiceId: qbInvoice.invoiceId,
              emailTo: client.email,
              status: 'SENT'
            });
          } catch (emailErr: any) {
            console.error('[Invoice] ⚠️ QB Invoice finalization failed (attempting alternative):', emailErr.message);
            // If send fails, try marking as printed instead
            try {
              const updateResult = await makeQBAPICallWithRefresh(
                `/invoice/${qbInvoice.invoiceId}`,
                'POST',
                realmId,
                {
                  Id: qbInvoice.invoiceId,
                  SyncToken: qbInvoice.syncToken,
                  EmailStatus: 'EmailSent', // Mark as if email was sent
                },
                load.currency
              );
              console.log('[Invoice] ✅ QB Invoice marked as EmailSent');
            } catch (updateErr: any) {
              console.warn('[Invoice] ⚠️ Alternative finalization also failed (non-critical):', updateErr.message);
            }
          }

          console.log('[Invoice] 📝 Creating QB Bill for transporter...');
          console.log('[Invoice] Using vendorId:', transporter.quickbooks?.vendorId);
          
          const qbBill = await createQBBill(realmId, {
            vendorId: transporter.quickbooks?.vendorId,
            vendorDisplayName: transporter.companyName || transporter.email,
            lineItems: [
              {
                description: `Load ${load.ref} - Tonnage: ${tonnageForThisInvoice}t`,
                amount: transporterAmount,
              },
            ],
            billNumber: transporterInvNum,
          }, load.currency);

          if (!qbBill?.billId) {
            throw new Error('QB Bill creation failed: No bill ID returned');
          }
          console.log('[Invoice] ✅ QB Bill created:', qbBill.billId);

          // QB Bill /send is not supported in sandbox - skip silently
          console.log('[Invoice] ℹ️ QB Bill email skipped (not supported in sandbox)');

          // Update invoices with QB IDs and Links
          // Generate QB links from invoice IDs
          qbInvoiceLink = generateQBInvoiceLink(qbInvoice.invoiceId);
          qbBillLink = generateQBBillLink(qbBill.billId);
          
          console.log('[Invoice] 🔗 Generated QB links (Dynamic Realm ID from Currency):', {
            currency: load.currency,
            environment: process.env.QUICKBOOKS_ENVIRONMENT || 'SANDBOX',
            dynamicRealmId: realmId,  // This is fetched dynamically from MongoDB by currency
            invoiceId: qbInvoice?.invoiceId,
            billId: qbBill?.billId,
            invoiceLink: qbInvoiceLink,
            billLink: qbBillLink,
            linkBaseURL: process.env.QUICKBOOKS_ENVIRONMENT === 'PRODUCTION' 
              ? 'https://qbo.intuit.com' 
              : 'https://app.sandbox.qbo.intuit.com'
          });

          // THEN update database with the links
          await db.collection('invoices').updateOne(
            { _id: clientInvoiceResult.insertedId },
            {
              $set: {
                'qb_sync.invoiceId': qbInvoice.invoiceId,
                'qb_sync.invoiceSyncToken': qbInvoice.syncToken,
                'qb_sync.createdAt': new Date(),
                qbLink: generateQBInvoiceLink(qbInvoice.invoiceId),
                qbInvoiceId: qbInvoice.invoiceId,
              },
            }
          );

          await db.collection('invoices').updateOne(
            { _id: transporterInvoiceResult.insertedId },
            {
              $set: {
                'qb_sync.billId': qbBill.billId,
                'qb_sync.billSyncToken': qbBill.syncToken,
                'qb_sync.createdAt': new Date(),
                qbLink: generateQBBillLink(qbBill.billId),
                qbInvoiceId: qbBill.billId,
              },
            }
          );

          console.log('[Invoice] 🎉 QB Integration Complete!');
          console.log('[Invoice]   📝 Invoice ID:', qbInvoice.invoiceId);
          console.log('[Invoice]   Invoice Link:', qbInvoiceLink);
          console.log('[Invoice]   📄 Bill ID:', qbBill.billId);
          console.log('[Invoice]   Bill Link:', qbBillLink);
          console.log('[Invoice]   ✅ Saved to DB with qbLink fields');
        } catch (qbError: any) {
          console.error('[Invoice] ❌ QB sync error:', qbError.message);
          console.error('[Invoice] Error details:', qbError.stack);
          console.log('[Invoice] ⚠️ Invoices created but QB sync failed - qbLink not set');
        }
      } else {
        console.log('[Invoice] ⚠️ No QB credentials found for currency:', load.currency);
        console.log('[Invoice] ℹ️ QB invoice creation SKIPPED - Admin must connect QB account for this currency');
        console.log('[Invoice] 📧 But SMTP email notifications will still be sent to client and transporter');
        qbInvoiceLink = null;
        qbBillLink = null;
      }
    } catch (qbSetupError: any) {
      console.error('[Invoice] ❌ QB setup error:', qbSetupError.message);
      console.error('[Invoice] Error details:', qbSetupError.stack);
      // Links remain null — QB not configured or failed
    }

    // Send email to transporter
    if (transporter.email) {
      try {
        let emailContent = invoiceGeneratedEmail(
          transporter.companyName || 'Transporter',
          load.ref,
          transporterInvNum,
          transporterAmount,
          load.currency || 'ZAR',
          tonnageForThisInvoice,
          progressPercentage
        );

        // Add QB link to email if available
        if (qbBillLink) {
          emailContent += `\n\n📊 View Bill in QuickBooks: <a href="${qbBillLink}">${qbBillLink}</a>`;
        }

        await sendEmail(
          transporter.email,
          `✅ Invoice Generated: ${load.ref}`,
          emailContent
        );
        console.log('[Invoice] 📧 Transporter notification sent');
      } catch (emailErr) {
        console.error('[Invoice] ⚠️ Error sending transporter email:', emailErr);
      }
    }

    // Send email to client
    if (client.email) {
      try {
        let emailContent = invoiceGeneratedEmail(
          client.companyName || 'Client',
          load.ref,
          clientInvNum,
          clientAmount,
          load.currency || 'ZAR',
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

    return NextResponse.json({
      success: true,
      message: 'Invoices created successfully',
      data: {
        transporterInvoice: {
          _id: transporterInvoiceResult.insertedId.toString(),
          invoiceNumber: transporterInvNum,
          amount: transporterAmount,
          status: 'PENDING_CLIENT_APPROVAL',
          qbLink: qbBillLink,
        },
        clientInvoice: {
          _id: clientInvoiceResult.insertedId.toString(),
          invoiceNumber: clientInvNum,
          amount: clientAmount,
          status: 'SENT_TO_CLIENT',
          qbLink: qbInvoiceLink,
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
