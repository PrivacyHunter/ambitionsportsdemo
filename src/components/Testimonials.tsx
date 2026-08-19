import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { useState, useEffect } from "react";

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Soccer Club Director",
    text: "The quality of the jerseys is unmatched. The neon sublimation is vibrant and has survived countless washes. Ambition Sports is our go-to for all custom gear.",
    rating: 5
  },
  {
    name: "Sarah Miller",
    role: "Fitness Influencer",
    text: "Their compression wear is elite. The fit is perfect and the fabric technology actually aids performance. Highly recommend for any serious athlete.",
    rating: 5
  },
  {
    name: "David Chen",
    role: "Basketball Coach",
    text: "Fast turnaround and incredible design support. They took our rough ideas and turned them into professional-grade uniforms that our team loves.",
    rating: 5
  }
];

export function Testimonials() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-4 lg:px-8 bg-white/[0.02] overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-16 leading-none">
          Trusted By <br /><span className="text-neon-cyan">Elite Athletes</span>
        </h2>

        <div className="relative h-64 md:h-48">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ 
                opacity: i === current ? 1 : 0, 
                scale: i === current ? 1 : 0.9,
                y: i === current ? 0 : 20,
                pointerEvents: i === current ? "auto" : "none"
              }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 flex flex-col items-center justify-center"
            >
              <Quote className="text-neon-lime mb-6 w-12 h-12 opacity-50" />
              <p className="text-xl md:text-2xl text-muted-foreground italic leading-relaxed mb-8">
                "{t.text}"
              </p>
              <div>
                <h4 className="font-black uppercase tracking-widest text-white">{t.name}</h4>
                <p className="text-xs font-bold text-neon-cyan uppercase tracking-[0.2em]">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center gap-3 mt-12">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 transition-all duration-300 rounded-full ${i === current ? "w-12 bg-neon-cyan" : "w-3 bg-white/10"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
