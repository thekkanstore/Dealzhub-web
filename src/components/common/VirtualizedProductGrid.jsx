import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import 'react-virtualized/styles.css';
import ProductCard from '../home/ProductCard';
import { useAppContext } from '../../context/AppContext';
import LoadingSpinner from './LoadingSpinner';

const VirtualizedProductGrid = React.memo(({
  products,
  isLoading,
}) => {
  const { toggleFavorite, isFavorite, addToCart } = useAppContext();
  const navigate = useNavigate();

  const viewProduct = useCallback((product) => {
    navigate(`/product/${product.id}`, { replace: false });
    
    window.location.href = `/product/${product.id}`;
  }, [navigate]);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            isFavorite={isFavorite}
            toggleFavorite={toggleFavorite}
            viewProduct={viewProduct}
            addToCart={addToCart}
          />
        ))}
      </div>
      {isLoading && <LoadingSpinner />}
    </div>
  );
});

export default VirtualizedProductGrid;