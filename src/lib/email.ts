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
  // Support both the older OUTLOOK_* vars and generic MAIL_* vars
  const user = process.env.MAIL_USER || process.env.OUTLOOK_EMAIL || process.env.SMTP_USER;
  const pass = process.env.MAIL_PASS || process.env.OUTLOOK_PASSWORD || process.env.SMTP_PASS;
  const fromEnv = process.env.MAIL_FROM || process.env.OUTLOOK_EMAIL || process.env.SMTP_FROM;

  // Choose host intelligently: explicit MAIL_HOST > explicit OUTLOOK_HOST > gmail default
  const host = process.env.MAIL_HOST || process.env.OUTLOOK_HOST || (user && user.endsWith('@gmail.com') ? 'smtp.gmail.com' : 'smtp.gmail.com');
  const port = Number(process.env.MAIL_PORT || process.env.OUTLOOK_PORT || 587);
  const secure = port === 465;

  // Log masked effective configuration (no secrets)
  console.log('Mail config (masked):', {
    NODE_ENV: process.env.NODE_ENV || 'development',
    host,
    port,
    user: maskEmail(user || null),
    hasPass: !!pass,
    from: maskEmail(fromEnv || user || null),
  });

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

const transporter = createTransporter();
const effectiveFrom = process.env.MAIL_FROM || process.env.OUTLOOK_EMAIL || process.env.MAIL_USER || process.env.OUTLOOK_EMAIL || '';

export async function sendLoadRequestEmail(data: any) {
  try {
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
