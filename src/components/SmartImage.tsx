import React from "react";

/**
 * SmartImage — drop-in replacement for <img> that:
 *   - serves WebP when a `.webp` sibling exists (via <picture><source>)
 *   - falls back to the original URL for browsers/CDNs that don't support WebP
 *   - lazy-loads by default (loading="lazy" decoding="async")
 *   - prevents layout shift when `aspect` prop is provided (Tailwind class,
 *     e.g. "aspect-[4/3]")
 *   - sets explicit width/height when provided (better CLS)
 *   - supports `fit` = "cover" (default, crops to fill) or "contain" (no crop,
 *     letterboxed — better for product photos where the whole subject must be
 *     visible)
 *
 * Usage:
 *   <SmartImage src="/images/services/foo.png" alt="..." aspect="aspect-[4/3]" />
 *   <SmartImage src="..." alt="..." fit="contain" aspect="aspect-square" />
 *
 * If `src` is a remote URL (http/https or starts with /uploads/), no WebP
 * swap is attempted — we just lazy-load it.
 */

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  aspect?: string;           // e.g. "aspect-[4/3]"
  objectPosition?: string;   // e.g. "object-top", default "object-center"
  fit?: "cover" | "contain"; // default: "cover" (fills + crops). "contain" preserves whole image.
  eager?: boolean;           // set true for above-the-fold images (hero, LCP)
  width?: number;
  height?: number;
  className?: string;
  wrapperClassName?: string;
}

function isLocalAsset(src: string): boolean {
  return src.startsWith("/") && !src.startsWith("/uploads/");
}

function toWebp(src: string): string | null {
  if (!isLocalAsset(src)) return null;
  // Replace .png/.jpg/.jpeg extension with .webp
  if (/\.(png|jpe?g)$/i.test(src)) {
    return src.replace(/\.(png|jpe?g)$/i, ".webp");
  }
  return null;
}

export function SmartImage({
  src,
  alt,
  aspect,
  objectPosition = "object-center",
  fit = "cover",
  eager = false,
  width,
  height,
  className = "",
  wrapperClassName = "",
  ...rest
}: SmartImageProps) {
  const webpSrc = toWebp(src);
  const loading = eager ? "eager" : "lazy";
  const fetchPriority = eager ? "high" : "auto";
  const fitClass = fit === "contain" ? "object-contain" : "object-cover";

  const imgEl = (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={loading}
      decoding="async"
      // @ts-ignore — fetchPriority is a valid HTML attribute (React 18+)
      fetchpriority={fetchPriority}
      className={`h-full w-full ${fitClass} ${objectPosition} ${className}`}
      {...rest}
    />
  );

  const inner = webpSrc ? (
    <picture>
      <source srcSet={webpSrc} type="image/webp" />
      <source srcSet={src} type="image/png" />
      {imgEl}
    </picture>
  ) : imgEl;

  if (aspect) {
    return (
      <div className={`overflow-hidden ${aspect} ${wrapperClassName}`}>
        {inner}
      </div>
    );
  }
  return inner;
}
