import { useEffect, useRef } from 'react';

/**
 * Custom hook to measure component render performance
 * Only active in development mode
 * 
 * @param {string} componentName - Name of the component being measured
 * @param {object} props - Component props to track (optional)
 */
const usePerformanceMonitor = (componentName, props = {}) => {
  const renderCount = useRef(0);
  const lastRenderTime = useRef(Date.now());
  const mountTime = useRef(Date.now());

  useEffect(() => {
    // Only log in development
    if (import.meta.env.DEV) {
      renderCount.current += 1;
      const currentTime = Date.now();
      const timeSinceLastRender = currentTime - lastRenderTime.current;
      const timeSinceMount = currentTime - mountTime.current;

      // Log if render takes too long (>16ms = 60fps threshold)
      if (timeSinceLastRender > 16 && renderCount.current > 1) {
        console.warn(
          `[Performance] ${componentName} slow render:`,
          `${timeSinceLastRender}ms`,
          `(Render #${renderCount.current})`
        );
      }

      // Log excessive re-renders
      if (renderCount.current > 50) {
        console.warn(
          `[Performance] ${componentName} excessive re-renders:`,
          `${renderCount.current} renders in ${timeSinceMount}ms`
        );
      }

      lastRenderTime.current = currentTime;
    }
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (import.meta.env.DEV) {
        console.log(
          `[Performance] ${componentName} unmounted after ${renderCount.current} renders`
        );
      }
    };
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    timeSinceMount: Date.now() - mountTime.current,
  };
};

export default usePerformanceMonitor;
