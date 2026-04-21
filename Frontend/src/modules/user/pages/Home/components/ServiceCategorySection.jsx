import React from 'react';
import SimpleServiceCard from '../../../components/common/SimpleServiceCard';
import { themeColors } from '../../../../../theme';

const ServiceCategorySection = ({ title, services, onSeeAllClick, onServiceClick }) => {
  return (
    <div className="mb-6">
      <div className="px-4 mb-5 flex items-center justify-between">
        <h2 
          className="text-xl font-bold text-black"
        >
          {title}
        </h2>
      </div>

      {/* Horizontal Scrollable Service Cards */}
      <div className="flex gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {services.map((service) => (
          <SimpleServiceCard
            key={service.id}
            title={service.title}
            image={service.image}
            onClick={() => onServiceClick?.(service)}
          />
        ))}
      </div>
    </div>
  );
};

export default ServiceCategorySection;

