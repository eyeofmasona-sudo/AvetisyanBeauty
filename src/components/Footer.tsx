import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { Lock } from "lucide-react";
import { useContentStore } from "../store/contentStore";

export function Footer() {
  const { t } = useTranslation();
  const { lang = "hy" } = useParams();
  const { content } = useContentStore();

  const services =
    content[lang as "hy" | "ru" | "en"]?.services?.items ||
    content["hy"].services.items;

  return (
    <footer className="bg-white pt-24 pb-12 border-t border-graphite/10 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex flex-col mb-8">
              <img src="/logo.png" alt="Avetisyan Beauty Clinic" className="h-16 w-auto object-contain object-left" onError={(e) => {
                // Fallback if image not uploaded yet
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling?.classList.remove('hidden');
              }} />
              <div className="hidden flex-col">
                <span className="font-display font-bold text-2xl tracking-widest text-graphite uppercase">
                  Avetisyan
                </span>
                <span className="text-xs tracking-[0.3em] text-gold uppercase mt-1">
                  Beauty Clinic
                </span>
              </div>
            </Link>
            <p className="text-graphite/60 font-light max-w-sm mb-8">
              {t("footer.desc")}
            </p>
            {/* BLOCKER: no confirmed social media URLs exist yet for this
                clinic; social icons are intentionally omitted rather than
                linking to placeholder/fake profiles. Add them back once
                real Instagram/Facebook/YouTube URLs are provided. */}
          </div>

          <div>
            <h4 className="text-graphite font-medium mb-6 uppercase tracking-wider text-sm">
              {t("footer.treatments")}
            </h4>
            <ul className="flex flex-col gap-4 text-graphite/60 font-light">
              {services.map((service) =>
                service.href ? (
                  <li key={service.id}>
                    <Link to={service.href} className="hover:text-gold transition-colors">
                      {service.title}
                    </Link>
                  </li>
                ) : (
                  <li key={service.id}>
                    <Link to={`/${lang}#services`} className="hover:text-gold transition-colors">
                      {service.title}
                    </Link>
                  </li>
                )
              )}
              <li>
                <Link to={`/${lang}/gallery`} className="hover:text-gold transition-colors">
                  {t("results.after")} / {t("results.before")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-graphite font-medium mb-6 uppercase tracking-wider text-sm">
              {t("footer.contact")}
            </h4>
            <ul className="flex flex-col gap-4 text-graphite/60 font-light">
              <li>
                <a 
                  href="https://wa.me/37433101077" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  WhatsApp: +374 33 10 10 77
                </a>
              </li>
              <li className="mt-4 whitespace-pre-line">
                {t("footer.address")}
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-graphite/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-graphite/40 tracking-wider">
          <p>{t("footer.rights")}</p>
          {/* BLOCKER: no Privacy Policy / Terms of Service pages exist yet;
              links removed rather than pointing to "#" placeholders. */}
          <Link
            to={`/${lang}/admin`}
            aria-label={t("admin.signIn", "Admin")}
            className="flex items-center gap-1.5 text-graphite/40 hover:text-gold transition-colors"
          >
            <Lock size={12} />
            <span>{t("admin.signIn", "Admin")}</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
