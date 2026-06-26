import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useContentStore } from '../store/contentStore';

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
      className="py-32 bg-ivory relative z-10 border-t border-graphite/5"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <h2 className="text-sm font-medium tracking-[0.2em] text-gold uppercase mb-4">
              {t("services.badge")}
            </h2>
            <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-graphite whitespace-pre-line">
              {servicesContent.title}
            </h3>
          </div>
          <p className="text-graphite/60 max-w-md font-light text-lg">
            {servicesContent.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              onClick={() => {
                if (service.href) {
                  navigate(service.href);
                }
              }}
              className="group relative bg-white border border-graphite/5 rounded-3xl overflow-hidden hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col h-full"
            >
              {service.image_url ? (
                <div className="relative h-56 w-full overflow-hidden">
                  <img 
                    src={service.image_url} 
                    alt={service.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
              ) : (
                <div className="relative h-56 w-full overflow-hidden bg-pearl flex items-center justify-center">
                  <span className="text-graphite/40 text-sm tracking-widest uppercase">No Image</span>
                </div>
              )}
              <div className="p-10 flex flex-col flex-1 relative z-10">
                {/* Subtle background glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="flex justify-end items-start mb-12 relative z-10">
                  <div className="w-12 h-12 rounded-full border border-graphite/10 flex items-center justify-center group-hover:bg-gold group-hover:text-white group-hover:border-gold transition-all duration-300 shrink-0 ml-4">
                    <ArrowUpRight
                      size={20}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>

                <div className="relative z-10 mt-auto">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-display text-3xl text-graphite group-hover:text-gold transition-colors duration-300">
                      {service.title}
                    </h4>
                    {service.price && (
                      <span className="text-gold font-medium text-xl shrink-0 ml-4">{service.price}</span>
                    )}
                  </div>
                  <p className="text-graphite/60 font-light leading-relaxed max-w-md">
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
