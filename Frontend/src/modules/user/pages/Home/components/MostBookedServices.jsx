import React, { useRef, useEffect } from 'react';
import { createOptimizedScrollAnimation, createOptimizedStaggerAnimation } from '../../../../../utils/optimizedScrollTrigger';
import DetailedServiceCard from '../../../components/common/DetailedServiceCard';
import intenseBathroom2Image from '../../../../../assets/images/pages/Home/MostBookedServices/intense-bathroom-2.jpg';
import intenseBathroom3Image from '../../../../../assets/images/pages/Home/MostBookedServices/intense-bathroom-3.jpg';
import drillHangImage from '../../../../../assets/images/pages/Home/MostBookedServices/dreill&hang.jpg';
import rollOnWaxImage from '../../../../../assets/images/pages/Home/MostBookedServices/roll-on-wax.webp';
import tapRepairImage from '../../../../../assets/images/pages/Home/MostBookedServices/tap-repai.jpg';
import automaticTopLoadImage from '../../../../../assets/images/pages/Home/MostBookedServices/automatic-top-load-machine.webp';
import spatulaWaxingImage from '../../../../../assets/images/pages/Home/MostBookedServices/spacula-waxing.jpg';
import fanRepairImage from '../../../../../assets/images/pages/Home/MostBookedServices/fan-repairs.jpg';
import switchBoardImage from '../../../../../assets/images/pages/Home/MostBookedServices/switch-board.jpg';

const MostBookedServices = React.memo(({ services, onServiceClick, onAddClick }) => {


  const serviceList = services || [];
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);

  // Defer GSAP scroll animations until after initial render for better performance
  useEffect(() => {
    // Skip animations on initial load to improve performance
    const shouldAnimate = typeof window !== 'undefined' &&
      (window.requestIdleCallback || window.setTimeout);

    if (!shouldAnimate || !sectionRef.current || !titleRef.current || !cardsRef.current) {
      // Show content immediately without animation
      if (titleRef.current) titleRef.current.style.opacity = '1';
      if (cardsRef.current) {
        Array.from(cardsRef.current.children).forEach(card => {
          card.style.opacity = '1';
          card.style.transform = 'none';
        });
      }
      return;
    }

    // Defer animation initialization until browser is idle
    const initAnimations = () => {
      const cards = Array.from(cardsRef.current?.children || []);
      if (cards.length === 0) return;

      const cleanupFunctions = [];

      // Animate title
      const titleCleanup = createOptimizedScrollAnimation(
        titleRef.current,
        {
          from: { y: 30, opacity: 0 },
          to: { y: 0, opacity: 1 },
          duration: 0.6,
          ease: 'power2.out',
        },
        { rootMargin: '100px' }
      );
      if (titleCleanup) cleanupFunctions.push(titleCleanup);

      // Stagger animate cards
      const cardsCleanup = createOptimizedStaggerAnimation(
        cards,
        {
          from: { x: 50, opacity: 0, scale: 0.9 },
          to: { x: 0, opacity: 1, scale: 1 },
          duration: 0.5,
          stagger: 0.08,
          ease: 'back.out(1.7)',
        },
        { rootMargin: '150px' }
      );
      if (cardsCleanup) cleanupFunctions.push(cardsCleanup);

      return () => {
        cleanupFunctions.forEach(cleanup => cleanup?.());
      };
    };

    // Use requestIdleCallback if available, otherwise setTimeout
    if (window.requestIdleCallback) {
      const idleCallback = window.requestIdleCallback(initAnimations, { timeout: 2000 });
      return () => {
        if (idleCallback) window.cancelIdleCallback(idleCallback);
      };
    } else {
      const timeout = setTimeout(initAnimations, 500);
      return () => clearTimeout(timeout);
    }
  }, []); // Empty deps - only run once on mount

  if (serviceList.length === 0) {
    return null;
  }

  return (
    <div ref={sectionRef} className="mb-6">
      <div ref={titleRef} className="px-4 mb-5" style={{ opacity: 1 }}>
        <h2
          className="text-xl font-bold text-gray-900 tracking-tight"
        >
          Most booked services
        </h2>
      </div>

      <div ref={cardsRef} className="flex gap-2 overflow-x-auto px-6 lg:px-4 pb-2 scrollbar-hide lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible">
        {serviceList.map((service, index) => (
          <DetailedServiceCard
            key={service.id || index}
            title={service.title}
            rating={service.rating}
            reviews={service.reviews}
            price={service.price}
            originalPrice={service.originalPrice}
            discount={service.discount}
            image={service.image}
            onClick={() => onServiceClick?.(service)}
            onAddClick={() => onAddClick?.(service)}
          />
        ))}
      </div>
    </div>
  );
});

MostBookedServices.displayName = 'MostBookedServices';

export default MostBookedServices;

