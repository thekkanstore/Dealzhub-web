import React, { useState, useEffect } from 'react';
import BannerSkeleton from './skeletons/BannerSkeleton';

const BannerCarousel = ({ appConfigs }) => {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (appConfigs && appConfigs[0] && appConfigs[0].banners && appConfigs[0].banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % appConfigs[0].banners.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [appConfigs]);

  if (!appConfigs || appConfigs.length === 0 || appConfigs[0].banners.length === 0) {
    return <BannerSkeleton />;
  }

  return (
    <div className="relative h-64 rounded-xl overflow-hidden">
      {appConfigs[0].banners.map((bannerUrl, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 flex items-center justify-center text-white transition-opacity duration-500 ${
            idx === currentBanner ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img src={bannerUrl} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" />
        </div>
      ))}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {appConfigs[0].banners.map((_, idx) => (
          <button
            key={idx}
            className={`w-2 h-2 rounded-full ${
              idx === currentBanner ? 'bg-white' : 'bg-white/50'
            }`}
            onClick={() => setCurrentBanner(idx)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
