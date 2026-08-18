import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import 'react-virtualized/styles.css';
import noDataFound from '../../assets/images/noDataFound@3x.png';
import { searchProducts } from '../../services/productService';
import useDebounce from '../../hooks/useDebounce';
import VirtualizedProductGrid from '../../components/common/VirtualizedProductGrid';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  
  const query = searchParams.get('q') || '';
  const debouncedQuery = useDebounce(query, 300);

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const observerTarget = useRef(null);
  const isFetchingRef = useRef(false);
  const lastDocRef = useRef(null);

  const queryRef = useRef(debouncedQuery);

  useEffect(() => {
    queryRef.current = debouncedQuery;
  }, [debouncedQuery]);

  useEffect(() => {
    if (debouncedQuery) {
      setIsLoading(true);
      setProducts([]);
      setLastDoc(null);
      lastDocRef.current = null;
      setHasMore(false);
      isFetchingRef.current = false;
      searchProducts(null, null, debouncedQuery, 12, null).then((response) => {
        const activeProducts = response.products.filter(p => {
          const status = p.store?.vendorStatus?.toLowerCase();
          return status !== 'inactive' && status !== 'private';
        });
        setProducts(activeProducts);
        setLastDoc(response.lastDoc);
        lastDocRef.current = response.lastDoc;
        setHasMore(response.hasMore);
        setIsLoading(false);
      });
    } else {
      setProducts([]);
      setLastDoc(null);
      lastDocRef.current = null;
      setHasMore(false);
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [debouncedQuery]);

  const handleLoadMore = () => {
    if (!hasMore || isLoadingMore || isLoading || isFetchingRef.current) return;

    const currentQuery = debouncedQuery;

    isFetchingRef.current = true;
    setIsLoadingMore(true);

    searchProducts(null, null, debouncedQuery, 12, lastDocRef.current).then((response) => {
      if (queryRef.current !== currentQuery) {
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

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">
          Search results for: <span className="text-primaryButtonBackgroundColor">{query}</span>
        </h1>
        
        <div>
          {products.length > 0 || isLoading ? (
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
          ) : (
            <div className="text-center py-12">
              <img src={noDataFound} alt="No Products Found" className="w-48 h-48 mx-auto mb-6" loading="lazy" />
              <h2 className="text-2xl font-medium mb-2">No products found</h2>
              <p className="text-gray-600">Try a different search term.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
