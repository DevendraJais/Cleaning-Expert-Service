/**
 * Optimized scroll handler with throttling and debouncing
 * Reduces CPU usage during scrolling
 */

let scrollTimeout = null;
let lastScrollTime = 0;
const SCROLL_THROTTLE = 16; // ~60fps
const SCROLL_DEBOUNCE = 100;

/**
 * Creates an optimized scroll handler with throttling
 */
export const createOptimizedScrollHandler = (callback, options = {}) => {
  const {
    throttle = SCROLL_THROTTLE,
    debounce = SCROLL_DEBOUNCE,
    passive = true,
  } = options;

  let ticking = false;
  let lastScrollY = window.scrollY;
  let rafId = null;

  const handleScroll = () => {
    const now = Date.now();
    const timeSinceLastScroll = now - lastScrollTime;

    // Throttle: Only process if enough time has passed
    if (timeSinceLastScroll < throttle) {
      return;
    }

    if (!ticking) {
      rafId = window.requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;
        lastScrollY = currentScrollY;
        lastScrollTime = now;
        
        callback(currentScrollY, lastScrollY);
        
        ticking = false;
      });
      ticking = true;
    }
  };

  return {
    handler: handleScroll,
    cleanup: () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
    },
  };
};

/**
 * Memoized localStorage operations
 */
const localStorageCache = {
  cartItems: null,
  lastUpdate: 0,
  CACHE_DURATION: 100, // 100ms cache
};

export const getCachedCartItems = () => {
  const now = Date.now();
  if (
    localStorageCache.cartItems !== null &&
    now - localStorageCache.lastUpdate < localStorageCache.CACHE_DURATION
  ) {
    return localStorageCache.cartItems;
  }

  try {
    localStorageCache.cartItems = JSON.parse(
      localStorage.getItem('cartItems') || '[]'
    );
    localStorageCache.lastUpdate = now;
    return localStorageCache.cartItems;
  } catch (error) {
    console.error('Error reading cart items:', error);
    return [];
  }
};

export const invalidateCartCache = () => {
  localStorageCache.cartItems = null;
  localStorageCache.lastUpdate = 0;
};

