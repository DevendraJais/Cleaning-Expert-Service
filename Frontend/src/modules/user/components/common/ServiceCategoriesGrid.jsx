import React from 'react';
import { themeColors } from '../../../../theme';
import OptimizedImage from '../../../../components/common/OptimizedImage';

const ServiceCategoriesGrid = ({ categories = [], onCategoryClick, layout = 'grid' }) => {
  if (!categories || categories.length === 0) {
    return null;
  }

  // Grid layout (default - 4 columns)
  if (layout === 'grid') {
    return (
      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col items-center w-full"
            >
              <div
                onClick={() => onCategoryClick?.(category)}
                className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform w-full"
              >
                <div
                  className="relative w-full aspect-square mx-auto rounded-2xl overflow-hidden mb-2"
                  style={{
                    backgroundColor: '#f5f5f5',
                    boxShadow: themeColors.cardShadow,
                    border: themeColors.cardBorder
                  }}
                >
                  {category.image ? (
                    <OptimizedImage
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover"
                    />
                  ) : category.icon ? (
                    <div className="w-full h-full flex items-center justify-center">
                      {category.icon}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-400 text-xs">{category.title}</span>
                    </div>
                  )}
                  {category.badge && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-semibold px-1.5 py-0.5 rounded">
                      {category.badge}
                    </div>
                  )}
                </div>
                <span className="text-[11px] text-center text-gray-800 font-medium leading-tight px-1 line-clamp-2 min-h-[2.5em]">
                  {category.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal scroll layout
  return (
    <div className="px-4 mb-6">
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex flex-col items-center cursor-pointer active:scale-95 transition-transform flex-shrink-0"
            onClick={() => onCategoryClick?.(category)}
          >
            <div
              className="relative w-20 h-20 rounded-2xl overflow-hidden mb-2"
              style={{
                backgroundColor: '#f5f5f5',
                boxShadow: themeColors.cardShadow,
                border: themeColors.cardBorder
              }}
            >
              {category.image ? (
                <OptimizedImage
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover"
                />
              ) : category.icon ? (
                <div className="w-full h-full flex items-center justify-center">
                  {category.icon}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-xs">{category.title}</span>
                </div>
              )}
              {category.badge && (
                <div className="absolute -top-1 -right-1 bg-green-500 text-white text-[8px] font-semibold px-1.5 py-0.5 rounded">
                  {category.badge}
                </div>
              )}
            </div>
            <span className="text-[10px] text-center text-gray-700 font-medium leading-tight px-1 max-w-[80px]">
              {category.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceCategoriesGrid;

