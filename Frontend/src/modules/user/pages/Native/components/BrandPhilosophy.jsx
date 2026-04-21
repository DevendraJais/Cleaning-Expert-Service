import React from 'react';

const BrandPhilosophy = () => {
  return (
    <div className="bg-black text-white py-12 px-4">
      <div className="max-w-2xl">
        {/* Main Headings */}
        <h2 className="text-3xl font-bold mb-4">Innovative.</h2>
        <h2 className="text-3xl font-bold mb-4">Customer-first products.</h2>
        <h2 className="text-3xl font-bold mb-8">Designed in India, for India.</h2>

        {/* Descriptive Text */}
        <div className="space-y-4">
          <p className="text-base text-white leading-relaxed">
            At Native, we don't follow trends. We set new standards.
          </p>
          <p className="text-base text-white leading-relaxed">
            Our every product is deeply researched, built from scratch by industry experts, crafted with precision, and tested rigorously. So it works beautifully, every single time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BrandPhilosophy;

