import React, { memo } from 'react';
import { AiFillStar } from 'react-icons/ai';

const RatingSection = memo(({ title, rating, bookings, showBorder = false }) => {
  return (
    <div className={`px-4 py-4 ${showBorder ? 'border-b border-gray-200' : ''}`}>
      {title && <h1 className="text-2xl font-bold text-black mb-2">{title}</h1>}
      <div className="flex items-center gap-1">
        <AiFillStar className="w-5 h-5 text-yellow-400" />
        <span className="text-base text-gray-600">{rating}</span>
        <span className="text-sm text-gray-600">({bookings})</span>
      </div>
    </div>
  );
});

RatingSection.displayName = 'RatingSection';

export default RatingSection;

