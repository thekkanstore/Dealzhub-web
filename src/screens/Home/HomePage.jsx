import React, { useState, useEffect, useCallback, useMemo } from 'react';
import 'react-virtualized/styles.css';
import noDataFound from '../../assets/images/noDataFound@3x.png';
import { useAppContext } from '../../context/AppContext';
import { fetchAllProducts } from '../../services/productService';
import CategoryScroller from '../../components/common/CategoryScroller';
import VirtualizedProductGrid from '../../components/common/VirtualizedProductGrid';
import BannerCarousel from '../../components/home/BannerCarousel';

const HomePage = () => {
  console.log('Rendering HomePage');
  const { categories, selectedLocation, appConfigs } = useAppContext();

  const [selectedCategory, setSelectedCategory] = useState(null);
  // const [isPending, startTransition] = useTransition();

  // Local state for infinite scrolling
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(false);

  // Effect for fetching data when filters change
  useEffect(() => {
    // startTransition(() => {
      setIsLoading(true);
      setProducts([]); // Clear products immediately
      setHasFetchedProducts(false);
      fetchAllProducts(selectedCategory, selectedLocation, null).then((response) => {
        const activeProducts = response.filter(p => p.store && p.store.vendorStatus !== 'inactive' && p.store.vendorStatus !== 'private');
        setProducts(activeProducts);
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
      {appConfigs?.[0]?.banners?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 my-6">
          <BannerCarousel appConfigs={appConfigs} />
        </div>
      )}

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
            <img src={noDataFound} alt="Please select a location" className="w-48 h-48 mx-auto mb-6" loading="lazy" />
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
            <img src={noDataFound} alt="No Products Found" className="w-48 h-48 mx-auto mb-6" loading="lazy" />
            <h2 className="text-2xl font-medium mb-2">{noProductsMessage}</h2>
            <p className="text-gray-600 mb-6">Please try selecting a different category or location.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default HomePage;
