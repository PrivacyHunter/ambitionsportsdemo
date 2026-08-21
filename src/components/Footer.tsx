import { Link } from "@tanstack/react-router";
import { Send, MapPin, Phone, Mail } from "lucide-react";
import { FaFacebook, FaInstagram, FaTwitter, FaLinkedin } from "react-icons/fa";
import { useTheme } from "./ThemeProvider";

export function Footer() {
  const { branding } = useTheme();
  return (
    <footer className="bg-white dark:bg-background border-t border-border pt-20 pb-10 px-4 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
        {/* Brand & Inquiry Info */}
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2">
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.logoText} className="h-11 w-auto object-contain" />
            ) : (
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-black text-primary-foreground text-2xl">
                {branding.logoText?.[0] || 'A'}
              </div>
            )}
            <span className="text-xl font-black tracking-tighter uppercase italic">
              {branding.logoText.split(' ')[0]} <span className="text-primary">{branding.logoText.split(' ').slice(1).join(' ')}</span>
            </span>
          </Link>
          <p className="text-slate-600 dark:text-muted-foreground text-sm leading-relaxed">
            Change the Featured collection product colors in dark mode to a non-white scheme so they look readable and match the desired branding.
          </p>
          {branding.showSocialIcons && (
            <div className="flex gap-4">
              <SocialIcon icon={<FaFacebook size={18} />} href="https://wa.me/923049893054" />
              <SocialIcon icon={<FaInstagram size={18} />} href="https://wa.me/923049893054" />
              <SocialIcon icon={<FaTwitter size={18} />} href="https://wa.me/923049893054" />
              <SocialIcon icon={<FaLinkedin size={18} />} href="https://wa.me/923049893054" />
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-bold uppercase tracking-widest mb-6 text-primary">Quick Links</h4>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link to="/sportswear" className="text-slate-700 dark:text-foreground hover:text-primary transition-colors">Sportswear</Link></li>
            <li><Link to="/activewear" className="text-slate-700 dark:text-foreground hover:text-primary transition-colors">Activewear</Link></li>
            <li><Link to="/customization" className="text-slate-700 dark:text-foreground hover:text-primary transition-colors">Customization</Link></li>
            <li><Link to="/about" className="text-slate-700 dark:text-foreground hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="text-slate-700 dark:text-foreground hover:text-primary transition-colors">Contact & Quote</Link></li>

          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-lg font-bold uppercase tracking-widest mb-6 text-primary">Get In Touch</h4>
          <ul className="space-y-4 text-sm">
            <li className="flex gap-3 text-muted-foreground">
              <MapPin size={20} className="text-primary shrink-0" />
              <span>Industrial Estate, Sialkot, Pakistan 51310</span>
            </li>
            <li className="flex gap-3 text-muted-foreground">
              <Phone size={20} className="text-primary shrink-0" />
              <span>{branding.phone}</span>
            </li>
            <li className="flex gap-3 text-muted-foreground">
              <Mail size={20} className="text-primary shrink-0" />
              <span>{branding.email}</span>
            </li>

          </ul>
        </div>

        {/* Newsletter / Form Intro */}
        <div>
          <h4 className="text-lg font-bold uppercase tracking-widest mb-6 text-primary">Newsletter</h4>
          <p className="text-muted-foreground text-sm mb-6">
            Subscribe to get latest updates and new product launches.
          </p>
          <div className="relative">
            <input 
              type="email" 
              placeholder="Your Email" 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-md py-3 px-4 text-sm focus:outline-none focus:border-primary transition-colors"
            />
            <button className="absolute right-2 top-2 p-1.5 bg-primary rounded text-white hover:bg-slate-900 dark:hover:bg-primary/90 transition-all">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="max-w-7xl mx-auto border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground uppercase tracking-widest">
        <p>© 2026 Ambition Sports. All Rights Reserved.</p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-neon-cyan">Privacy Policy</a>
          <a href="#" className="hover:text-neon-cyan">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <a 
      href={href} 
      className="w-10 h-10 border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center text-slate-700 dark:text-foreground hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm dark:shadow-[0_0_15px_rgba(0,0,0,0.3)]"
    >
      {icon}
    </a>
  );
}
