import React from 'react';

// Basic animated placeholder line
export const SkeletonLine = ({ width = '100%', height = '1em', className = '', style = {} }) => (
  <div
    className={`bg-gray-200 rounded animate-pulse ${className}`}
    style={{ width, height, ...style }}
  />
);

// Circular placeholder for avatars/icons
export const SkeletonCircle = ({ size = '3rem', className = '', style = {} }) => (
  <div
    className={`bg-gray-200 rounded-full animate-pulse flex-shrink-0 ${className}`}
    style={{ width: size, height: size, ...style }}
  />
);

// Placeholder for a stats card or similar block
export const SkeletonCard = ({ className = '', style = {}, children }) => (
  <div
    className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${className}`}
    style={{ ...style }}
  >
    <div className="animate-pulse">
      {children || (
        <>
          <div className="flex justify-between items-start mb-4">
            <div className="w-1/2">
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        </>
      )}
    </div>
  </div>
);

// List of card placeholders
export const SkeletonList = ({ count = 3, cardHeight = '100px', className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {[...Array(count)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl p-4 shadow-md border border-gray-100 flex items-center gap-4 animate-pulse"
        style={{ height: cardHeight }}
      >
        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="w-8 h-8 bg-gray-200 rounded flex-shrink-0"></div>
      </div>
    ))}
  </div>
);

// Profile Header Skeleton (specific to worker dashboard)
export const SkeletonProfileHeader = () => (
  <div className="px-4 pt-4 pb-2">
    <div
      className="rounded-2xl p-4 relative overflow-hidden bg-gray-100 border border-gray-200 animate-pulse"
      style={{ height: '90px' }}
    >
      <div className="flex items-center gap-3 h-full">
        <div className="w-14 h-14 bg-gray-300 rounded-full flex-shrink-0"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-300 rounded w-1/3"></div>
          <div className="h-5 bg-gray-300 rounded w-2/3"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
        <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
      </div>
    </div>
  </div>
);

// Dashboard Stats Grid Skeleton
export const SkeletonDashboardStats = () => (
  <div className="px-4 pt-4">
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="rounded-xl p-4 bg-gray-100 h-32 animate-pulse border border-gray-200 flex flex-col justify-between">
        <div className="flex justify-between">
          <div className="w-1/2 h-3 bg-gray-300 rounded"></div>
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
        </div>
        <div className="w-3/4 h-6 bg-gray-300 rounded"></div>
      </div>
      <div className="rounded-xl p-4 bg-gray-100 h-32 animate-pulse border border-gray-200 flex flex-col justify-between">
        <div className="flex justify-between">
          <div className="w-1/2 h-3 bg-gray-300 rounded"></div>
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
        </div>
        <div className="w-1/2 h-6 bg-gray-300 rounded"></div>
      </div>
      <div className="rounded-xl p-4 bg-gray-100 h-32 animate-pulse border border-gray-200 flex flex-col justify-between">
        <div className="flex justify-between">
          <div className="w-1/2 h-3 bg-gray-300 rounded"></div>
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
        </div>
        <div className="w-1/2 h-6 bg-gray-300 rounded"></div>
      </div>
      <div className="rounded-xl p-4 bg-gray-100 h-32 animate-pulse border border-gray-200 flex flex-col justify-between">
        <div className="flex justify-between">
          <div className="w-1/2 h-3 bg-gray-300 rounded"></div>
          <div className="w-8 h-8 bg-gray-300 rounded"></div>
        </div>
        <div className="w-1/2 h-6 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);
