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
}

export function SEO({ 
  titleKey, 
  descriptionKey, 
  type = 'website', 
  image = 'https://avetisyanclinic.com/og-image.jpg', 
  schema 
}: SEOProps) {
  const { t } = useTranslation();
  const { lang } = useParams();
  const location = useLocation();
  
  const currentLang = lang || 'hy';
  const siteUrl = 'https://avetisyanclinic.com'; // Adjust to actual domain
  const currentUrl = `${siteUrl}${location.pathname}`;

  const title = t(titleKey);
  const description = t(descriptionKey);

  // Default MedicalBusiness Schema
  const defaultSchema = {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Avetisyan Beauty Clinic",
    "image": image,
    "@id": siteUrl,
    "url": siteUrl,
    "telephone": "+374 00 000 000",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Premium Medical District",
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

  return (
    <Helmet>
      <html lang={currentLang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* OpenGraph */}
      <meta property="og:url" content={currentUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta property="twitter:domain" content="avetisyanclinic.com" />
      <meta property="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* hreflang tags */}
      <link rel="alternate" hrefLang="hy" href={`${siteUrl}/hy${pathWithoutLang}`} />
      <link rel="alternate" hrefLang="ru" href={`${siteUrl}/ru${pathWithoutLang}`} />
      <link rel="alternate" hrefLang="en" href={`${siteUrl}/en${pathWithoutLang}`} />
      <link rel="alternate" hrefLang="x-default" href={`${siteUrl}/hy${pathWithoutLang}`} />

      {/* Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify(finalSchema)}
      </script>
    </Helmet>
  );
}
