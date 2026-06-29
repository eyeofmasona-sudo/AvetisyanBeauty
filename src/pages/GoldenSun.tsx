import React, { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { BookingModal } from "../components/BookingModal";
import { SEO } from "../components/SEO";

export function GoldenSun() {
  const { t } = useTranslation();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Custom Schema for Golden Sun Service
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Golden Sun",
    "provider": {
      "@type": "MedicalBusiness",
      "name": "Avetisyan Beauty Clinic"
    },
    "description": "Exclusive Golden Sun aesthetic treatment at Avetisyan Beauty Clinic.",
    "category": "Aesthetic Procedure"
  };

  return (
    <div className="bg-pearl min-h-screen text-graphite selection:bg-gold/30 selection:text-graphite">
      <SEO titleKey="seo.goldensun.title" descriptionKey="seo.goldensun.description" schema={serviceSchema} />
      <Navbar onBookClick={() => setIsBookingOpen(true)} />

      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-white">
          <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gold/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-pearl rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4" />
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 lg:grid-cols-2 rounded-[2.5rem] border border-graphite/5 overflow-hidden bg-white shadow-sm"
            >
              <div className="relative h-[300px] md:h-[380px] lg:h-auto w-full">
                <img
                  src="/images/services/golden-sun-hero.png"
                  alt={t("goldensun.title", "Golden Sun")}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
                <span className="self-start py-1.5 px-4 rounded-full border border-graphite/10 text-xs tracking-widest text-gold uppercase bg-pearl">
                  {t("goldensun.badge", "Featured")}
                </span>

                <h1 className="mt-8 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display text-graphite break-words">
                  {t("goldensun.title", "Golden Sun")}
                </h1>

                <p className="mt-6 text-lg font-light text-graphite/70 leading-relaxed">
                  {t("goldensun.desc", "Discover the radiant benefits of Golden Sun.")}
                </p>

                <div className="mt-10 flex gap-4">
                  <button
                    onClick={() => setIsBookingOpen(true)}
                    className="px-8 py-4 bg-graphite text-white rounded-full font-medium hover:bg-gold transition-colors duration-300 shadow-xl shadow-graphite/10"
                  >
                    {t("goldensun.bookBtn", "Book Golden Sun")}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Details Section */}
        <section className="py-24 bg-pearl border-t border-graphite/5">
          <div className="max-w-7xl mx-auto px-6 md:px-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="bg-white p-12 rounded-[2.5rem] border border-graphite/5 shadow-sm"
              >
                <h3 className="font-display text-3xl text-graphite mb-6">
                  {t("goldensun.howItWorks", "About the Treatment")}
                </h3>
                <p className="text-graphite/70 font-light leading-relaxed mb-8">
                  {t("goldensun.howDesc", "The exclusive Golden Sun treatment provides a luxurious and radiant finish...")}
                </p>
                <div className="aspect-video bg-graphite/5 rounded-2xl border border-graphite/5 overflow-hidden flex items-center justify-center">
                  <p className="text-graphite/40 tracking-widest uppercase text-sm">
                    {t("ultraformer.videoPlaceholder", "Video (coming soon)")}
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="bg-ivory p-12 rounded-[2.5rem] border border-graphite/5 shadow-sm"
              >
                <h3 className="font-display text-3xl text-graphite mb-8">
                  {t("goldensun.benefits", "Benefits")}
                </h3>
                <ul className="space-y-6">
                  {((t("goldensun.benefitsList", { returnObjects: true })) as string[]).map((benefit, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="mt-1 w-6 h-6 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={14} className="text-gold" />
                      </div>
                      <span className="text-graphite font-medium text-lg">
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
}
