import { createFileRoute } from '@tanstack/react-router';
import { Palette, Layers, Cpu, Scissors, Play, Pause, Maximize } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getCustomizationVideos } from '@/lib/customization.functions';
import { getPageSeo } from '@/lib/seo.functions';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const Route = createFileRoute('/customization')({
  head: () => {
    return {
      meta: [
        { title: "Customization Excellence | Ambition Sports" },
        { name: "description", content: "Explore our world-class manufacturing processes: Sublimation, Heat Transfer, Embroidery, and more." },
        { property: "og:title", content: "Customization Excellence | Ambition Sports" },
        { property: "og:description", content: "Witness the precision of Ambition Sports manufacturing." },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CustomizationPage,
});

function VideoPlayer({ url, title }: { url: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <div 
      className="relative group glass rounded-[2rem] overflow-hidden border border-white/10 aspect-video shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video 
        ref={videoRef}
        loop 
        playsInline 
        autoPlay
        muted
        className="w-full h-full object-cover"
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={url} type="video/mp4" />
      </video>
      
      {/* Overlay Controls */}
      <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${isHovered || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={togglePlay}
          className="w-16 h-16 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center text-primary border border-primary/30 hover:scale-110 transition-transform"
        >
          {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
        </button>
      </div>

      <div className={`absolute bottom-4 right-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <button 
          onClick={toggleFullscreen}
          className="p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
          title="Fullscreen"
        >
          <Maximize size={20} />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background/80 to-transparent pointer-events-none"></div>
    </div>
  );
}

function CustomizationPage() {
  const getVideosFn = useServerFn(getCustomizationVideos);
  const getSeoFn = useServerFn(getPageSeo);

  const { data: videos, isLoading } = useQuery({
    queryKey: ['customization-videos'],
    queryFn: () => getVideosFn(),
  });

  const { data: seo } = useQuery({
    queryKey: ['customization-seo'],
    queryFn: () => getSeoFn({ data: { path: '/customization' } }),
  });

  const icons = [Palette, Layers, Cpu, Scissors];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-20">
        <section className="px-6 lg:px-10 max-w-7xl mx-auto">
          <div className="mb-16">
            <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary mb-2">
              Manufacturing Excellence
            </p>
            <h1 className="text-4xl md:text-6xl font-extrabold uppercase italic leading-tight">
              Elite <span className="text-primary">Customization</span> Studio
            </h1>
            <p className="mt-6 text-muted-foreground max-w-2xl text-lg leading-relaxed">
              {seo?.description || "Where engineering meets artistry. We utilize state-of-the-art machinery and proprietary techniques to transform raw materials into professional-grade athletic armor."}
            </p>
          </div>

          <div className="space-y-32">
            {isLoading ? (
               <div className="grid lg:grid-cols-2 gap-12 items-center animate-pulse">
                 <div className="space-y-6">
                   <div className="h-10 w-48 bg-white/5 rounded-lg" />
                   <div className="h-24 w-full bg-white/5 rounded-2xl" />
                   <div className="flex gap-4">
                     <div className="h-8 w-24 bg-white/5 rounded-full" />
                     <div className="h-8 w-24 bg-white/5 rounded-full" />
                   </div>
                 </div>
                 <div className="aspect-video bg-white/5 rounded-[2rem]" />
               </div>
            ) : videos?.map((v: any, i: number) => {
              const Icon = icons[i % icons.length];
              return (
                <div key={v.id} className={`grid lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                        {Icon && <Icon size={24} />}
                      </div>
                      <h2 className="text-2xl md:text-3xl font-black uppercase italic">{v.title}</h2>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                      {v.description}
                    </p>
                    <div className="flex flex-wrap gap-4">
                      {["Precision", "Durability", "Elite Quality"].map(f => (
                        <span key={f} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-[10px] font-bold uppercase tracking-widest">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className={`relative group ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-[2rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                    <VideoPlayer url={v.video_url} title={v.title} />
                  </div>
                </div>
              );
            })}
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
      </main>

      <Footer />
    </div>
  );
}
