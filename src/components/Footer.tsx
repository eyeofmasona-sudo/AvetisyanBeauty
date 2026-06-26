import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";

export function Footer() {
  const { t } = useTranslation();
  const { lang } = useParams();

  return (
    <footer className="bg-white pt-24 pb-12 border-t border-graphite/10 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex flex-col mb-8">
              <img src="/logo.png" alt="Avetisyan Beauty Clinic" className="h-16 w-auto object-contain object-left" onError={(e) => {
                // Fallback if image not uploaded yet
                e.currentTarget.style.display = 'none';
                e.currentTarget.nextElementSibling!.classList.remove('hidden');
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
            <div className="flex gap-4">
              <span className="w-10 h-10 rounded-full border border-graphite/20 flex items-center justify-center text-graphite/60 hover:text-gold hover:border-gold cursor-pointer transition-colors">
                In
              </span>
              <span className="w-10 h-10 rounded-full border border-graphite/20 flex items-center justify-center text-graphite/60 hover:text-gold hover:border-gold cursor-pointer transition-colors">
                Fb
              </span>
              <span className="w-10 h-10 rounded-full border border-graphite/20 flex items-center justify-center text-graphite/60 hover:text-gold hover:border-gold cursor-pointer transition-colors">
                Yt
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-graphite font-medium mb-6 uppercase tracking-wider text-sm">
              {t("footer.treatments")}
            </h4>
            <ul className="flex flex-col gap-4 text-graphite/60 font-light">
              <li>
                <Link to={`/${lang}/ultraformer`} className="hover:text-gold transition-colors">
                  Ultraformer III
                </Link>
              </li>
              <li>
                <Link to={`/${lang}/gallery`} className="hover:text-gold transition-colors">
                  Before & After
                </Link>
              </li>
              <li>
                <Link to={`/${lang}/admin`} className="hover:text-gold transition-colors">
                  Admin Panel
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-gold transition-colors">
                  SMAS Lifting
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold transition-colors">
                  Body Contouring
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gold transition-colors">
                  Skin Rejuvenation
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-graphite font-medium mb-6 uppercase tracking-wider text-sm">
              {t("footer.contact")}
            </h4>
            <ul className="flex flex-col gap-4 text-graphite/60 font-light">
              <li>+374 10 123 456</li>
              <li>WhatsApp: +374 33 10 10 77</li>
              <li className="mt-4 whitespace-pre-line">
                {t("footer.address")}
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-graphite/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-light text-graphite/40 tracking-wider">
          <p>{t("footer.rights")}</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-gold transition-colors">
              {t("footer.privacy")}
            </a>
            <a href="#" className="hover:text-gold transition-colors">
              {t("footer.terms")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
