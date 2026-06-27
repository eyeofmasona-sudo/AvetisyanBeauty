import React from "react";
import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {specialists.map((spec, i) => (
            <motion.div
              key={spec.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.8 }}
              className="group cursor-pointer"
            >
              <div
                className={`relative w-full aspect-[3/4] ${spec.image?.startsWith('http') || spec.image?.startsWith('data:image') ? 'bg-pearl' : spec.image || 'bg-graphite/10'} rounded-3xl overflow-hidden mb-8 border border-graphite/5 bg-cover bg-center`}
                style={spec.image?.startsWith('http') || spec.image?.startsWith('data:image') ? { backgroundImage: `url(${spec.image})` } : {}}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-graphite/90 via-graphite/20 to-transparent opacity-90" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="w-16 h-16 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center border border-white/20 text-gold scale-75 group-hover:scale-100 transition-transform duration-500 shadow-xl">
                    <PlayCircle size={32} strokeWidth={1.5} />
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <div className="flex gap-2 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest text-white/90 border border-white/10">
                      {t("specialists.diplomas")}
                    </span>
                    <span className="px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-[10px] uppercase tracking-widest text-white/90 border border-white/10">
                      {t("specialists.certificates")}
                    </span>
                  </div>
                  <h4 className="font-display text-3xl text-white font-medium mb-1 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {spec.name}
                  </h4>
                  <p className="text-gold text-sm tracking-widest uppercase font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {spec.role}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center px-4 py-2 mt-2 bg-white rounded-2xl shadow-sm border border-graphite/5 group-hover:shadow-md transition-shadow">
                <div>
                  <p className="text-graphite font-medium text-lg tracking-wide">{spec.spec}</p>
                </div>
                <div className="text-right">
                  <p className="text-gold font-display text-lg font-semibold tracking-wider">
                    {spec.exp}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
