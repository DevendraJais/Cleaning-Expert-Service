import React from 'react';
import { FiChevronDown } from 'react-icons/fi';

const LocationSelector = ({ location, onLocationClick }) => {
  // Format location to show only city and state, rest with "..."
  const formatLocation = (loc) => {
    if (!loc) return '...';
    
    // Split by "-" to get parts
    const parts = loc.split('-').map(part => part.trim()).filter(part => part);
    
    // Extract city and state
    // Format: "Area- City- State- ..."
    // We want: "City- State..."
    if (parts.length >= 3) {
      // parts[0] = Area, parts[1] = City, parts[2] = State
      const city = parts[1] || '';
      const state = parts[2] || '';
      return `${city}- ${state}...`;
    } else if (parts.length === 2) {
      // If only 2 parts, assume first is city, second is state
      return `${parts[0]}- ${parts[1]}...`;
    } else if (parts.length === 1) {
      return `${parts[0]}...`;
    }
    
    return '...';
  };

  const formattedLocation = formatLocation(location);

  return (
    <div 
      className="flex items-center gap-1.5 cursor-pointer"
      onClick={onLocationClick}
    >
      <span className="text-xs text-gray-700 truncate max-w-[140px] leading-tight text-right">
        {formattedLocation}
      </span>
      <FiChevronDown className="w-3 h-3 flex-shrink-0" style={{ color: '#F59E0B' }} />
    </div>
  );
};

export default LocationSelector;


