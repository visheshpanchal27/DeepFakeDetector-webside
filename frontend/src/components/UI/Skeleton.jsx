import React from 'react';

export const Skeleton = ({ className = '', variant = 'text' }) => {
  const baseClass = 'animate-pulse bg-gray-200 rounded';
  
  const variants = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    circle: 'h-12 w-12 rounded-full',
    rect: 'h-32 w-full',
    card: 'h-64 w-full'
  };

  return <div className={`${baseClass} ${variants[variant]} ${className}`} />;
};

export const SkeletonCard = () => (
  <div className="card space-y-4">
    <Skeleton variant="title" />
    <Skeleton variant="text" />
    <Skeleton variant="text" className="w-5/6" />
    <Skeleton variant="rect" />
  </div>
);
