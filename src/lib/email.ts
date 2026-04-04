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

  const host = process.env.MAIL_HOST || process.env.OUTLOOK_HOST || (user && user.endsWith('@gmail.com') ? 'smtp.gmail.com' : 'smtp.gmail.com');
  const port = Number(process.env.MAIL_PORT || process.env.OUTLOOK_PORT || 587);
  const secure = port === 465;

  if (!user || !pass) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Mail transporter is not configured. Set MAIL_USER/OUTLOOK_EMAIL and MAIL_PASS/OUTLOOK_PASSWORD.');
    }

    console.warn('Mail credentials missing — using JSON transport in development.');
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

let transporter: any = null;

function getTransporter() {
  if (!transporter) {
    transporter = createTransporter();
  }
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
    const transporter = getTransporter();
    const info = await transporter.sendMail({
      from: `"FleetXChange" <${from}>`,
      to,
      subject,
      html,
    });
    console.log('Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email send failed:', error);
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
    const result = await getTransporter().sendMail({
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
