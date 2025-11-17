import React from 'react';

const CategorySkeleton = () => {
  return (
    <div className="min-w-[120px] p-4 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-200 mx-auto mb-2 animate-pulse" />
      <div className="h-4 w-20 bg-gray-200 rounded mx-auto animate-pulse" />
    </div>
  );
};

export default CategorySkeleton;
