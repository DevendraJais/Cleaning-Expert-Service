import React, { memo } from 'react';

const StickySubHeading = memo(({ title, isVisible }) => {
  if (!isVisible || !title || title.trim() === '') {
    return null;
  }

  return (
    <div 
      style={{
        position: 'fixed',
        top: '57px',
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '10px 16px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        zIndex: 9998,
        opacity: 1,
        transform: 'translateZ(0)',
        display: 'block',
        visibility: 'visible',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#000000', margin: 0 }}>{title}</h2>
    </div>
  );
});

StickySubHeading.displayName = 'StickySubHeading';

export default StickySubHeading;

