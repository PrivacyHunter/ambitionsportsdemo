import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Zap, Info, ShieldCheck } from "lucide-react";
import { useEffect } from "react";

type Product = {
  name: string;
  price: string;
  category: string;
  desc: string;
  image: string;
};

export function QuickViewModal({ product, isOpen, onClose, onInquire }: {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onInquire: (name: string) => void;
}) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="glass relative w-full max-w-5xl rounded-[3rem] overflow-hidden grid lg:grid-cols-2"
          >
            <button
              onClick={onClose}
              className="absolute top-8 right-8 z-20 glass p-3 rounded-full hover:text-primary transition-colors"
            >
              <X size={20} />
            </button>

            <div className="h-[40vh] lg:h-[70vh] bg-white/5 relative">
              <div
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${product.image})` }}
              />
              <div className="absolute top-8 left-8">
                <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="p-10 lg:p-20 flex flex-col justify-center">
              <h2 className="text-4xl lg:text-6xl font-black uppercase italic tracking-tighter mb-6 leading-none">
                {product.name}
              </h2>
              <div className="flex items-center gap-4 mb-8">
                <span className="text-3xl font-black italic tracking-tighter">{product.price}</span>
                <div className="flex gap-1">
                  <ShieldCheck size={18} className="text-neon-lime" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Premium Quality Guaranteed</span>
                </div>
              </div>

              <p className="text-muted-foreground text-lg mb-12 leading-relaxed">
                {product.desc}
              </p>

              <div className="space-y-4">
                <button
                  onClick={() => { onInquire(product.name); onClose(); }}
                  className="w-full bg-primary text-primary-foreground hover:bg-neon-cyan py-6 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-[0_20px_40px_rgba(212,175,55,0.2)]"
                >
                  Request Bulk Quote <Zap size={18} fill="currentColor" />
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass p-4 rounded-xl text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Material</p>
                    <p className="text-xs font-black">Performance Poly</p>
                  </div>
                  <div className="glass p-4 rounded-xl text-center">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Tech</p>
                    <p className="text-xs font-black">Full Sublimation</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
