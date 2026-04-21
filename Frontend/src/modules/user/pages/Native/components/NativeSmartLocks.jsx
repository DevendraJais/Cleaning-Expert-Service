import React from 'react';

const NativeSmartLocks = ({ onKnowMoreClick }) => {
  return (
    <div className="bg-black text-white py-8 px-4">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Native Smart Locks</h1>

      {/* Product Card */}
      <div className="bg-gray-900 rounded-xl p-6 mb-6">
        {/* Offer Badge */}
        <div className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded mb-4 w-fit">
          Up to ₹1,800 off
        </div>

        {/* Product Name */}
        <h2 className="text-lg text-white mb-2">LOCK PRO</h2>

        {/* Features */}
        <p className="text-2xl font-bold text-white mb-6 leading-tight">
          Camera. Doorbell. 7-way unlock. All-in-one.
        </p>

        {/* Know More Button */}
        <button
          onClick={() => onKnowMoreClick?.('smart-locks')}
          className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-gray-700 transition-colors"
        >
          Know more
        </button>

        {/* Product Images Placeholder */}
        <div className="mt-6 flex items-end justify-end gap-4">
          <div className="w-28 h-56 bg-gray-700 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-xs text-center px-2">Smart Lock</span>
          </div>
          <div className="w-20 h-48 bg-white rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-xs text-center px-2">Phone Screen</span>
          </div>
        </div>
      </div>

      {/* All Intelligent Features Section */}
      <div className="bg-white py-6 px-4 -mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-black">All intelligent features</h2>
          <button className="text-blue-600 font-medium text-sm hover:underline">
            Know more
          </button>
        </div>

        {/* Feature Cards */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          <div className="min-w-[280px] bg-black rounded-xl p-4">
            <h3 className="text-base font-bold text-white mb-2">TouchKey</h3>
            <p className="text-sm text-gray-300">Faster unlocking with adaptive fingerprint</p>
          </div>
          <div className="min-w-[280px] bg-black rounded-xl p-4">
            <h3 className="text-base font-bold text-white mb-2">Camera</h3>
            <p className="text-sm text-gray-300">Captures & sends visitor's picture when doorbell rings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NativeSmartLocks;

