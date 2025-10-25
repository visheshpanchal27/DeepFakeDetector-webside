import React from 'react';

const SkeletonLoader = ({ className = '', variant = 'rectangular', animation = true }) => {
  const baseClasses = `bg-gray-200 ${animation ? 'animate-pulse' : ''}`;
  
  const variants = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`} />
  );
};

export const CardSkeleton = () => (
  <div className="card animate-pulse">
    <div className="flex items-center space-x-4 mb-4">
      <SkeletonLoader variant="circular" className="w-10 h-10" />
      <div className="flex-1">
        <SkeletonLoader variant="text" className="w-3/4 mb-2" />
        <SkeletonLoader variant="text" className="w-1/2" />
      </div>
    </div>
    <SkeletonLoader className="w-full h-32 mb-4" />
    <div className="space-y-2">
      <SkeletonLoader variant="text" className="w-full" />
      <SkeletonLoader variant="text" className="w-2/3" />
    </div>
  </div>
);

export default React.memo(SkeletonLoader);