import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Shield, Target, Eye, Gem, Award, Users, Box, Headphones } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const quoteSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  sportType: z.string().min(2, "Sport type is required"),
  quantity: z.string().min(1, "Quantity is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
  });

  const onSubmit = (data: QuoteFormValues) => {
    console.log(data);
    toast.success("Quote request sent successfully!");
    reset();
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        {/* Sub-Hero Banner */}
        <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-background/80 z-10" />
             <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1552674605-db6ffd4facb5?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative z-10 text-center"
          >
            <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter">
              About <span className="text-neon-cyan">Us</span>
            </h1>
            <div className="w-24 h-2 bg-neon-lime mx-auto mt-4" />
          </motion.div>
        </section>

        {/* Story Section */}
        <section className="py-24 px-4 lg:px-8 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter italic mb-8">
              Legacy of <span className="text-neon-lime">Ambition</span>
            </h2>
            <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
              <p>
                Founded in the heart of Sialkot, Ambition Sports has evolved from a small stitching unit into a leading global manufacturer of premium custom sportswear. Our journey is fueled by a relentless drive to provide athletes with gear that matches their hustle.
              </p>
              <p>
                We specialize in full sublimation, custom embroidery, and high-performance fabric engineering. Every jersey, hoodie, and pair of leggings we produce carries the mark of excellence, exported to professional teams and retail brands worldwide.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
             <StatCard number="15+" label="Years Experience" />
             <StatCard number="200+" label="Team Members" />
             <StatCard number="50k+" label="Monthly Production" />
             <StatCard number="30+" label="Countries Exported" />
          </div>
        </section>

        {/* Mission / Vision / Values */}
        <section className="bg-white/[0.02] py-24 px-4 lg:px-8">
          <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12">
            <ValueCard 
              icon={<Target className="text-neon-cyan" size={40} />}
              title="Our Mission"
              desc="To empower athletes through innovative, high-performance apparel that blends style with uncompromising quality."
            />
            <ValueCard 
              icon={<Eye className="text-neon-lime" size={40} />}
              title="Our Vision"
              desc="To be the world's most trusted partner for custom sportswear, setting the standard for speed, quality, and design."
            />
            <ValueCard 
              icon={<Gem className="text-neon-cyan" size={40} />}
              title="Core Values"
              desc="Integrity in manufacturing, relentless innovation, and a customer-first approach in every stitch."
            />
          </div>
        </section>

        {/* Quote Form Section */}
        <section className="py-24 px-4 lg:px-8 max-w-4xl mx-auto">
           <div className="bg-card border border-white/5 rounded-2xl p-8 md:p-12 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-2 h-full bg-neon-cyan" />
             <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Request A <span className="text-neon-lime">Quote Today</span></h2>
             <p className="text-muted-foreground mb-10">Planning a bulk order? Fill out the details below and our team will get back to you within 24 hours.</p>

             <form onSubmit={handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</label>
                 <input {...register("name")} className="w-full bg-background border border-white/10 rounded-lg py-3 px-4 focus:border-neon-cyan outline-none transition-colors" placeholder="John Doe" />
                 {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
                 <input {...register("email")} className="w-full bg-background border border-white/10 rounded-lg py-3 px-4 focus:border-neon-cyan outline-none transition-colors" placeholder="john@example.com" />
                 {errors.email && <span className="text-red-500 text-xs">{errors.email.message}</span>}
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Sport Type</label>
                 <input {...register("sportType")} className="w-full bg-background border border-white/10 rounded-lg py-3 px-4 focus:border-neon-cyan outline-none transition-colors" placeholder="e.g. Soccer, Cricket" />
                 {errors.sportType && <span className="text-red-500 text-xs">{errors.sportType.message}</span>}
               </div>
               <div className="space-y-2">
                 <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Quantity</label>
                 <input {...register("quantity")} type="number" className="w-full bg-background border border-white/10 rounded-lg py-3 px-4 focus:border-neon-cyan outline-none transition-colors" placeholder="Minimum 20pcs" />
                 {errors.quantity && <span className="text-red-500 text-xs">{errors.quantity.message}</span>}
               </div>
               <div className="space-y-2 md:col-span-2">
                 <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Detailed Requirements</label>
                 <textarea {...register("message")} rows={4} className="w-full bg-background border border-white/10 rounded-lg py-3 px-4 focus:border-neon-cyan outline-none transition-colors" placeholder="Describe your design, material, and sizing needs..." />
                 {errors.message && <span className="text-red-500 text-xs">{errors.message.message}</span>}
               </div>
               <div className="md:col-span-2">
                 <button type="submit" className="w-full bg-neon-cyan hover:bg-neon-lime text-background font-black uppercase py-4 rounded-lg transition-all hover:scale-[1.02] shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                   Submit Quote Request
                 </button>
               </div>
             </form>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ number, label }: { number: string, label: string }) {
  return (
    <div className="bg-white/5 border border-white/5 p-8 rounded-xl text-center group hover:border-neon-cyan/30 transition-colors">
       <div className="text-4xl font-black text-neon-cyan mb-2">{number}</div>
       <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">{label}</div>
    </div>
  );
}

function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-10 bg-background border border-white/5 rounded-2xl hover:shadow-[0_0_30px_rgba(255,255,255,0.02)] transition-all">
       <div className="mb-6">{icon}</div>
       <h3 className="text-xl font-black uppercase tracking-tighter italic mb-4">{title}</h3>
       <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
