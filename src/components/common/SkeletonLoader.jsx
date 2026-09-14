import React from 'react';

/**
 * Shimmer effect class for smooth animated skeleton placeholders
 */
export const shimmerClass = "animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]";

/**
 * Skeleton for a single Product Card
 */
export const ProductCardSkeleton = () => (
  <div className="bg-white rounded-lg p-3 relative flex flex-col justify-between border border-gray-100 shadow-sm overflow-hidden">
    {/* Image Skeleton */}
    <div className="w-full h-44 bg-gray-200 rounded-3xl animate-pulse mb-3 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]" />
    </div>

    {/* Title Skeleton */}
    <div className="space-y-1.5 my-1">
      <div className="h-4 bg-gray-200 rounded-md w-4/5 animate-pulse" />
      <div className="h-3 bg-gray-200 rounded-md w-3/5 animate-pulse" />
    </div>

    {/* Store & Price Skeleton */}
    <div className="mt-2 space-y-2">
      {/* Store Logo & Name */}
      <div className="flex items-center gap-1.5">
        <div className="w-4 h-4 rounded-full bg-gray-200 animate-pulse shrink-0" />
        <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse" />
      </div>

      {/* Price */}
      <div className="flex items-center gap-2 pt-1">
        <div className="h-3.5 bg-gray-200 rounded w-12 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
      </div>
    </div>
  </div>
);

/**
 * Grid of Product Card Skeletons
 */
export const ProductGridSkeleton = ({ count = 10 }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
    {Array.from({ length: count }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

/**
 * Categories Horizontal Scroller Skeleton
 */
export const CategoryScrollerSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 py-4">
    <div className="flex items-center justify-between gap-4 overflow-hidden">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2 shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 animate-pulse" />
          <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Banner Carousel Skeleton
 */
export const BannerSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 my-6">
    <div className="w-full h-44 sm:h-64 md:h-80 bg-gray-200 rounded-3xl animate-pulse relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_1.5s_infinite]" />
    </div>
  </div>
);

/**
 * Full HomePage Skeleton
 */
export const HomePageSkeleton = () => (
  <div className="min-h-screen bg-white">
    <BannerSkeleton />
    <CategoryScrollerSkeleton />
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <ProductGridSkeleton count={10} />
    </div>
  </div>
);

/**
 * Full Product Page View Skeleton
 */
export const ProductPageSkeleton = () => (
  <main className="min-h-screen bg-gray-50/70">
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Back button skeleton */}
      <div className="w-20 h-7 bg-gray-200 rounded-full animate-pulse mb-4" />

      {/* Product Detail Card Skeleton */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 grid md:grid-cols-2 gap-8 border border-gray-100 shadow-sm">
        {/* Left Column: Images */}
        <div>
          {/* Main Image Skeleton */}
          <div className="w-full h-80 sm:h-96 bg-gray-200 rounded-2xl animate-pulse relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent animate-[shimmer_1.5s_infinite]" />
          </div>

          {/* Thumbnails Row */}
          <div className="flex gap-3 mt-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-xl animate-pulse shrink-0"
              />
            ))}
          </div>
        </div>

        {/* Right Column: Details & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded-xl w-4/5 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded-lg w-2/3 animate-pulse" />
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 pt-2">
              <div className="h-10 bg-gray-200 rounded-xl w-32 animate-pulse" />
              <div className="h-6 bg-gray-200 rounded-lg w-20 animate-pulse" />
            </div>

            {/* Description */}
            <div className="space-y-2 pt-2">
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse" />
            </div>

            {/* Category Tag */}
            <div className="h-11 bg-gray-100 rounded-xl w-3/4 animate-pulse border border-gray-200/60" />

            {/* Store Card Placeholder */}
            <div className="py-5 px-6 bg-gray-50 border border-gray-100 rounded-3xl space-y-2">
              <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="h-3.5 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-3.5 bg-gray-200 rounded w-1/3 animate-pulse" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <div className="flex gap-4">
              <div className="h-12 bg-gray-200 rounded-full w-1/2 animate-pulse" />
              <div className="h-12 bg-gray-200 rounded-full w-1/2 animate-pulse" />
            </div>
            <div className="h-12 bg-gray-200 rounded-full w-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </main>
);
