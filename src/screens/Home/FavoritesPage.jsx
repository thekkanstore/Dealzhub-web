import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/home/ProductCard';
import noDataFound from '../../assets/images/noDataFound@3x.png';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getProductById } from '../../services/productService';
import { ProductGridSkeleton } from '../../components/common/SkeletonLoader';

const FavoritesPage = () => {
  const { favorites, toggleFavorite, isFavorite, addToCart } = useAppContext();
  const navigate = useNavigate();
  const [favoriteProducts, setFavoriteProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadFavorites = async () => {
      if (!favorites || favorites.length === 0) {
        setFavoriteProducts([]);
        return;
      }

      setLoading(true);
      try {
        const fetched = await Promise.all(favorites.map((id) => getProductById(id)));
        if (isMounted) {
          setFavoriteProducts(fetched.filter(Boolean));
        }
      } catch (err) {
        console.error('Error fetching favorites:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadFavorites();

    return () => {
      isMounted = false;
    };
  }, [favorites]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">My Favorites ({favoriteProducts.length})</h1>
        {loading ? (
          <ProductGridSkeleton count={6} />
        ) : favoriteProducts.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <img src={noDataFound} alt="No Favorites" className="w-48 h-48 mx-auto mb-6" loading="lazy" />
            <h2 className="text-2xl font-medium mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">Add items you love to see them here</p>
            <div className='w-full flex items-center justify-center'>
              <button
                onClick={() => navigate('/home')}
                className="p-2 bg-primaryButtonBackgroundColor gap-2 rounded-full w-4/12 flex items-center justify-center text-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {favoriteProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
                viewProduct={(product) => navigate(`/product/${product.id}`)}
                addToCart={addToCart}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
