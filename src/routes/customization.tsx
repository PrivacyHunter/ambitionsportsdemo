import { createFileRoute } from '@tanstack/react-router';
import { Palette, Layers, Cpu, Scissors } from 'lucide-react';

export const Route = createFileRoute('/customization')({
  head: () => ({
    meta: [
      { title: "Customization Excellence | Ambition Sports" },
      { name: "description", content: "Explore our world-class manufacturing processes: Sublimation, Heat Transfer, Embroidery, and more." },
      { property: "og:title", content: "Customization Excellence | Ambition Sports" },
      { property: "og:description", content: "Witness the precision of Ambition Sports manufacturing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CustomizationPage,
});

function CustomizationPage() {
  const processes = [
    {
      title: "Vibrant Sublimation",
      icon: Palette,
      video: "https://player.vimeo.com/external/494163967.hd.mp4?s=97e1694f410c538749a5893a7e4362b667232e01&profile_id=175",
      description: "Our high-definition sublimation process fuses ink directly into the fibers, ensuring colors that never fade, crack, or peel. Perfect for intricate designs and unlimited color palettes on performance fabrics.",
      features: ["Breathable finish", "Unlimited colors", "Edge-to-edge printing"]
    },
    {
      title: "Precision Heat Transfer",
      icon: Layers,
      video: "https://player.vimeo.com/external/494164100.hd.mp4?s=1d5440a40d5884d5930e1c3a6b57904797686b2d&profile_id=175",
      description: "Utilizing industrial-grade vinyl and 3D silicone transfers, we deliver sharp, professional logos and player numbers with exceptional durability and a premium tactile feel.",
      features: ["3D Silicone options", "Reflective finishes", "Rapid turnaround"]
    },
    {
      title: "Advanced Bed Operator",
      icon: Cpu,
      video: "https://player.vimeo.com/external/434045526.sd.mp4?s=c27dbcc6a7604051065961d9006450682022830e&profile_id=165",
      description: "Our automated bed operating systems ensure perfect fabric alignment and cutting precision. This foundational step guarantees that every panel of your custom kit is cut to exact specifications.",
      features: ["Laser-precise cutting", "Automated nesting", "Material efficiency"]
    },
    {
      title: "Premium Embroidery",
      icon: Scissors,
      video: "https://player.vimeo.com/external/394333068.sd.mp4?s=78465d336a992634d101037303f26ca4c5520e7d&profile_id=165",
      description: "Traditional craftsmanship meets modern technology. Our multi-head embroidery machines produce high-stitch-density crests and text with a sophisticated, three-dimensional look.",
      features: ["Metallic threads", "Appliqué support", "High stitch density"]
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <section className="px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="mb-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-2">Manufacturing Excellence</p>
          <h1 className="text-4xl md:text-6xl font-extrabold uppercase italic leading-tight">
            Elite <span className="text-primary">Customization</span> Studio
          </h1>
          <p className="mt-6 text-muted-foreground max-w-2xl text-lg leading-relaxed">
            Where engineering meets artistry. We utilize state-of-the-art machinery and proprietary techniques 
            to transform raw materials into professional-grade athletic armor.
          </p>
        </div>

        <div className="space-y-32">
          {processes.map((p, i) => (
            <div key={p.title} className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    <p.icon size={24} />
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black uppercase italic">{p.title}</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                  {p.description}
                </p>
                <div className="flex flex-wrap gap-4">
                  {p.features.map(f => (
                    <span key={f} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest">
                      {f}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className={`relative group ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                <div className="relative glass rounded-[2rem] overflow-hidden border border-white/10 aspect-video">
                  <video 
                    autoPlay 
                    muted 
                    loop 
                    playsInline 
                    className="w-full h-full object-cover"
                  >
                    <source src={p.video} type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mt-32 px-6 lg:px-10 max-w-7xl mx-auto">
        <div className="glass rounded-[3rem] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold uppercase italic mb-6">Ready to start your project?</h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto uppercase tracking-widest text-sm font-bold">
              Consult with our manufacturing experts today and bring your vision to life.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="/quote" className="bg-primary text-primary-foreground px-8 py-4 rounded-xl font-black uppercase italic tracking-widest hover:scale-105 transition-transform">
                Get a Custom Quote
              </a>
              <a href="/contact" className="glass border border-white/10 px-8 py-4 rounded-xl font-black uppercase italic tracking-widest hover:bg-white/5 transition-colors">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
