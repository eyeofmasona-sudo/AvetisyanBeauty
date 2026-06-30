import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useContentStore } from '../store/contentStore';
import { SmartImage } from './SmartImage';

export function ServicesSection() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang = 'hy' } = useParams();
  const { content } = useContentStore();

  const servicesContent = content[lang as 'hy' | 'ru' | 'en']?.services || content['hy'].services;

  const services = servicesContent.items || [];

  return (
    <section
      id="services"
      className="py-20 md:py-32 bg-ivory relative z-10 border-t border-graphite/5"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-6 md:gap-8">
          <div className="max-w-2xl">
            <h2 className="text-sm font-medium tracking-[0.2em] text-gold uppercase mb-4">
              {t("services.badge")}
            </h2>
            <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-graphite whitespace-pre-line">
              {servicesContent.title}
            </h3>
          </div>
          <p className="text-graphite/60 max-w-md font-light text-base md:text-lg">
            {servicesContent.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: Math.min(index * 0.08, 0.4) }}
              onClick={() => {
                if (service.href) {
                  navigate(service.href);
                }
              }}
              role={service.href ? "button" : undefined}
              tabIndex={service.href ? 0 : undefined}
              onKeyDown={(e) => {
                if (service.href && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  navigate(service.href);
                }
              }}
              className={`group relative bg-white border border-graphite/5 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm hover:scale-[1.01] md:hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl hover:shadow-graphite/10 transition-all duration-500 flex flex-col h-full ${service.href ? "cursor-pointer" : ""}`}
            >
              {service.image_url ? (
                <SmartImage
                  src={service.image_url}
                  alt={service.title}
                  aspect="aspect-[16/10] md:aspect-[4/3]"
                  objectPosition="object-center"
                />
              ) : (
                <div className="relative aspect-[16/10] md:aspect-[4/3] w-full overflow-hidden bg-pearl flex items-center justify-center">
                  <span className="text-graphite/40 text-sm tracking-widest uppercase">No Image</span>
                </div>
              )}
              <div className="p-5 md:p-10 flex flex-col flex-1 relative z-10">
                {/* Subtle background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="relative z-10 mt-auto">
                  <div className="flex justify-between items-start mb-3 md:mb-4 gap-3">
                    <h4 className="font-display text-xl md:text-3xl text-graphite group-hover:text-gold transition-colors duration-300 line-clamp-2">
                      {service.title}
                    </h4>
                    {service.price && (
                      <span className="text-gold font-medium text-base md:text-xl shrink-0 ml-2 md:ml-4 whitespace-nowrap">{service.price}</span>
                    )}
                  </div>
                  <p className="text-graphite/60 font-light leading-relaxed text-sm md:text-base line-clamp-3 md:line-clamp-none">
                    {service.description}
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
