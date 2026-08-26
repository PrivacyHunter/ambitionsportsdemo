import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const submitInquiry = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    return z.object({
      name: z.string().min(2),
      email: z.string().email(),
      subject: z.string().min(2),
      message: z.string().min(10),
      details: z.record(z.string(), z.any()).optional(),
    }).parse(data);
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // 1. Store in database
    const { error: dbError } = await supabaseAdmin
      .from('inquiries')
      .insert({
        name: data.name,
        email: data.email,
        message: data.message,
        type: data.subject, // Map subject to 'type' column
        status: 'pending'
      });


    if (dbError) {
      console.error('Error saving inquiry:', dbError);
      throw new Error(dbError.message);
    }

    // 2. Send email
    const { sendInquiryEmail } = await import("./email.server");
    const result = await sendInquiryEmail({
      ...data,
      details: data.details as Record<string, any>
    });

    if (!result.success) {
      console.error("Inquiry email delivery failed:", result.error);
    }

    return {
      success: true as const,
      emailed: result.success,
      data: result.success ? result.data || null : null,
      mock: (result as any).mock || false
    };
  });

