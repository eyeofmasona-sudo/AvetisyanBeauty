import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';

interface SEOProps {
  titleKey: string;
  descriptionKey: string;
  type?: string;
  image?: string;
  schema?: Record<string, any>;
  noindex?: boolean;
}

// Routes that exist for every language prefix; used to generate hreflang
// alternates so we never advertise a language variant that 404s.
const LOCALIZED_ROUTES = ['', '/ultraformer', '/golden-sun', '/gallery'];

// Falls back to a relative origin (no protocol/host) when no real domain is
// configured yet, so we never emit a fabricated production URL.
const SITE_URL = (import.meta.env.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || '';

export function SEO({
  titleKey,
  descriptionKey,
  type = 'website',
  image,
  schema,
  noindex = false,
}: SEOProps) {
  const { t } = useTranslation();
  const { lang } = useParams();
  const location = useLocation();

  const currentLang = lang || 'hy';
  const siteUrl = SITE_URL;
  const currentUrl = `${siteUrl}${location.pathname}`;
  const resolvedImage = image || (siteUrl ? `${siteUrl}/og-image.png` : '/og-image.png');

  const title = t(titleKey);
  const description = t(descriptionKey);

  // Default MedicalBusiness Schema
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Avetisyan Beauty Clinic",
    "image": resolvedImage,
    "@id": siteUrl || undefined,
    "url": siteUrl || undefined,
    "telephone": "+374 33 10 10 77",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Yerevan",
      "addressCountry": "AM"
    },
    "medicalSpecialty": [
      "https://schema.org/Dermatology",
      "https://schema.org/PlasticSurgery"
    ],
    "priceRange": "$$$"
  };

  const finalSchema = schema || defaultSchema;

  // Clean path for hreflang
  const pathWithoutLang = location.pathname.replace(/^\/[a-z]{2}/, '');
  const isKnownRoute = LOCALIZED_ROUTES.includes(pathWithoutLang);

  return (
    <Helmet>
      <html lang={currentLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />
      {siteUrl && <link rel="canonical" href={currentUrl} />}

      {/* OpenGraph */}
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={resolvedImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={resolvedImage} />

      {/* hreflang tags (only for routes that exist in every language) */}
      {siteUrl && !noindex && isKnownRoute && (
        <>
          <link rel="alternate" hrefLang="hy" href={`${siteUrl}/hy${pathWithoutLang}`} />
          <link rel="alternate" hrefLang="ru" href={`${siteUrl}/ru${pathWithoutLang}`} />
          <link rel="alternate" hrefLang="en" href={`${siteUrl}/en${pathWithoutLang}`} />
          <link rel="alternate" hrefLang="x-default" href={`${siteUrl}/hy${pathWithoutLang}`} />
        </>
      )}

      {/* Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
    </Helmet>
  );
}
