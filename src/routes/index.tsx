import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Link } from "@tanstack/react-router";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { ChevronRight, ArrowRight, Star, Globe, ShieldCheck, Zap, Scissors, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-neon-cyan selection:text-background">
      <Navbar />

      <main>
        {/* Hero Banner Slider (Simulated with first banner) */}
        <section className="relative h-[80vh] overflow-hidden flex items-center">
          <div className="absolute inset-0 z-0">
             {/* Dynamic background placeholder */}
             <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent z-10" />
             <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center animate-pulse" />
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 w-full">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="max-w-2xl"
            >
              <h2 className="text-neon-cyan font-black tracking-widest uppercase mb-4 flex items-center gap-2">
                <span className="w-8 h-[2px] bg-neon-cyan" /> Level Up Your Game
              </h2>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase italic leading-[0.9] tracking-tighter mb-8">
                Premium <br />
                <span className="text-transparent stroke-text">Custom</span> <br />
                Sportswear
              </h1>
              <div className="flex flex-wrap gap-4">
                <button className="bg-neon-cyan hover:bg-neon-lime text-background px-8 py-4 rounded font-black uppercase transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] flex items-center gap-2">
                  Shop Now <ArrowRight size={20} />
                </button>
                <button className="border-2 border-neon-lime text-neon-lime hover:bg-neon-lime hover:text-background px-8 py-4 rounded font-black uppercase transition-all flex items-center gap-2">
                  Custom Order
                </button>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-10 right-10 z-10 hidden lg:block">
            <div className="flex gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className={cn("w-12 h-1 bg-white/20 transition-all", i === 1 && "w-20 bg-neon-cyan")} />
              ))}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-24 px-4 lg:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto flex justify-between items-end mb-12">
            <div>
              <h3 className="text-neon-lime font-black tracking-widest uppercase mb-2">Exclusive</h3>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">Featured Apparel</h2>
            </div>
            <Link to="/sportswear" className="text-neon-cyan flex items-center gap-2 font-bold uppercase tracking-widest hover:translate-x-2 transition-transform">
              View All <ChevronRight size={20} />
            </Link>
          </div>

          <div className="flex gap-8 overflow-x-auto pb-10 no-scrollbar">
            {[
              { name: "Pro Soccer Jersey", price: "$49", tag: "Hot" },
              { name: "Neon Training Kit", price: "$59", tag: "New" },
              { name: "Stealth Basketball Kit", price: "$65", tag: "Trending" },
              { name: "Apex Boxing Gear", price: "$89", tag: "Elite" },
            ].map((product, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="min-w-[300px] bg-card rounded-xl overflow-hidden border border-white/5 relative group"
              >
                <div className="h-80 bg-white/5 flex items-center justify-center p-8 relative">
                   <div className="w-full h-full bg-white/5 rounded-full blur-3xl absolute scale-50 group-hover:bg-neon-cyan/20 transition-all" />
                   <div className="w-48 h-48 bg-white/10 rounded-lg group-hover:scale-110 transition-transform duration-500" />
                   <span className="absolute top-4 right-4 bg-neon-lime text-background px-3 py-1 rounded text-xs font-black uppercase tracking-widest">{product.tag}</span>
                </div>
                <div className="p-6">
                  <h4 className="font-black uppercase tracking-tighter text-xl mb-1">{product.name}</h4>
                  <p className="text-muted-foreground text-sm mb-4 italic">High-performance sublimation apparel.</p>
                  <div className="flex justify-between items-center">
                    <span className="text-neon-cyan font-black text-2xl">{product.price}</span>
                    <button className="p-2 bg-white/5 rounded-full hover:bg-neon-cyan hover:text-background transition-all">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Facilities Section */}
        <section className="bg-white/[0.02] py-24 px-4 lg:px-8">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="h-64 bg-white/5 rounded-xl border border-white/5" />
                <div className="h-64 bg-white/5 rounded-xl border border-white/5 translate-y-12" />
                <div className="h-64 bg-white/5 rounded-xl border border-white/5" />
                <div className="h-64 bg-white/5 rounded-xl border border-white/5 translate-y-12" />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-neon-cyan/20 blur-3xl" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-8">
                Built For <span className="text-neon-cyan">Performance</span>
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-10">
                Our state-of-the-art manufacturing facility in Sialkot combines traditional craftsmanship with cutting-edge technology. From sublimation to precision stitching, we control every step to ensure elite quality.
              </p>
              <div className="grid grid-cols-2 gap-8 mb-10">
                <FacilityItem icon={<ShieldCheck className="text-neon-lime" />} title="ISO Certified" />
                <FacilityItem icon={<Scissors className="text-neon-lime" />} title="Precision Cutting" />
                <FacilityItem icon={<Zap className="text-neon-lime" />} title="Sublimation Unit" />
                <FacilityItem icon={<Truck className="text-neon-lime" />} title="Global Export" />
              </div>
              <button className="bg-white/5 hover:bg-white/10 px-8 py-4 rounded font-black uppercase tracking-widest transition-all">
                Explore Our Facility
              </button>
            </div>
          </div>
        </section>

        {/* Work Process */}
        <section className="py-24 px-4 lg:px-8 max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-black uppercase italic mb-20 tracking-tighter">The Ambition <span className="text-neon-lime">Workflow</span></h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
            <WorkflowStep num="01" title="Mockup" desc="Custom design & 3D mockups." />
            <WorkflowStep num="02" title="Material" desc="Elite fabric selection." />
            <WorkflowStep num="03" title="Stitching" desc="High-density precision." />
            <WorkflowStep num="04" title="Quality" desc="Rigorous QC checks." />
            <WorkflowStep num="05" title="Shipping" desc="Global doorstep delivery." />
          </div>
        </section>

        {/* Worldwide Shipping */}
        <section className="bg-neon-cyan py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 flex flex-wrap justify-between items-center gap-10 grayscale brightness-0 opacity-80">
             <div className="text-background font-black text-2xl tracking-tighter italic">DHL EXPRESS</div>
             <div className="text-background font-black text-2xl tracking-tighter italic">FEDEX WORLD</div>
             <div className="text-background font-black text-2xl tracking-tighter italic">UPS GLOBAL</div>
             <div className="text-background font-black text-2xl tracking-tighter italic">TCS</div>
             <div className="text-background font-black text-2xl tracking-tighter italic">ARAMEX</div>
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        .stroke-text {
          -webkit-text-stroke: 1.5px #fff;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

function FacilityItem({ icon, title }: { icon: React.ReactNode, title: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
        {icon}
      </div>
      <span className="font-bold uppercase tracking-wider text-sm">{title}</span>
    </div>
  );
}

function WorkflowStep({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="group">
      <div className="text-6xl font-black text-white/5 group-hover:text-neon-cyan/20 transition-colors mb-4">{num}</div>
      <h4 className="font-black uppercase tracking-widest text-lg mb-2">{title}</h4>
      <p className="text-muted-foreground text-sm">{desc}</p>
    </div>
  );
}
