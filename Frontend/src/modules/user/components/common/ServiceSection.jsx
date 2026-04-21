import React from 'react';
import { AiFillStar } from 'react-icons/ai';
import { themeColors } from '../../../../theme';

/**
 * Reusable Service Section Component
 * Used for displaying service listings with image, rating, price, features, and Add button
 */
const ServiceSection = ({ 
  title, 
  services, 
  onAddClick, 
  onViewDetails,
  showTopBorder = true 
}) => {
  return (
    <div className={`mb-6 ${showTopBorder ? 'border-t-4 border-gray-300 pt-6' : ''}`} id={title.toLowerCase().replace(/\s+/g, '-')}>
      <div className="px-4 mb-4">
        <h2 className="text-xl font-bold text-black">{title}</h2>
      </div>

      <div className="px-4 space-y-6">
        {services.map((service) => (
          <div key={service.id} className="flex gap-4">
            {/* Service Details */}
            <div className="flex-1">
              {service.badge && (
                <span className="inline-block bg-green-500 text-white text-xs font-bold px-2 py-1 rounded mb-2">
                  {service.badge}
                </span>
              )}
              <h3 className="text-lg font-normal text-gray-600 mb-2">{service.title}</h3>
              <div className="flex items-center gap-1 mb-2">
                <AiFillStar className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-gray-700">{service.rating} ({service.reviews} reviews)</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base font-bold text-black">₹{service.price}</span>
                {service.duration && (
                  <>
                    <span className="text-sm text-gray-600">•</span>
                    <span className="text-sm text-gray-600">{service.duration}</span>
                  </>
                )}
                {service.originalPrice && (
                  <>
                    <span className="text-sm text-gray-400 line-through ml-2">₹{service.originalPrice}</span>
                  </>
                )}
              </div>
              {service.description && (
                <p className="text-sm text-gray-600 mb-2">{service.description}</p>
              )}
              {service.features && (
                <ul className="space-y-1 mb-3">
                  {service.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
              {service.options && (
                <p className="text-sm text-gray-600 mb-2">{service.options}</p>
              )}
              <button
                onClick={() => onViewDetails?.(service)}
                className="text-brand text-sm font-medium hover:underline"
                style={{ color: themeColors.button }}
              >
                View details
              </button>
            </div>

            {/* Service Image */}
            <div className="relative w-32 h-32 rounded-lg overflow-hidden flex-shrink-0">
              {service.image && (
                <>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                  {service.label && (
                    <div className="absolute top-2 left-2 bg-black text-white text-[8px] font-bold px-2 py-1 rounded">
                      {service.label}
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 flex flex-col items-end gap-2">
                    <button
                      onClick={() => onAddClick?.(service)}
                      className="bg-white text-brand px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-gray-50 active:scale-95 transition-all"
                      style={{ color: themeColors.button }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
                    >
                      Add
                    </button>
                    {service.options && (
                      <span className="text-[10px] text-gray-600 bg-white/90 px-2 py-0.5 rounded">
                        {service.options}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ServiceSection;

