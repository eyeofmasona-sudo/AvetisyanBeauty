import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Instagram, ChevronLeft, ChevronRight } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useContentStore } from '../store/contentStore';

export function InstagramCarousel() {
  const { t } = useTranslation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { lang = 'hy' } = useParams();
  const { content, instagramPosts } = useContentStore();

  const instaContent = content[lang as 'hy' | 'ru' | 'en']?.insta || content['hy'].insta;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { clientWidth, scrollLeft } = scrollRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth : clientWidth;
      scrollRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-16 md:py-24 bg-pearl relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-6 md:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Instagram className="text-gold" size={24} />
              <h2 className="text-sm font-medium tracking-[0.2em] text-gold uppercase">
                {t('insta.follow_us', 'Follow Us')}
              </h2>
            </div>
            <h3 className="font-display text-3xl md:text-4xl lg:text-5xl text-graphite mb-4 md:mb-6 whitespace-pre-line">
              {instaContent?.title || 'Instagram'}
            </h3>
            <p className="text-graphite/70 max-w-xl text-sm md:text-base">
              {instaContent?.description || t('insta.desc', 'Stay updated with our latest treatments, offers and beauty tips on Instagram.')}
            </p>
          </div>
          <div className="flex gap-3 md:gap-4 self-end md:self-auto">
            <button
              onClick={() => scroll('left')}
              aria-label={t('insta.scroll_left', 'Scroll left')}
              className="w-11 h-11 md:w-12 md:h-12 min-w-[44px] min-h-[44px] rounded-full border border-graphite/10 flex items-center justify-center text-graphite hover:bg-gold hover:text-white hover:border-gold transition-colors shrink-0"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              aria-label={t('insta.scroll_right', 'Scroll right')}
              className="w-11 h-11 md:w-12 md:h-12 min-w-[44px] min-h-[44px] rounded-full border border-graphite/10 flex items-center justify-center text-graphite hover:bg-gold hover:text-white hover:border-gold transition-colors shrink-0"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="relative -mx-4 md:mx-0 px-4 md:px-0">
          <div
            ref={scrollRef}
            className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-6 md:pb-8 pt-4 instagram-scrollbar"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {instagramPosts.map((post) => (
              <a
                key={post.id}
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative w-[78vw] sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)] flex-shrink-0 aspect-[4/5] overflow-hidden rounded-2xl bg-graphite/5 snap-center sm:snap-start"
              >
                <img
                  src={post.image || undefined}
                  alt={post.caption || 'Instagram post'}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center text-white gap-4 p-4">
                  <Instagram size={28} />
                  <div className="flex gap-4 md:gap-6 font-medium text-sm md:text-base">
                    <span className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-2">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/></svg>
                      {post.comments}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
