import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, Heart } from "lucide-react";

const products = [
  { name: "Pro Soccer Jersey", price: "$49", tag: "Hot", category: "Sportswear" },
  { name: "Neon Training Kit", price: "$59", tag: "New", category: "Activewear" },
  { name: "Stealth Basketball Kit", price: "$65", tag: "Trending", category: "Sportswear" },
  { name: "Apex Boxing Gear", price: "$89", tag: "Elite", category: "Combat" },
  { name: "Vector Compression", price: "$45", tag: "Sale", category: "Activewear" },
  { name: "Street Elite Hoodie", price: "$75", tag: "Limited", category: "Casual" },
];

export function FeaturedProducts() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    const speed = 1;

    const animate = () => {
      scrollContainer.scrollLeft += speed;
      if (scrollContainer.scrollLeft >= (scrollContainer.scrollWidth - scrollContainer.clientWidth)) {
        scrollContainer.scrollLeft = 0;
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    
    const stopScroll = () => cancelAnimationFrame(animationId);
    const startScroll = () => {
      animationId = requestAnimationFrame(animate);
    };

    scrollContainer.addEventListener("mouseenter", stopScroll);
    scrollContainer.addEventListener("mouseleave", startScroll);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener("mouseenter", stopScroll);
      scrollContainer.removeEventListener("mouseleave", startScroll);
    };
  }, []);

  return (
    <section className="py-24 px-4 lg:px-8 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <h3 className="text-neon-cyan font-black tracking-[0.2em] uppercase mb-4 text-sm">Most Wanted</h3>
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
            Featured <br /><span className="text-neon-lime">Collection</span>
          </h2>
        </div>
        <button className="text-white border-b-2 border-neon-cyan pb-2 font-black uppercase tracking-widest text-sm hover:text-neon-cyan transition-colors">
          Explore All Gear
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-8 overflow-x-hidden py-10"
      >
        {[...products, ...products].map((product, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -15 }}
            className="min-w-[320px] md:min-w-[400px] bg-white/[0.02] rounded-3xl overflow-hidden border border-white/5 relative group"
          >
            <div className="h-[400px] bg-white/[0.03] flex items-center justify-center p-12 relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
               <div className="w-full h-full bg-white/5 rounded-full blur-[100px] absolute scale-50 group-hover:bg-neon-cyan/10 transition-all duration-700" />
               
               {/* Mock Product Visual */}
               <div className="w-64 h-64 bg-white/10 rounded-2xl group-hover:scale-110 transition-transform duration-700 flex items-center justify-center border border-white/10 relative z-0">
                  <Star className="text-white/5 w-24 h-24" />
               </div>

               <div className="absolute top-6 left-6 flex gap-2 z-20">
                  <span className="bg-neon-cyan text-background px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{product.tag}</span>
               </div>
               
               <button className="absolute top-6 right-6 p-3 bg-background/50 backdrop-blur-md rounded-full text-white hover:text-red-500 transition-colors z-20">
                  <Heart size={18} />
               </button>

               <div className="absolute bottom-8 left-8 right-8 z-20 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                  <button className="w-full bg-white text-background py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-neon-cyan transition-colors">
                    Quick View
                  </button>
               </div>
            </div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-neon-lime text-[10px] font-black uppercase tracking-[0.2em] mb-2">{product.category}</p>
                  <h4 className="font-black uppercase tracking-tighter text-2xl group-hover:text-neon-cyan transition-colors">{product.name}</h4>
                </div>
                <span className="text-white font-black text-2xl tracking-tighter">{product.price}</span>
              </div>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">High-performance custom apparel engineered for elite athletes.</p>
              <button className="flex items-center gap-2 text-white font-black uppercase tracking-widest text-[10px] group/btn">
                Request Spec Sheet <ArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
