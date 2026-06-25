import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useContentStore } from "../store/contentStore";

export function TrustSection() {
  const { t } = useTranslation();
  const { lang = 'hy' } = useParams();
  const { content } = useContentStore();

  const trustContent = content[lang as 'hy' | 'ru' | 'en']?.trust || content['hy'].trust;

  return (
    <section
      id="trust"
      className="py-32 bg-ivory relative z-10 border-t border-graphite/5"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 text-center">
        <div className="mt-12 p-12 md:p-24 bg-white border border-graphite/5 rounded-[3rem] text-left relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-graphite mb-6 whitespace-pre-line">
                {trustContent?.title || t("trust.title")}
              </h3>
              <p className="text-graphite/60 text-lg font-light leading-relaxed mb-10 max-w-lg">
                {trustContent?.description || t("trust.desc")}
              </p>
              <button className="px-8 py-4 border border-graphite/20 text-graphite rounded-full font-medium hover:bg-graphite hover:text-white transition-all duration-500">
                {t("trust.btn")}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[3/4] bg-graphite/5 rounded-2xl overflow-hidden mt-8 border border-graphite/5" />
              <div className="aspect-[3/4] bg-graphite/10 rounded-2xl overflow-hidden border border-graphite/5" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
