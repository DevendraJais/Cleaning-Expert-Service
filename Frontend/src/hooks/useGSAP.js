import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

/**
 * Custom hook for GSAP animations
 * @param {Function} animationFn - Function that receives GSAP instance and element ref
 * @param {Array} dependencies - Dependencies array for useEffect
 */
export const useGSAP = (animationFn, dependencies = []) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current && animationFn) {
      const ctx = gsap.context(() => {
        animationFn(elementRef.current);
      }, elementRef.current);

      return () => ctx.revert();
    }
  }, dependencies);

  return elementRef;
};

/**
 * Hook for scroll-triggered animations
 */
export const useScrollAnimation = (animationFn, dependencies = []) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (elementRef.current && animationFn) {
      const ctx = gsap.context(() => {
        animationFn(elementRef.current);
      }, elementRef.current);

      return () => ctx.revert();
    }
  }, dependencies);

  return elementRef;
};

