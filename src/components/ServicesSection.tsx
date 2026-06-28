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
  const imagePositionById: Record<string, string> = {
    ultraformer: "object-center",
    goldensun: "object-center",
    smas: "object-center",
    "body-contouring": "object-center",
    "skin-rejuvenation": "object-center",
  };

  return (
    <section
      id="services"
      className="py-24 md:py-32 bg-ivory relative z-10 border-t border-graphite/5"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16 gap-8">
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

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-5">
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
              role={service.href ? "button" : undefined}
              tabIndex={service.href ? 0 : undefined}
              onKeyDown={(event) => {
                if (service.href && (event.key === "Enter" || event.key === " ")) {
                  event.preventDefault();
                  navigate(service.href);
                }
              }}
              className={`group relative flex flex-col overflow-hidden rounded-[1.25rem] bg-graphite shadow-sm ring-1 ring-graphite/10 transition-all duration-500 md:min-h-[460px] md:rounded-[1.5rem] md:hover:-translate-y-1 md:hover:shadow-2xl md:hover:shadow-graphite/15 ${
                index < 2 ? "md:col-span-3" : "md:col-span-2"
              } ${service.href ? "cursor-pointer" : ""}`}
            >
              {service.image_url ? (
                <div className="relative aspect-[4/3] w-full overflow-hidden md:absolute md:inset-0 md:aspect-auto">
                  <img 
                    src={service.image_url || undefined} 
                    alt={service.title} 
                    className={`w-full h-full object-cover ${imagePositionById[service.id] || "object-center"} transition-transform duration-700 md:group-hover:scale-105`}
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                </div>
              ) : (
                <div className="relative aspect-[4/3] w-full bg-graphite flex items-center justify-center md:absolute md:inset-0 md:aspect-auto">
                  <span className="text-white/40 text-sm tracking-widest uppercase">No Image</span>
                </div>
              )}
              <div className="hidden md:block absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/5" />
              <div className="hidden md:block absolute inset-0 bg-gold/0 transition-colors duration-500 md:group-hover:bg-gold/10" />

              <div className="relative z-10 flex flex-1 flex-col justify-between gap-5 bg-gradient-to-b from-graphite to-black p-4 text-white md:h-full md:bg-transparent md:p-7">
                <div className="flex items-start justify-between gap-3">
                  <span className="max-w-[calc(100%-3rem)] rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-gold backdrop-blur md:max-w-[70%] md:px-4 md:py-2 md:text-[11px] md:tracking-[0.18em]">
                    {service.tag}
                  </span>
                  {service.href && (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white backdrop-blur transition-all duration-300 md:h-10 md:w-10 md:group-hover:border-gold md:group-hover:bg-gold md:group-hover:text-graphite">
                      <ArrowUpRight size={17} />
                    </span>
                  )}
                </div>

                <div>
                  <div className="mb-2 flex items-end justify-between gap-3 md:mb-3 md:gap-4">
                    <h4 className="font-display max-w-full break-words text-2xl leading-tight text-white md:text-4xl md:leading-none">
                      {service.title}
                    </h4>
                    {service.price && <span className="shrink-0 text-sm font-medium text-gold">{service.price}</span>}
                  </div>
                  <p className="max-w-full break-words text-[13px] font-light leading-relaxed text-white/78 md:max-w-xl md:text-base">
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
