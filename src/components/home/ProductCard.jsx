
import React, { memo, useState } from 'react';
import { Heart, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const ProductCard = memo(({ product, isFavorite, toggleFavorite, viewProduct, addToCart, showCart = false }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { activeStore, addToStoreCart, updateStoreCartQuantity, getStoreCart } = useAppContext();
  
  const statusText = product.isSoldOut ? 'SOLD OUT' : (product.isOutOfStock ? 'OUT OF STOCK' : '');
  const isUnavailable = !!statusText;
  
  // Use product.images[0] if available, otherwise fallback to product.image
  const productImage = product.images && product.images.length > 0 ? product.images[0] : product.image;

  const targetStoreId = product.storeId || product.store?.id || (activeStore && activeStore.id) || '';
  const canShowCart = Boolean(showCart && targetStoreId && !isUnavailable);
  const storeCart = canShowCart ? getStoreCart(targetStoreId) : [];
  const cartItem = storeCart.find(item => (item.productId || item.id) === product.id);
  const qtyInCart = cartItem ? (cartItem.quantity || cartItem.cartQuantity || 1) : 0;
  
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
      className={`bg-white rounded-2xl p-3 transition-all duration-300 relative border border-gray-100 flex flex-col justify-between ${isUnavailable ? 'opacity-50' : 'hover:shadow-lg hover:border-gray-200 cursor-pointer'}`}
      onClick={handleCardClick}
    >
      {isUnavailable && (
        <div className="absolute inset-0 flex top-2/10 justify-center rounded-2xl z-10 pointer-events-none">
          <span className="text-red-600 font-bold px-3 py-1.5 rounded-xl bg-white border border-red-600 h-fit text-xs sm:text-sm">{statusText}</span>
        </div>
      )}
      <button
        className="absolute top-5 right-5 z-20 cursor-pointer p-1.5 rounded-full bg-white/70 backdrop-blur-xs hover:bg-white transition-colors shadow-2xs"
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
        <div>
          {product.store && product.store.storeName && (
            <div className="flex items-center gap-1.5 mb-1.5">
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
          
          {product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0 && (
            <div className="mt-1 flex items-center gap-1 flex-wrap">
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded px-1.5 py-0.5">
                Sizes: {product.sizes.slice(0, 3).join(', ')}{product.sizes.length > 3 ? ' +' : ''}
              </span>
            </div>
          )}
          {product.weightOptions && Array.isArray(product.weightOptions) && product.weightOptions.length > 0 && (
            <div className="mt-1 flex items-center gap-1 flex-wrap">
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/60 rounded px-1.5 py-0.5">
                Packs: {product.weightOptions.slice(0, 2).join(', ')}{product.weightOptions.length > 2 ? ' +' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer: Price & Store Cart Button */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
        <div className="flex items-baseline gap-1.5 flex-wrap">
          {product.actualPrice > product.discountPrice && (
            <span className="text-[11px] text-gray-400 line-through">
              ₹{product.actualPrice}
            </span>
          )}
          <span className="text-sm font-bold text-emerald-800">
            ₹{product.discountPrice}
          </span>
          {product.unit && product.unit.toLowerCase() !== 'pcs' && (
            <span className="text-[10px] text-gray-500 font-medium">
              /{product.unitValue && parseFloat(product.unitValue) !== 1 ? ` ${product.unitValue} ` : ' '}
              {product.unit}
            </span>
          )}
        </div>

        {/* Shop-level Add to cart / Stepper */}
        {canShowCart && (
          <div onClick={(e) => e.stopPropagation()}>
            {qtyInCart > 0 ? (
              <div className="flex items-center bg-emerald-50 border border-emerald-300 rounded-full px-2 py-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStoreCartQuantity(targetStoreId, product.id, qtyInCart - 1, cartItem.selectedSize, cartItem.selectedWeight);
                  }}
                  className="w-4 h-4 flex items-center justify-center text-emerald-700 hover:text-emerald-900 font-bold text-xs"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-2.5 h-2.5" />
                </button>
                <span className="text-xs font-bold text-emerald-800 px-1.5 min-w-[16px] text-center">
                  {qtyInCart}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateStoreCartQuantity(targetStoreId, product.id, qtyInCart + 1, cartItem.selectedSize, cartItem.selectedWeight);
                  }}
                  className="w-4 h-4 flex items-center justify-center text-emerald-700 hover:text-emerald-900 font-bold text-xs"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-2.5 h-2.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if ((product.sizes && product.sizes.length > 0) || (product.weightOptions && product.weightOptions.length > 0)) {
                    viewProduct(product);
                  } else {
                    addToStoreCart(targetStoreId, product);
                  }
                }}
                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-full text-xs font-semibold shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                aria-label="Add to cart"
              >
                <Plus className="w-3 h-3" />
                <span>Add</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default ProductCard;