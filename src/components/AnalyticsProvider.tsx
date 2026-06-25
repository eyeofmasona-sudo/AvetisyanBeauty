import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

interface AnalyticsContextType {
  trackBookingInitiation: (serviceCategory?: string) => void;
  trackEvent: (eventName: string, params?: Record<string, any>) => void;
  acceptConsent: () => void;
  consentGiven: boolean;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

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

  // Track Page Views
  useEffect(() => {
    if (!consentGiven) return;

    // Google Analytics Page View
    if (typeof window.gtag === 'function') {
      window.gtag('config', 'G-XXXXXXXXXX', {
        page_path: location.pathname + location.search,
      });
    }

    // Meta Pixel Page View
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'PageView');
    }
    
    // For development/debugging purposes
    console.log(`[Analytics] PageView tracked: ${location.pathname}${location.search}`);
  }, [location, consentGiven]);

  // Generic Event Tracker
  const trackEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    if (!consentGiven) return;

    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    }

    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', eventName, params);
    }
    
    console.log(`[Analytics] Event tracked: ${eventName}`, params);
  }, [consentGiven]);

  // Track Booking Initiation
  const trackBookingInitiation = useCallback((serviceCategory?: string) => {
    if (!consentGiven) return;

    if (typeof window.gtag === 'function') {
      window.gtag('event', 'begin_checkout', {
        event_category: 'booking',
        event_label: serviceCategory || 'general',
      });
    }

    if (typeof window.fbq === 'function') {
      window.fbq('track', 'InitiateCheckout', {
        content_category: serviceCategory || 'general',
      });
    }
    
    console.log(`[Analytics] Booking Initiation tracked: ${serviceCategory || 'general'}`);
  }, [consentGiven]);

  return (
    <AnalyticsContext.Provider value={{ trackBookingInitiation, trackEvent, acceptConsent, consentGiven }}>
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
  const { consentGiven, acceptConsent } = useAnalytics();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Add a slight delay before showing the banner to ensure it doesn't interrupt initial animations
    const timer = setTimeout(() => {
      if (!consentGiven) {
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
          onClick={() => setIsVisible(false)}
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
