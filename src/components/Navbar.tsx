import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Phone, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Sportswear", href: "/sportswear" },
    { name: "Activewear", href: "/activewear" },
    { name: "Casual Wear", href: "/casual-wear" },
    { name: "About Us", href: "/about" },
    { name: "Contact Us", href: "/contact" },
  ];

  return (
    <>
      {/* Notification Bar */}
      <div className="bg-neon-lime py-1 px-4 text-center text-xs font-bold text-background uppercase tracking-wider">
        🔥 Premium Custom Sportswear - Worldwide Shipping Available!
      </div>

      {/* Top Info Bar */}
      <div className="hidden lg:flex justify-between items-center px-8 py-2 text-xs border-b border-white/10 bg-background/50 backdrop-blur-md">
        <div className="flex gap-6">
          <a href="tel:+1234567890" className="flex items-center gap-2 hover:text-neon-cyan transition-colors">
            <Phone size={14} className="text-neon-cyan" /> +1 (234) 567-890
          </a>
          <a href="mailto:info@ambitionsports.com" className="flex items-center gap-2 hover:text-neon-cyan transition-colors">
            <Mail size={14} className="text-neon-cyan" /> info@ambitionsports.com
          </a>
        </div>
        <div className="flex gap-4">
          <span className="hover:text-neon-cyan cursor-pointer transition-colors">FB</span>
          <span className="hover:text-neon-cyan cursor-pointer transition-colors">IG</span>
          <span className="hover:text-neon-cyan cursor-pointer transition-colors">TW</span>
        </div>
      </div>

      {/* Main Navbar */}
      <nav
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300 px-4 lg:px-8 py-4",
          isScrolled ? "bg-background/90 backdrop-blur-xl border-b border-neon-cyan/20 py-3" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-neon-cyan rounded-lg flex items-center justify-center font-black text-background text-2xl group-hover:shadow-[0_0_20px_rgba(0,243,255,0.5)] transition-all">
              A
            </div>
            <span className="text-xl font-black tracking-tighter uppercase italic group-hover:text-neon-cyan transition-colors">
              Ambition <span className="text-neon-cyan">Sports</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-bold uppercase tracking-widest hover:text-neon-cyan transition-colors"
                activeProps={{ className: "text-neon-cyan" }}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/contact"
              className="bg-neon-cyan hover:bg-neon-cyan/80 text-background px-6 py-2 rounded font-black text-sm uppercase transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(0,243,255,0.4)]"
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-background border-b border-white/10 p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-lg font-bold uppercase tracking-widest hover:text-neon-cyan"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/contact"
              className="bg-neon-cyan text-background px-6 py-3 rounded text-center font-black uppercase"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get a Quote
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
