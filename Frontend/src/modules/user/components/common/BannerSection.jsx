import React, { useState, useEffect, useRef } from 'react';
import { FiArrowLeft, FiSearch, FiShare2, FiBell } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import OptimizedImage from '../../../../components/common/OptimizedImage';

const BannerSection = ({ banners = [], onBack, onSearch, onShare, showStickyNav = false, bannerRef = null }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (banners.length <= 1) return;

    // Auto-play carousel
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000); // Change slide every 5 seconds (reduced frequency for better performance)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [banners.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
    // Reset interval when manually changing slide
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (banners.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
      }, 5000);
    }
  };

  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <>
      {/* Banner Icons - Fixed at top */}
      <div
        className={`px-4 py-3 flex items-center justify-between transition-all duration-200 ease-out ${showStickyNav ? 'opacity-0 -translate-y-full pointer-events-none' : 'opacity-100 translate-y-0 pointer-events-auto'
          }`}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          willChange: showStickyNav ? 'transform, opacity' : 'auto',
          transition: showStickyNav ? 'opacity 150ms ease-in, transform 150ms ease-in' : 'opacity 200ms ease-out, transform 200ms ease-out',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        <button
          onClick={onBack}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
        >
          <FiArrowLeft className="w-6 h-6 text-gray-800" />
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onSearch}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
          >
            <FiSearch className="w-6 h-6 text-gray-800" />
          </button>
          <button
            onClick={onShare}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/90 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
          >
            <FiShare2 className="w-6 h-6 text-gray-800" />
          </button>
        </div>
      </div>

      <div ref={bannerRef} className="relative w-full h-64" style={{ overflow: 'hidden' }}>
        {/* Carousel Container */}
        <div
          className="flex transition-transform duration-500 ease-in-out h-full"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
            willChange: 'transform'
          }}
        >
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className="min-w-full h-full relative flex-shrink-0"
              style={{ width: '100%' }}
            >
              <OptimizedImage
                src={banner.image}
                alt={banner.text || banner.title || 'Banner'}
                className="w-full h-full object-cover"
                style={{ width: '100%', height: '100%' }}
                priority={index === 0}
              />
              {(banner.text || banner.title) && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <div className="text-center text-white px-4">
                    <p className="text-lg font-semibold mb-2">{banner.text || banner.title}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Progress bar indicator */}
        {banners.length > 1 && (
          <>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full">
              <div
                className="h-full bg-white rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / banners.length) * 100}%` }}
              ></div>
            </div>

            {/* Indicator dots */}
            <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-1.5">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BannerSection;

