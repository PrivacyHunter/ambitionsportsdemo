import { Star } from "lucide-react";
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
    <section className="py-24 bg-slate-50 dark:bg-surface/30">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-black italic uppercase text-center mb-16">
          What Our <span className="text-primary">Clients Say</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-surface border border-slate-200 dark:border-border p-8 rounded-xl shadow-sm dark:shadow-none"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} size={16} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-slate-600 dark:text-muted-foreground italic mb-6">{t.content}</p>
              <div>
                <p className="font-bold text-primary">{t.name}</p>
                <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-white/40">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
