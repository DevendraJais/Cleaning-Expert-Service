import React, { useState, useEffect, useRef } from 'react';
import { FiSearch } from 'react-icons/fi';
import NotificationBell from '../../../components/common/NotificationBell';
import { themeColors } from '../../../../../theme';

const SearchBar = ({ onInputClick }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);

  const serviceNames = [
    'AC service and repair',
    'Washing machine services',
    'Cooler repair at Home',
    'R.O. repair installation',
    'Microwave repair',
    'Geyser repair',
    'Bathroom appliance installation',
    'Fridge at Home'
  ];

  useEffect(() => {
    let timer;
    const currentFullText = serviceNames[currentServiceIndex];

    if (isTyping) {
      if (displayedText.length < currentFullText.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length + 1));
        }, 150);
      } else {
        timer = setTimeout(() => setIsTyping(false), 2000);
      }
    } else {
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(currentFullText.slice(0, displayedText.length - 1));
        }, 100);
      } else {
        setCurrentServiceIndex((prev) => (prev + 1) % serviceNames.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isTyping, currentServiceIndex]);

  return (
    <div className="flex items-center gap-3 w-full">
      <div className="flex-1 relative cursor-pointer" onClick={onInputClick}>
        <div className="relative w-full group">
          {/* Glow effect on hover */}
          <div
            className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{ background: `linear-gradient(90deg, ${themeColors.brand.teal}1A, ${themeColors.brand.orange}1A)` }}
          />

          {/* Gradient Definition */}
          <svg width="0" height="0" className="absolute">
            <linearGradient id="homestr-search-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={themeColors.brand.teal} />
              <stop offset="50%" stopColor={themeColors.brand.yellow} />
              <stop offset="100%" stopColor={themeColors.brand.orange} />
            </linearGradient>
          </svg>

          {/* Search icon */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
            <FiSearch
              className="w-5 h-5 transition-colors duration-300"
              style={{ stroke: 'url(#homestr-search-gradient)' }}
            />
          </div>

          {/* Simulated Input */}
          <div
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-[15px] bg-white border border-gray-200 transition-all duration-300 text-gray-800 flex items-center h-[52px]"
            style={{
              boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)',
            }}
          >
            {/* Placeholder text with typing animation */}
            <span className="text-[15px] text-gray-400 tracking-wide font-light">
              Search for <span
                className="font-medium inline-block min-w-[2px]"
                style={{
                  background: themeColors.gradient,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent'
                }}
              >
                {displayedText}
                <span className="animate-pulse ml-0.5" style={{ color: themeColors.brand.teal }}>|</span>
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Notification Bell next to Search Bar */}
      <div className="shrink-0">
        <NotificationBell />
      </div>
    </div>
  );
};

export default SearchBar;
