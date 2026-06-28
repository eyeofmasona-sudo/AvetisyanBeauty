import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { BeforeAfterSlider } from "../components/BeforeAfterSlider";
import { useGalleryStore } from "../store/galleryStore";
import { SEO } from "../components/SEO";

export function Gallery() {
  const { t } = useTranslation();
  const { cases } = useGalleryStore();
  const [filter, setFilter] = useState<string>("all");

  const categories = ["all", "ultraformer", "goldensun", "face", "body", "skin", "inject"];

  const getCategoryName = (cat: string) => {
    if (cat === "all") return t("gallery.filterAll");
    if (cat === "ultraformer") return "Ultraformer III";
    if (cat === "goldensun") return "Golden Sun";
    return t(`booking.cats.${cat}`);
  };

  const filteredCases = filter === "all" ? cases : cases.filter(c => c.category === filter);

  return (
    <div className="bg-pearl min-h-screen text-graphite selection:bg-gold/30 selection:text-graphite">
      <SEO titleKey="seo.gallery.title" descriptionKey="seo.gallery.description" />
      <Navbar onBookClick={() => {}} />

      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-graphite mb-6">
              {t("gallery.title")}
            </h1>
            <p className="text-graphite/60 text-lg font-light max-w-2xl mx-auto">
              {t("gallery.desc")}
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full text-sm tracking-wider uppercase transition-colors ${
                  filter === cat
                    ? "bg-graphite text-white"
                    : "bg-white border border-graphite/10 text-graphite/60 hover:border-gold hover:text-gold"
                }`}
              >
                {getCategoryName(cat)}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {filteredCases.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="relative group bg-white p-4 rounded-[2rem] shadow-sm border border-graphite/5"
              >
                <BeforeAfterSlider 
                  beforeLabel={item.beforeLabel} 
                  afterLabel={item.afterLabel} 
                  beforeImage={item.beforeImage}
                  afterImage={item.afterImage}
                  aspectRatio="aspect-square md:aspect-[4/3]" 
                />
                
                <div className="mt-6 px-4 pb-4">
                  <h4 className="text-graphite font-medium text-xl mb-1">
                    {item.protocol}
                  </h4>
                  <p className="text-graphite/60 text-sm">
                    {item.patientDesc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
          
          {filteredCases.length === 0 && (
            <div className="text-center py-20 text-graphite/40">
              {t("gallery.placeholder", "Results will be added soon")}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
