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
    const adminEmail = process.env['ADMIN_EMAIL'] || 'delivered@resend.dev';
    const response = await resend.emails.send({
      from: 'Ambition Sports <onboarding@resend.dev>',
      to: adminEmail,
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

export async function sendOrderConfirmationEmail(data: {
  email: string;
  orderId: string;
  amount: number;
  items: any[];
}) {
  const apiKey = process.env['RESEND_API_KEY'];
  const { email, orderId, amount, items } = data;

  if (!apiKey) {
    console.log("MOCK ORDER EMAIL (No API Key):", data);
    return { success: true, mock: true };
  }

  const resend = new Resend(apiKey);
  const html = `
    <h2>Order Confirmed!</h2>
    <p>Thank you for your order from Ambition Sports.</p>
    <p><strong>Order ID:</strong> ${orderId}</p>
    <p><strong>Total Amount:</strong> $${amount.toFixed(2)}</p>
    <p>Our team is currently preparing your custom gear. You will receive another update once your order has shipped.</p>
  `;

  try {
    const response = await resend.emails.send({
      from: 'Ambition Sports <onboarding@resend.dev>',
      to: email,
      subject: `Order Confirmation #${orderId.slice(0, 8)}`,
      html: html,
    });
    
    // Log success to database
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseAdmin = createClient(
      process.env['SUPABASE_URL']!,
      process.env['SUPABASE_SERVICE_ROLE_KEY']!,
      { auth: { persistSession: false, autoRefreshToken: false } }
    );
    await supabaseAdmin.from('email_logs').insert({
      recipient: email,
      subject: `Order Confirmation #${orderId.slice(0, 8)}`,
      order_id: orderId,
      status: 'sent',
    });

    return { success: true, data: response };
  } catch (error) {
    console.error('Error sending order email:', error);
    
    // Log failure to database
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env['SUPABASE_URL']!,
        process.env['SUPABASE_SERVICE_ROLE_KEY']!,
        { auth: { persistSession: false, autoRefreshToken: false } }
      );
      await supabaseAdmin.from('email_logs').insert({
        recipient: email,
        subject: `Order Confirmation #${orderId.slice(0, 8)}`,
        order_id: orderId,
        status: 'failed',
        error: error instanceof Error ? error.message : String(error),
      });
    } catch (logErr) {
      console.error('Failed to log email failure:', logErr);
    }

    return { success: false, error };
  }
}
