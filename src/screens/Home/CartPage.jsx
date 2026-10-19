import React, { useState, useMemo } from 'react';
import noDataFound from '../../assets/images/noDataFound@3x.png';
import { Minus, Plus, Trash2, ArrowRight, MessageSquare, ShoppingBag, ShieldCheck, Store as StoreIcon, ExternalLink } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from '../../utils/toast';

const CartPage = () => {
  const { 
    storeCarts, 
    getStoreCartTotals, 
    updateStoreCartQuantity, 
    removeFromStoreCart, 
    clearStoreCart 
  } = useAppContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramStoreId = searchParams.get('storeId');

  // Filter stores that have at least 1 item in cart
  const activeStoresWithItems = useMemo(() => {
    return Object.entries(storeCarts)
      .filter(([_, items]) => Array.isArray(items) && items.length > 0)
      .map(([sId, items]) => {
        const firstItem = items[0] || {};
        const storeInfo = firstItem.store || {};
        return {
          id: sId,
          storeName: storeInfo.storeName || firstItem.storeName || 'Local Store',
          storeLogo: storeInfo.logoUrl || storeInfo.logo || storeInfo.imageUrl || '',
          phoneNumber: storeInfo.phoneNumber || storeInfo.phone || '',
          slug: storeInfo.slug || '',
          items,
        };
      });
  }, [storeCarts]);

  const [selectedStoreId, setSelectedStoreId] = useState(() => {
    if (paramStoreId) return paramStoreId;
    return activeStoresWithItems.length > 0 ? activeStoresWithItems[0].id : '';
  });

  // Sync selected store if list changes
  const currentActiveStore = useMemo(() => {
    const found = activeStoresWithItems.find(s => s.id === selectedStoreId);
    return found || activeStoresWithItems[0] || null;
  }, [activeStoresWithItems, selectedStoreId]);

  const currentStoreId = currentActiveStore?.id || '';
  const currentItems = currentActiveStore?.items || [];
  const { totalCount, totalPrice, totalDiscount } = getStoreCartTotals(currentStoreId);

  const handleWhatsAppCheckout = (targetStore = currentActiveStore) => {
    if (!targetStore || !targetStore.items || targetStore.items.length === 0) {
      toast.warning('Cart is empty.');
      return;
    }

    const storePhone = targetStore.phoneNumber;
    if (!storePhone) {
      toast.warning("The store's phone number is not available for WhatsApp order.");
      return;
    }

    let cleanedPhoneNumber = storePhone.replace(/\D/g, '');
    if (cleanedPhoneNumber.length === 10) {
      cleanedPhoneNumber = '91' + cleanedPhoneNumber;
    }

    const totals = getStoreCartTotals(targetStore.id);

    const itemsManifest = targetStore.items.map((item, index) => {
      const sizeStr = item.selectedSize ? ` [Size: ${item.selectedSize}]` : '';
      const weightStr = item.selectedWeight ? ` (${item.selectedWeight})` : '';
      const qtyStr = `x${item.quantity || item.cartQuantity || 1}`;
      const itemPrice = item.itemTotalPrice || (item.unitPrice * (item.quantity || 1));
      return `${index + 1}. ${item.name}${sizeStr}${weightStr} ${qtyStr} = ₹${itemPrice}`;
    }).join('\n');

    const storeLink = targetStore.slug 
      ? `https://dealzhub.co.in/shop/${targetStore.slug}` 
      : `https://dealzhub.co.in/vendor/${targetStore.id}`;

    const manifest = `🛒 *New Order from DealzHub*\n🏪 *Store:* ${targetStore.storeName}\n\n*Selected Items:*\n${itemsManifest}\n\n--------------------------------\n🔢 *Total Items:* ${totals.totalCount}\n💵 *Total Amount:* ₹${totals.totalPrice}\n--------------------------------\n\n🔗 *Store Link:* ${storeLink}\n\nPlease confirm availability and payment details. Thank you!`;

    const encoded = encodeURIComponent(manifest);
    window.open(`https://wa.me/${cleanedPhoneNumber}?text=${encoded}`, '_blank');
    toast.success('Opening WhatsApp to complete your order!');
  };

  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Shop Carts</h1>
            <p className="text-sm text-gray-500 mt-1">
              {activeStoresWithItems.length === 0
                ? 'Your store carts are empty'
                : `You have active carts in ${activeStoresWithItems.length} ${activeStoresWithItems.length === 1 ? 'store' : 'stores'}`}
            </p>
          </div>

          {activeStoresWithItems.length > 0 && (
            <button
              onClick={() => navigate('/home')}
              className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors self-start sm:self-auto cursor-pointer"
            >
              Continue Shopping <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {activeStoresWithItems.length === 0 ? (
          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-12 text-center border border-gray-100 shadow-xs max-w-lg mx-auto">
            <img src={noDataFound} alt="Empty Cart" className="w-40 h-40 sm:w-44 sm:h-44 mx-auto mb-6 object-contain" loading="lazy" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6 text-sm sm:text-base">
              Visit local shops on DealzHub and add items to your store cart.
            </p>
            <div className="w-full flex items-center justify-center px-4">
              <button
                onClick={() => navigate('/home')}
                className="w-full max-w-xs sm:w-auto px-8 py-3.5 bg-primaryButtonBackgroundColor text-white font-semibold text-sm sm:text-base rounded-full shadow-sm hover:shadow-md hover:bg-[#427256] transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                Explore Stores
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* Store Tabs (if user has carts across multiple stores) */}
            {activeStoresWithItems.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {activeStoresWithItems.map((store) => {
                  const isSelected = store.id === currentStoreId;
                  const storeTotals = getStoreCartTotals(store.id);
                  return (
                    <button
                      key={store.id}
                      onClick={() => setSelectedStoreId(store.id)}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <StoreIcon className="w-4 h-4" />
                      <span>{store.storeName}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {storeTotals.totalCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Selected Store Active Cart View */}
            {currentActiveStore && (
              <div className="grid lg:grid-cols-3 gap-8 items-start">
                
                {/* Cart Items List */}
                <div className="lg:col-span-2 space-y-4">
                  
                  {/* Store Info Banner */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {currentActiveStore.storeLogo ? (
                        <img
                          src={currentActiveStore.storeLogo}
                          alt={currentActiveStore.storeName}
                          className="w-10 h-10 rounded-xl object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                          {currentActiveStore.storeName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h2 className="font-bold text-gray-900 text-base">
                          {currentActiveStore.storeName}
                        </h2>
                        <p className="text-xs text-gray-500">
                          {currentItems.length} {currentItems.length === 1 ? 'item' : 'items'} in this store cart
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/vendor/${currentActiveStore.id}`)}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                      >
                        Visit Store <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Clear all items from ${currentActiveStore.storeName} cart?`)) {
                            clearStoreCart(currentActiveStore.id);
                          }
                        }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Items */}
                  {currentItems.map((item, index) => {
                    const itemImg = (item.images && item.images.length > 0 ? item.images[0] : item.image) || 'https://dealzhub.co.in/appLogo@2x.png';
                    const qty = item.quantity || item.cartQuantity || 1;
                    const unitPrice = item.unitPrice !== undefined ? item.unitPrice : (item.discountPrice || item.price || 0);
                    const itemTotal = item.itemTotalPrice || (unitPrice * qty);

                    return (
                      <div
                        key={`${item.id}-${item.selectedSize || ''}-${item.selectedWeight || ''}-${index}`}
                        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-5 transition-all hover:border-gray-200"
                      >
                        {/* Image */}
                        <div
                          onClick={() => navigate(`/product/${item.id}`)}
                          className="w-full sm:w-28 h-28 bg-gray-100 rounded-xl overflow-hidden shrink-0 cursor-pointer"
                        >
                          <img
                            src={itemImg}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                            loading="lazy"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3
                                  onClick={() => navigate(`/product/${item.id}`)}
                                  className="font-bold text-base text-gray-900 hover:text-emerald-700 cursor-pointer line-clamp-2"
                                >
                                  {item.name}
                                </h3>
                              </div>

                              <button
                                onClick={() => removeFromStoreCart(currentStoreId, item.id, item.selectedSize, item.selectedWeight)}
                                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.selectedSize && (
                                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-800 rounded-md border border-gray-200">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                              {item.selectedWeight && (
                                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-200">
                                  Package: {item.selectedWeight}
                                </span>
                              )}
                              {!item.selectedWeight && item.unit && item.unit.toLowerCase() !== 'pcs' && (
                                <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-50 rounded-md border border-gray-200/60">
                                  Unit: {item.unitValue && item.unitValue !== 1 ? `${item.unitValue} ` : ''}{item.unit}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stepper & Total */}
                          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                            <div className="flex items-center gap-2.5">
                              <button
                                type="button"
                                onClick={() => updateStoreCartQuantity(currentStoreId, item.id, qty - 1, item.selectedSize, item.selectedWeight)}
                                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                              >
                                <Minus className="w-3 h-3 text-gray-600" />
                              </button>
                              <span className="text-sm font-bold text-gray-900 w-5 text-center">{qty}</span>
                              <button
                                type="button"
                                onClick={() => updateStoreCartQuantity(currentStoreId, item.id, qty + 1, item.selectedSize, item.selectedWeight)}
                                className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                              >
                                <Plus className="w-3 h-3 text-gray-600" />
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="text-base font-extrabold text-gray-900">
                                ₹{itemTotal.toLocaleString()}
                              </div>
                              {qty > 1 && (
                                <div className="text-[11px] text-gray-400">
                                  ₹{unitPrice.toLocaleString()} each
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Summary & WhatsApp Button */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs sticky top-24 space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Order Summary
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      for {currentActiveStore.storeName}
                    </p>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Total Items ({totalCount})</span>
                      <span className="font-semibold text-gray-900">₹{(totalPrice + totalDiscount).toLocaleString()}</span>
                    </div>

                    {totalDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Discount Savings</span>
                        <span>-₹{totalDiscount.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-600">
                      <span>Estimated Delivery</span>
                      <span className="text-xs text-gray-500 italic">Confirmed by store</span>
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                      <span className="text-base font-bold text-gray-900">Total Amount</span>
                      <span className="text-2xl font-extrabold text-gray-900">₹{totalPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 text-xs text-emerald-800 text-center font-semibold">
                      🎉 You are saving ₹{totalDiscount.toLocaleString()} on this store order!
                    </div>
                  )}

                  {/* Order via WhatsApp */}
                  <button
                    onClick={() => handleWhatsAppCheckout(currentActiveStore)}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-5 h-5 fill-current" />
                    Buy Entire Cart via WhatsApp
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Direct WhatsApp checkout with verified store</span>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};

export default CartPage;
