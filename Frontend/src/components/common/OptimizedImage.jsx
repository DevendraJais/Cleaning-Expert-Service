import React, { useState, useRef, useEffect } from 'react';
import { optimizeCloudinaryUrl } from '../../utils/cloudinaryOptimize';

/**
 * OptimizedImage Component
 * Provides lazy loading, Cloudinary optimization, and error handling for images
 */
const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  width,
  height,
  style = {},
  priority = false,      // If true, loads immediately (for above-the-fold images)
  quality = 'auto',      // Cloudinary quality setting
  placeholder = true,    // Show placeholder while loading
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  // Optimize the image URL
  const optimizedSrc = optimizeCloudinaryUrl(src, {
    width: width ? Math.min(width * 2, 1920) : undefined, // 2x for retina, max 1920
    quality,
  });

  // Handle image load
  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  // Handle image error
  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  // Intersection Observer for lazy loading (fallback for browsers without native support)
  useEffect(() => {
    if (priority || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '200px' } // Start loading 200px before visible
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [priority]);

  // Error fallback
  if (hasError) {
    return (
      <div
        className={`bg-gray-50 flex items-center justify-center ${className}`}
        style={{ width, height, ...style }}
      >
        <img
          src="/Homestr-logo.png"
          alt="Image not available"
          className="w-12 h-12 object-contain opacity-40 grayscale"
        />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height, ...style }}>
      {/* Placeholder/Skeleton */}
      {placeholder && !isLoaded && (
        <div
          className="absolute inset-0 bg-gray-100 animate-pulse"
          style={{ width: '100%', height: '100%' }}
        />
      )}

      {/* Actual Image */}
      <img
        ref={imgRef}
        src={priority ? optimizedSrc : undefined}
        data-src={!priority ? optimizedSrc : undefined}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} w-full h-full object-cover`}
        style={{ display: 'block' }}
        {...props}
      />
    </div>
  );
};

export default React.memo(OptimizedImage);
