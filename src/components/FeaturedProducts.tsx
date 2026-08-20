import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Star, Heart, Info, ShoppingCart } from "lucide-react";
import { Link } from "@tanstack/react-router";

const products = [
  { name: "Apex Pro Soccer Jersey", price: "Custom Quote", tag: "Hot", category: "Sportswear", image: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=1974&auto=format&fit=crop" },
  { name: "Hyper-Stretch Leggings", price: "Custom Quote", tag: "New", category: "Activewear", image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?q=80&w=1974&auto=format&fit=crop" },
  { name: "Stealth Basketball Kit", price: "Custom Quote", tag: "Trending", category: "Sportswear", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop" },
  { name: "Nebula Training Hoodie", price: "Custom Quote", tag: "Elite", category: "Activewear", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1974&auto=format&fit=crop" },
  { name: "Vector Compression", price: "Custom Quote", tag: "Sale", category: "Activewear", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop" },
  { name: "Street Elite Hoodie", price: "Custom Quote", tag: "Limited", category: "Casual", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1935&auto=format&fit=crop" },
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
    <section className="py-24 px-4 lg:px-8 bg-white dark:bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <h3 className="text-primary font-black tracking-[0.2em] uppercase mb-4 text-sm">Most Wanted</h3>
          <h2 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter leading-none">
            Featured <br /><span className="text-primary">Collection</span>
          </h2>
        </div>
        <Link to="/sportswear" className="text-slate-900 dark:text-white border-b-2 border-primary pb-2 font-black uppercase tracking-widest text-sm hover:text-primary transition-colors">
          Explore All Gear
        </Link>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-8 overflow-x-hidden py-10"
      >
        {[...products, ...products].map((product, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -15 }}
            className="min-w-[320px] md:min-w-[400px] bg-slate-50 dark:bg-surface rounded-3xl overflow-hidden border border-slate-200 dark:border-border relative group"
          >
            <div className="h-[400px] bg-white/[0.03] flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
               <div className="w-full h-full bg-white/5 rounded-full blur-[100px] absolute scale-50 group-hover:bg-primary/10 transition-all duration-700" />
               
               <div 
                 className="w-full h-full bg-cover bg-center group-hover:scale-110 transition-transform duration-700 opacity-60 group-hover:opacity-100" 
                 style={{ backgroundImage: `url(${product.image})` }} 
               />

               <div className="absolute top-6 left-6 flex gap-2 z-20">
                  <span className="bg-primary text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{product.tag}</span>
               </div>
               
               <button className="absolute top-6 right-6 p-3 bg-white/80 dark:bg-background/50 backdrop-blur-md rounded-full text-slate-900 dark:text-white hover:text-red-500 transition-colors z-20">
                  <Heart size={18} />
               </button>

               <div className="absolute bottom-8 left-8 right-8 z-20 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                  <Link to="/quote" className="w-full block text-center bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 dark:hover:bg-white transition-colors">
                    Request Quote
                  </Link>
               </div>
            </div>
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-2">{product.category}</p>
                  <h4 className="font-black uppercase tracking-tighter text-2xl group-hover:text-primary transition-colors">{product.name}</h4>
                </div>
                <span className="text-slate-900 dark:text-white font-black text-2xl tracking-tighter">{product.price}</span>
              </div>
              <p className="text-slate-600 dark:text-muted-foreground text-sm mb-6 leading-relaxed">High-performance custom apparel engineered for elite athletes.</p>
              <Link to="/quote" className="flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] group/btn">
                Request Spec Sheet <ArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
