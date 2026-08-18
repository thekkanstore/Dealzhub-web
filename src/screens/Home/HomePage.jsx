import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import 'react-virtualized/styles.css';
import noDataFound from '../../assets/images/noDataFound@3x.png';
import { useAppContext } from '../../context/AppContext';
import { fetchAllProducts } from '../../services/productService';
import CategoryScroller from '../../components/common/CategoryScroller';
import VirtualizedProductGrid from '../../components/common/VirtualizedProductGrid';
import BannerCarousel from '../../components/home/BannerCarousel';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const HomePage = () => {
  console.log('Rendering HomePage');
  const { categories, selectedLocation, appConfigs } = useAppContext();

  const [selectedCategory, setSelectedCategory] = useState(null);

  // Local state for pagination
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasFetchedProducts, setHasFetchedProducts] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const observerTarget = useRef(null);
  const isFetchingRef = useRef(false);
  const lastDocRef = useRef(null);

  const categoryRef = useRef(selectedCategory);
  const locationRef = useRef(selectedLocation);

  useEffect(() => {
    categoryRef.current = selectedCategory;
    locationRef.current = selectedLocation;
  }, [selectedCategory, selectedLocation]);

  // Effect for fetching data when filters change
  useEffect(() => {
    setIsLoading(true);
    setProducts([]); // Clear products immediately
    setLastDoc(null);
    lastDocRef.current = null;
    setHasMore(false);
    setHasFetchedProducts(false);
    isFetchingRef.current = false;

    fetchAllProducts(selectedCategory, selectedLocation, null, 12, null).then((response) => {
      const activeProducts = response.products.filter(p => {
        const status = p.store?.vendorStatus?.toLowerCase();
        return status !== 'inactive' && status !== 'private';
      });
      setProducts(activeProducts);
      setLastDoc(response.lastDoc);
      lastDocRef.current = response.lastDoc;
      setHasMore(response.hasMore);
      setIsLoading(false);
      setHasFetchedProducts(true);
    });
  }, [selectedCategory, selectedLocation]);

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore || isLoading || isFetchingRef.current) return;

    const currentCategory = selectedCategory;
    const currentLocation = selectedLocation;

    isFetchingRef.current = true;
    setIsLoadingMore(true);

    fetchAllProducts(selectedCategory, selectedLocation, null, 12, lastDocRef.current).then((response) => {
      if (categoryRef.current !== currentCategory || locationRef.current !== currentLocation) {
        isFetchingRef.current = false;
        setIsLoadingMore(false);
        return;
      }
      const activeProducts = response.products.filter(p => {
        const status = p.store?.vendorStatus?.toLowerCase();
        return status !== 'inactive' && status !== 'private';
      });
      setProducts(prev => [...prev, ...activeProducts]);
      setLastDoc(response.lastDoc);
      lastDocRef.current = response.lastDoc;
      setHasMore(response.hasMore);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }).catch((err) => {
      console.error(err);
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    });
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoading) {
          handleLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoadingMore, isLoading, lastDoc]);

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
          <>
            <VirtualizedProductGrid
              products={products}
              isLoading={isLoading}
            />
            {hasMore && (
              <div ref={observerTarget} className="flex justify-center mt-8 min-h-[50px]">
                {isLoadingMore && <LoadingSpinner />}
              </div>
            )}
          </>
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
