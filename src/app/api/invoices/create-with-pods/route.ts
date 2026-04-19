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
            // VERIFY customer exists in QB
            try {
              console.log('[Invoice] 🔍 Verifying customer exists in QB...');
              const verifyResult = await makeQBAPICallWithRefresh(
                `/customer/${client.quickbooks.customerId}`,
                'GET',
                realmId,
                undefined,
                load.currency
              );
              if (!verifyResult?.Customer?.Id) {
                console.error('[Invoice] ❌ Customer not found in QB, recreating...');
                throw new Error('Customer not found in QB');
              }
              console.log('[Invoice] ✅ Customer verified in QB');
            } catch (verifyErr: any) {
              console.error('[Invoice] ⚠️ Customer verification failed, recreating:', verifyErr.message);
              // Customer doesn't exist, create new one
              const qbCustomer = await createQBCustomer(realmId, {
                displayName: client.companyName || client.email,
                email: client.email,
                phone: client.phone,
              }, load.currency);
              
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
              
              client.quickbooks.customerId = qbCustomer.id;
              client.quickbooks.customerSyncToken = qbCustomer.syncToken;
              console.log('[Invoice] ✅ QB Customer recreated:', qbCustomer.id);
            }
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
            // VERIFY vendor exists in QB
            try {
              console.log('[Invoice] 🔍 Verifying vendor exists in QB...');
              const verifyResult = await makeQBAPICallWithRefresh(
                `/vendor/${transporter.quickbooks.vendorId}`,
                'GET',
                realmId,
                undefined,
                load.currency
              );
              if (!verifyResult?.Vendor?.Id) {
                console.error('[Invoice] ❌ Vendor not found in QB, recreating...');
                throw new Error('Vendor not found in QB');
              }
              console.log('[Invoice] ✅ Vendor verified in QB');
            } catch (verifyErr: any) {
              console.error('[Invoice] ⚠️ Vendor verification failed, recreating:', verifyErr.message);
              // Vendor doesn't exist, create new one
              const qbVendor = await createQBVendor(realmId, {
                displayName: transporter.companyName || transporter.email,
                email: transporter.email,
                phone: transporter.phone,
                bankAccount: transporter.bankAccount,
              }, load.currency);
              
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
              
              transporter.quickbooks.vendorId = qbVendor.id;
              transporter.quickbooks.vendorSyncToken = qbVendor.syncToken;
              console.log('[Invoice] ✅ QB Vendor recreated:', qbVendor.id);
            }
          }

          // Create QB Invoice and Bill
          console.log('[Invoice] 📝 Creating QB Invoice for client...');
          console.log('[Invoice] QB Environment:', process.env.QUICKBOOKS_ENVIRONMENT);
          console.log('[Invoice] QB Client ID loaded:', process.env.QUICKBOOKS_CLIENT_ID ? '✅' : '❌ MISSING');
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

          console.log('[Invoice] 🔍 QB Invoice creation response:', JSON.stringify(qbInvoice, null, 2));
          
          if (!qbInvoice?.invoiceId) {
            console.error('[Invoice] ❌ CRITICAL: QB Invoice creation returned no invoiceId!');
            console.error('[Invoice] Response was:', qbInvoice);
            throw new Error('QB Invoice creation failed: No invoice ID returned');
          }
          console.log('[Invoice] ✅ QB Invoice created with ID:', qbInvoice.invoiceId);

          // IMMEDIATELY save qbLink to database:
          const qbLinkToSave = `https://app.qbo.intuit.com/app/invoice?txnId=${qbInvoice.invoiceId}`;
          console.log('[Invoice] 💾 Saving QB Invoice link to DB:', qbLinkToSave);
          console.log('[Invoice] 💾 Saving to invoice ID:', clientInvoiceResult.insertedId.toString());
          
          const updateResult = await db.collection('invoices').updateOne(
            { _id: clientInvoiceResult.insertedId },
            {
              $set: {
                qbLink: qbLinkToSave,
                'qbSync.invoiceId': qbInvoice.invoiceId,
                'qbSync.syncToken': qbInvoice.syncToken,
                'qbSync.lastSyncedAt': new Date(),
                updatedAt: new Date(),
              }
            }
          );
          console.log('[Invoice] 💾 Update result:', JSON.stringify({
            matched: updateResult.matchedCount,
            modified: updateResult.modifiedCount,
            acknowledged: updateResult.acknowledged
          }));
          
          // Verify the update worked
          const verifyUpdate = await db.collection('invoices').findOne({ _id: clientInvoiceResult.insertedId });
          console.log('[Invoice] 🔍 Verification - Invoice qbLink after save:', verifyUpdate?.qbLink || 'NULL');
          if (!verifyUpdate?.qbLink) {
            console.error('[Invoice] ❌ CRITICAL: Invoice qbLink was NOT saved to database!');
          }
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

          console.log('[Invoice] 🔍 QB Bill creation response:', JSON.stringify(qbBill, null, 2));
          
          if (!qbBill?.billId) {
            console.error('[Invoice] ❌ CRITICAL: QB Bill creation returned no billId!');
            console.error('[Invoice] Response was:', qbBill);
            throw new Error('QB Bill creation failed: No bill ID returned');
          }
          console.log('[Invoice] ✅ QB Bill created with ID:', qbBill.billId);

          // IMMEDIATELY save qbLink to database:
          const qbBillLinkToSave = `https://app.qbo.intuit.com/app/bill?txnId=${qbBill.billId}`;
          console.log('[Invoice] 💾 Saving QB Bill link to DB:', qbBillLinkToSave);
          console.log('[Invoice] 💾 Saving to invoice ID:', transporterInvoiceResult.insertedId.toString());
          
          const billUpdateResult = await db.collection('invoices').updateOne(
            { _id: transporterInvoiceResult.insertedId },
            {
              $set: {
                qbLink: qbBillLinkToSave,
                'qbSync.billId': qbBill.billId,
                'qbSync.syncToken': qbBill.syncToken,
                'qbSync.lastSyncedAt': new Date(),
                updatedAt: new Date(),
              }
            }
          );
          console.log('[Invoice] 💾 Bill update result:', JSON.stringify({
            matched: billUpdateResult.matchedCount,
            modified: billUpdateResult.modifiedCount,
            acknowledged: billUpdateResult.acknowledged
          }));
          
          // Verify the update worked
          const verifyBillUpdate = await db.collection('invoices').findOne({ _id: transporterInvoiceResult.insertedId });
          console.log('[Invoice] 🔍 Verification - Bill qbLink after save:', verifyBillUpdate?.qbLink || 'NULL');
          if (!verifyBillUpdate?.qbLink) {
            console.error('[Invoice] ❌ CRITICAL: Bill qbLink was NOT saved to database!');
          }

          // QB Bill /send is not supported in sandbox - skip silently
          console.log('[Invoice] ℹ️ QB Bill email skipped (not supported in sandbox)');

          // Generate QB links from invoice IDs for local variables
          qbInvoiceLink = generateQBInvoiceLink(qbInvoice.invoiceId);
          qbBillLink = generateQBBillLink(qbBill.billId);
          
          console.log('[Invoice] 🔗 Generated QB links:', {
            invoiceLink: qbInvoiceLink,
            billLink: qbBillLink
          });

          console.log('[Invoice] 🎉 QB Integration Complete!');
          console.log('[Invoice]   Invoice Link:', qbInvoiceLink);
          console.log('[Invoice]   Bill Link:', qbBillLink);
        } catch (qbError: any) {
          console.error('[Invoice] ❌ QB sync error:', qbError.message);
          console.error('[Invoice] Error details:', qbError.stack);
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

    // Re-fetch both invoices to get updated qbLink:
    console.log('[Invoice] 🔄 Re-fetching invoices to get updated qbLink...');
    const [updatedClientInvoice, updatedTransporterInvoice] = await Promise.all([
      db.collection('invoices').findOne({ _id: clientInvoiceResult.insertedId }),
      db.collection('invoices').findOne({ _id: transporterInvoiceResult.insertedId }),
    ]);
    console.log('[Invoice] 🔄 Client invoice qbLink after re-fetch:', updatedClientInvoice?.qbLink || 'NULL');
    console.log('[Invoice] 🔄 Transporter invoice qbLink after re-fetch:', updatedTransporterInvoice?.qbLink || 'NULL');

    return NextResponse.json({
      success: true,
      message: 'Invoices created successfully',
      data: {
        transporterInvoice: {
          _id: updatedTransporterInvoice?._id.toString(),
          invoiceNumber: updatedTransporterInvoice?.invoiceNumber,
          amount: updatedTransporterInvoice?.amount,
          status: updatedTransporterInvoice?.status,
          qbLink: updatedTransporterInvoice?.qbLink || null,
        },
        clientInvoice: {
          _id: updatedClientInvoice?._id.toString(),
          invoiceNumber: updatedClientInvoice?.invoiceNumber,
          amount: updatedClientInvoice?.amount,
          status: updatedClientInvoice?.status,
          qbLink: updatedClientInvoice?.qbLink || null,
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
