import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useTheme } from "@/components/ThemeProvider";
import { HeroSlider } from "@/components/HeroSlider";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { Testimonials } from "@/components/Testimonials";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, Scissors, Truck, Globe, Award, Factory, Users, Loader2 } from "lucide-react";
import { useEffect } from "react";

import { getPageSeo } from "@/lib/seo.functions";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ["seo", "/"],
      queryFn: () => getPageSeo({ data: { path: "/" } }),
    });
  },
  head: ({ loaderData }) => {
    const seo = loaderData as any;
    const title = seo?.title || "Ambition Sports | Elite Performance Wear";
    const description = seo?.description || "High-performance custom sportswear and apparel manufacturer.";
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
  component: Index,
});

function Index() {
  useEffect(() => {
    const track = async () => {
      const consent = localStorage.getItem("ambition_tracking_consent");
      if (!consent) return;

      try {
        const res = await fetch('https://ipapi.co/json/');
        const location = await res.json();
        
        await fetch('/api/public/tracking', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: '/',
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            location: {
              city: location.city,
              region: location.region,
              country: location.country_name,
              latitude: location.latitude,
              longitude: location.longitude,
              postal: location.postal,
              ip: location.ip
            }
          })
        });
      } catch (e) {
        console.warn('Tracking failed', e);
      }
    };
    track();
  }, []);


  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main>
        <HeroSlider />
        
        <FeaturedProducts />

        {/* Facilities Section */}
        <section className="bg-white dark:bg-surface py-32 px-4 lg:px-8 border-y border-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--primary),transparent_70%)] opacity-[0.03]" />
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
            <div className="relative order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="h-72 bg-[url('https://images.unsplash.com/photo-1558444479-c8498274f9ad?q=80&w=1974&auto=format&fit=crop')] bg-cover bg-center rounded-3xl border border-white/10" />
                  <div className="h-48 bg-primary/5 dark:bg-primary/10 rounded-3xl border border-primary/10 dark:border-primary/20 flex items-center justify-center">
                    <Factory className="text-primary w-16 h-16" />
                  </div>
                </div>
                <div className="space-y-6 pt-12">
                  <div className="h-48 bg-primary/5 dark:bg-primary/10 rounded-3xl border border-primary/10 dark:border-primary/20 flex items-center justify-center">
                    <Users className="text-primary w-16 h-16" />
                  </div>
                  <div className="h-72 bg-[url('https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center rounded-3xl border border-white/10" />
                </div>
              </div>
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/20 blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/20 blur-[100px] pointer-events-none" />
            </div>

            <div className="order-1 lg:order-2">
              <h3 className="text-primary font-black tracking-[0.3em] uppercase mb-6 text-sm">Industrial Excellence</h3>
              <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-8 leading-[0.9]">
                Advanced <br /><span className="text-primary">Facilities</span>
              </h2>
              <p className="text-slate-600 dark:text-muted-foreground text-xl leading-relaxed mb-12">
                Operating from Sialkot's industrial hub, our facility integrates vertical production lines. We handle everything from high-tech sublimation to precision tailoring under one roof.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12">
                <FacilityItem icon={<Award className="text-primary" />} title="ISO 9001:2015" desc="Certified quality management standards." />
                <FacilityItem icon={<Zap className="text-primary" />} title="Sublimation Pro" desc="Infinite colors, zero-fade technology." />
                <FacilityItem icon={<Scissors className="text-primary" />} title="Laser Cutting" desc="Computerized precision fabric cutting." />
                <FacilityItem icon={<ShieldCheck className="text-primary" />} title="QC Protocol" desc="Triple-stage quality inspection." />
              </div>

              <button className="bg-primary text-white hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-background hover:shadow-xl px-10 py-5 rounded-xl font-black uppercase tracking-widest text-sm transition-all duration-300">
                Explore Stitching Unit
              </button>
            </div>
          </div>
        </section>

        {/* How We Build Section */}
        <section className="py-32 px-4 lg:px-8 max-w-7xl mx-auto text-center bg-white dark:bg-background">
          <h3 className="text-primary font-black tracking-[0.3em] uppercase mb-6 text-sm">The Process</h3>
          <h2 className="text-5xl md:text-7xl font-black uppercase italic mb-24 tracking-tighter">Manufacturing <span className="text-primary">Workflow</span></h2>
          
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-12 relative">
            <div className="hidden lg:block absolute top-12 left-0 w-full h-[2px] bg-border -z-10" />
            <WorkflowStep num="01" title="Design" desc="Digital mockups & 3D tech packs." />
            <WorkflowStep num="02" title="Material" desc="Elite performance fabrics selection." />
            <WorkflowStep num="03" title="Stitching" desc="High-density flatlock precision." />
            <WorkflowStep num="04" title="QC Check" desc="Rigorous final quality assurance." />
            <WorkflowStep num="05" title="Shipping" desc="Express global logistics delivery." />
          </div>
        </section>

        {/* Worldwide Shipping */}
        <section className="bg-primary py-20 overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/world-map.png')] bg-repeat" />
          </div>
          <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="text-center lg:text-left">
              <h2 className="text-primary-foreground font-black text-4xl md:text-5xl uppercase italic tracking-tighter mb-2">We Ship Worldwide</h2>
              <p className="text-primary-foreground/80 font-bold uppercase tracking-widest text-sm">Express doorstep delivery via global partners</p>
            </div>
            <div className="flex flex-wrap justify-center gap-12 items-center grayscale brightness-0 opacity-90">
               <div className="text-primary-foreground font-black text-2xl tracking-tighter italic">DHL EXPRESS</div>
               <div className="text-primary-foreground font-black text-2xl tracking-tighter italic">FEDEX</div>
               <div className="text-primary-foreground font-black text-2xl tracking-tighter italic">UPS</div>
               <div className="text-primary-foreground font-black text-2xl tracking-tighter italic">ARAMEX</div>
            </div>
          </div>
        </section>

        <Testimonials />

        {/* Final CTA / Footer Form Intro */}
        <section className="py-32 px-4 lg:px-8 text-center bg-background border-t border-border relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_50%_0%,var(--primary),transparent_70%)] opacity-[0.05]" />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto p-12 md:p-20 rounded-[3rem] bg-primary/5 border border-primary/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
            <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter mb-8 leading-none">
              Start Your <br /><span className="text-primary">Custom Order</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto uppercase font-bold tracking-widest">
              I have approved the plan
            </p>
            <Link to="/quote" className="inline-block bg-primary text-primary-foreground hover:bg-white hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-lg transition-all duration-300">
              Get A Quote Now
            </Link>
          </motion.div>
        </section>
      </main>

      <Footer />

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

function FacilityItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
          {icon}
        </div>
        <span className="font-black uppercase tracking-wider text-sm">{title}</span>
      </div>
      <p className="text-muted-foreground text-xs font-medium leading-relaxed ml-13">{desc}</p>
    </div>
  );
}

function WorkflowStep({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="group relative">
      <div className="w-16 h-16 bg-surface border border-border rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 relative z-10">
        <span className="text-xl font-black">{num}</span>
      </div>
      <h4 className="font-black uppercase tracking-widest text-lg mb-3 group-hover:text-primary transition-colors">{title}</h4>
      <p className="text-muted-foreground text-sm leading-relaxed max-w-[200px] mx-auto">{desc}</p>
    </div>
  );
}
