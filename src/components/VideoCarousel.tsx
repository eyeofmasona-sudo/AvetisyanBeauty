import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

export function VideoCarousel() {
  const { settings } = useSettingsStore();
  const videos = settings?.videos?.filter(v => v.isActive).sort((a, b) => a.order - b.order) || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!videos || videos.length === 0) return null;

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  };

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  };

  const currentVideo = videos[currentIndex];

  return (
    <section className="py-20 bg-pearl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display text-graphite mb-4">
            Video Gallery
          </h2>
          <div className="w-24 h-1 bg-gold mx-auto"></div>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full relative"
              >
                <video
                  src={currentVideo.videoUrl}
                  poster={currentVideo.posterUrl}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                  preload="metadata"
                />
                {(currentVideo.title || currentVideo.description) && (
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white pointer-events-none">
                    {currentVideo.title && <h3 className="text-xl font-bold mb-2">{currentVideo.title}</h3>}
                    {currentVideo.description && <p className="text-white/80 text-sm">{currentVideo.description}</p>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {videos.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors z-10"
                aria-label="Previous video"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={next}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors z-10"
                aria-label="Next video"
              >
                <ChevronRight size={24} />
              </button>

              <div className="flex justify-center gap-2 mt-6">
                {videos.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      idx === currentIndex ? 'bg-gold w-8' : 'bg-graphite/20 hover:bg-gold/50'
                    }`}
                    aria-label={`Go to video ${idx + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
