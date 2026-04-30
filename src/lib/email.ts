import nodemailer from 'nodemailer';

function maskEmail(e?: string | null) {
  if (!e) return null;
  const parts = e.split('@');
  if (parts.length !== 2) return e.replace(/.(?=.{2})/g, '*');
  const name = parts[0];
  const maskedName = name.length > 1 ? name[0] + '*'.repeat(Math.min(3, name.length - 1)) : '*';
  return `${maskedName}@${parts[1]}`;
}

function createTransporter() {
  const user = process.env.MAIL_USER || process.env.OUTLOOK_EMAIL || process.env.SMTP_USER;
  const pass = process.env.MAIL_PASS || process.env.OUTLOOK_PASSWORD || process.env.SMTP_PASS;

  console.log('[EmailConfig] Creating transporter with:', { 
    user: user ? user.substring(0, 10) + '...' : 'NOT SET',
    pass: pass ? 'SET' : 'NOT SET',
    passLength: pass?.length || 0
  })

  const host = process.env.MAIL_HOST || process.env.OUTLOOK_HOST || (user && user.endsWith('@gmail.com') ? 'smtp.gmail.com' : 'smtp.gmail.com');
  const port = Number(process.env.MAIL_PORT || process.env.OUTLOOK_PORT || 587);
  const secure = port === 465;

  if (!user || !pass) {
    console.error('[EmailConfig] ❌ Email credentials missing!', { user: !!user, pass: !!pass })
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Mail transporter is not configured. Set MAIL_USER/OUTLOOK_EMAIL and MAIL_PASS/OUTLOOK_PASSWORD.');
    }

    console.warn('[EmailConfig] ⚠️  Mail credentials missing — using JSON transport in development.');
    return nodemailer.createTransport({ jsonTransport: true });
  }

  console.log('[EmailConfig] ✅ Creating SMTP transporter:', { host, port, secure, user })
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

let transporter: any = null;

function getTransporter() {
  // Always recreate transporter to ensure fresh credentials
  // This is important when env variables change
  transporter = createTransporter();
  return transporter;
}

const effectiveFrom = process.env.MAIL_FROM || process.env.OUTLOOK_EMAIL || process.env.MAIL_USER || process.env.OUTLOOK_EMAIL || '';

// ============ FLEETXCHANGE EMAIL FUNCTIONS ============

export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  from: string = effectiveFrom
) => {
  try {
    console.log('[SendEmail] Starting email send:', { to, subject, from, mailUser: process.env.MAIL_USER })
    
    const transporter = getTransporter();
    
    console.log('[SendEmail] Transporter created, attempting to send...')
    const info = await transporter.sendMail({
      from: `"FleetXChange" <${from}>`,
      to,
      subject,
      html,
    });
    
    console.log('[SendEmail] ✅ Email sent successfully:', { 
      messageId: info.messageId, 
      to, 
      subject,
      response: info.response 
    });
    return true;
  } catch (error: any) {
    console.error('[SendEmail] ❌ Email send failed:', { 
      error: error.message,
      code: error.code,
      to,
      subject,
      mailUser: process.env.MAIL_USER,
      mailPass: process.env.MAIL_PASS ? '****' : 'NOT SET'
    });
    return false;
  }
};

// Email Templates

export const quoteSubmittedEmail = (clientName: string, transporterName: string, loadRef: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #1a2a5e; margin-top: 0;">📬 New Quote Received</h2>
    <p>Hi ${clientName},</p>
    <p><strong>${transporterName}</strong> has submitted a quote for your load <strong>${loadRef}</strong>.</p>
    <p style="margin: 30px 0;">
      <a href="${process.env.PAYLOAD_PUBLIC_SERVER_URL}/client/loads" style="background-color: #1a2a5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Quotes</a>
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export const quoteApprovedEmail = (transporterName: string, loadRef: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #3ab54a; margin-top: 0;">✅ Quote Approved!</h2>
    <p>Hi ${transporterName},</p>
    <p>Your quote for load <strong>${loadRef}</strong> has been approved. You are now the assigned transporter for this shipment.</p>
    <p style="margin: 30px 0;">
      <a href="${process.env.PAYLOAD_PUBLIC_SERVER_URL}/transporter/loads" style="background-color: #3ab54a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Assigned Loads</a>
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export const loadDeliveredEmail = (clientName: string, loadRef: string, trackingToken: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #3ab54a; margin-top: 0;">🚚 Delivery Complete</h2>
    <p>Hi ${clientName},</p>
    <p>Your shipment <strong>${loadRef}</strong> has been delivered successfully!</p>
    <p style="margin: 30px 0;">
      <a href="${process.env.PAYLOAD_PUBLIC_SERVER_URL}/track" style="background-color: #3ab54a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Delivery Proof</a>
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export const userVerifiedEmail = (userName: string, userRole: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #3ab54a; margin-top: 0;">✨ Account Verified</h2>
    <p>Hi ${userName},</p>
    <p>Congratulations! Your FleetXChange account has been verified by our team.</p>
    <p>You can now:</p>
    <ul style="color: #555;">
      ${userRole === 'CLIENT' ? '<li>Post freight loads</li><li>Receive quotes from transporters</li>' : ''}
      ${userRole === 'TRANSPORTER' ? '<li>Bid on available loads</li><li>Manage your shipments</li>' : ''}
    </ul>
    <p style="margin: 30px 0;">
      <a href="${process.env.PAYLOAD_PUBLIC_SERVER_URL}/dashboard" style="background-color: #1a2a5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Go to Dashboard</a>
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export async function sendLoadRequestEmail(data: any) {
  try {
    const transporter = getTransporter()
    const result = await transporter.sendMail({
      from: `"FleetXchange" <${effectiveFrom}>`,
      to: 'Mrtiger@fleetxchange.africa',
      subject: `New Load Request from ${data.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">New Load Request</h2>
          
          <h3>Company Information</h3>
          <p><strong>Company Name:</strong> ${data.companyName}</p>
          <p><strong>Contact Person:</strong> ${data.contactPerson}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          
          <h3>Cargo Details</h3>
          <p>${data.cargoDetails}</p>
          
          <h3>Route & Timeline</h3>
          <p><strong>Route:</strong> ${data.route}</p>
          <p><strong>Timeline:</strong> ${data.timeline}</p>
          
          ${data.specialRequirements ? `
            <h3>Special Requirements</h3>
            <p>${data.specialRequirements}</p>
          ` : ''}
          
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Submitted on: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });
    console.log('✅ Email sent successfully:', result.messageId);
    // Detailed delivery info for debugging (provider responses)
    console.log('   accepted:', result.accepted);
    console.log('   rejected:', result.rejected);
    if (result.envelope) console.log('   envelope:', result.envelope);
    if (result.response) console.log('   response:', result.response);
    return { success: true, result };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error };
  }
}

export async function sendTransporterApplicationEmail(data: any) {
  try {
    const transporter = getTransporter()
    const result = await transporter.sendMail({
      from: `"FleetXchange" <${effectiveFrom}>`,
      to: 'Mrtiger@fleetxchange.africa',
      subject: `New Transporter Application from ${data.companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">New Transporter Application</h2>
          
          <h3>Company Information</h3>
          <p><strong>Company Name:</strong> ${data.companyName}</p>
          <p><strong>Contact Name:</strong> ${data.contactName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone}</p>
          <p><strong>Country:</strong> ${data.country || 'N/A'}</p>
          <p><strong>Fleet Size:</strong> ${data.fleetSize || 'N/A'}</p>
          
          <h3>Inquiry Type</h3>
          <p>${data.inquiryType || 'General'}</p>
          
          ${data.message ? `
            <h3>Message</h3>
            <p>${data.message}</p>
          ` : ''}
          
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Submitted on: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });
    console.log('✅ Email sent successfully:', result.messageId);
    // Detailed delivery info for debugging (provider responses)
    console.log('   accepted:', result.accepted);
    console.log('   rejected:', result.rejected);
    if (result.envelope) console.log('   envelope:', result.envelope);
    if (result.response) console.log('   response:', result.response);
    return { success: true, result };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error };
  }
}

// ============ NEW EMAIL TEMPLATES FOR NOTIFICATIONS ============

export const loadPostedEmail = (transporterName: string, loadRef: string, origin: string, destination: string, price: number, currency: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #1a2a5e; margin-top: 0;">🚚 New Load Available</h2>
    <p>Hi ${transporterName},</p>
    <p>A new load has been posted on FleetXChange matching your service area!</p>
    
    <div style="background: #f0f0f0; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <p><strong>Load Reference:</strong> ${loadRef}</p>
      <p><strong>Route:</strong> ${origin} → ${destination}</p>
      <p><strong>Offered Price:</strong> ${currency} ${price.toLocaleString()}</p>
    </div>
    
    <p>View the load details and submit your quote below:</p>
    <p style="margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://fleetxchange.com'}/transporter/loads" style="background-color: #3ab54a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Available Loads</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export const quoteReceivedEmail = (clientName: string, transporterName: string, loadRef: string, quotedPrice: number, currency: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #1a2a5e; margin-top: 0;">📬 New Quote Received</h2>
    <p>Hi ${clientName},</p>
    <p><strong>${transporterName}</strong> has submitted a quote for your load <strong>${loadRef}</strong>.</p>
    
    <div style="background: #e8f5e9; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3ab54a;">
      <p><strong>Quoted Price:</strong> <span style="font-size: 20px; font-weight: bold; color: #3ab54a;">${currency} ${quotedPrice.toLocaleString()}</span></p>
    </div>
    
    <p>Review the quote and accept or reject it:</p>
    <p style="margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://fleetxchange.com'}/client/loads" style="background-color: #1a2a5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Quotes</a>
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export const quoteRejectedEmail = (transporterName: string, loadRef: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #ef5350; margin-top: 0;">❌ Quote Rejected</h2>
    <p>Hi ${transporterName},</p>
    <p>Unfortunately, your quote for load <strong>${loadRef}</strong> has been rejected by the client.</p>
    
    <p>Don't worry! More loads are being posted regularly. Keep an eye on available loads matching your service area.</p>
    
    <p style="margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://fleetxchange.com'}/transporter/loads" style="background-color: #3ab54a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View More Loads</a>
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export const documentApprovedEmail = (userName: string, docType: string, loadRef?: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #3ab54a; margin-top: 0;">✅ Document Approved</h2>
    <p>Hi ${userName},</p>
    <p>Your <strong>${docType}</strong> document${loadRef ? ` for load ${loadRef}` : ''} has been approved by the FleetXChange team.</p>
    
    <p>You can now proceed with your shipment. If you have any questions, please contact support.</p>
    
    <p style="margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://fleetxchange.com'}/dashboard" style="background-color: #1a2a5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Go to Dashboard</a>
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export const documentRejectedEmail = (userName: string, docType: string, reason: string, loadRef?: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #ef5350; margin-top: 0;">❌ Document Rejected</h2>
    <p>Hi ${userName},</p>
    <p>Your <strong>${docType}</strong> document${loadRef ? ` for load ${loadRef}` : ''} has been rejected.</p>
    
    <div style="background: #ffebee; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #ef5350;">
      <p><strong>Reason:</strong> ${reason}</p>
    </div>
    
    <p>Please re-upload the document with the necessary corrections. If you need assistance, contact our support team.</p>
    
    <p style="margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://fleetxchange.com'}/client/documents" style="background-color: #1a2a5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Upload Document</a>
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export const welcomeEmail = (companyName: string, role: string, loginUrl: string = 'https://fleetxchange.com/login') => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #1a2a5e; margin-top: 0;">🎉 Welcome to FleetXChange!</h2>
    <p>Hi ${companyName},</p>
    <p>Thank you for registering with <strong>FleetXChange</strong>. We're excited to have you on board!</p>
    
    <div style="background: #e3f2fd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3ab54a;">
      <p><strong>Account Role:</strong> <span style="color: #1a2a5e; font-weight: bold;">${role === 'CLIENT' ? 'Freight Client' : 'Transporter'}</span></p>
      <p style="font-size: 13px; margin: 10px 0 0 0; color: #666;">
        ${role === 'CLIENT' ? 
          'Post freight loads, receive bids from verified transporters, and manage your shipments all in one place.' : 
          'Bid on available loads, manage your fleet, upload proof of delivery, and build your reputation.'}
      </p>
    </div>
    
    <h3 style="color: #1a2a5e; margin-top: 25px;">Next Steps:</h3>
    <ul style="color: #555; line-height: 1.8;">
      <li><strong>Verify Your Account:</strong> Admin verification is required before you can fully use the platform. This typically takes 24-48 hours.</li>
      <li><strong>Complete Your Profile:</strong> Add your company details, contact information, and any relevant documents.</li>
      <li><strong>Review Guidelines:</strong> Familiarize yourself with our platform rules and best practices.</li>
    </ul>
    
    <p style="margin: 30px 0;">
      <a href="${loginUrl}" style="background-color: #1a2a5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Login to Your Account</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <h3 style="color: #1a2a5e; margin-bottom: 10px;">Need Help?</h3>
    <p style="font-size: 14px; color: #666; margin: 0;">
      If you have any questions, feel free to reach out to our support team at 
      <a href="mailto:support@fleetxchange.com" style="color: #3ab54a; text-decoration: none; font-weight: bold;">support@fleetxchange.com</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export const loadApprovedEmail = (clientName: string, loadRef: string, origin: string, destination: string, basePrice: number, commission: number, currency: string = 'ZAR') => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #1a2a5e; margin-top: 0;">✅ Your Load Has Been Approved!</h2>
    <p>Hi ${clientName},</p>
    <p>Great news! Your load <strong>${loadRef}</strong> has been <strong style="color: #3ab54a;">APPROVED</strong> by our admin team and is now ready for transporter bidding.</p>
    
    <div style="background: #f0fef4; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3ab54a;">
      <p style="margin: 0 0 15px 0;"><strong style="color: #1a2a5e;">Load Details:</strong></p>
      <p style="margin: 5px 0;"><strong>Reference:</strong> ${loadRef}</p>
      <p style="margin: 5px 0;"><strong>Route:</strong> ${origin} → ${destination}</p>
      <p style="margin: 5px 0;"><strong>Base Price:</strong> ${currency} ${basePrice.toLocaleString()}</p>
      ${commission > 0 ? `<p style="margin: 5px 0;"><strong>Commission:</strong> ${currency} ${commission.toLocaleString()}</p>` : ''}
      <p style="margin: 5px 0;"><strong>Total:</strong> ${currency} ${(basePrice + commission).toLocaleString()}</p>
    </div>
    
    <p><strong style="color: #1a2a5e;">What happens next?</strong></p>
    <ul style="color: #555; line-height: 1.8;">
      <li>Verified transporters will receive notifications about your load</li>
      <li>Transporters can submit their bids for your load</li>
      <li>You'll be able to review and compare bids</li>
      <li>Select the best transporter and confirm the assignment</li>
    </ul>
    
    <p style="margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://fleetxchange.com'}/client/loads" style="background-color: #3ab54a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Your Load</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #666; font-size: 13px;">
      If you have any questions about your load or need assistance, please don't hesitate to contact our support team.
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export const loadApprovedNotificationEmail = (transporterName: string, loadRef: string, origin: string, destination: string, price: number, currency: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #3ab54a; margin-top: 0;">🎯 Load Approved & Available for Bidding</h2>
    <p>Hi ${transporterName},</p>
    <p>An approved load is now available on FleetXChange! This is a verified, quality load ready for transporter bids.</p>
    
    <div style="background: #e8f5e9; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3ab54a;">
      <p><strong>Load Reference:</strong> ${loadRef}</p>
      <p><strong>Route:</strong> ${origin} → ${destination}</p>
      <p><strong>Offered Price:</strong> ${currency} ${price.toLocaleString()}</p>
      <p style="font-size: 12px; color: #666; margin-top: 10px;">✓ This load has been verified and approved by our admin team</p>
    </div>
    
    <p>Submit your quote and compete for this load:</p>
    <p style="margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://fleetxchange.com'}/transporter/loads" style="background-color: #3ab54a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Submit Your Quote</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export const loadRejectedEmail = (clientName: string, loadRef: string, origin: string, destination: string, reason: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #d32f2f; margin-top: 0;">❌ Load Rejected</h2>
    <p>Hi ${clientName},</p>
    <p>Unfortunately, your load <strong>${loadRef}</strong> has been <strong style="color: #d32f2f;">REJECTED</strong> by our admin team.</p>
    
    <div style="background: #ffebee; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #d32f2f;">
      <p style="margin: 0 0 15px 0;"><strong style="color: #1a2a5e;">Load Details:</strong></p>
      <p style="margin: 5px 0;"><strong>Reference:</strong> ${loadRef}</p>
      <p style="margin: 5px 0;"><strong>Route:</strong> ${origin} → ${destination}</p>
      
      <div style="background: white; padding: 15px; border-radius: 4px; margin-top: 15px; border-left: 3px solid #d32f2f;">
        <p style="margin: 0 0 10px 0;"><strong style="color: #d32f2f;">Rejection Reason:</strong></p>
        <p style="margin: 0; color: #555; line-height: 1.6;">${reason}</p>
      </div>
    </div>
    
    <p><strong style="color: #1a2a5e;">What can you do?</strong></p>
    <ul style="color: #555; line-height: 1.8;">
      <li>Review the rejection reason above carefully</li>
      <li>Make necessary changes to your load details or documentation</li>
      <li>Resubmit your load after addressing the feedback</li>
      <li>Contact our support team if you need clarification on the rejection</li>
    </ul>
    
    <p style="margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://fleetxchange.com'}/client/loads" style="background-color: #1a2a5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">View Your Loads</a>
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="color: #666; font-size: 13px;">
      If you have questions about this rejection or need assistance, please contact our support team immediately.
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export const invoiceGeneratedEmail = (
  recipientName: string,
  loadRef: string,
  invoiceNumber: string,
  amount: number,
  currency: string,
  tonnage: number,
  progressPercentage: number
) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="border-left: 4px solid #3ab54a; padding-left: 15px; margin-bottom: 25px;">
      <h1 style="margin: 0 0 5px 0; color: #1a2a5e; font-size: 24px;">📄 Invoice Generated</h1>
      <p style="margin: 0; color: #666; font-size: 14px;">Load: <strong>${loadRef}</strong></p>
    </div>
    
    <div style="background: #f0f8f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 15px 0; color: #1a2a5e; font-size: 16px;">Invoice Details</h3>
      <table style="width: 100%; color: #333; font-size: 14px;">
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Invoice #:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right;"><strong>${invoiceNumber}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Amount Due:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right; color: #3ab54a;"><strong>${currency} ${amount.toLocaleString()}</strong></td>
        </tr>
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Tonnage:</strong></td>
          <td style="padding: 8px 0; border-bottom: 1px solid #ddd; text-align: right;">${tonnage} tons</td>
        </tr>
        <tr>
          <td style="padding: 8px 0;"><strong>Load Progress:</strong></td>
          <td style="padding: 8px 0; text-align: right;">${progressPercentage}% Complete</td>
        </tr>
      </table>
    </div>
    
    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      A new invoice has been generated and is ready for payment. Please review the details above and proceed with payment at your earliest convenience.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://fleetxchange.africa'}/client/invoices" style="background-color: #3ab54a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        View Invoice
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">
      If you have any questions about this invoice, please contact FleetXChange support.
    </p>
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export const podApprovedByAdminEmail = (
  recipientName: string,
  loadRef: string,
  comments?: string
) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px; border-radius: 8px;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <div style="border-left: 4px solid #3ab54a; padding-left: 15px; margin-bottom: 25px;">
      <h1 style="margin: 0 0 5px 0; color: #1a2a5e; font-size: 24px;">✅ POD Approved</h1>
      <p style="margin: 0; color: #666; font-size: 14px;">Your Proof of Delivery has been approved</p>
    </div>
    
    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      Hello ${recipientName},
    </p>
    
    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      Your Proof of Delivery (POD) for load <strong>${loadRef}</strong> has been approved by FleetXChange admin. The POD has been forwarded to the client for their review and approval.
    </p>
    
    ${comments ? `
      <div style="background: #f0f8f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
        <p style="margin: 0 0 10px 0; color: #1a2a5e;"><strong>Admin Comments:</strong></p>
        <p style="margin: 0; color: #555;">${comments}</p>
      </div>
    ` : ''}
    
    <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
      Once the client approves, invoices will be generated and you can track payment status.
    </p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export const documentUploadAcknowledgementEmail = (userName: string, docType: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #1a2a5e; margin-top: 0;">📄 Document Received – Under Review</h2>
    <p>Hi ${userName},</p>
    <p>We have successfully received your <strong>${docType.replace(/_/g, ' ')}</strong> document.</p>
    
    <div style="background: #e3f2fd; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #1a2a5e;">
      <p style="margin: 0; color: #1a2a5e; font-size: 14px;">
        ⏳ <strong>Review Timeline:</strong> Our team will review your document within <strong>24 hours</strong>.
        If the document meets all requirements, it will be approved and you will receive a confirmation email.
      </p>
    </div>
    
    <p style="color: #555; font-size: 14px;">If your document is found to be incomplete or incorrect, our team will notify you with the reason and you will be able to resubmit.</p>
    
    <p style="margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://fleetxchange.africa'}/dashboard" 
         style="background-color: #1a2a5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
        View My Documents
      </a>
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;

export const quoteSubmittedConfirmationEmail = (transporterName: string, loadRef: string, quotedPrice: number, currency: string) => `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #3ab54a; margin-top: 0;">📤 Quote Submitted Successfully</h2>
    <p>Hi ${transporterName},</p>
    <p>Your quote for load <strong>${loadRef}</strong> has been submitted and is now under review.</p>
    
    <div style="background: #e8f5e9; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #3ab54a;">
      <p style="margin: 0;"><strong>Load Reference:</strong> ${loadRef}</p>
      <p style="margin: 8px 0 0 0;"><strong>Your Quote:</strong> <span style="font-size: 20px; font-weight: bold; color: #3ab54a;">${currency} ${quotedPrice.toLocaleString()}</span></p>
    </div>
    
    <p style="color: #555; font-size: 14px;">The admin team will review all submitted quotes. You will be notified once a decision has been made.</p>
    
    <p style="margin: 30px 0;">
      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://fleetxchange.africa'}/transporter/quotes" 
         style="background-color: #1a2a5e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
        View My Quotes
      </a>
    </p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    <p style="color: #999; font-size: 12px;">Best regards,<br><strong>FleetXChange Team</strong></p>
  </div>
</div>
`;