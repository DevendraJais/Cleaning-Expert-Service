import React from 'react';
import ServiceCardWithAdd from '../../../components/common/ServiceCardWithAdd';
import { themeColors } from '../../../../../theme';
import drillHangImage from '../../../../../assets/images/pages/Home/HomeRepairSection/drill&hang.jpg';
import tapRepairImage from '../../../../../assets/images/pages/Home/HomeRepairSection/tap-repair.jpg';
import fanRepairImage from '../../../../../assets/images/pages/Home/HomeRepairSection/fan-repair.jpg';
import switchSocketImage from '../../../../../assets/images/pages/Home/HomeRepairSection/switch socket installation.jpg';

const HomeRepairSection = ({ services, onSeeAllClick, onServiceClick, onAddClick }) => {
  // Default home repair services if none provided
  if (!services || services.length === 0) {
    return null;
  }

  const serviceList = services;

  return (
    <div className="mb-6">
      <div className="px-4 mb-5 flex items-center justify-between">
        <h2
          className="text-xl font-bold text-gray-900 tracking-tight"
        >
          Home repair & installation
        </h2>
      </div>

      <div className="flex gap-4 overflow-x-auto px-6 pb-2 scrollbar-hide">
        {serviceList.map((service) => (
          <ServiceCardWithAdd
            key={service.id}
            title={service.title}
            rating={service.rating}
            reviews={service.reviews}
            price={service.price}
            image={service.image}
            onClick={() => onServiceClick?.(service)}
            onAddClick={() => onAddClick?.(service)}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeRepairSection;

