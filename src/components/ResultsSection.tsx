import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { useNavigate, useParams } from "react-router-dom";
import { useContentStore } from "../store/contentStore";
import { useGalleryStore } from "../store/galleryStore";

export function ResultsSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang = 'hy' } = useParams();
  const { content } = useContentStore();
  const { cases } = useGalleryStore();

  const resultsContent = content[lang as 'hy' | 'ru' | 'en']?.results || content['hy'].results;
  const firstCase = cases && cases.length > 0 ? cases[0] : null;

  return (
    <section id="results" className="py-32 bg-white relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
          <div>
            <h2 className="text-sm font-medium tracking-[0.2em] text-gold uppercase mb-4">
              {t("results.badge")}
            </h2>
            <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-graphite whitespace-pre-line">
              {resultsContent?.title || t("results.title")}
            </h3>
          </div>
          <button 
            onClick={() => navigate(`/${lang}/gallery`)}
            className="px-6 py-3 border border-graphite/20 text-graphite rounded-full font-medium hover:bg-graphite hover:text-white transition-all duration-300"
          >
            {t("results.viewGallery")}
          </button>
        </div>

        <div className="relative group">
          <BeforeAfterSlider 
            beforeImage={firstCase?.beforeImage || "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=1200&auto=format&fit=crop"}
            afterImage={firstCase?.afterImage || "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=1200&auto=format&fit=crop"}
          />

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 bg-gradient-to-t from-white/90 via-white/50 to-transparent flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pointer-events-none rounded-b-3xl">
            <div>
              <h4 className="text-graphite font-medium text-lg sm:text-xl mb-1 drop-shadow-sm">
                {firstCase?.protocol || t("results.protocol")}
              </h4>
              <p className="text-graphite/70 text-xs sm:text-sm drop-shadow-sm">
                {firstCase?.patientDesc || t("results.patient")}
              </p>
            </div>
            <button className="px-4 sm:px-6 py-2 bg-white/50 backdrop-blur-md rounded-full text-graphite text-xs sm:text-sm font-medium hover:bg-white transition-colors border border-graphite/10 pointer-events-auto shadow-sm">
              {t("results.btn")}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mt-12 md:mt-16 border-t border-graphite/10 pt-12 md:pt-16">
          {[
            { metric: "98%", label: t("results.stats.satisfaction") },
            { metric: "10k+", label: t("results.stats.procedures") },
            { metric: "15+", label: t("results.stats.awards") },
            { metric: "0", label: t("results.stats.surgical") },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="text-center md:text-left md:border-l border-graphite/10 md:pl-6"
            >
              <div className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-graphite font-medium mb-2">
                {stat.metric}
              </div>
              <div className="text-gold text-[10px] sm:text-sm tracking-wider uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
