import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/casual-wear")({
  component: CasualWear,
});

const products = [
  { name: "Street-Elite Tee", category: "Streetwear" },
  { name: "Urban Polo Collection", category: "Casual" },
  { name: "Varsity Heritage Jacket", category: "Outerwear" },
  { name: "Tech-Chino Shorts", category: "Casual" },
  { name: "Reflective Street Hoody", category: "Outerwear" },
  { name: "Core Graphic Tee", category: "Casual" },
];

function CasualWear() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      <main>
        <section className="h-[40vh] bg-white/[0.03] flex items-center justify-center border-b border-white/5">
          <div className="text-center">
             <h1 className="text-6xl md:text-7xl font-black uppercase italic tracking-tighter">
               Custom <span className="text-white">Streetwear</span>
             </h1>
          </div>
        </section>

        <section className="py-24 px-4 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((p, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-card border border-white/5 rounded-xl overflow-hidden group"
              >
                <div className="h-80 bg-white/5 relative flex items-center justify-center">
                  <div className="w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
                </div>
                <div className="p-6">
                  <span className="text-muted-foreground text-xs font-bold uppercase tracking-widest">{p.category}</span>
                  <h3 className="text-xl font-black uppercase tracking-tighter italic my-2">{p.name}</h3>
                  <div className="flex gap-3 mt-6">
                    <button className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded font-black text-xs uppercase transition-all">Quick View</button>
                    <button className="flex-1 bg-white hover:bg-neon-cyan text-background py-3 rounded font-black text-xs uppercase flex items-center justify-center gap-2 transition-all">
                      Inquire <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
