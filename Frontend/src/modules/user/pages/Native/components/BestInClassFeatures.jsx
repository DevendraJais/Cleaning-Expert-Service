import React from 'react';

const BestInClassFeatures = ({ onFeatureClick }) => {
  const features = [
    {
      id: 1,
      title: 'Smart app',
      description: 'Monitor everything with the UC app',
      image: null,
    },
    {
      id: 2,
      title: 'Easy-to-use features',
      description: 'Preset dispensing with guide light',
      image: null,
    },
    {
      id: 3,
      title: 'Filters',
      description: 'Superior filters that really last for 2 years',
      image: null,
    },
    {
      id: 4,
      title: 'Purification',
      description: '10-stage purifier',
      image: null,
    },
    {
      id: 5,
      title: 'Top-notch design',
      description: 'Retractable tray',
      image: null,
    },
    {
      id: 6,
      title: 'Warranty',
      description: '2-year UC warranty on everything. No hidden charges.',
      image: null,
    },
  ];

  return (
    <div className="bg-white py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-2xl font-bold text-black">Best-in-class features</h2>
        <button className="text-blue-600 font-medium text-sm hover:underline">
          Know more
        </button>
      </div>

      {/* Horizontal Scrollable Feature Cards */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {features.map((feature) => (
          <div
            key={feature.id}
            onClick={() => onFeatureClick?.(feature)}
            className="min-w-[280px] bg-gray-100 rounded-xl p-4 cursor-pointer active:scale-98 transition-transform"
          >
            <h3 className="text-base font-bold text-black mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-700 mb-4">{feature.description}</p>
            
            {/* Feature Image Placeholder */}
            <div className="w-full h-40 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
              <span className="text-gray-400 text-xs">Feature Image</span>
            </div>

            {/* Know More Link */}
            <button className="text-blue-600 text-xs font-medium mt-3 hover:underline">
              Know more &gt;
            </button>
          </div>
        ))}
      </div>

      {/* Scroll Indicator */}
      <div className="flex justify-center gap-1 mt-4">
        <div className="w-2 h-1 bg-gray-800 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  );
};

export default BestInClassFeatures;

