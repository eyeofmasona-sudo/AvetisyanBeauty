import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID as string | undefined;

const devLog = (...args: any[]) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

interface AnalyticsContextType {
  trackBookingInitiation: (serviceCategory?: string) => void;
  trackEvent: (eventName: string, params?: Record<string, any>) => void;
  acceptConsent: () => void;
  declineConsent: () => void;
  consentGiven: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

function loadGoogleAnalytics(measurementId: string) {
  if (window.gtag) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: any[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId);
}

function loadMetaPixel(pixelId: string) {
  if (window.fbq) return;
  const fbq: any = function (...args: any[]) {
    (fbq.callMethod ? fbq.callMethod : fbq.queue.push).apply(fbq, args as any);
  };
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = '2.0';
  window.fbq = fbq;

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  document.head.appendChild(script);

  window.fbq('init', pixelId);
  window.fbq('track', 'PageView');
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [consentGiven, setConsentGiven] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (consent === 'true') {
      setConsentGiven(true);
    }
  }, []);

  const acceptConsent = () => {
    localStorage.setItem('cookie-consent', 'true');
    setConsentGiven(true);
  };

  const declineConsent = () => {
    localStorage.setItem('cookie-consent', 'false');
    setConsentGiven(false);
  };

  // Load tracking scripts once consent is given, and only if an ID is configured.
  useEffect(() => {
    if (!consentGiven) return;
    if (GA_MEASUREMENT_ID) loadGoogleAnalytics(GA_MEASUREMENT_ID);
    if (META_PIXEL_ID) loadMetaPixel(META_PIXEL_ID);
  }, [consentGiven]);

  // Track Page Views
  useEffect(() => {
    if (!consentGiven) return;

    if (GA_MEASUREMENT_ID && typeof window.gtag === 'function') {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }

    if (META_PIXEL_ID && typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }

    devLog(`[Analytics] PageView tracked: ${location.pathname}${location.search}`);
  }, [location, consentGiven]);

  // Generic Event Tracker
  const trackEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    if (!consentGiven) return;

    if (GA_MEASUREMENT_ID && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }

    if (META_PIXEL_ID && typeof window.fbq === 'function') {
      window.fbq('trackCustom', eventName, params);
    }

    devLog(`[Analytics] Event tracked: ${eventName}`, params);
  }, [consentGiven]);

  // Track Booking Initiation
  const trackBookingInitiation = useCallback((serviceCategory?: string) => {
    if (!consentGiven) return;

    if (GA_MEASUREMENT_ID && typeof window.gtag === 'function') {
      window.gtag('event', 'begin_checkout', {
        event_category: 'booking',
        event_label: serviceCategory || 'general',
      });
    }

    if (META_PIXEL_ID && typeof window.fbq === 'function') {
      window.fbq('track', 'InitiateCheckout', {
        content_category: serviceCategory || 'general',
      });
    }

    devLog(`[Analytics] Booking Initiation tracked: ${serviceCategory || 'general'}`);
  }, [consentGiven]);

  return (
    <AnalyticsContext.Provider value={{ trackBookingInitiation, trackEvent, acceptConsent, declineConsent, consentGiven }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

// Minimalist Cookie Banner matching the site's aesthetic
export function CookieBanner() {
  const { consentGiven, acceptConsent, declineConsent } = useAnalytics();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Add a slight delay before showing the banner to ensure it doesn't interrupt initial animations
    const timer = setTimeout(() => {
      const decided = localStorage.getItem('cookie-consent') !== null;
      if (!consentGiven && !decided) {
        setIsVisible(true);
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [consentGiven]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-graphite/5 p-4 md:p-6 z-[100] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] animate-in slide-in-from-bottom duration-700">
      <div className="max-w-4xl">
        <h4 className="text-graphite font-medium mb-1">Privacy & Analytics</h4>
        <p className="text-graphite/60 text-sm font-light leading-relaxed">
          We use cookies and analytics tools (like Google Analytics and Meta Pixel) to improve your experience and understand site traffic. By clicking "Accept", you agree to our privacy policy and the use of cookies.
        </p>
      </div>
      <div className="flex gap-3 w-full md:w-auto flex-shrink-0">
        <button
          onClick={() => {
            declineConsent();
            setIsVisible(false);
          }}
          className="flex-1 md:flex-none px-6 py-2.5 border border-graphite/10 text-graphite rounded-full text-sm font-medium hover:bg-pearl transition-colors whitespace-nowrap"
        >
          Decline
        </button>
        <button
          onClick={() => {
            acceptConsent();
            setIsVisible(false);
          }}
          className="flex-1 md:flex-none px-6 py-2.5 bg-graphite text-white rounded-full text-sm font-medium hover:bg-gold transition-colors whitespace-nowrap shadow-sm"
        >
          Accept Analytics
        </button>
      </div>
    </div>
  );
}
