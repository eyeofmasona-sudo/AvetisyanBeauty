import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useContentStore, defaultContent } from '../store/contentStore';
import { useParams } from 'react-router-dom';
import { SmartImage } from './SmartImage';

export function SpecialistsSection() {
  const { t } = useTranslation();
  const { lang = 'hy' } = useParams();
  const { content } = useContentStore();

  const specialistsContent = content[lang as 'hy' | 'ru' | 'en']?.specialists || content['hy'].specialists;

  const specialists = specialistsContent.items || [];

  return (
    <section
      id="specialists"
      className="py-20 md:py-32 bg-pearl relative z-10 border-t border-graphite/5"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-20 gap-6 md:gap-8">
          <div>
            <h2 className="text-sm font-medium tracking-[0.2em] text-gold uppercase mb-4">
              {t("specialists.badge")}
            </h2>
            <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-graphite whitespace-pre-line">
              {specialistsContent.title}
            </h3>
          </div>
          <p className="text-graphite/60 max-w-sm font-light text-base md:text-lg">
            {specialistsContent.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-8">
          {specialists.map((spec, i) => {
            const img = spec.image || defaultContent['hy'].specialists.items.find(s => s.id === spec.id)?.image;
            return (
              <motion.div
                key={spec.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.08, 0.3), duration: 0.6 }}
                className="group cursor-pointer"
              >
                <div className="relative w-full aspect-[3/4] bg-pearl rounded-2xl md:rounded-3xl overflow-hidden border border-graphite/5 mb-4">
                  {img ? (
                    <SmartImage
                      src={img}
                      alt={spec.name}
                      // object-top anchors on faces (specialist photos are typically head-and-shoulders)
                      objectPosition="object-top"
                      className="transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-graphite/40 text-sm tracking-widest uppercase">
                      No Photo
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-graphite/90 via-graphite/20 to-transparent opacity-90 pointer-events-none" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="flex flex-wrap gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      <span className="px-2.5 py-1 md:px-3 bg-black/40 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest text-white/90 border border-white/10">
                        {t("specialists.diplomas")}
                      </span>
                      <span className="px-2.5 py-1 md:px-3 bg-black/40 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest text-white/90 border border-white/10">
                        {t("specialists.certificates")}
                      </span>
                    </div>
                    <h4 className="font-display text-2xl md:text-3xl text-white font-medium mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-2">
                      {spec.name}
                    </h4>
                    <p className="text-white/80 text-xs md:text-sm tracking-widest uppercase font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] line-clamp-2">
                      {spec.role}
                    </p>
                  </div>
                </div>

                <div className="text-center px-2 min-h-[3em] flex items-center justify-center">
                  <p className="text-gold font-medium text-sm md:text-base tracking-wide normal-case break-words leading-snug">{spec.spec}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
