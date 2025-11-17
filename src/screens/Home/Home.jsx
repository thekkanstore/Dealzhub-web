import React, { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const Home = () => {
  const navigate = useNavigate();
  const { cart, favorites, addToCart, toggleFavorite, isFavorite, removeFromCart, updateQuantity, getTotalPrice, getTotalDiscount, products, categories, banners } = useAppContext();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const viewProduct = (product) => {
    setSelectedProduct(product);
    navigate(`/product/${product.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet context={{
        categories,
        banners,
        products,
        cart,
        favorites,
        selectedProduct,
        setSelectedProduct,
        searchQuery,
        setSearchQuery,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleFavorite,
        isFavorite,
        viewProduct,
        getTotalPrice,
        getTotalDiscount,
        navigateTo: navigate
      }} />
    </div>
  );
};

export default Home;

