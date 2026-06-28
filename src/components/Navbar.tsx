import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, X, Globe } from "lucide-react";
import { cn } from "../lib/utils";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

export function Navbar({ onBookClick }: { onBookClick?: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: t("nav.services"), href: "#services" },
    { name: t("nav.results"), href: "#results" },
    { name: t("nav.specialists"), href: "#specialists" },
    { name: t("nav.clinic"), href: "#trust" },
  ];

  const changeLang = (lang: string) => {
    setLangMenuOpen(false);
  };

  const getLangLink = (lang: string) => {
    const currentPath = location.pathname;
    const parts = currentPath.split('/');
    if (parts.length > 1 && ['hy', 'ru', 'en'].includes(parts[1])) {
       return `/${lang}${parts.slice(2).join('/')}${location.hash}`;
    }
    return `/${lang}`;
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-pearl/80 backdrop-blur-xl border-b border-graphite/5 py-4 shadow-sm"
          : "bg-transparent py-6",
      )}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        <Link to="/" className="flex flex-col">
          <img src="/logo.png" alt="Avetisyan Beauty Clinic" className="h-12 w-auto object-contain" onError={(e) => {
            // Fallback if image not uploaded yet
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }} />
          <div className="hidden flex-col">
            <span className="font-display font-bold text-xl tracking-widest text-gold uppercase">
              Avetisyan
            </span>
            <span className="text-[10px] tracking-[0.3em] text-graphite/50 uppercase mt-1">
              Beauty Clinic
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              className="text-sm tracking-wide text-graphite/70 hover:text-graphite transition-colors duration-300"
            >
              {link.name}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4 relative">
          <div className="relative">
            <button 
              onClick={() => setLangMenuOpen(!langMenuOpen)}
              className="flex items-center gap-1 text-graphite/70 hover:text-graphite transition-colors p-2"
            >
              <Globe size={18} />
              <span className="text-xs font-medium uppercase">{i18n.language}</span>
            </button>
            {langMenuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-graphite/5 overflow-hidden flex flex-col py-2 w-24">
                {['hy', 'ru', 'en'].map(l => (
                  <Link 
                    key={l} 
                    to={getLangLink(l)}
                    onClick={() => changeLang(l)}
                    className="px-4 py-2 text-sm text-graphite/70 hover:bg-pearl hover:text-gold uppercase text-center"
                  >
                    {l}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={onBookClick}
            className="text-sm font-medium tracking-wide px-6 py-2.5 text-graphite border border-graphite/20 hover:border-graphite/50 hover:bg-graphite/5 rounded-full transition-all duration-300"
          >
            {t("nav.consultation")}
          </button>
          <button
            onClick={onBookClick}
            className="text-sm font-medium tracking-wide px-6 py-2.5 bg-gold text-white rounded-full hover:bg-gold/90 transition-all duration-300 shadow-md shadow-gold/20"
          >
            {t("nav.book")}
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-graphite p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-full left-0 right-0 bg-pearl/95 backdrop-blur-xl border-b border-graphite/10 p-6 flex flex-col gap-6 md:hidden shadow-lg"
        >
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-lg tracking-wide text-graphite/80 hover:text-gold transition-colors"
            >
              {link.name}
            </a>
          ))}
          <div className="flex justify-center gap-4 py-4 border-t border-graphite/10 mt-2">
             {['hy', 'ru', 'en'].map(l => (
                <Link 
                  key={l} 
                  to={getLangLink(l)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "text-sm font-medium uppercase px-3 py-1 rounded-full",
                    i18n.language === l ? "bg-gold text-white" : "text-graphite/50"
                  )}
                >
                  {l}
                </Link>
              ))}
          </div>
          <div className="flex flex-col gap-4 mt-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onBookClick?.();
              }}
              className="w-full py-3 text-graphite border border-graphite/20 rounded-full font-medium"
            >
              {t("nav.consultation")}
            </button>
            <button 
              onClick={() => {
                setMobileMenuOpen(false);
                onBookClick?.();
              }}
              className="w-full py-3 bg-gold text-white rounded-full font-medium shadow-md shadow-gold/20"
            >
              {t("nav.book")}
            </button>
          </div>
        </motion.div>
      )}
    </motion.header>
  );
}
