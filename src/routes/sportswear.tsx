import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingCart, Info, CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { submitInquiry } from "@/lib/inquiries.functions";
import { getPageSeo } from "@/lib/seo.functions";
import { QuickViewModal } from "@/components/QuickViewModal";

export const Route = createFileRoute("/sportswear")({
  loader: async ({ context }) => {
    return context.queryClient.ensureQueryData({
      queryKey: ["seo", "/sportswear"],
      queryFn: () => getPageSeo({ data: { path: "/sportswear" } }),
    });
  },
  head: ({ loaderData }) => {
    const seo = loaderData as any;
    const title = seo?.title || "Sportswear | Ambition Sports";
    const description = seo?.description || "Explore our range of professional custom sportswear.";
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
  component: Sportswear,
});

const products = [
  { 
    name: "Apex Pro Soccer Jersey", 
    category: "Performance", 
    desc: "100% Interlock Polyester with Quick-Dry technology. Full sublimation for infinite design vibrant colors.",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=1974&auto=format&fit=crop"
  },
  { 
    name: "Elite Basketball Uniform", 
    category: "Teamwear", 
    desc: "High-density mesh fabric with moisture-wicking properties. Ribbed neck and armholes for durability.",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop"
  },
  { 
    name: "Velocity Cricket Kit", 
    category: "Teamwear", 
    desc: "Anti-UV performance fabric with side ventilation panels. Reinforced stitching for high-impact play.",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=2067&auto=format&fit=crop"
  },
  { 
    name: "Stealth Training Jacket", 
    category: "Outerwear", 
    desc: "Soft-shell windbreaker with micro-fleece lining. YKK waterproof zippers and reflective detailing.",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?q=80&w=2070&auto=format&fit=crop"
  },
  { 
    name: "Apex Sublimated Hoodie", 
    category: "Casual Sport", 
    desc: "Heavyweight 320GSM poly-cotton blend. Precision sublimation that never fades or peels.",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop"
  },
  { 
    name: "Pro-Tech Soccer Shorts", 
    category: "Performance", 
    desc: "Four-way stretch Spandex-Polyester blend. Anti-chafing flatlock seams for maximum comfort.",
    price: "Custom Quote",
    image: "https://images.unsplash.com/photo-1526676037777-05a232554f75?q=80&w=2070&auto=format&fit=crop"
  },
];


function Sportswear() {
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
          subject: `Product Inquiry: ${productName}`,
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
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      <Navbar />

      <main>
        {/* Banner */}
        <section className="relative h-[50vh] flex items-center justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale" />
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center relative z-10 px-4"
          >
             <h3 className="text-neon-lime font-black tracking-[0.4em] uppercase mb-4 text-sm">Professional Grade</h3>
             <h1 className="text-6xl md:text-9xl font-black uppercase italic tracking-tighter leading-none mb-6">
               Performance <br /><span className="text-neon-cyan">Sportswear</span>
             </h1>
             <div className="flex items-center justify-center gap-4">
               <div className="h-[2px] w-12 bg-neon-cyan" />
               <p className="text-white font-bold uppercase tracking-widest text-xs">Custom Sublimation Specialists</p>
               <div className="h-[2px] w-12 bg-neon-cyan" />
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
                className="bg-card border border-white/10 rounded-3xl overflow-hidden group flex flex-col h-full"
              >
                <div className="h-80 relative overflow-hidden bg-white/5">
                  <div 
                    className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" 
                    style={{ backgroundImage: `url(${p.image})` }} 
                  />
                  <div className="absolute top-6 right-6">
                    <span className="bg-neon-cyan text-background px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      <Zap size={10} fill="currentColor" /> {p.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                </div>

                <div className="p-10 flex flex-col flex-grow">
                  <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-3 group-hover:text-neon-cyan transition-colors leading-tight">{p.name}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-8 flex-grow">{p.desc}</p>
                  
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-white font-black text-xl italic tracking-tighter">{p.price}</span>
                    <div className="flex gap-1">
                      <CheckCircle2 size={16} className="text-neon-lime" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Premium QC</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => { setSelectedProduct(p); setIsQuickViewOpen(true); }}
                      className="bg-white/5 hover:bg-white/10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2"
                    >
                      <Info size={14} /> Quick View
                    </button>
                    <button 
                      onClick={() => handleInquiry(p.name)}
                      className="bg-neon-cyan hover:bg-neon-lime text-background py-4 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_10px_20px_rgba(0,243,255,0.1)]"
                    >
                      Inquire Now <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Global Catalog CTA */}
        <section className="py-24 px-4 bg-neon-cyan relative overflow-hidden">
           <div className="absolute inset-0 bg-background/5 opacity-10 pointer-events-none">
             <div className="w-full h-full bg-[url('https://www.transparenttextures.com/patterns/graphy-dark.png')]" />
           </div>
           <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
              <div className="text-center lg:text-left">
                <h2 className="text-background font-black text-4xl md:text-5xl uppercase italic tracking-tighter mb-4">Download Our Latest Catalog</h2>
                <p className="text-background/70 font-bold uppercase tracking-widest text-xs">Explore 500+ designs across all categories</p>
              </div>
              <button className="bg-background text-neon-cyan hover:text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-xl">
                Get PDF Catalog
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
