import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/checkout")({
  component: Checkout,
});

function Checkout() {
  const [placed, setPlaced] = useState(false);

  if (placed) {
    return (
      <div className="min-h-screen bg-[#020617] text-white">
        <Navbar />
        <main className="py-32 px-4 max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card p-16 rounded-[3rem] border border-neon-lime/30 shadow-[0_0_50px_rgba(57,255,20,0.1)]"
          >
            <div className="w-20 h-20 bg-neon-lime/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-neon-lime/30">
              <CheckCircle2 className="text-neon-lime w-12 h-12" />
            </div>
            <h1 className="text-5xl font-black uppercase italic tracking-tighter mb-4">Order Placed!</h1>
            <p className="text-muted-foreground text-lg mb-12">Thank you for your trust. A confirmation email has been sent, and our logistics team is preparing your gear.</p>
            <Link to="/" className="inline-block bg-white text-background px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-neon-cyan transition-all">
              Return Home
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <Navbar />
      <main className="py-24 px-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
           <Link to="/sportswear" className="p-3 bg-white/5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
              <ArrowLeft size={20} />
           </Link>
           <h1 className="text-5xl font-black uppercase italic tracking-tighter">Checkout</h1>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card p-10 rounded-[2.5rem] border border-white/5">
              <h2 className="text-2xl font-black uppercase italic mb-8 border-b border-white/10 pb-4">Shipping Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <input placeholder="First Name" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-neon-cyan transition-colors" />
                <input placeholder="Last Name" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-neon-cyan transition-colors" />
                <input placeholder="Email Address" className="md:col-span-2 bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-neon-cyan transition-colors" />
                <input placeholder="Shipping Address" className="md:col-span-2 bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-neon-cyan transition-colors" />
                <input placeholder="City" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-neon-cyan transition-colors" />
                <input placeholder="Country" className="bg-white/5 border border-white/10 p-5 rounded-2xl outline-none focus:border-neon-cyan transition-colors" />
              </div>
            </div>

            <div className="bg-card p-10 rounded-[2.5rem] border border-white/5">
              <h2 className="text-2xl font-black uppercase italic mb-8 border-b border-white/10 pb-4">Payment Method</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Direct Bank Wire', 'Credit Card', 'PayPal'].map((method) => (
                  <label key={method} className="relative group cursor-pointer">
                    <input type="radio" name="payment" className="peer hidden" defaultChecked={method === 'Credit Card'} />
                    <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center peer-checked:border-neon-cyan peer-checked:bg-neon-cyan/5 transition-all group-hover:bg-white/10">
                      <span className="font-bold text-xs uppercase tracking-widest">{method}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card p-10 rounded-[2.5rem] border border-neon-cyan/20 sticky top-32">
              <h2 className="text-2xl font-black uppercase italic mb-8">Order Summary</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="text-neon-lime font-bold">Calculated at shipping</span>
                </div>
                <div className="h-px bg-white/10 my-6" />
                <div className="flex justify-between items-end">
                  <span className="font-black uppercase tracking-widest text-xs">Total</span>
                  <span className="text-3xl font-black text-neon-cyan tracking-tighter italic">$0.00</span>
                </div>
              </div>
              <button 
                onClick={() => setPlaced(true)}
                className="w-full bg-neon-cyan hover:bg-neon-lime text-background py-6 rounded-2xl font-black uppercase italic tracking-widest transition-all shadow-[0_20px_40px_rgba(0,243,255,0.2)]"
              >
                Place Secure Order
              </button>
              <p className="text-[10px] text-center text-muted-foreground uppercase font-bold tracking-widest mt-6">
                🔒 256-bit SSL Encrypted Connection
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
