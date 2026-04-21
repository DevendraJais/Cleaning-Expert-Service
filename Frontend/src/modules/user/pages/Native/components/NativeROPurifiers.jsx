import React from 'react';

const NativeROPurifiers = ({ onKnowMoreClick }) => {
  return (
    <div className="bg-white py-8 px-4">
      {/* Header */}
      <h1 className="text-3xl font-bold text-black mb-6">Native RO Purifiers</h1>

      {/* Main Promotional Banner */}
      <div className="bg-gray-100 rounded-xl p-6 mb-6">
        {/* Offer Badge */}
        <div className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded mb-4 w-fit">
          Up to ₹2,000 off
        </div>

        {/* Product Models */}
        <p className="text-sm text-gray-600 mb-2">NATIVE M1 & M2 & MO</p>

        {/* Key Selling Point */}
        <h2 className="text-2xl font-bold text-black mb-6">
          Needs no service for 2 years
        </h2>

        {/* Know More Button */}
        <button
          onClick={() => onKnowMoreClick?.('ro-purifiers')}
          className="bg-white text-black px-6 py-3 rounded-lg font-medium text-sm border border-gray-300 hover:bg-gray-50 transition-colors mb-6"
        >
          Know more
        </button>

        {/* Product Images Placeholder */}
        <div className="flex items-end gap-4 justify-center mt-6">
          <div className="w-24 h-40 bg-gray-300 rounded-lg flex flex-col items-center justify-center">
            <span className="text-gray-500 text-xs font-medium mb-1">M1</span>
            <div className="w-16 h-20 bg-gray-400 rounded"></div>
          </div>
          <div className="w-20 h-36 bg-gray-300 rounded-lg flex flex-col items-center justify-center">
            <span className="text-gray-500 text-xs font-medium mb-1">M2</span>
            <div className="w-14 h-16 bg-gray-400 rounded"></div>
          </div>
          <div className="w-18 h-32 bg-gray-300 rounded-lg flex flex-col items-center justify-center">
            <span className="text-gray-500 text-xs font-medium mb-1">MO</span>
            <div className="w-12 h-14 bg-gray-400 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NativeROPurifiers;

