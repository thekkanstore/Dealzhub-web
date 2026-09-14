
import React, { memo, useState } from 'react';
import { Heart } from 'lucide-react';

const ProductCard = memo(({ product, isFavorite, toggleFavorite, viewProduct, addToCart }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
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
      className={`bg-white rounded-2xl p-3 transition-all duration-300 relative border border-gray-100 ${isUnavailable ? 'opacity-50' : 'hover:shadow-lg hover:border-gray-200 cursor-pointer'}`}
      onClick={handleCardClick}
    >
      {isUnavailable && (
        <div className="absolute inset-0 flex top-2/10 justify-center rounded-2xl z-10 pointer-events-none">
          <span className="text-red-600 font-bold px-3 py-1.5 rounded-xl bg-white border border-red-600 h-fit text-xs sm:text-sm">{statusText}</span>
        </div>
      )}
      <button
        className="absolute top-5 right-5 z-20 cursor-pointer p-1.5 rounded-full bg-white/70 backdrop-blur-xs hover:bg-white transition-colors"
        onClick={handleFavoriteClick}
        aria-label="Toggle favorite"
      >
        <Heart
          className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform active:scale-90 ${isFavorite(product.id)
            ? 'fill-favoritesSelectedColor text-favoritesSelectedColor'
            : 'text-favoriteUnselectedColor fill-favoriteUnselectedColor'
            }`}
        />
      </button>
      <div>
        <div className="w-full h-44 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden relative">
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          )}
          <img
            src={productImage}
            alt={product.name}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
            className={`w-full h-full object-cover rounded-2xl transition-all duration-300 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
            loading="lazy"
          />
        </div>
        <h3 className="font-semibold text-sm my-2 line-clamp-2 text-gray-800">{product.name}</h3>
        <div className="mb-2">
          {product.store && product.store.storeName && (
            <div className="flex items-center gap-1.5 mb-2">
              {product.store.logoUrl || product.store.logo ? (
                <img
                  src={product.store.logoUrl || product.store.logo}
                  alt={product.store.storeName}
                  className="w-4 h-4 rounded-full object-cover shrink-0 border border-gray-200"
                  loading="lazy"
                />
              ) : null}
              <p className="text-xs text-gray-500 truncate">From: {product.store.storeName}</p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 line-through">
              ₹{product.actualPrice}
            </span>
            <span className="text-sm font-semibold text-emerald-800">₹{product.discountPrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductCard;