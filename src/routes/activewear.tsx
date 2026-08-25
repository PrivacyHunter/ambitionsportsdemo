import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight, Info, Zap, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitInquiry } from "@/lib/inquiries.functions";
import { getPageSeo } from "@/lib/seo.functions";
import { QuickViewModal } from "@/components/QuickViewModal";


export const Route = createFileRoute("/activewear")({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ["seo", "/activewear"],
      queryFn: () => getPageSeo({ data: { path: "/activewear" } }),
    });
  },
  head: ({ loaderData }) => {
    const seo = loaderData as any;
    const title = seo?.title || "Activewear | Ambition Sports";
    const description = seo?.description || "High-performance custom gym and fitness apparel.";
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
  component: Activewear,
});

const products = [
  { 
    name: "Hyper-Stretch Leggings", 
    category: "Gym Wear", 
    desc: "Engineered with 82% Polyester / 18% Spandex. High-waisted, non-see-through performance fabric.",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1974&auto=format&fit=crop"
  },
  { 
    name: "Nebula Training Hoodie", 
    category: "Athleisure", 
    desc: "Interlock scubba fabric with laser-cut ventilation. Custom heat-seal logo options.",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop"
  },
  { 
    name: "Flow Compression Tank", 
    category: "Fitness", 
    desc: "Micro-mesh side panels for breathability. Advanced compression tech for muscle support.",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop"
  },
  { 
    name: "Carbon Performance Tracksuit", 
    category: "Teamwear", 
    desc: "Tricot brushed fabric with rib-knit cuffs. Customizable sublimation panels on arms and chest.",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=2070&auto=format&fit=crop"
  },
  { 
    name: "Pro-Grip Gym Stringer", 
    category: "Bodybuilding", 
    desc: "Lightweight jersey cotton with deep-cut armholes. Custom Silk-Screen or 3D Puff Print.",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
  },
  { 
    name: "Vector Tech Joggers", 
    category: "Activewear", 
    desc: "Tapered fit with French Terry lining. Concealed zipper pockets and custom branded drawstrings.",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=2062&auto=format&fit=crop"
  },
];

function Activewear() {
  const submitInquiryFn = useServerFn(submitInquiry);
  const [selectedProduct, setSelectedProduct] = useState<typeof products[0] | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleInquiry = async (productName: string) => {
    toast.loading(`Processing inquiry for ${productName}...`, { id: "inquiry" });
    try {
      await submitInquiryFn({
        data: {
          name: "Quick Inquiry User",
          email: "customer@example.com",
          subject: `Activewear Inquiry: ${productName}`,
          message: `Interested in bulk order for ${productName}. Please send details.`,
          details: { productName }
        }
      });
      toast.success(`Inquiry for ${productName} sent successfully!`, {
        id: "inquiry",
        description: "Our team will contact you with the spec sheet.",
      });
    } catch (error) {
      toast.error("Failed to send inquiry. Please try again.", { id: "inquiry" });
    }
  };



  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-neon-lime selection:text-background">
      <Navbar />

      <main>
        {/* Banner */}
        <section className="relative h-[clamp(300px,46svh,440px)] md:h-[clamp(380px,52svh,540px)] flex items-center justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 z-0 opacity-25">
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale" />
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center relative z-10 w-full min-w-0 px-5 sm:px-8"
          >
             <h3 className="text-neon-cyan font-black tracking-[0.18em] sm:tracking-[0.3em] md:tracking-[0.4em] uppercase mb-3 md:mb-4 text-[9px] sm:text-xs md:text-sm">Engineered For Motion</h3>
             <h1 className="mx-auto max-w-[12ch] text-4xl sm:text-5xl md:max-w-none md:text-6xl lg:text-8xl font-black uppercase italic tracking-normal leading-[0.92] mb-5 md:mb-6 break-words">
               Custom <br /><span className="text-neon-lime">Activewear</span>
             </h1>
             <div className="grid grid-cols-[minmax(16px,48px)_minmax(0,auto)_minmax(16px,48px)] items-center justify-center gap-2 sm:gap-4">
               <div className="h-[2px] w-full bg-neon-lime" />
               <p className="max-w-[25ch] text-white font-bold uppercase tracking-[0.1em] sm:tracking-widest text-[9px] sm:text-xs leading-relaxed">High-Performance Gym & Fitness Gear</p>
               <div className="h-[2px] w-full bg-neon-lime" />
             </div>
          </motion.div>
        </section>

        {/* Product Grid */}
        <section className="py-32 px-4 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12">
            {products.map((p, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-card border border-white/10 rounded-[2rem] overflow-hidden group flex flex-col h-full"
              >
                <div className="h-80 relative overflow-hidden bg-white/5">
                  <div 
                    className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" 
                    style={{ backgroundImage: `url(${p.image})` }} 
                  />
                  <div className="absolute top-6 right-6">
                    <span className="bg-neon-lime text-background px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Zap size={10} fill="currentColor" /> {p.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                </div>

                <div className="p-10 flex flex-col flex-grow">
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-3 group-hover:text-neon-lime transition-colors leading-tight">{p.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-grow">{p.desc}</p>
                  
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-white font-black text-xl italic tracking-tighter">{p.price}</span>
                    <div className="flex gap-1">
                      <CheckCircle2 size={16} className="text-neon-cyan" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Premium QC</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => { setSelectedProduct(p); setIsQuickViewOpen(true); }}
                      className="bg-white/5 hover:bg-white/10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2 text-white"
                    >
                      <Info size={14} /> Quick View
                    </button>
                    <button 
                      onClick={() => handleInquiry(p.name)}
                      className="bg-neon-lime hover:bg-neon-cyan text-background py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_10px_20px_rgba(57,255,20,0.1)]"
                    >
                      Inquire Now <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Catalog CTA */}
        <section className="py-24 px-4 bg-neon-lime relative overflow-hidden">
           <div className="absolute inset-0 bg-background/5 opacity-10 pointer-events-none">
             <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
           </div>
           <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
              <div className="text-center lg:text-left">
                <h2 className="text-background font-black text-4xl md:text-5xl uppercase italic tracking-tighter mb-4">Request Our Activewear Range</h2>
                <p className="text-background/70 font-bold uppercase tracking-widest text-xs">Gym gear, compression wear & fitness apparel</p>
              </div>
              <button className="bg-background text-neon-lime hover:text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl">
                Bulk Order Inquiry
              </button>
           </div>
        </section>
      </main>

      <Footer />
      <QuickViewModal 
        product={selectedProduct} 
        isOpen={isQuickViewOpen} 
        onClose={() => setIsQuickViewOpen(false)} 
        onInquire={handleInquiry} 
      />
    </div>
  );
}
