import { useEffect, useRef } from 'react';

/**
 * Custom hook for throttled scroll event listener
 * @param {Function} callback - Function to call on scroll
 * @param {number} delay - Throttle delay in milliseconds (default: 100ms)
 * @param {boolean} passive - Use passive event listener (default: true)
 */
const useThrottledScroll = (callback, delay = 100, passive = true) => {
  const lastRan = useRef(Date.now());
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handler = () => {
      const now = Date.now();
      
      if (now - lastRan.current >= delay) {
        callback();
        lastRan.current = now;
      } else {
        // Clear existing timeout
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        // Schedule callback for remaining time
        timeoutRef.current = setTimeout(() => {
          callback();
          lastRan.current = Date.now();
        }, delay - (now - lastRan.current));
      }
    };

    window.addEventListener('scroll', handler, { passive });
    
    return () => {
      window.removeEventListener('scroll', handler);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [callback, delay, passive]);
};

export default useThrottledScroll;

