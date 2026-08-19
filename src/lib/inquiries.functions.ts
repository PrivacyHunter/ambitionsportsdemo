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
    const result = await sendInquiryEmail({
      ...data,
      details: data.details as Record<string, any>
    });

    if (!result.success) {
      return { success: false as const, error: String(result.error) };
    }

    return { 
      success: true as const, 
      data: result.data || null, 
      mock: (result as any).mock || false 
    };
  });
