import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Optimized scroll-triggered animation that only initializes when needed
 * Uses Intersection Observer for better performance
 */
export const createOptimizedScrollAnimation = (element, animationConfig, options = {}) => {
  if (!element) return null;

  const {
    from = { opacity: 0, y: 30 },
    to = { opacity: 1, y: 0 },
    duration = 0.6,
    ease = 'power2.out',
    start = 'top 85%',
    once = true, // Only animate once by default
    delay = 0,
  } = animationConfig;

  const {
    rootMargin = '50px', // Start animation earlier
    threshold = 0.1,
  } = options;

  // Use Intersection Observer for better performance
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.fromTo(
            entry.target,
            from,
            {
              ...to,
              duration,
              delay,
              ease,
              onComplete: () => {
                if (once) {
                  observer.unobserve(entry.target);
                }
              },
            }
          );
          
          if (once) {
            observer.unobserve(entry.target);
          }
        }
      });
    },
    {
      rootMargin,
      threshold,
    }
  );

  observer.observe(element);

  return () => {
    observer.disconnect();
  };
};

/**
 * Optimized stagger animation for multiple elements
 */
export const createOptimizedStaggerAnimation = (elements, animationConfig, options = {}) => {
  if (!elements || elements.length === 0) return null;

  const {
    from = { opacity: 0, x: 50, scale: 0.9 },
    to = { opacity: 1, x: 0, scale: 1 },
    duration = 0.5,
    stagger = 0.08,
    ease = 'back.out(1.7)',
    start = 'top 80%',
    once = true,
  } = animationConfig;

  const {
    rootMargin = '100px',
    threshold = 0.1,
  } = options;

  // Use Intersection Observer on parent container
  const parent = elements[0]?.parentElement;
  if (!parent) return null;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          gsap.fromTo(
            elements,
            from,
            {
              ...to,
              duration,
              stagger,
              ease,
              onComplete: () => {
                if (once) {
                  observer.unobserve(entry.target);
                }
              },
            }
          );
          
          if (once) {
            observer.unobserve(entry.target);
          }
        }
      });
    },
    {
      rootMargin,
      threshold,
    }
  );

  observer.observe(parent);

  return () => {
    observer.disconnect();
  };
};

/**
 * Debounced scroll handler for better performance
 */
export const createDebouncedScrollHandler = (callback, delay = 100) => {
  let timeoutId = null;
  let lastCallTime = 0;

  return () => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    if (timeSinceLastCall < delay) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        callback();
        lastCallTime = Date.now();
      }, delay - timeSinceLastCall);
    } else {
      callback();
      lastCallTime = now;
    }
  };
};

/**
 * Batch ScrollTrigger refresh to avoid multiple recalculations
 */
let refreshTimeout = null;
export const batchRefreshScrollTrigger = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout);
  }
  
  refreshTimeout = setTimeout(() => {
    ScrollTrigger.refresh();
  }, 100);
};

