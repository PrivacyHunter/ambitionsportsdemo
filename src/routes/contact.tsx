import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: Contact,
});

function Contact() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        {/* Banner */}
        <section className="h-[40vh] bg-white/[0.03] flex items-center justify-center border-b border-white/5">
          <div className="text-center">
             <h1 className="text-6xl md:text-7xl font-black uppercase italic tracking-tighter">
               Contact <span className="text-neon-cyan">Us</span>
             </h1>
             <div className="flex items-center justify-center gap-2 mt-4 text-neon-lime font-bold uppercase tracking-widest text-sm">
               <span className="w-8 h-[2px] bg-neon-lime" /> Global Sales & Support
             </div>
          </div>
        </section>

        <section className="py-24 px-4 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-6">
               <ContactCard 
                icon={<Phone className="text-neon-cyan" />} 
                title="Phone" 
                value="+92 (300) 123-4567" 
                desc="Mon-Fri, 9am-6pm PST"
               />
               <ContactCard 
                icon={<Mail className="text-neon-lime" />} 
                title="Email" 
                value="sales@ambitionsports.com" 
                desc="Direct sales inquiries"
               />
               <ContactCard 
                icon={<MapPin className="text-neon-cyan" />} 
                title="Factory Address" 
                value="Industrial Estate, Sialkot, Pakistan" 
                desc="Visit our production unit"
               />
               
               <a 
                href="https://wa.me/923001234567" 
                target="_blank" 
                className="flex items-center justify-center gap-3 bg-[#25D366] text-white font-black uppercase py-4 rounded-xl hover:scale-[1.02] transition-all shadow-[0_10px_20px_rgba(37,211,102,0.2)]"
               >
                 <MessageSquare size={20} /> Chat on WhatsApp
               </a>
            </div>

            {/* Map Placeholder & Form */}
            <div className="lg:col-span-2 space-y-8">
               <div className="w-full h-80 bg-white/5 rounded-2xl border border-white/5 overflow-hidden relative flex items-center justify-center grayscale">
                  <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=2034&auto=format&fit=crop')] bg-cover bg-center opacity-20" />
                  <div className="relative z-10 text-center">
                    <MapPin size={48} className="text-neon-cyan mx-auto mb-4 animate-bounce" />
                    <span className="font-black uppercase tracking-widest text-xs">Live Factory Location Integration</span>
                  </div>
               </div>

               <div className="bg-card border border-white/5 p-8 md:p-12 rounded-2xl">
                 <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-8">Send A <span className="text-neon-lime">Direct Message</span></h2>
                 <form className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Full Name</label>
                      <input className="w-full bg-background border border-white/10 rounded-lg py-3 px-4 focus:border-neon-cyan outline-none transition-colors" placeholder="Your Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email</label>
                      <input className="w-full bg-background border border-white/10 rounded-lg py-3 px-4 focus:border-neon-cyan outline-none transition-colors" placeholder="Your Email" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Subject</label>
                      <input className="w-full bg-background border border-white/10 rounded-lg py-3 px-4 focus:border-neon-cyan outline-none transition-colors" placeholder="Order Inquiry" />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Message</label>
                      <textarea rows={5} className="w-full bg-background border border-white/10 rounded-lg py-3 px-4 focus:border-neon-cyan outline-none transition-colors" placeholder="How can we help?" />
                    </div>
                    <div className="md:col-span-2">
                      <button className="w-full bg-neon-cyan hover:bg-neon-lime text-background font-black uppercase py-4 rounded-lg transition-all shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                        Submit Message
                      </button>
                    </div>
                 </form>
               </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function ContactCard({ icon, title, value, desc }: { icon: React.ReactNode, title: string, value: string, desc: string }) {
  return (
    <div className="p-8 bg-white/5 border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
       <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center mb-4 border border-white/10">{icon}</div>
       <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">{title}</h3>
       <div className="text-lg font-bold mb-1">{value}</div>
       <div className="text-xs text-muted-foreground">{desc}</div>
    </div>
  );
}
