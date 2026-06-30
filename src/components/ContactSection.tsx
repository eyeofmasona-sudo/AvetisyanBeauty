import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, MessageCircle, ExternalLink, Navigation } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";

/**
 * Free embedded map section.
 *
 * Uses Google Maps' no-API-key iframe embed (`?q=...&output=embed`)
 * which is free, has no quota, and requires no billing setup.
 *
 * Adds "Open in Yandex Maps" / "Open in Google Maps" deep links so
 * users in Armenia/CIS can jump to their preferred native app.
 */

// Salon address — keep in sync with i18n `footer.address` and contentStore.
const ADDRESS_QUERY = "Yerevan, Amiryan 18";
const ADDRESS_QUERY_RU = "Ереван, ул. Амиряна 18";
const ADDRESS_QUERY_HY = "Երևան, Ամիրյան 18";

// Approximate coordinates of Amiryan 18, Yerevan (used for Yandex deep link).
const LAT = 40.179187;
const LNG = 44.515104;

const WHATSAPP_NUMBER = "37433101077";

export function ContactSection() {
  const { t } = useTranslation();
  const { lang = "hy" } = useParams();

  // Pick the most appropriate address query string for the active language.
  const addressQuery = useMemo(() => {
    if (lang === "ru") return ADDRESS_QUERY_RU;
    if (lang === "hy") return ADDRESS_QUERY_HY;
    return ADDRESS_QUERY;
  }, [lang]);

  // Free Google Maps embed (no API key, no billing).
  const googleEmbedSrc = `https://maps.google.com/maps?q=${encodeURIComponent(
    addressQuery
  )}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // Deep links — open the native app / web with the salon pinned.
  const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    addressQuery
  )}`;

  // Yandex Maps accepts a free-text `text` parameter; falls back to
  // coordinates if the address can't be resolved.
  const yandexMapsLink = `https://yandex.ru/maps/?text=${encodeURIComponent(
    addressQuery
  )}&ll=${LNG},${LAT}&z=17`;

  // Universal geo: deep link — works on most mobile devices and opens
  // whichever maps app the user has installed.
  const geoLink = `geo:${LAT},${LNG}?q=${LAT},${LNG}(${encodeURIComponent(
    "Avetisyan Beauty Clinic"
  )})`;

  return (
    <section
      id="contact"
      className="py-32 bg-pearl relative z-10 border-t border-graphite/5"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <h2 className="text-sm font-medium tracking-[0.2em] text-gold uppercase mb-4">
              {t("contact.badge")}
            </h2>
            <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-graphite whitespace-pre-line">
              {t("contact.title")}
            </h3>
          </div>
          <p className="text-graphite/60 font-light max-w-md text-sm md:text-base leading-relaxed">
            {t("contact.subtitle")}
          </p>
        </div>

        {/* Map + Info Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-stretch">
          {/* Map iframe — takes 3/5 of width on desktop, full on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 relative rounded-2xl overflow-hidden border border-graphite/10 bg-ivory min-h-[400px] lg:min-h-[520px]"
          >
            <iframe
              title={t("contact.mapTitle")}
              src={googleEmbedSrc}
              className="w-full h-full absolute inset-0"
              style={{ border: 0, minHeight: 400 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            {/* Subtle gradient overlay to blend with dark theme —
                non-interactive, pointer-events-none so it doesn't block map controls */}
            <div
              className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/10 rounded-2xl"
              aria-hidden="true"
            />
          </motion.div>

          {/* Info panel — takes 2/5 of width on desktop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            {/* Address card */}
            <div className="bg-ivory border border-graphite/10 rounded-2xl p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="text-graphite font-medium mb-2 uppercase tracking-wider text-xs">
                    {t("contact.addressLabel")}
                  </h4>
                  <p className="text-graphite font-light leading-relaxed">
                    {t("footer.address")}
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp card */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-ivory border border-graphite/10 rounded-2xl p-8 hover:border-gold/40 transition-colors group block"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors">
                  <MessageCircle className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h4 className="text-graphite font-medium mb-2 uppercase tracking-wider text-xs">
                    {t("contact.whatsappLabel")}
                  </h4>
                  <p className="text-graphite font-light leading-relaxed">
                    +374 33 10 10 77
                  </p>
                </div>
              </div>
            </a>

            {/* Buttons — open in native maps apps */}
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gold text-pearl rounded-xl font-medium tracking-wider text-sm uppercase hover:bg-champagne-gold transition-colors"
              >
                <Navigation className="w-4 h-4" />
                {t("contact.openInGoogle")}
              </a>
              <a
                href={yandexMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-transparent text-graphite border border-graphite/20 rounded-xl font-medium tracking-wider text-sm uppercase hover:border-gold hover:text-gold transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                {t("contact.openInYandex")}
              </a>
            </div>

            {/* Mobile-only native maps button (geo: deep link) */}
            <a
              href={geoLink}
              className="lg:hidden text-center text-xs text-graphite/40 hover:text-gold transition-colors tracking-wider uppercase pt-2"
            >
              {t("contact.openNative")}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
