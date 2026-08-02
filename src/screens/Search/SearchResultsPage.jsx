import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import 'react-virtualized/styles.css';
import noDataFound from '../../assets/images/noDataFound@3x.png';
import { searchProducts } from '../../services/productService';
import useDebounce from '../../hooks/useDebounce';
import VirtualizedProductGrid from '../../components/common/VirtualizedProductGrid';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  
  const query = searchParams.get('q') || '';
  const debouncedQuery = useDebounce(query, 300);

  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (debouncedQuery) {
      setIsLoading(true);
      setProducts([]);
      searchProducts(null, null, debouncedQuery).then((response) => {
        const activeProducts = response.filter(p => {
          const status = p.store?.vendorStatus?.toLowerCase();
          return status !== 'inactive' && status !== 'private';
        });
        setProducts(activeProducts);
        setIsLoading(false);
      });
    } else {
      setProducts([]);
    }
  }, [debouncedQuery]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">
          Search results for: <span className="text-primaryButtonBackgroundColor">{query}</span>
        </h1>
        
        <div>
          {products.length > 0 || isLoading ? (
            <VirtualizedProductGrid
              products={products}
              isLoading={isLoading}
            />
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
