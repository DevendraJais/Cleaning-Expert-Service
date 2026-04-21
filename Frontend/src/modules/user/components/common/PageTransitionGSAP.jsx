import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap } from 'gsap';
import { animatePageIn, animatePageOut } from '../../../../utils/gsapAnimations';

const PageTransitionGSAP = ({ children, isExiting = false, onExitComplete }) => {
  const location = useLocation();
  const pageRef = useRef(null);
  const prevLocationRef = useRef(location.pathname);

  useEffect(() => {
    if (pageRef.current) {
      // Animate page in
      animatePageIn(pageRef.current);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isExiting && pageRef.current) {
      // Animate page out
      animatePageOut(pageRef.current, onExitComplete);
    }
  }, [isExiting, onExitComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pageRef.current) {
        gsap.killTweensOf(pageRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={pageRef}
      style={{
        willChange: isExiting ? 'transform, opacity' : 'auto',
        transform: 'translateY(100%)',
        opacity: 0,
      }}
    >
      {children}
    </div>
  );
};

export default PageTransitionGSAP;

