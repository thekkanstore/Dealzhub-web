import React, { useEffect } from 'react';
import { X, Trash2, Plus, Minus, MessageSquare, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { toast } from '../../utils/toast';

const StoreCartDrawer = ({
  store,
  isOpen,
  onClose,
}) => {
  const {
    getStoreCart,
    getStoreCartTotals,
    updateStoreCartQuantity,
    removeFromStoreCart,
    clearStoreCart,
  } = useAppContext();

  const storeId = store?.id || '';
  const cartItems = getStoreCart(storeId);
  const { totalCount, totalPrice, totalDiscount } = getStoreCartTotals(storeId);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const storeName = store?.storeName || 'Shop';
  const storeLogo = store?.logoUrl || store?.logo || store?.storeLogo || store?.imageUrl || '';
  const storePhone = store?.phoneNumber || store?.phone || '';
  const storeSlug = store?.slug || '';

  const handleWhatsAppCheckout = () => {
    if (cartItems.length === 0) {
      toast.warning('Your cart is empty.');
      return;
    }

    if (!storePhone) {
      toast.warning("The store's phone number is not available for WhatsApp order.");
      return;
    }

    let cleanedPhoneNumber = storePhone.replace(/\D/g, '');
    if (cleanedPhoneNumber.length === 10) {
      cleanedPhoneNumber = '91' + cleanedPhoneNumber;
    }

    const itemsManifest = cartItems.map((item, index) => {
      const sizeStr = item.selectedSize ? ` [Size: ${item.selectedSize}]` : '';
      const weightStr = item.selectedWeight ? ` (${item.selectedWeight})` : '';
      const qtyStr = `x${item.quantity || item.cartQuantity || 1}`;
      const itemPrice = item.itemTotalPrice || (item.unitPrice * (item.quantity || 1));
      return `${index + 1}. ${item.name}${sizeStr}${weightStr} ${qtyStr} = ₹${itemPrice}`;
    }).join('\n');

    const storeLink = storeSlug 
      ? `https://dealzhub.co.in/shop/${storeSlug}` 
      : (storeId ? `https://dealzhub.co.in/vendor/${storeId}` : 'https://dealzhub.co.in');

    const message = `🛒 *New Order from DealzHub*\n🏪 *Store:* ${storeName}\n\n*Selected Items:*\n${itemsManifest}\n\n--------------------------------\n🔢 *Total Items:* ${totalCount}\n💵 *Total Amount:* ₹${totalPrice}\n--------------------------------\n\n🔗 *Store Link:* ${storeLink}\n\nPlease confirm product availability, payment, and delivery details. Thank you!`;

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${cleanedPhoneNumber}?text=${encoded}`;
    window.open(whatsappUrl, '_blank');
    toast.success('Redirecting to WhatsApp to complete your order!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
            <div className="flex items-center gap-3 min-w-0">
              {storeLogo ? (
                <img
                  src={storeLogo}
                  alt={storeName}
                  className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-sm">
                  {storeName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <h2 className="text-base font-bold text-gray-900 truncate">
                  {storeName} Cart
                </h2>
                <p className="text-xs text-gray-500">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} ({totalCount} total)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Your store cart is empty</h3>
                  <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">
                    Explore products from {storeName} and add them to your cart.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-full shadow-sm transition-all"
                >
                  Browse Store Items
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 text-xs text-gray-500">
                  <span>Store Items</span>
                  <button
                    onClick={() => {
                      if (window.confirm(`Clear all items from ${storeName} cart?`)) {
                        clearStoreCart(storeId);
                      }
                    }}
                    className="text-red-500 hover:text-red-700 font-medium cursor-pointer"
                  >
                    Clear cart
                  </button>
                </div>

                <div className="space-y-3">
                  {cartItems.map((item, index) => {
                    const itemImg = (item.images && item.images.length > 0 ? item.images[0] : item.image) || 'https://dealzhub.co.in/appLogo@2x.png';
                    const qty = item.quantity || item.cartQuantity || 1;
                    const unitPrice = item.unitPrice !== undefined ? item.unitPrice : (item.discountPrice || item.price || 0);
                    const itemTotal = item.itemTotalPrice || (unitPrice * qty);

                    return (
                      <div
                        key={`${item.id}-${item.selectedSize || ''}-${item.selectedWeight || ''}-${index}`}
                        className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-2xs hover:border-gray-200 transition-all flex gap-3.5"
                      >
                        {/* Image */}
                        <img
                          src={itemImg}
                          alt={item.name}
                          className="w-18 h-18 rounded-xl object-cover border border-gray-100 shrink-0 bg-gray-50"
                        />

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-1">
                              <h4 className="text-sm font-semibold text-gray-900 truncate">
                                {item.name}
                              </h4>
                              <button
                                onClick={() => removeFromStoreCart(storeId, item.id, item.selectedSize, item.selectedWeight)}
                                className="text-gray-400 hover:text-red-600 p-1 rounded-md transition-colors shrink-0"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Options */}
                            <div className="flex flex-wrap gap-1.5 mt-1">
                              {item.selectedSize && (
                                <span className="text-[10px] font-medium bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                  Size: {item.selectedSize}
                                </span>
                              )}
                              {item.selectedWeight && (
                                <span className="text-[10px] font-medium bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-100">
                                  Pack: {item.selectedWeight}
                                </span>
                              )}
                              {!item.selectedWeight && item.unit && item.unit.toLowerCase() !== 'pcs' && (
                                <span className="text-[10px] text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded">
                                  {item.unitValue && item.unitValue !== 1 ? `${item.unitValue} ` : ''}{item.unit}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Stepper & Price */}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => updateStoreCartQuantity(storeId, item.id, qty - 1, item.selectedSize, item.selectedWeight)}
                                className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer text-gray-600"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="text-xs font-bold text-gray-900 w-4 text-center">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateStoreCartQuantity(storeId, item.id, qty + 1, item.selectedSize, item.selectedWeight)}
                                className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer text-gray-600"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="text-right">
                              <span className="text-sm font-bold text-gray-900">
                                ₹{itemTotal.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer & WhatsApp Checkout */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-gray-50/80 space-y-4">
              {/* Order Bill Summary */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({totalCount} items)</span>
                  <span className="font-semibold text-gray-900">₹{(totalPrice + totalDiscount).toLocaleString()}</span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount Savings</span>
                    <span>-₹{totalDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="italic text-gray-500">Confirmed on WhatsApp</span>
                </div>

                <div className="pt-2 border-t border-gray-200 flex justify-between items-baseline text-sm">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-extrabold text-gray-900">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              {/* Order Button */}
              <button
                type="button"
                onClick={handleWhatsAppCheckout}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer text-sm"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
                <span>Buy via WhatsApp</span>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Direct order to {storeName} owner via WhatsApp</span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default StoreCartDrawer;
