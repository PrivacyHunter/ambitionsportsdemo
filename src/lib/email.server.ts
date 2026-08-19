import { Resend } from 'resend';

export async function sendInquiryEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  details?: Record<string, any>;
}) {
  const apiKey = process.env['RESEND_API_KEY'];
  if (!apiKey) {
    console.log("MOCK EMAIL (No API Key):", data);
    return { success: true, mock: true };
  }

  const resend = new Resend(apiKey);
  const { name, email, subject, message, details } = data;
  
  const html = `
    <h2>New Inquiry from Ambition Sports</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
    ${details ? `
      <h3>Additional Details:</h3>
      <ul>
        ${Object.entries(details).map(([key, value]) => `<li><strong>${key}:</strong> ${value}</li>`).join('')}
      </ul>
    ` : ''}
  `;

  try {
    const response = await resend.emails.send({
      from: 'Ambition Sports <onboarding@resend.dev>',
      to: 'delivered@resend.dev',
      replyTo: email,
      subject: `[Website Inquiry] ${subject}`,
      html: html,
    });
    
    return { success: true, data: response };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
}
