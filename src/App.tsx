import React, { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Navbar } from "./components/Navbar";
import { HeroSection } from "./components/HeroSection";
import { ServicesSection } from "./components/ServicesSection";
import { ResultsSection } from "./components/ResultsSection";
import { SpecialistsSection } from "./components/SpecialistsSection";
import { InstagramCarousel } from "./components/InstagramCarousel";
import { VideoCarousel } from "./components/VideoCarousel";
import { Footer } from "./components/Footer";
import { BookingModal } from "./components/BookingModal";
import { AnalyticsProvider, CookieBanner } from "./components/AnalyticsProvider";

// Lazy-loaded: these routes pull in heavy dependencies (three.js/3D
// rendering on UltraformerIII, the admin dashboard) that shouldn't be in
// the homepage's initial bundle.
const UltraformerIII = lazy(() => import("./pages/UltraformerIII").then(m => ({ default: m.UltraformerIII })));
const GoldenSun = lazy(() => import("./pages/GoldenSun").then(m => ({ default: m.GoldenSun })));
const Gallery = lazy(() => import("./pages/Gallery").then(m => ({ default: m.Gallery })));
const AdminPanel = lazy(() => import("./pages/AdminPanel").then(m => ({ default: m.AdminPanel })));
import { HelmetProvider } from 'react-helmet-async';
import { SEO } from "./components/SEO";
import { WhatsAppButton } from "./components/WhatsAppButton";
import { ScrollReveal } from "./components/ScrollReveal";

function LanguageWrapper({ children }: { children: React.ReactNode }) {
  const { lang } = useParams();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && ['hy', 'ru', 'en'].includes(lang)) {
      i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  return <>{children}</>;
}

import { loadContentFromDB } from "./store/contentStore";
import { useSettingsStore } from "./store/settingsStore";

function HomePage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="bg-pearl min-h-screen text-graphite selection:bg-gold/30 selection:text-graphite overflow-x-hidden">
      <SEO titleKey="seo.home.title" descriptionKey="seo.home.description" />
      <Navbar onBookClick={() => setIsBookingOpen(true)} />
      <main className="overflow-x-hidden">
        <HeroSection onBookClick={() => setIsBookingOpen(true)} />
        <ScrollReveal>
          <ServicesSection />
        </ScrollReveal>
        <ScrollReveal>
          <VideoCarousel />
        </ScrollReveal>
        <ScrollReveal>
          <ResultsSection />
        </ScrollReveal>
        <ScrollReveal>
          <SpecialistsSection />
        </ScrollReveal>
        <ScrollReveal>
          <InstagramCarousel />
        </ScrollReveal>
      </main>
      <Footer />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
}

export default function App() {
  useEffect(() => {
    loadContentFromDB().catch(console.error);
    import("./store/galleryStore").then(m => m.loadGalleryFromDB().catch(console.error)).catch(console.error);
    useSettingsStore.getState().loadFromDB().catch(console.error);
  }, []);

  return (
    <HelmetProvider>
      <BrowserRouter>
        <AnalyticsProvider>
        <Routes>
          <Route path="/:lang" element={
            <LanguageWrapper>
              <HomePage />
            </LanguageWrapper>
          } />
          <Route path="/:lang/ultraformer" element={
            <LanguageWrapper>
              <Suspense fallback={null}>
                <UltraformerIII />
              </Suspense>
            </LanguageWrapper>
          } />
          <Route path="/:lang/golden-sun" element={
            <LanguageWrapper>
              <Suspense fallback={null}>
                <GoldenSun />
              </Suspense>
            </LanguageWrapper>
          } />
          <Route path="/:lang/gallery" element={
            <LanguageWrapper>
              <Suspense fallback={null}>
                <Gallery />
              </Suspense>
            </LanguageWrapper>
          } />
          <Route path="/:lang/admin" element={
            <LanguageWrapper>
              <Suspense fallback={null}>
                <AdminPanel />
              </Suspense>
            </LanguageWrapper>
          } />
          <Route path="*" element={<Navigate to="/hy" replace />} />
        </Routes>
        <CookieBanner />
        <WhatsAppButton />
      </AnalyticsProvider>
    </BrowserRouter>
    </HelmetProvider>
  );
}
