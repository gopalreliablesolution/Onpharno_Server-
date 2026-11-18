import nodemailer from 'nodemailer';
import Enquiry from '../models/Enquiry.js';

// In-memory test store for automated testing
export const mockMailbox = [];

export const getTransporter = () => {
  if (process.env.NODE_ENV === 'test' || process.env.SMTP_MOCK === 'true') {
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }

  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  const port = Number(process.env.SMTP_PORT) || 587;
  const secure = port === 465 || process.env.SMTP_SECURE === 'true';

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production',
    },
  });
};

/**
 * Generate luxury B2B branded email wrapper with ONPHARNO colors
 */
const renderEmailHtml = ({ title, subtitle, contentHtml }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #FAF6F2; margin: 0; padding: 20px; color: #1F2937; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E5E7EB; }
    .header { background: linear-gradient(135deg, #D85430 0%, #A83030 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .logo { height: 42px; margin-bottom: 12px; }
    .header h1 { margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 32px 28px; line-height: 1.6; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; background: #FAF6F2; color: #D85430; border: 1px solid rgba(216,84,48,0.2); }
    .table-details { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px; }
    .table-details td { padding: 10px 12px; border-bottom: 1px solid #F3F4F6; }
    .table-details td.label { font-weight: 600; color: #6B7280; width: 35%; }
    .table-details td.value { color: #111827; font-weight: 500; }
    .message-box { background: #FAF6F2; border-left: 4px solid #D85430; padding: 16px; border-radius: 8px; margin: 20px 0; font-size: 13px; color: #374151; white-space: pre-wrap; }
    .footer { background: #0F172A; padding: 24px; text-align: center; color: #9CA3AF; font-size: 12px; line-height: 1.5; }
    .footer a { color: #D85430; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://onpharno.com/logo.png" alt="ONPHARNO" class="logo" />
      <h1>${title}</h1>
      <p>${subtitle}</p>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p><strong>ONPHARNO</strong> &mdash; Advanced Pharmaceutical &amp; Nutraceutical Contract Manufacturing</p>
      <p>Plot No. 42, GIDC Phase II, Vatva, Ahmedabad, Gujarat, India 382445</p>
      <p><a href="https://onpharno.com">www.onpharno.com</a> &bull; <a href="mailto:info@onpharno.com">info@onpharno.com</a></p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Send Admin Notification & Sender Auto-reply
 * Note: Failure NEVER interrupts or fails the parent lead submission request!
 */
export const sendEnquiryEmails = async (enquiry) => {
  const transporter = getTransporter();
  const fromAddress = process.env.SMTP_FROM || 'ONPHARNO Inquiries <no-reply@onpharno.com>';
  const adminAddress = process.env.ADMIN_EMAIL || process.env.NOTIFICATION_EMAIL || 'info@onpharno.com';

  if (!transporter) {
    console.log(`ℹ️ SMTP not configured. Skipping email delivery for Enquiry ${enquiry._id}`);
    try {
      await Enquiry.findByIdAndUpdate(enquiry._id, { emailStatus: 'disabled' });
    } catch {}
    return { success: false, reason: 'smtp_disabled' };
  }

  let adminSent = false;
  let userSent = false;
  let lastError = null;

  try {
    // 1. Admin Notification Email
    const adminHtml = renderEmailHtml({
      title: 'New Commercial B2B Lead',
      subtitle: `Type: ${enquiry.type?.toUpperCase()} &bull; Received ${new Date().toLocaleDateString('en-US')}`,
      contentHtml: `
        <div style="margin-bottom: 16px;">
          <span class="badge">${enquiry.type} Lead</span>
        </div>
        <p>A new commercial inquiry has been submitted through the ONPHARNO B2B portal. Details below:</p>
        <table class="table-details">
          <tr><td class="label">Client Name</td><td class="value">${enquiry.name || '-'}</td></tr>
          <tr><td class="label">Email Address</td><td class="value"><a href="mailto:${enquiry.email}" style="color: #D85430;">${enquiry.email}</a></td></tr>
          <tr><td class="label">Phone</td><td class="value">${enquiry.phone || 'Not provided'}</td></tr>
          <tr><td class="label">Company</td><td class="value"><strong>${enquiry.company || 'Not provided'}</strong></td></tr>
          ${enquiry.businessType ? `<tr><td class="label">Business Model</td><td class="value">${enquiry.businessType}</td></tr>` : ''}
          ${enquiry.location ? `<tr><td class="label">Location / Market</td><td class="value">${enquiry.location}</td></tr>` : ''}
          ${enquiry.productName ? `<tr><td class="label">Target Product</td><td class="value"><strong>${enquiry.productName}</strong></td></tr>` : ''}
          ${enquiry.productInterest ? `<tr><td class="label">Category / Format</td><td class="value">${enquiry.productInterest}</td></tr>` : ''}
          ${enquiry.quantity ? `<tr><td class="label">Target Batch / MOQ</td><td class="value">${enquiry.quantity}</td></tr>` : ''}
        </table>
        <h4 style="margin: 20px 0 8px; color: #111827; font-size: 14px;">Requirement / Message Body:</h4>
        <div class="message-box">${enquiry.message || 'No additional message text.'}</div>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.CLIENT_URL || 'https://onpharno.netlify.app'}/admin/enquiries" style="background: #D85430; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 600; font-size: 13px; display: inline-block;">View in Admin Panel &rarr;</a>
        </div>
      `,
    });

    const adminInfo = await transporter.sendMail({
      from: fromAddress,
      to: adminAddress,
      subject: `[New Lead - ${enquiry.type?.toUpperCase()}] from ${enquiry.name} (${enquiry.company || 'Individual'})`,
      html: adminHtml,
    });
    adminSent = true;
    if (process.env.NODE_ENV === 'test') {
      mockMailbox.push({ to: adminAddress, subject: `[New Lead - ${enquiry.type?.toUpperCase()}]`, info: adminInfo });
    }

    // 2. Sender Auto-Reply Email
    const userHtml = renderEmailHtml({
      title: 'Thank You for Contacting ONPHARNO',
      subtitle: 'Your inquiry has been successfully received by our product team',
      contentHtml: `
        <p>Dear <strong>${enquiry.name}</strong>,</p>
        <p>Thank you for reaching out to <strong>ONPHARNO</strong>. We have received your ${enquiry.type} inquiry regarding <strong>${enquiry.productName || enquiry.subject || 'pharmaceutical & nutraceutical manufacturing'}</strong>.</p>
        <p>Our formulation R&amp;D and commercial business development team is currently reviewing your project specifications. A dedicated technical specialist will get in touch with you within <strong>one business day</strong>.</p>
        <div style="background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; margin: 20px 0;">
          <h4 style="margin: 0 0 10px; font-size: 13px; color: #374151; text-transform: uppercase; letter-spacing: 0.05em;">Summary of Your Submission:</h4>
          <table class="table-details" style="margin: 0;">
            <tr><td class="label">Reference ID</td><td class="value"><code>${enquiry._id}</code></td></tr>
            <tr><td class="label">Inquiry Type</td><td class="value">${enquiry.type?.toUpperCase()}</td></tr>
            ${enquiry.company ? `<tr><td class="label">Company</td><td class="value">${enquiry.company}</td></tr>` : ''}
            ${enquiry.productName ? `<tr><td class="label">Formulation</td><td class="value">${enquiry.productName}</td></tr>` : ''}
          </table>
        </div>
        <p style="font-size: 13px; color: #6B7280;">If you have immediate questions, you can also reach our partnership team directly via WhatsApp or email at <a href="mailto:info@onpharno.com" style="color: #D85430;">info@onpharno.com</a>.</p>
        <p style="margin-top: 24px;">Warm regards,<br><strong>ONPHARNO Formulation &amp; Manufacturing Team</strong></p>
      `,
    });

    const userInfo = await transporter.sendMail({
      from: fromAddress,
      to: enquiry.email,
      subject: `Thank you for contacting ONPHARNO - We've received your inquiry`,
      html: userHtml,
    });
    userSent = true;
    if (process.env.NODE_ENV === 'test') {
      mockMailbox.push({ to: enquiry.email, subject: `Thank you for contacting ONPHARNO`, info: userInfo });
    }

    await Enquiry.findByIdAndUpdate(enquiry._id, { emailStatus: 'sent', emailError: '' });
  } catch (err) {
    lastError = err.message;
    console.error(`⚠️ Email notification error for Enquiry ${enquiry._id}:`, err.message);
    try {
      await Enquiry.findByIdAndUpdate(enquiry._id, { emailStatus: 'failed', emailError: err.message });
    } catch {}
  }

  return { success: adminSent && userSent, adminSent, userSent, error: lastError };
};

export default sendEnquiryEmails;
