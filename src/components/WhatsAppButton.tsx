import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSettingsStore } from '../store/settingsStore';

export function WhatsAppButton() {
  const { settings } = useSettingsStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cleanNumber = settings?.whatsappNumber?.replace(/[^\d+]/g, '') || '+37433101077';
  const finalNumber = cleanNumber.startsWith('+') ? cleanNumber.substring(1) : cleanNumber;
  const waUrl = `https://wa.me/${finalNumber || '37433101077'}`;

  if (!mounted) return null;

  return (
    <motion.a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-[0_4px_20px_rgba(200,155,78,0.3)] hover:shadow-[0_8px_30px_rgba(200,155,78,0.5)] transition-shadow duration-300 btn-primary"
      aria-label="Contact on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#111111"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7"
      >
        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" />
      </svg>
    </motion.a>
  );
}
