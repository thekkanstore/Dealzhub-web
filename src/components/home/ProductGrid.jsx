import React from 'react';
import type { IProduct } from '../../config/common';
import ProductCard from './ProductCard';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

interface ProductGridProps {
  products: IProduct[];
}

const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const { isFavorite, toggleFavorite, addToCart } = useAppContext();
  const navigate = useNavigate();

  const viewProduct = (product: IProduct) => {
    navigate(`/product/${product.id}`);
  };

  return (
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
  );
};

export default ProductGrid;
