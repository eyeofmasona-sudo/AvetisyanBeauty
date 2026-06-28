import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useContentStore } from '../store/contentStore';
import { useParams } from 'react-router-dom';

export function SpecialistsSection() {
  const { t } = useTranslation();
  const { lang = 'hy' } = useParams();
  const { content } = useContentStore();
  
  const specialistsContent = content[lang as 'hy' | 'ru' | 'en']?.specialists || content['hy'].specialists;

  const specialists = specialistsContent.items || [];

  return (
    <section
      id="specialists"
      className="py-32 bg-pearl relative z-10 border-t border-graphite/5"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-8">
          <div>
            <h2 className="text-sm font-medium tracking-[0.2em] text-gold uppercase mb-4">
              {t("specialists.badge")}
            </h2>
            <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-graphite whitespace-pre-line">
              {specialistsContent.title}
            </h3>
          </div>
          <p className="text-graphite/60 max-w-sm font-light text-lg">
            {specialistsContent.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:[direction:rtl]">
          {specialists.map((spec, i) => (
            <motion.div
              key={spec.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="group cursor-pointer md:[direction:ltr]"
            >
              <div className="relative w-full aspect-[3/4] bg-pearl rounded-3xl overflow-hidden border border-graphite/5 mb-4">
                {spec.image ? (
                  <img
                    src={spec.image}
                    alt={`${spec.name} — специалист Avetisyan Beauty Clinic`}
                    className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-graphite/10 via-pearl to-gold/10" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-graphite/90 via-graphite/20 to-transparent opacity-90" />

                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h4 className="font-display text-3xl text-white font-medium mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {spec.name}
                  </h4>
                  {spec.role ? (
                    <p className="text-white/80 text-sm tracking-widest uppercase font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                      {spec.role}
                    </p>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
