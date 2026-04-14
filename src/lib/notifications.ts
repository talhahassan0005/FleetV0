/**
 * Email Notification System
 * Centralized notification templates and senders
 */

import { sendEmail } from './email';

export async function notifyLoadPosted(load: any, client?: any, transporters?: any[]) {
  // Notify transporters about new load
  if (transporters && Array.isArray(transporters)) {
    for (const transporter of transporters) {
      if (transporter.email) {
        try {
          await sendEmail(
            transporter.email,
            `🚛 New Load Available: ${load.ref}`,
            `<h2>New Load Available</h2>
             <p>A new load is available for bidding:</p>
             <p><strong>Route:</strong> ${load.origin} → ${load.destination}</p>
             <p><strong>Cargo:</strong> ${load.cargoType || 'General'} - ${load.weight || load.tonnage || 0} tons</p>
             <p><strong>Rate:</strong> ${load.currency || 'ZAR'} ${load.ratePerTon || 0} per ton</p>
             <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/transporter/loads" 
                style="background:#3ab54a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
               View Load
             </a>`
          );
          console.log(`[Notification] ✅ Load posted notification sent to ${transporter.email}`);
        } catch (err) {
          console.error(`[Notification] ⚠️ Failed to notify transporter ${transporter.email}:`, err);
        }
      }
    }
  }
}

export async function notifyLoadStatusChanged(load: any, client: any, newStatus: string) {
  if (client?.email) {
    try {
      const statusMessages: { [key: string]: string } = {
        'POSTED': 'Load has been posted and is available for transporters',
        'ASSIGNED': 'Transporter has been assigned to your load',
        'IN_TRANSIT': 'Your load is now in transit',
        'DELIVERED': 'Your load has been delivered',
        'CANCELLED': 'Your load has been cancelled',
      };

      await sendEmail(
        client.email,
        `Load Update: ${load.ref} - ${newStatus.replace(/_/g, ' ')}`,
        `<h2>Load Status Update</h2>
         <p>Your load <strong>${load.ref}</strong> status has changed to: <strong>${newStatus.replace(/_/g, ' ')}</strong></p>
         <p>${statusMessages[newStatus] || 'Your load status has been updated.'}</p>
         <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/client/loads" 
            style="background:#3ab54a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
           Track Load
         </a>`
      );
      console.log(`[Notification] ✅ Status changed notification sent to ${client.email}`);
    } catch (err) {
      console.error(`[Notification] ⚠️ Failed to notify client about status change:`, err);
    }
  }
}

export async function notifyPODUploaded(load: any, transporter: any, adminEmail?: string) {
  if (adminEmail) {
    try {
      await sendEmail(
        adminEmail,
        `POD Uploaded - Load ${load.ref}`,
        `<h2>POD Ready for Review</h2>
         <p>Transporter <strong>${transporter.companyName || transporter.email}</strong> has uploaded POD for load <strong>${load.ref}</strong>.</p>
         <p><strong>Route:</strong> ${load.origin} → ${load.destination}</p>
         <p><strong>Tonnage:</strong> ${load.weight || load.tonnage || 0} tons</p>
         <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin/pod-management" 
            style="background:#3ab54a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
           Review POD
         </a>`
      );
      console.log(`[Notification] ✅ POD upload notification sent to admin`);
    } catch (err) {
      console.error(`[Notification] ⚠️ Failed to notify admin about POD:`, err);
    }
  }
}

export async function notifyAccountVerified(user: any) {
  if (user?.email) {
    try {
      const roleLabel = user.role === 'CLIENT' ? 'Client' : user.role === 'TRANSPORTER' ? 'Transporter' : 'User';
      await sendEmail(
        user.email,
        `✅ Account Verified - Welcome to FleetXChange`,
        `<h2>Account Verified!</h2>
         <p>Dear ${user.companyName || user.contactName || user.name || 'User'},</p>
         <p>Your FleetXChange account has been verified and approved. Your ${roleLabel} account is now fully activated.</p>
         <p>You can now access all features of the platform and start using our services.</p>
         <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login" 
            style="background:#3ab54a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
           Login Now
         </a>
         <p style="margin-top:20px;font-size:12px;color:#666;">
           Need help? Contact support@fleetxchange.com
         </p>`
      );
      console.log(`[Notification] ✅ Account verification notification sent to ${user.email}`);
    } catch (err) {
      console.error(`[Notification] ⚠️ Failed to notify user about account verification:`, err);
    }
  }
}

export async function notifyInvoiceDue(invoice: any, client: any) {
  if (client?.email) {
    try {
      const dueDate = new Date(invoice.dueDate || new Date()).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      await sendEmail(
        client.email,
        `⚠️ Invoice Due: ${invoice.invoiceNumber}`,
        `<h2>Invoice Payment Reminder</h2>
         <p>Dear ${client.companyName || client.contactName},</p>
         <p>Invoice <strong>${invoice.invoiceNumber}</strong> of amount <strong>${invoice.currency || 'ZAR'} ${(invoice.amount || 0).toLocaleString()}</strong> is due on <strong>${dueDate}</strong>.</p>
         <p><strong>Load Reference:</strong> ${invoice.loadRef || 'N/A'}</p>
         <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/client/invoices" 
            style="background:#3ab54a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
           View & Pay Invoice
         </a>
         <p style="margin-top:20px;font-size:12px;color:#666;">
           If you have already paid, please disregard this notice.
         </p>`
      );
      console.log(`[Notification] ✅ Invoice due notification sent to ${client.email}`);
    } catch (err) {
      console.error(`[Notification] ⚠️ Failed to notify client about invoice:`, err);
    }
  }
}

export async function notifyPODApprovedByClient(load: any, transporter: any, action: 'approved' | 'rejected') {
  if (transporter?.email) {
    try {
      const message = action === 'approved' 
        ? 'Your Proof of Delivery has been approved by the client.' 
        : 'Your Proof of Delivery has been rejected by the client.';

      await sendEmail(
        transporter.email,
        `POD ${action === 'approved' ? 'Approved' : 'Rejected'} - Load ${load.ref}`,
        `<h2>Proof of Delivery ${action === 'approved' ? 'Approved' : 'Rejected'}</h2>
         <p>Dear ${transporter.companyName || transporter.email},</p>
         <p>${message}</p>
         <p><strong>Load Reference:</strong> ${load.ref}</p>
         <p><strong>Route:</strong> ${load.origin} → ${load.destination}</p>
         ${action === 'rejected' ? `<p style="color:#d32f2f;"><strong>Note:</strong> Please contact the client to resolve any issues.</p>` : ''}
         <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/transporter/loads" 
            style="background:#3ab54a;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;">
           View Load
         </a>`
      );
      console.log(`[Notification] ✅ POD action notification sent to transporter`);
    } catch (err) {
      console.error(`[Notification] ⚠️ Failed to notify transporter about POD action:`, err);
    }
  }
}
