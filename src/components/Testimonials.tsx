import { Star, Quote } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    name: "John Smith",
    role: "Club Manager, UK",
    content: "The quality of the custom kits we received was outstanding. The sublimation is crisp and the fabric is professional grade.",
    rating: 5
  },
  {
    name: "Elena Rodriguez",
    role: "Fitness Influencer, USA",
    content: "Ambition Sports delivered my activewear line ahead of schedule. The fit and finish are perfect for high-intensity training.",
    rating: 5
  },
  {
    name: "Ahmed Khan",
    role: "Local League Coordinator",
    content: "Great communication throughout the design process. They really understood our brand vision for the team uniforms.",
    rating: 5
  }
];

export function Testimonials() {
  return (
    <section className="py-24 bg-slate-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-primary font-black tracking-[0.3em] uppercase mb-4 text-center text-xs">Trusted Worldwide</h3>
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-center mb-16">
          What Our <span className="text-primary">Clients Say</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/5 p-8 rounded-3xl shadow-sm dark:shadow-none hover:border-primary/40 transition-colors"
            >
              <Quote className="absolute top-6 right-6 text-primary/15" size={48} />
              <div className="flex gap-1 mb-5">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={14} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-slate-700 dark:text-zinc-300 text-base leading-relaxed mb-8">“{t.content}”</p>
              <div className="pt-5 border-t border-slate-200 dark:border-white/5">
                <p className="font-black uppercase tracking-tight text-slate-900 dark:text-white">{t.name}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mt-1">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
