import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Star, Heart, Info, ShoppingCart, Check } from "lucide-react";
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
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFavoriteNotification, setShowFavoriteNotification] = useState(false);

  const toggleFavorite = (idx: number) => {
    setFavorites(prev => {
      const next = prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx];
      localStorage.setItem("ambition_favorites", JSON.stringify(next));
      return next;
    });
    if (!favorites.includes(idx)) {
      setShowFavoriteNotification(true);
      setTimeout(() => setShowFavoriteNotification(false), 2000);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem("ambition_favorites");
    if (stored) setFavorites(JSON.parse(stored));
  }, []);


  return (
    <section className="py-24 px-4 lg:px-8 bg-slate-50 dark:bg-black overflow-hidden relative">
      <AnimatePresence>
        {showFavoriteNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 20 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-primary text-white px-6 py-3 rounded-full font-black uppercase tracking-widest text-xs shadow-2xl flex items-center gap-3 border border-white/20"
          >
            <Check size={16} /> Added to Favorites
          </motion.div>
        )}
      </AnimatePresence>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
        <div>
          <h3 className="text-primary font-black tracking-[0.2em] uppercase mb-4 text-sm">Most Wanted</h3>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase italic tracking-tighter leading-none mb-4">
            Featured <br /><span className="text-primary">Collection</span>
          </h2>
          <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest max-w-xl">
            Pro-grade kits engineered in our own facility — sublimation, flatlock stitching and elite performance fabrics.
          </p>
        </div>
        <Link to="/sportswear" className="text-slate-900 dark:text-white border-b-2 border-primary pb-2 font-black uppercase tracking-widest text-sm hover:text-primary transition-colors flex items-center gap-2 group/all">
          Explore All Gear <ArrowRight size={16} className="group-hover/all:translate-x-2 transition-transform text-primary" />
        </Link>
      </div>

      <div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 py-10"
      >
        {products.map((product, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -15 }}
            className="w-full bg-slate-50 dark:bg-zinc-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-white/5 relative group"
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
               
               <button 
                 onClick={(e) => {
                   e.preventDefault();
                   toggleFavorite(idx);
                 }}
                 className={`absolute top-6 right-6 p-3 backdrop-blur-md rounded-full transition-all duration-300 z-20 ${
                   favorites.includes(idx) 
                     ? "bg-primary text-white scale-110 shadow-lg" 
                     : "bg-white/80 dark:bg-background/50 text-slate-900 dark:text-white hover:text-primary"
                 }`}
               >
                  <Heart size={18} fill={favorites.includes(idx) ? "currentColor" : "none"} />
               </button>

               <div className="absolute bottom-8 left-8 right-8 z-20 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
                  <Link to="/quote" className="w-full block text-center bg-primary text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-black dark:hover:bg-white dark:hover:text-black transition-all duration-300 border border-primary/20">
                    Request Quote
                  </Link>
               </div>
            </div>
            
            <div className="p-8">
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex justify-between items-start">
                  <p className="text-primary group-hover:text-primary/80 transition-colors text-[10px] font-black uppercase tracking-[0.2em]">{product.category}</p>
                  <span className="text-slate-900 dark:text-white font-black text-xs sm:text-xl tracking-tighter shrink-0">{product.price}</span>
                </div>
                <h4 className="font-black uppercase tracking-tighter text-lg sm:text-2xl group-hover:text-primary transition-colors leading-tight">{product.name}</h4>
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
