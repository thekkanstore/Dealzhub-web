import React, { useState, useEffect, useCallback, useMemo } from 'react';
import 'react-virtualized/styles.css';
import noDataFound from '../../assets/images/noDataFound@3x.png';
import { useAppContext } from '../../context/AppContext';
import { fetchAllProducts } from '../../services/productService';
import BannerSkeleton from '../../components/home/skeletons/BannerSkeleton';
import CategoryScroller from '../../components/common/CategoryScroller';
import VirtualizedProductGrid from '../../components/common/VirtualizedProductGrid';

const HomePage = () => {
  const { categories, selectedLocation, appConfigs } = useAppContext();

  const [currentBanner, setCurrentBanner] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState(null);
  // const [isPending, startTransition] = useTransition();

  // Local state for infinite scrolling
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(false);

  // Effect for the banner carousel
  useEffect(() => {
    if (appConfigs && appConfigs[0] && appConfigs[0].banners && appConfigs[0].banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % appConfigs[0].banners.length);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [appConfigs]);

  // Effect for fetching data when filters change
  useEffect(() => {
    // startTransition(() => {
      setIsLoading(true);
      setProducts([]); // Clear products immediately
      setHasFetchedProducts(false);
      fetchAllProducts(selectedCategory, selectedLocation, null).then((response) => {
        setProducts(response);
        setIsLoading(false);
        setHasFetchedProducts(true);
      });
    // });
  }, [selectedCategory, selectedLocation]);


  const handleCategoryClick = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  const noProductsMessage = useMemo(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      return "No products found in this category.";
    }
    if (selectedLocation && selectedLocation !== 'Select Location') {
      return "No products found for your selected location.";
    }
    return "No products found.";
  }, [selectedCategory, selectedLocation]);

  return (
    <div className="min-h-screen bg-white">
      {/* Banner Carousel */}
      <div className="max-w-7xl mx-auto px-4 my-6">
        {!appConfigs || appConfigs.length === 0 || appConfigs[0].banners.length === 0 ? (
          <BannerSkeleton />
        ) : (
          <div className="relative h-64 rounded-xl overflow-hidden">
            {appConfigs[0].banners.map((bannerUrl, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 flex items-center justify-center text-white transition-opacity duration-500 ${idx === currentBanner ? 'opacity-100' : 'opacity-0'
                  }`}
              >
                <img src={bannerUrl} alt={`Banner ${idx + 1}`} className="w-full h-full object-cover" loading="lazy"
                  onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                  style={{ opacity: 0 }} />
              </div>
            ))}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {appConfigs[0].banners.map((_, idx) => (
                <button
                  key={idx}
                  className={`w-2 h-2 rounded-full ${idx === currentBanner ? 'bg-white' : 'bg-white/50'
                    }`}
                  onClick={() => setCurrentBanner(idx)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Categories */}
      <CategoryScroller
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryClick={handleCategoryClick}
      />

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {!selectedLocation || selectedLocation === 'Select Location' ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <img src={noDataFound} alt="Please select a location" className="w-48 h-48 mx-auto mb-6" />
            <h2 className="text-2xl font-medium mb-2">Please select a location</h2>
            <p className="text-gray-600 mb-6">Select a location to see products available in your area.</p>
          </div>
        ) : (products.length > 0 || isLoading) ? (
          <VirtualizedProductGrid
            products={products}
            isLoading={isLoading}
          />
        ) : (hasFetchedProducts && products.length === 0 && !isLoading) ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <img src={noDataFound} alt="No Products Found" className="w-48 h-48 mx-auto mb-6" />
            <h2 className="text-2xl font-medium mb-2">{noProductsMessage}</h2>
            <p className="text-gray-600 mb-6">Please try selecting a different category or location.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default HomePage;
