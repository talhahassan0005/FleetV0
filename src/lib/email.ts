import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.OUTLOOK_EMAIL,
    pass: process.env.OUTLOOK_PASSWORD,
  },
});

export async function sendLoadRequestEmail(data: any) {
  try {
    const result = await transporter.sendMail({
      from: `"FleetXchange" <${process.env.OUTLOOK_EMAIL}>`,
      to: 'mrtiger@fleetxchange.africa',
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
    return { success: true, result };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error };
  }
}

export async function sendTransporterApplicationEmail(data: any) {
  try {
    const result = await transporter.sendMail({
      from: `"FleetXchange" <${process.env.OUTLOOK_EMAIL}>`,
      to: 'mrtiger@fleetxchange.africa',
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
    return { success: true, result };
  } catch (error) {
    console.error('❌ Email send error:', error);
    return { success: false, error };
  }
}
