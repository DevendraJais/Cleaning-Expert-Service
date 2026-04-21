import React, { memo } from 'react';
import { themeColors } from '../../../../theme';
import { optimizeCloudinaryUrl } from '../../../../utils/cloudinaryOptimize';

const SimpleServiceCard = memo(({ image, title, onClick }) => {
  return (
    <div
      className="min-w-[160px] bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95"
      style={{
        boxShadow: themeColors.cardShadow,
        border: themeColors.cardBorder
      }}
      onClick={onClick}
    >
      {image ? (
        <img
          src={optimizeCloudinaryUrl(image, { width: 320, quality: 'auto' })}
          alt={title}
          className="w-full h-28 object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="w-full h-28 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
      )}
      <div className="p-2">
        <h3 className="text-xs font-medium text-black leading-tight">{title}</h3>
      </div>
    </div>
  );
});

SimpleServiceCard.displayName = 'SimpleServiceCard';

export default SimpleServiceCard;

