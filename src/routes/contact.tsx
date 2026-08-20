import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle2, Factory } from "lucide-react";
import { toast } from "sonner";
import { submitInquiry } from "@/lib/inquiries.functions";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";


import { getPageSeo } from "@/lib/seo.functions";

export const Route = createFileRoute("/contact")({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ["seo", "/contact"],
      queryFn: () => getPageSeo({ data: { path: "/contact" } }),
    });
  },
  head: ({ loaderData }) => {
    const seo = loaderData as any;
    const title = seo?.title || "Contact Us | Ambition Sports";
    const description = seo?.description || "Get a quote for your custom sportswear project or visit our Sialkot factory.";
    return {
      title,
      meta: [
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        ...(seo?.ogImage ? [{ property: "og:image", content: seo.ogImage }] : []),
      ],
    };
  },
  component: Contact,
});

function Contact() {
  const submitInquiryFn = useServerFn(submitInquiry);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      await submitInquiryFn({
        data: {
          name: formData.get("name") as string,
          email: formData.get("email") as string,
          subject: formData.get("subject") as string,
          message: formData.get("message") as string,
        }
      });
      
      toast.success("Message sent successfully!", {
        icon: <CheckCircle2 className="text-neon-lime" />,
        description: "Our international sales team will reach out within 24 hours."
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-neon-cyan selection:text-background">
      <Navbar />

      <main>
        {/* Banner */}
        <section className="relative h-[50vh] flex items-center justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=2034&auto=format&fit=crop')] bg-cover bg-center grayscale" />
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center relative z-10 px-4"
          >
             <h3 className="text-neon-lime font-black tracking-[0.4em] uppercase mb-4 text-sm">Global Headquarters</h3>
             <h1 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-none mb-6">
               Get In <span className="text-neon-cyan">Touch</span>
             </h1>
             <div className="flex items-center justify-center gap-4">
               <div className="h-[2px] w-12 bg-neon-cyan" />
               <p className="text-white font-bold uppercase tracking-widest text-xs">Direct Manufacturing & Export Inquiries</p>
               <div className="h-[2px] w-12 bg-neon-cyan" />
             </div>
          </motion.div>
        </section>

        <section className="py-32 px-4 lg:px-8 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16">
            
            {/* Contact Info Cards */}
            <div className="lg:col-span-1 space-y-8">
               <div className="space-y-6">
                 <ContactCard 
                  icon={<Phone className="text-neon-cyan" size={24} />} 
                  title="Phone / WhatsApp" 
                  value="+92 (300) 123-4567" 
                  desc="Mon-Sat, 9am-6pm (GMT+5)"
                 />
                 <ContactCard 
                  icon={<Mail className="text-neon-lime" size={24} />} 
                  title="Official Email" 
                  value="sales@ambitionsports.com" 
                  desc="For bulk order & dealership inquiries"
                 />
                 <ContactCard 
                  icon={<MapPin className="text-neon-cyan" size={24} />} 
                  title="Factory Location" 
                  value="Industrial Estate, Sialkot, Pakistan" 
                  desc="Visit our state-of-the-art facility"
                 />
               </div>
               
               <motion.a 
                whileHover={{ scale: 1.02 }}
                href="https://wa.me/923001234567" 
                target="_blank" 
                className="flex items-center justify-center gap-4 bg-[#25D366] text-white font-black uppercase italic py-6 rounded-2xl hover:brightness-110 transition-all shadow-[0_20px_40px_rgba(37,211,102,0.2)] text-sm tracking-widest"
               >
                 <MessageSquare size={22} fill="currentColor" /> Chat On WhatsApp
               </motion.a>

               <div className="p-8 bg-white/5 border border-white/10 rounded-2xl text-center">
                  <Clock className="text-neon-lime mx-auto mb-4" size={32} />
                  <h4 className="font-black uppercase tracking-widest text-xs mb-2">Operational Hours</h4>
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Mon - Sat: 09:00 - 18:00</p>
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-1 italic">Sunday: Production Maintenance</p>
               </div>
            </div>

            {/* Map Placeholder & Form */}
            <div className="lg:col-span-2 space-y-12">
               <div className="w-full h-[450px] bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden relative group">
                  <div className="absolute inset-0 z-0">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d108420.21102983796!2d74.46083375837648!3d32.50296766518116!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391ee9042c130095%3A0x1927702e71887e14!2sSialkot%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) contrast(90%) brightness(0.8)' }} 
                      allowFullScreen={true} 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="absolute inset-0 pointer-events-none border-[12px] border-background/20 rounded-[2.5rem]" />
                  <div className="absolute top-8 left-8 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-white/10 z-10 flex items-center gap-4">
                     <div className="w-12 h-12 bg-neon-cyan rounded-lg flex items-center justify-center">
                        <Factory className="text-background" size={24} />
                     </div>
                     <div>
                        <h4 className="font-black uppercase tracking-widest text-xs">Ambition Sports Unit-1</h4>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Sialkot Industrial Zone</p>
                     </div>
                  </div>
               </div>

               <div className="bg-card border border-white/10 p-10 md:p-16 rounded-[3rem] shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-neon-lime/5 blur-[100px] -z-10" />
                 <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-4 leading-none">Global <br /><span className="text-neon-lime">Inquiry Portal</span></h2>
                 <p className="text-muted-foreground mb-12 uppercase font-bold tracking-widest text-xs">Direct line to our manufacturing experts</p>
                 
                  <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-cyan">Client Name</label>
                       <input name="name" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-neon-cyan outline-none transition-all focus:bg-white/[0.08]" placeholder="e.g. David Smith" />
                     </div>
                     <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-cyan">Email Address</label>
                       <input name="email" required type="email" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-neon-cyan outline-none transition-all focus:bg-white/[0.08]" placeholder="david@sportsclub.com" />
                     </div>
                     <div className="md:col-span-2 space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-cyan">Inquiry Subject</label>
                       <input name="subject" required className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-neon-cyan outline-none transition-all focus:bg-white/[0.08]" placeholder="e.g. Private Label Manufacturing Inquiry" />
                     </div>
                     <div className="md:col-span-2 space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-cyan">Detailed Message</label>
                       <textarea name="message" required rows={6} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:border-neon-cyan outline-none transition-all focus:bg-white/[0.08]" placeholder="Tell us about your project requirements..." />
                     </div>
                     <div className="md:col-span-2 pt-4">
                       <button type="submit" disabled={isSubmitting} className="w-full bg-neon-cyan hover:bg-neon-lime text-background font-black uppercase italic py-6 rounded-2xl transition-all shadow-[0_20px_40px_rgba(0,243,255,0.2)] group disabled:opacity-50">
                         <span className="flex items-center justify-center gap-3">
                           {isSubmitting ? "Sending..." : "Send Message"} <Send className="group-hover:translate-x-2 transition-transform" size={20} />
                         </span>
                       </button>
                     </div>
                  </form>

               </div>
            </div>

          </div>
        </section>

        {/* Global Logistics Section */}
        <section className="py-24 border-t border-white/5 bg-white/[0.01]">
           <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
             <h4 className="text-neon-lime font-black tracking-[0.4em] uppercase mb-12 text-xs">Our Global Logistics Partners</h4>
             <div className="flex flex-wrap justify-center gap-16 items-center opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                <span className="text-white font-black text-3xl tracking-tighter italic">DHL</span>
                <span className="text-white font-black text-3xl tracking-tighter italic">FEDEX</span>
                <span className="text-white font-black text-3xl tracking-tighter italic">UPS</span>
                <span className="text-white font-black text-3xl tracking-tighter italic">TNT</span>
                <span className="text-white font-black text-3xl tracking-tighter italic">DPD</span>
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
    <motion.div 
      whileHover={{ x: 10 }}
      className="p-8 bg-white/[0.03] border border-white/10 rounded-2xl group hover:border-neon-cyan/40 transition-all shadow-xl relative overflow-hidden"
    >
       <div className="absolute top-0 left-0 w-1 h-0 bg-neon-cyan group-hover:h-full transition-all duration-300" />
       <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:bg-neon-cyan group-hover:text-background transition-all duration-300">{icon}</div>
       <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-2 group-hover:text-white transition-colors">{title}</h3>
       <div className="text-xl font-bold mb-2 italic tracking-tighter">{value}</div>
       <div className="text-xs text-muted-foreground font-medium">{desc}</div>
    </motion.div>
  );
}
