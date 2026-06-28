import React from 'react';
import { defaultGalleryVideos, useSettingsStore } from '../store/settingsStore';

export function VideoCarousel() {
  const { settings } = useSettingsStore();
  const activeVideos = settings?.videos
    ?.filter(v => v.isActive && v.id !== 'clinic-video-2' && Boolean(v.videoUrl?.trim()))
    .sort((a, b) => a.order - b.order) || [];
  const activeVideoIds = new Set(activeVideos.map(video => video.id));
  const fallbackVideos = defaultGalleryVideos.filter(video => video.id !== 'clinic-video-2' && video.videoUrl && !activeVideoIds.has(video.id));
  const videos = [...activeVideos, ...fallbackVideos].sort((a, b) => a.order - b.order);

  if (!videos || videos.length === 0) return null;

  return (
    <section className="py-20 bg-pearl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display text-graphite mb-4">
            Video Gallery
          </h2>
          <div className="w-24 h-1 bg-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {videos.map((video, idx) => (
            <div key={idx} className="aspect-[9/16] bg-black rounded-2xl overflow-hidden relative shadow-2xl">
              {video.videoUrl ? (
                <video
                  src={video.videoUrl}
                  poster={video.posterUrl || undefined}
                  className="w-full h-full object-contain"
                  controls
                  playsInline
                  preload="metadata"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/50 text-sm">No video source</div>
              )}
              {(video.title || video.description) && (
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent text-white pointer-events-none">
                  {video.title && <h3 className="text-xl font-bold mb-2">{video.title}</h3>}
                  {video.description && <p className="text-white/80 text-sm">{video.description}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
