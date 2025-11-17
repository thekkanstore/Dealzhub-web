import React from 'react';

const BannerSkeleton = () => {
  return (
    <div className="relative h-64 rounded-xl overflow-hidden bg-gray-200 animate-pulse">
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        <div className="w-2 h-2 rounded-full bg-gray-300" />
        <div className="w-2 h-2 rounded-full bg-gray-300" />
        <div className="w-2 h-2 rounded-full bg-gray-300" />
        <div className="w-2 h-2 rounded-full bg-gray-300" />
      </div>
    </div>
  );
};

export default BannerSkeleton;
