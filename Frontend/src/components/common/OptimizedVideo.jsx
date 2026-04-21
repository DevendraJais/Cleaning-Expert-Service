import React, { useState, useRef, useEffect } from 'react';
import { optimizeCloudinaryUrl } from '../../utils/cloudinaryOptimize';

/**
 * OptimizedVideo Component
 * Provides lazy loading, Cloudinary optimization, poster images, and performance-focused video playing.
 */
const OptimizedVideo = ({
  src,
  poster,                // Optional poster image URL
  className = '',
  width,
  height,
  style = {},
  priority = false,      // If true, starts loading immediately
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
  playsInline = true,
  onLoad,
  onError,
  ...props
}) => {
  const [isIntersecting, setIsIntersecting] = useState(priority);
  const videoRef = useRef(null);

  // Transform URL for optimization
  // Note: For videos, optimizeCloudinaryUrl works the same for f_auto, q_auto
  const optimizedSrc = src?.includes('cloudinary.com')
    ? optimizeCloudinaryUrl(src, { quality: 'auto' })
    : src;

  // Optimized poster image
  const optimizedPoster = poster
    ? optimizeCloudinaryUrl(poster, { width: width || 800, quality: 'auto' })
    : undefined;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority || !videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '200px' }
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [priority]);

  // Handle errors
  const handleError = (e) => {
    console.error('Video loading error:', src);
    onError?.(e);
  };

  return (
    <div
      className={`relative overflow-hidden bg-gray-100 ${className}`}
      style={{ width, height, ...style }}
    >
      <video
        ref={videoRef}
        src={isIntersecting ? optimizedSrc : undefined}
        poster={optimizedPoster}
        className="w-full h-full object-cover"
        autoPlay={autoPlay}
        loop={loop}
        muted={muted}
        controls={controls}
        playsInline={playsInline}
        onLoadedData={onLoad}
        onError={handleError}
        {...props}
      />

      {/* Loading state / Overlay if needed */}
      {!isIntersecting && !priority && optimizedPoster && (
        <img
          src={optimizedPoster}
          alt="Video Poster"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default React.memo(OptimizedVideo);
