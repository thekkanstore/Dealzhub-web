
import React, { memo } from 'react';
import { Heart, Star } from 'lucide-react';

const ProductCard = memo(({ product, isFavorite, toggleFavorite, viewProduct, addToCart }) => {
  const statusText = product.isSoldOut ? 'SOLD OUT' : (product.isOutOfStock ? 'OUT OF STOCK' : '');
  const isUnavailable = !!statusText;
  
  // Use product.images[0] if available, otherwise fallback to product.image
  const productImage = product.images && product.images.length > 0 ? product.images[0] : product.image;
  
  const handleCardClick = (e) => {
    if (!isUnavailable) {
      viewProduct(product);
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (!isUnavailable) {
      toggleFavorite(product);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg p-3 transition-shadow relative ${isUnavailable ? 'opacity-50' : 'hover:shadow-lg cursor-pointer'}`}
      onClick={handleCardClick}
    >
      {isUnavailable && (
        <div className="absolute inset-0 flex top-2/10 justify-center rounded-lg z-10 pointer-events-none">
          <span className="text-red-600 font-bold px-4 py-2 rounded-xl bg-white border border-red-600 h-fit">{statusText}</span>
        </div>
      )}
      <button
        className="absolute top-5 right-5 z-20"
        onClick={handleFavoriteClick}
      >
        <Heart
          className={`w-5 h-5 ${isFavorite(product.id)
            ? 'fill-favoritesSelectedColor text-favoritesSelectedColor'
            : 'text-favoriteUnselectedColor fill-favoriteUnselectedColor'
            }`}
        />
      </button>
      <div>
        <div className="w-full h-44 bg-gray-200 rounded-3xl flex items-center justify-center overflow-hidden">
          <img
            src={productImage}
            alt={product.name}
            className="w-full h-full object-cover rounded-3xl transition-opacity duration-300"
            loading="lazy"
            onLoad={(e) => (e.currentTarget.style.opacity = '1')}
            style={{ opacity: 0 }}
          />
        </div>
        <h3 className="font-semibold text-sm my-2 line-clamp-2">{product.name}</h3>
        <div className="mb-2">
          {product.store && product.store.storeName && (
            <p className="text-xs text-gray-500 mb-2">From: {product.store.storeName}</p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 line-through">
              ₹{product.actualPrice}
            </span>
            <span className="text-sm font-semibold">₹{product.discountPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;