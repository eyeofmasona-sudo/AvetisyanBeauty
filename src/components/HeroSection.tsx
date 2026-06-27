import React, { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useContentStore } from '../store/contentStore';
import { useSettingsStore } from '../store/settingsStore';
import { useParams } from 'react-router-dom';

export function HeroSection({ onBookClick }: { onBookClick?: () => void }) {
  const { t } = useTranslation();
  const { lang = 'hy' } = useParams();
  const { content } = useContentStore();
  const { settings } = useSettingsStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { margin: "0px" });

  const heroContent = content[lang as 'hy' | 'ru' | 'en']?.hero || content['hy'].hero;

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const videoSrc = (isMobile && settings.heroVideoMobileUrl) ? settings.heroVideoMobileUrl : (settings.heroVideoUrl || "/videos/hero-background.mp4");

  useEffect(() => {
    if (!videoRef.current) return;
    
    // Play/Pause optimization based on viewport visibility
    if (isInView) {
      videoRef.current.play().catch(e => console.log("Video autoplay prevented:", e));
    } else {
      videoRef.current.pause();
    }
  }, [isInView]);

  return (
    <section 
      ref={containerRef}
      className="hero relative min-h-[100dvh] w-full overflow-hidden bg-pearl flex items-center justify-center py-32"
    >
      <video
        ref={videoRef}
        key={videoSrc}
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/hero-poster.webp"
      >
        <source src={videoSrc || undefined} type="video/mp4" />
      </video>
      
      <div className="hero-overlay"></div>

      {/* Content */}
      <div className="hero-content relative z-[2] w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center text-center pb-24 md:pb-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <span className="inline-block py-1.5 px-5 border border-gold/40 rounded-full text-gold text-xs tracking-[0.2em] uppercase mb-8 bg-black/30 backdrop-blur-md shadow-sm">
            {t("hero.badge")}
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
          className="font-display text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-medium text-white max-w-5xl drop-shadow-xl"
        >
          {heroContent.title} <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-champagne-gold to-gold">
            {heroContent.subtitle}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
          className="mt-8 text-lg md:text-xl text-white/80 max-w-2xl font-light tracking-wide drop-shadow-md leading-relaxed"
        >
          {heroContent.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
          className="mt-12 flex flex-col sm:flex-row gap-6 w-full sm:w-auto"
        >
          <button
            onClick={onBookClick}
            className="px-8 py-4 bg-gold text-white rounded-full font-medium hover:bg-gold/90 transition-all duration-500 w-full sm:w-auto shadow-md shadow-gold/20"
          >
            {t("hero.bookBtn")}
          </button>
          <button 
            onClick={onBookClick}
            className="px-8 py-4 border border-white/30 text-white rounded-full font-medium hover:bg-white/10 backdrop-blur-md transition-all duration-500 w-full sm:w-auto bg-black/20">
            {t("hero.consultBtn")}
          </button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 pointer-events-none z-10"
      >
        <span className="text-[10px] tracking-[0.3em] text-white/60 uppercase">
          {t("hero.scroll")}
        </span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-[1px] h-12 bg-gradient-to-b from-white/60 to-transparent"
        />
      </motion.div>
    </section>
  );
}
