import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  image: string;
  subtitle: string;
  title1: string;
  title2: string;
  accent: string;
}

const banners: Banner[] = [
  {
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
    subtitle: "Premium Custom Gear",
    title1: "Unleash Your",
    title2: "Ambition",
    accent: "text-neon-cyan"
  },
  {
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop",
    subtitle: "Elite Manufacturing",
    title1: "Precision",
    title2: "Performance",
    accent: "text-neon-lime"
  },
  {
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2076&auto=format&fit=crop",
    subtitle: "Team Uniforms",
    title1: "One Team",
    title2: "One Identity",
    accent: "text-white"
  },
  {
    image: "https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=2070&auto=format&fit=crop",
    subtitle: "Sublimation Specialists",
    title1: "Infinite",
    title2: "Design",
    accent: "text-neon-cyan"
  },
  {
    image: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?q=80&w=2062&auto=format&fit=crop",
    subtitle: "Activewear Revolution",
    title1: "Fit For",
    title2: "Greatness",
    accent: "text-neon-lime"
  },
  {
    image: "https://images.unsplash.com/photo-1461896704690-474cb88d599a?q=80&w=2070&auto=format&fit=crop",
    subtitle: "Worldwide Shipping",
    title1: "Global",
    title2: "Performance",
    accent: "text-white"
  }
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  const activeBanner = banners[current] || banners[0];

  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute inset-0 z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent z-10" />
          <div 
            className="w-full h-full bg-cover bg-center" 
            style={{ backgroundImage: `url(${activeBanner?.image})` }} 
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-20 h-full max-w-7xl mx-auto px-4 lg:px-8 flex items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-neon-cyan font-black tracking-widest uppercase mb-4 flex items-center gap-3"
            >
              <span className="w-12 h-[2px] bg-neon-cyan" /> {activeBanner?.subtitle}
            </motion.p>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black uppercase italic leading-[0.85] tracking-tighter mb-10">
              {activeBanner?.title1} <br />
              <span className={activeBanner?.accent}>{activeBanner?.title2}</span>
            </h1>
            <div className="flex flex-wrap gap-6">
              <Link
                to="/sportswear"
                className="bg-neon-cyan hover:bg-neon-lime text-background px-10 py-5 rounded-sm font-black uppercase transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,243,255,0.5)] flex items-center gap-3"
              >
                Shop Now <ArrowRight size={22} />
              </Link>
              <Link
                to="/contact"
                className="border-2 border-white/20 text-white hover:border-neon-lime hover:text-neon-lime px-10 py-5 rounded-sm font-black uppercase transition-all backdrop-blur-sm"
              >
                Custom Order
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 lg:left-8 lg:translate-x-0 z-30 flex items-center gap-8">
        <div className="flex gap-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1 transition-all duration-500 ${i === current ? "w-16 bg-neon-cyan" : "w-6 bg-white/20"}`}
            />
          ))}
        </div>
        <div className="hidden lg:flex gap-4 ml-8">
          <button onClick={prev} className="p-2 border border-white/10 rounded-full hover:bg-neon-cyan hover:text-background transition-all">
            <ChevronLeft size={20} />
          </button>
          <button onClick={next} className="p-2 border border-white/10 rounded-full hover:bg-neon-cyan hover:text-background transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
