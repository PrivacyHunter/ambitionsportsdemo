import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { sendInquiryEmail } from "./email.server";

// Order Status Type
export type OrderStatus = 'pending' | 'designing' | 'production' | 'quality_check' | 'shipped' | 'delivered';

export const submitQuote = createServerFn({ method: "POST" })
  .validator((data: unknown) => z.object({
    name: z.string(),
    email: z.string().email(),
    sportType: z.string(),
    quantity: z.number(),
    deadline: z.string(),
    designNotes: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    const orderId = `AS-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;
    
    // Also send an email notification for the quote
    await sendInquiryEmail({
      name: data.name,
      email: data.email,
      subject: `New Custom Quote Request: ${orderId}`,
      message: data.designNotes,
      details: {
        orderId,
        sportType: data.sportType,
        quantity: data.quantity,
        deadline: data.deadline
      }
    });

    return { success: true as const, orderId };
  });

export const getOrderStatus = createServerFn({ method: "GET" })
  .validator((data: unknown) => z.object({ orderId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const statuses: OrderStatus[] = ['pending', 'designing', 'production', 'quality_check', 'shipped', 'delivered'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      orderId: data.orderId,
      status: randomStatus,
      updatedAt: new Date().toISOString(),
      estimatedDelivery: "2026-09-15"
    };
  });
