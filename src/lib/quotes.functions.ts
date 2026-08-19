import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// Order Status Type
export type OrderStatus = 'pending' | 'designing' | 'production' | 'quality_check' | 'shipped' | 'delivered';

export const submitQuote = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    name: z.string(),
    email: z.string().email(),
    sportType: z.string(),
    quantity: z.number(),
    deadline: z.string(),
    designNotes: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    // In a real app, save to DB
    const orderId = `AS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    console.log("QUOTE SUBMITTED:", { orderId, ...data });
    return { success: true, orderId };
  });

export const getOrderStatus = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ orderId: z.string() }).parse(data))
  .handler(async ({ data }) => {
    // Mock tracking
    const statuses: OrderStatus[] = ['pending', 'designing', 'production', 'quality_check', 'shipped', 'delivered'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      orderId: data.orderId,
      status: randomStatus,
      updatedAt: new Date().toISOString(),
      estimatedDelivery: "2026-09-15"
    };
  });
