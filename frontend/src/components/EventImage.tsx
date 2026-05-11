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
  useEffect(() => {
    // Reset error and loaded states when image URL changes
    setImageError(false);
    setImageLoaded(false);
  }, [imageUrl]);

  // Show fallback if no image URL or if image failed to load
  if (!imageUrl || imageError) {
    return <EventImageFallback title={title} className={className} />;
  }

  return (
    <>
      {/* Show fallback placeholder while image is loading */}
      {!imageLoaded && <EventImageFallback title={title} className={className} />}

      {/* Actual image - hidden until loaded to prevent flicker */}
      <img
        src={imageUrl}
        alt={alt || title}
        className={`${className} ${imageLoaded ? '' : 'hidden'}`}
        style={{ objectFit: 'cover' }}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </>
  );
};
