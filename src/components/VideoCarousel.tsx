import React from 'react';
import { defaultGalleryVideos, useSettingsStore } from '../store/settingsStore';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Clapperboard, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';

export function VideoCarousel() {
  const { t } = useTranslation();
  const { settings } = useSettingsStore();
  const activeVideos = settings?.videos
    ?.filter(v => v.isActive && v.id !== 'clinic-video-2' && Boolean(v.videoUrl?.trim()))
    .sort((a, b) => a.order - b.order) || [];
  const activeVideoIds = new Set(activeVideos.map(video => video.id));
  const fallbackVideos = defaultGalleryVideos.filter(video => video.id !== 'clinic-video-2' && video.videoUrl && !activeVideoIds.has(video.id));
  const videos = [...activeVideos, ...fallbackVideos].sort((a, b) => a.order - b.order);
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});
  const [mutedIdx, setMutedIdx] = useState<Record<number, boolean>>({});

  const videos = settings?.videos?.filter(v => v.isActive).sort((a, b) => a.order - b.order) || [];

  // Autoplay (muted, like Instagram Reels) only the card that's mostly in view.
  useEffect(() => {
    const container = scrollRef.current;
    if (!container || videos.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = Number((entry.target as HTMLElement).dataset.idx);
          const video = videoRefs.current[idx];
          if (!video) return;
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            video.play().catch(() => {});
          } else {
            video.pause();
          }
        });
      },
      { root: container, threshold: [0.6] }
    );

    Object.values(videoRefs.current).forEach((v) => v?.parentElement && observer.observe(v.parentElement));
    return () => observer.disconnect();
  }, [videos.length]);

  if (!videos || videos.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth, scrollLeft } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.8 : clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollLeft + scrollAmount, behavior: 'smooth' });
    }
  };

  const toggleMute = (idx: number) => {
    const video = videoRefs.current[idx];
    const nextMuted = !(mutedIdx[idx] ?? true);
    if (video) video.muted = nextMuted;
    setMutedIdx((prev) => ({ ...prev, [idx]: nextMuted }));
  };

  return (
    <section className="py-24 bg-pearl relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clapperboard className="text-gold" size={24} />
              <h2 className="text-sm font-medium tracking-[0.2em] text-gold uppercase">
                {t('video.label', 'Video Gallery')}
              </h2>
            </div>
            <h3 className="font-display text-4xl md:text-5xl text-graphite mb-6 whitespace-pre-line">
              {t('video.title', 'Watch Our Treatments')}
            </h3>
          </div>
          <div className="flex gap-4 self-end md:self-auto">
            <button
              onClick={() => scroll('left')}
              aria-label={t('insta.scroll_left', 'Scroll left')}
              className="w-12 h-12 rounded-full border border-graphite/10 flex items-center justify-center text-graphite hover:bg-gold hover:text-white hover:border-gold transition-colors shrink-0"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label={t('insta.scroll_right', 'Scroll right')}
              className="w-12 h-12 rounded-full border border-graphite/10 flex items-center justify-center text-graphite hover:bg-gold hover:text-white hover:border-gold transition-colors shrink-0"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="relative -mx-6 md:mx-0 px-6 md:px-0">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 hide-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {videos.map((video, idx) => (
              <div
                key={video.id}
                data-idx={idx}
                className="group relative w-[78vw] sm:w-[min(60vw,360px)] md:w-[320px] flex-shrink-0 aspect-[9/16] overflow-hidden rounded-2xl bg-black snap-center sm:snap-start shadow-2xl"
              >
                {video.videoUrl ? (
                  <video
                    ref={(el) => { videoRefs.current[idx] = el; }}
                    src={video.videoUrl}
                    poster={video.posterUrl || undefined}
                    className="w-full h-full object-cover"
                    muted={mutedIdx[idx] ?? true}
                    loop
                    playsInline
                    preload="metadata"
                    onClick={(e) => e.currentTarget.paused ? e.currentTarget.play().catch(() => {}) : e.currentTarget.pause()}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">No video source</div>
                )}

                {video.videoUrl && (
                  <button
                    onClick={() => toggleMute(idx)}
                    aria-label={mutedIdx[idx] ?? true ? t('video.unmute', 'Unmute') : t('video.mute', 'Mute')}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                  >
                    {(mutedIdx[idx] ?? true) ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                )}

                {(video.title || video.description) && (
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent text-white pointer-events-none">
                    {video.title && <h4 className="text-lg font-bold mb-1">{video.title}</h4>}
                    {video.description && <p className="text-white/80 text-xs line-clamp-2">{video.description}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
