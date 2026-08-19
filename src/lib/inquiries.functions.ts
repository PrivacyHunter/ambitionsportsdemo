import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendInquiryEmail } from "./email.server";

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
    // If no API key is set, we'll just log and return success for the demo
    if (!process.env['RESEND_API_KEY']) {
      console.log("MOCK EMAIL SENT:", data);
      await new Promise(r => setTimeout(r, 1000));
      return { success: true as const, mock: true as const };
    }
    
    const result = await sendInquiryEmail({
      ...data,
      details: data.details as Record<string, any> | undefined
    });

    if (!result.success) {
      return { success: false as const, error: String(result.error) };
    }

    return { success: true as const, data: result.data };
  });
