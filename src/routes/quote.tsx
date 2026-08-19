import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { CheckCircle2, Upload, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { submitQuote } from "@/lib/quotes.functions";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  sportType: z.string().min(2),
  quantity: z.number().min(20, "Minimum order is 20 pieces"),
  deadline: z.string().min(2),
  designNotes: z.string().min(10),
});

export const Route = createFileRoute("/quote")({
  component: Quote,
});

function Quote() {
  const submitQuoteFn = useServerFn(submitQuote);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: any) => {
    try {
      const res = await submitQuoteFn({ data: { ...data, quantity: Number(data.quantity) } });
      if (res.success) {
        setOrderId(res.orderId);
        toast.success("Quote submitted successfully!");
      }
    } catch {
      toast.error("Failed to submit.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      <main className="py-24 px-4 max-w-4xl mx-auto">
        {orderId ? (
          <div className="bg-card p-12 rounded-3xl border border-neon-cyan text-center">
            <CheckCircle2 className="mx-auto w-16 h-16 text-neon-lime mb-6" />
            <h2 className="text-4xl font-black mb-4">Quote Submitted!</h2>
            <p className="text-xl mb-8">Order ID: <span className="text-neon-cyan font-bold">{orderId}</span></p>
            <p className="text-muted-foreground">Our team will review your specs and contact you within 24 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-card p-10 rounded-3xl border border-white/10">
            <h1 className="text-4xl font-black uppercase italic">Custom Quote Portal</h1>
            <div className="grid md:grid-cols-2 gap-6">
              <input {...register("name")} placeholder="Name" className="w-full p-4 bg-white/5 rounded-xl border border-white/10" />
              <input {...register("email")} placeholder="Email" className="w-full p-4 bg-white/5 rounded-xl border border-white/10" />
              <input {...register("sportType")} placeholder="Sport Type" className="w-full p-4 bg-white/5 rounded-xl border border-white/10" />
              <input {...register("quantity", { valueAsNumber: true })} type="number" placeholder="Quantity (Min 20)" className="w-full p-4 bg-white/5 rounded-xl border border-white/10" />
            </div>
            <input {...register("deadline")} placeholder="Deadline (YYYY-MM-DD)" className="w-full p-4 bg-white/5 rounded-xl border border-white/10" />
            <textarea {...register("designNotes")} placeholder="Design Notes" className="w-full p-4 bg-white/5 rounded-xl border border-white/10 h-32" />
            <button disabled={isSubmitting} className="w-full bg-neon-cyan py-6 text-background font-black rounded-xl hover:bg-neon-lime transition-all">
              {isSubmitting ? "Submitting..." : "Submit Quote Request"}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}
