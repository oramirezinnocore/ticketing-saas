import { useState, useEffect } from 'react';
import { EventImageFallback } from './EventImageFallback';
import { getImageUrl } from '@/utils/image';

interface EventImageProps {
  src?: string;
  alt?: string;
  title: string;
  className?: string;
}

export const EventImage = ({ src, alt, title, className = '' }: EventImageProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Normalize the image URL (handle relative and absolute paths)
  const imageUrl = getImageUrl(src);

  // CRITICAL FIX: Reset state when src/imageUrl changes
  // This handles React Query async hydration and prop updates
  // Forces React to treat this as a new image load
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
  }, [imageUrl]);

  // Show fallback if no image URL or if image failed to load
  if (!imageUrl || imageError) {
    return <EventImageFallback title={title} className={className} />;
  }

  return (
    <div className={`relative ${className}`}>
      {/* Fallback - visible while loading, fades out when image loads */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ opacity: imageLoaded ? 0 : 1, pointerEvents: imageLoaded ? 'none' : 'auto' }}
      >
        <EventImageFallback title={title} className="w-full h-full" />
      </div>

      {/* Actual image - always rendered, fades in when loaded */}
      <img
        key={imageUrl} // Force remount when URL changes
        src={imageUrl}
        alt={alt || title}
        className="w-full h-full transition-opacity duration-300"
        style={{
          objectFit: 'cover',
          opacity: imageLoaded ? 1 : 0,
        }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
};
