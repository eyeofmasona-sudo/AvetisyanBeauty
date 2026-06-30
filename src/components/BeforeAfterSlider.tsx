import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";

interface BeforeAfterSliderProps {
  beforeLabel?: string;
  afterLabel?: string;
  aspectRatio?: string;
  beforeImage?: string;
  afterImage?: string;
}

export function BeforeAfterSlider({ 
  beforeLabel, 
  afterLabel,
  aspectRatio = "aspect-[4/3] md:aspect-[21/9]",
  beforeImage = "https://www.transparenttextures.com/patterns/stardust.png",
  afterImage = "https://www.transparenttextures.com/patterns/cream-paper.png"
}: BeforeAfterSliderProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const newPosition = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, newPosition)));
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Update transform origin for zoom effect
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    if (afterImageRef.current && beforeImageRef.current) {
      afterImageRef.current.style.transformOrigin = `${xPercent}% ${yPercent}%`;
      beforeImageRef.current.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    }

    if (!isDragging) return;
    const newPosition = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, newPosition)));
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const afterImageRef = useRef<HTMLDivElement>(null);
  const beforeImageRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`relative w-full ${aspectRatio} rounded-3xl overflow-hidden bg-pearl border border-graphite/5 group cursor-ew-resize select-none touch-none shadow-xl`}
    >
      {/* After Image (Background) */}
      <div className="absolute inset-0 bg-[#111111] flex items-center justify-center overflow-hidden">
        <div 
          ref={afterImageRef}
          className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-150"
        >
          <div className="absolute inset-0 opacity-40 mix-blend-multiply bg-gradient-to-tr from-gold/10 to-transparent"></div>
          {/* We add a texture to simulate skin details so zoom has an effect */}
          <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${afterImage})` }}></div>
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-overlay"></div>
          <div className="flex items-center justify-center w-full h-full">
            <p className="text-graphite/40 tracking-widest uppercase text-xl font-display">
              {afterLabel || t("results.after")}
            </p>
          </div>
        </div>
      </div>

      {/* Before Image (Clipped) */}
      <div
        className="absolute inset-0 flex items-center justify-center overflow-hidden border-r border-gold shadow-[2px_0_15px_rgba(201,162,39,0.2)]"
        style={{ width: `${sliderPosition}%` }}
      >
        <div className="absolute inset-0 w-full h-full">
          <div 
            ref={beforeImageRef}
            className="absolute inset-0 bg-[#080808] transition-transform duration-500 ease-out group-hover:scale-150"
            style={{ width: containerRef.current ? containerRef.current.offsetWidth : '100vw' }}
          >
            <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${beforeImage})` }}></div>
            {/* Added texture to simulate skin imperfections for before image */}
            <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] mix-blend-overlay"></div>
            <div className="flex items-center justify-center w-full h-full">
              <p className="text-graphite/40 tracking-widest uppercase text-xl font-display min-w-[200px] text-center absolute left-1/2 -translate-x-1/2">
                {beforeLabel || t("results.before")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Slider Handle */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-gold/50 cursor-ew-resize"
        style={{
          left: `${sliderPosition}%`,
          transform: "translateX(-50%)",
        }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white border-2 border-gold rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110">
          <div className="flex gap-1">
            <div className="w-1 h-1 bg-gold rounded-full"></div>
            <div className="w-1 h-1 bg-gold rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
