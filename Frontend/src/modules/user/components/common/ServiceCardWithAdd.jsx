import React, { memo } from 'react';
import { AiFillStar } from 'react-icons/ai';
import { themeColors } from '../../../../theme';

const ServiceCardWithAdd = memo(({ image, title, rating, reviews, price, onAddClick, onClick }) => {
  return (
    <div
      className="min-w-[200px] bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-95"
      style={{
        boxShadow: themeColors.cardShadow,
        border: themeColors.cardBorder
      }}
      onClick={onClick}
    >
      {image ? (
        <img
          src={image}
          alt={title}
          className="w-full h-40 object-cover"
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="w-full h-40 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
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
      <div className="p-3">
        <h3 className="text-xs font-medium text-black leading-tight mb-2">{title}</h3>
        {rating && (
          <div className="flex items-center gap-1 mb-2">
            <AiFillStar className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-black font-medium">{rating}</span>
            {reviews && (
              <span className="text-xs text-gray-500">({reviews})</span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between">
          <span
            className="text-base font-bold text-black"
          >
            ₹{price}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddClick?.();
            }}
            className="text-xs font-semibold px-4 py-1.5 rounded-full active:scale-95 transition-all shadow-sm"
            style={{
              backgroundColor: themeColors.button,
              color: 'white',
              border: 'none',
              boxShadow: '0 2px 4px rgba(0, 166, 166, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = themeColors.button;
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 4px 8px rgba(0, 166, 166, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = themeColors.button;
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 2px 4px rgba(0, 166, 166, 0.3)';
            }}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
});

ServiceCardWithAdd.displayName = 'ServiceCardWithAdd';

export default ServiceCardWithAdd;

