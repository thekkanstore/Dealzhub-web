import React, { useState, useEffect, useMemo } from 'react';
import { Star, Heart, ChevronLeft, ChevronRight, ArrowLeft, Package, Minus, Plus, Shirt, ShoppingCart, ArrowRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { getProductById, deleteProduct } from '../../services/productService';
import { TKArrowIcon } from '../../components/common/Icons/TKArrowIcon';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ProductPageSkeleton } from '../../components/common/SkeletonLoader';
import { getSubCategories } from '../../services/subcategoryService';
import SEO from '../../components/common/SEO';
import { calculateScaledPrice, getProductWeightOptions } from '../../utils/measurementUtils';
import { toast } from '../../utils/toast';
import StoreCartDrawer from '../../components/cart/StoreCartDrawer';

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { 
    isInCart, 
    toggleFavorite, 
    isFavorite, 
    user, 
    addToStoreCart,
    getStoreCartCount,
    getStoreCartTotals,
    isItemInStoreCart,
    setLoginModalOpen, 
    setOnLoginModalContinue 
  } = useAppContext();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [resolvedSubCategoryNames, setResolvedSubCategoryNames] = useState([]);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Sizing & Measurement states
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Check if current user owns this product
  const isProductOwner = useMemo(() => {
    if (!user || !selectedProduct) return false;
    const currentUserId = user?.uid || user?.providerData?.[0]?.uid;
    return selectedProduct.userId === currentUserId || 
           (user.uid && selectedProduct.userId === user.uid) || 
           (user.providerData?.[0]?.uid && selectedProduct.userId === user.providerData[0].uid);
  }, [user, selectedProduct]);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        if (productId) {
          const product = await getProductById(productId);
          if (!isMounted) return;

          setSelectedProduct(product);
          setCurrentImageIndex(0);
          setQuantity(1);

          if (product.sizes && Array.isArray(product.sizes) && product.sizes.length > 0) {
            setSelectedSize(product.sizes[0]);
          } else {
            setSelectedSize('');
          }

          const isWeight = ['kg', 'g', 'ltr', 'ml'].includes((product.unit || '').toLowerCase()) || 
                           (product.weightOptions && product.weightOptions.length > 0);
          if (isWeight) {
            const options = getProductWeightOptions(product);
            setSelectedWeight(options[0] || null);
          } else {
            setSelectedWeight(null);
          }
          
          if (product && product.storeId && product.categoryId) {
            try {
              const activeSubs = await getSubCategories(product.storeId, product.categoryId);
              if (!isMounted) return;

              const resolved = product.subcategoryIds
                ? product.subcategoryIds
                    .map(id => activeSubs.find(sub => sub.id === id || sub.matchedIds?.includes(id))?.name)
                    .filter(Boolean)
                : [];
              setResolvedSubCategoryNames(resolved);
            } catch (error) {
              console.error('Error fetching subcategories for product:', error);
              if (isMounted) setResolvedSubCategoryNames([]);
            }
          } else {
            if (isMounted) setResolvedSubCategoryNames([]);
          }
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    if (window.confirm('Are you sure you want to permanently delete this product? This action cannot be undone.')) {
      try {
        const result = await deleteProduct(selectedProduct);
        if (result.success) {
          toast.success('Product deleted successfully!');
          navigate(selectedProduct.storeId ? `/vendor/${selectedProduct.storeId}` : '/home');
        } else {
          toast.error(result.message || 'Failed to delete product.');
        }
      } catch (error) {
        console.error('Error in handleDeleteProduct:', error);
        toast.error('Failed to delete product.');
      }
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (selectedProduct?.storeId) {
      navigate(`/vendor/${selectedProduct.storeId}`);
    } else {
      navigate('/home');
    }
  };

  const isWeightOrVolume = useMemo(() => {
    return ['kg', 'g', 'ltr', 'ml'].includes((selectedProduct?.unit || '').toLowerCase()) ||
           (selectedProduct?.weightOptions && selectedProduct.weightOptions.length > 0);
  }, [selectedProduct]);

  const weightPresets = useMemo(() => {
    if (!selectedProduct || !isWeightOrVolume) return [];
    return getProductWeightOptions(selectedProduct);
  }, [selectedProduct, isWeightOrVolume]);

  const currentDiscountPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    if (isWeightOrVolume && selectedWeight) {
      const firstOpt = weightPresets[0];
      const effectiveBaseValue = firstOpt ? firstOpt.value : (parseFloat(selectedProduct.unitValue) || 1);
      const effectiveBaseUnit = firstOpt ? firstOpt.unit : (selectedProduct.unit || 'pcs');

      return calculateScaledPrice(
        selectedProduct.discountPrice,
        effectiveBaseUnit,
        effectiveBaseValue,
        selectedWeight.value,
        selectedWeight.unit
      ) * quantity;
    }
    return (parseFloat(selectedProduct.discountPrice) || 0) * quantity;
  }, [selectedProduct, isWeightOrVolume, selectedWeight, quantity, weightPresets]);

  const currentActualPrice = useMemo(() => {
    if (!selectedProduct) return 0;
    if (isWeightOrVolume && selectedWeight) {
      const firstOpt = weightPresets[0];
      const effectiveBaseValue = firstOpt ? firstOpt.value : (parseFloat(selectedProduct.unitValue) || 1);
      const effectiveBaseUnit = firstOpt ? firstOpt.unit : (selectedProduct.unit || 'pcs');

      return calculateScaledPrice(
        selectedProduct.actualPrice,
        effectiveBaseUnit,
        effectiveBaseValue,
        selectedWeight.value,
        selectedWeight.unit
      ) * quantity;
    }
    return (parseFloat(selectedProduct.actualPrice) || 0) * quantity;
  }, [selectedProduct, isWeightOrVolume, selectedWeight, quantity, weightPresets]);

  if (loading) {
    return <ProductPageSkeleton />;
  }

  if (!selectedProduct) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primaryButtonBackgroundColor to-emerald-400" />
          <div className="w-20 h-20 bg-[#E5EEE9]/60 border border-[#528E6B]/20 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-xs">
            <Package className="w-10 h-10 text-[#528E6B]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            The product you are looking for is no longer available or may have been removed by the store owner.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/home')}
              className="flex-1 bg-primaryButtonBackgroundColor text-white font-semibold py-3 px-6 rounded-full shadow-sm hover:shadow-md hover:bg-[#427256] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer"
            >
              Browse Products
            </button>
            <button
              onClick={handleBack}
              className="py-3 px-6 bg-secondaryButtonBackgroundColor hover:bg-gray-200 text-gray-800 font-semibold rounded-full border border-gray-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sm cursor-pointer"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusText = selectedProduct.isSoldOut ? 'SOLD OUT' : (selectedProduct.isOutOfStock ? 'OUT OF STOCK' : '');
  const isUnavailable = !!statusText;

  // Determine which images to display
  const rawImages = selectedProduct.images && Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 
    ? selectedProduct.images 
    : (selectedProduct.image ? [selectedProduct.image] : []);
  
  const images = rawImages.filter(img => typeof img === 'string' && img.trim() !== '');
  if (images.length === 0) {
    images.push('https://dealzhub.co.in/appLogo@2x.png');
  }

  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setIsImageLoading(true);
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setIsImageLoading(true);
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleThumbnailClick = (index) => {
    if (index !== currentImageIndex) {
      setIsImageLoading(true);
      setCurrentImageIndex(index);
    }
  };

  const handleBuyNow = () => {
    if (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !selectedSize) {
      toast.warning('Please select a size first.');
      return;
    }

    const storePhoneNumber = selectedProduct.store?.phoneNumber;
    if (storePhoneNumber) {
      let cleanedPhoneNumber = storePhoneNumber.replace(/\D/g, '');
      if (cleanedPhoneNumber.length === 10) {
        cleanedPhoneNumber = '91' + cleanedPhoneNumber;
      }

      const itemDetails = [
        `• Product: ${selectedProduct.name}`,
        selectedSize ? `• Selected Size: ${selectedSize}` : null,
        isWeightOrVolume && selectedWeight ? `• Selected Weight: ${selectedWeight.label}` : null,
        `• Quantity: ${quantity}${!isWeightOrVolume && selectedProduct.unit && selectedProduct.unit.toLowerCase() !== 'pcs' ? ' ' + selectedProduct.unit : ''}`,
        `• Total Price: ₹${currentDiscountPrice}`,
      ].filter(Boolean).join('\n');

      const message = `Hi, I would like to order this item from your store on DealzHub:\n\n${itemDetails}\n\nProduct Link: https://dealzhub.co.in/product/${selectedProduct.id}\n\nPlease confirm availability and payment details!`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanedPhoneNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    } else {
      toast.warning("This store's contact information is not available.");
    }
  };

  const currentStoreId = selectedProduct?.storeId || selectedProduct?.store?.id || '';
  const storeCartCount = currentStoreId ? getStoreCartCount(currentStoreId) : 0;
  const { totalPrice: storeCartTotal } = currentStoreId ? getStoreCartTotals(currentStoreId) : { totalPrice: 0 };
  const isThisItemInCart = currentStoreId ? isItemInStoreCart(currentStoreId, selectedProduct?.id, selectedSize || null) : false;

  const handleAddToCartClick = () => {
    if (selectedProduct.sizes && selectedProduct.sizes.length > 0 && !selectedSize) {
      toast.warning('Please select a size before adding to cart.');
      return;
    }
    addToStoreCart(currentStoreId, selectedProduct, {
      quantity,
      selectedSize: selectedSize || null,
      selectedWeight: isWeightOrVolume ? selectedWeight?.label : null,
      unitPrice: currentDiscountPrice / quantity,
      storeInfo: selectedProduct.store,
    });
    toast.success(`Added to ${selectedProduct.store?.storeName || 'store'} cart!`);
  };

  const primaryImg = images[0] || 'https://dealzhub.co.in/appLogo@2x.png';
  const storeName = selectedProduct.store?.storeName || 'DealzHub Vendor';

  const productSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': `https://dealzhub.co.in/product/${selectedProduct.id}#product`,
        name: selectedProduct.name,
        description: selectedProduct.description || `${selectedProduct.name} from ${storeName} on DealzHub`,
        image: images,
        sku: selectedProduct.id,
        brand: {
          '@type': 'Brand',
          name: storeName,
        },
        offers: {
          '@type': 'Offer',
          url: `https://dealzhub.co.in/product/${selectedProduct.id}`,
          priceCurrency: 'INR',
          price: selectedProduct.discountPrice || selectedProduct.actualPrice || '0',
          priceValidUntil: '2028-12-31',
          itemCondition: selectedProduct.isSecondHand
            ? 'https://schema.org/UsedCondition'
            : 'https://schema.org/NewCondition',
          availability: isUnavailable
            ? 'https://schema.org/OutOfStock'
            : 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: storeName,
          },
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://dealzhub.co.in/home',
          },
          ...(selectedProduct.category?.name
            ? [
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: selectedProduct.category.name,
                  item: `https://dealzhub.co.in/home?category=${selectedProduct.categoryId}`,
                },
              ]
            : []),
          {
            '@type': 'ListItem',
            position: selectedProduct.category?.name ? 3 : 2,
            name: selectedProduct.name,
            item: `https://dealzhub.co.in/product/${selectedProduct.id}`,
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-gray-50/70 overflow-x-hidden">
      <SEO
        title={`${selectedProduct.name} - ₹${selectedProduct.discountPrice}`}
        description={selectedProduct.description ? `${selectedProduct.description.slice(0, 155)}... Buy online at ₹${selectedProduct.discountPrice}` : `Buy ${selectedProduct.name} for ₹${selectedProduct.discountPrice} on DealzHub.`}
        image={images[0]}
        url={`/product/${selectedProduct.id}`}
        type="product"
        schema={productSchema}
      />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <button
          onClick={handleBack}
          className="px-4 py-1.5 mb-4 text-sm cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-secondaryButtonBackgroundColor rounded-full transition-colors w-fit flex items-center gap-1.5"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium text-xs">Back</span>
        </button>
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 border border-gray-100 shadow-sm">
          <div className="w-full min-w-0">
            <div className="relative bg-gray-50 rounded-2xl flex items-center justify-center min-h-[18rem] sm:min-h-[24rem] overflow-hidden">
              {/* Image Loading Skeleton */}
              {isImageLoading && (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-gray-300 border-t-emerald-600 animate-spin opacity-40" />
                </div>
              )}

              {/* Main Image Display */}
              <img 
                src={images[currentImageIndex]} 
                alt={`${selectedProduct.name} - Image ${currentImageIndex + 1}`} 
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
                className={`w-full h-72 sm:h-96 object-contain rounded-2xl transition-all duration-300 ${isImageLoading ? 'opacity-0 scale-98' : 'opacity-100 scale-100'} ${isUnavailable ? 'opacity-50' : ''}`} 
                loading="eager"
              />
              
              {/* Unavailable Overlay */}
              {isUnavailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 rounded-2xl">
                  <span className="text-red-600 font-bold px-4 py-2 rounded-xl bg-white border border-red-600">{statusText}</span>
                </div>
              )}

              {/* Navigation Arrows - Only show if multiple images */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110 cursor-pointer"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {hasMultipleImages && (
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xs">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Navigation - Only show if multiple images */}
            {hasMultipleImages && (
              <div className="flex gap-2.5 mt-4 overflow-x-auto pb-2 max-w-full">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer bg-gray-50 ${
                      currentImageIndex === index 
                        ? 'border-emerald-600 shadow-sm scale-102 ring-2 ring-emerald-600/20' 
                        : 'border-gray-200 hover:border-gray-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`} 
                      className="w-full h-full object-cover"
                      loading='lazy'
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="w-full min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-3 break-words text-gray-900">{selectedProduct.name}</h1>
            
            {/* Dynamic Price Display */}
            <div className="mb-5">
              <div className="flex items-baseline gap-3 mb-1 flex-wrap">
                <span className="text-4xl font-extrabold text-gray-900">
                  ₹{currentDiscountPrice}
                </span>
                {currentActualPrice > currentDiscountPrice && (
                  <span className="text-xl text-gray-400 line-through">
                    ₹{currentActualPrice}
                  </span>
                )}
                {isWeightOrVolume ? (
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {selectedWeight?.label || `${selectedProduct.unitValue || 1} ${selectedProduct.unit}`}
                  </span>
                ) : (selectedProduct.unit && selectedProduct.unit.toLowerCase() !== 'pcs') ? (
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    {selectedProduct.unitValue && parseFloat(selectedProduct.unitValue) !== 1 ? selectedProduct.unitValue + ' ' : ''}{selectedProduct.unit}
                  </span>
                ) : null}
              </div>
              {quantity > 1 && (
                <p className="text-xs text-gray-500 font-medium">
                  ₹{(currentDiscountPrice / quantity).toFixed(2)} each × {quantity}
                </p>
              )}
            </div>

            <p className="text-gray-600 mb-5 leading-relaxed">{selectedProduct.description}</p>

            {/* Sizing Selector (Rendered if product has sizes) */}
            {selectedProduct.sizes && Array.isArray(selectedProduct.sizes) && selectedProduct.sizes.length > 0 && (
              <div className="mb-5 p-4 bg-white rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center gap-2 mb-2.5">
                  <Shirt className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Select Size</span>
                  {selectedSize && (
                    <span className="text-xs text-emerald-700 font-semibold ml-auto">Selected: {selectedSize}</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSelectedSize(s)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        selectedSize === s
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-102 ring-2 ring-emerald-600/20'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Weight / Volume Increment Presets */}
            {isWeightOrVolume && weightPresets.length > 0 && (
              <div className="mb-5 p-4 bg-white rounded-2xl border border-gray-100 shadow-xs">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Select Weight / Package</span>
                  <span className="text-xs text-emerald-700 font-semibold ml-auto">
                    {selectedWeight?.label}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {weightPresets.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setSelectedWeight(preset)}
                      className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        selectedWeight?.label === preset.label
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs scale-102 ring-2 ring-emerald-600/20'
                          : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Counter */}
            <div className="mb-5 flex items-center justify-between p-3.5 bg-white rounded-2xl border border-gray-100 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-700">Quantity</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5 text-gray-700" />
                </button>
                <span className="text-base font-bold text-gray-900 w-6 text-center">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-gray-700" />
                </button>
              </div>
            </div>

            {selectedProduct.category?.name && (
              <div className="mb-6 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="font-semibold text-gray-700">Category: </span>
                {selectedProduct.category.name}
                {resolvedSubCategoryNames.length > 0 && ` > ${resolvedSubCategoryNames.join(', ')}`}
              </div>
            )}
            {selectedProduct.store && selectedProduct.store.storeName && (
              <div 
                onClick={() => navigate(`/vendor/${selectedProduct.store.id}`)}
                className='py-4 px-4 sm:px-6 bg-white shadow-xs rounded-2xl sm:rounded-3xl flex flex-col mb-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] border border-gray-100'
              >
                <div className='flex justify-between items-center w-full gap-2'>
                  <p className="text-base text-gray-900 font-bold mb-1.5 truncate">{selectedProduct.store.storeName}</p>
                  <TKArrowIcon />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1.5 break-words">{selectedProduct.store.address}</p>
                  <p className="text-sm text-gray-600 break-all">{selectedProduct.store.phoneNumber}/{selectedProduct.store.email}</p>
                </div>
              </div>
            )}

            {/* Conditional Button Rendering */}
            {isProductOwner ? (
              <div className='w-full flex flex-col sm:flex-row items-center gap-3 mb-6'>
                <button
                  onClick={() => navigate(`/edit-product/${selectedProduct.id}`)}
                  className="p-3 gap-2 rounded-full w-full sm:w-1/2 flex items-center justify-center text-sm sm:text-base font-semibold bg-primaryButtonBackgroundColor text-white border border-transparent shadow-sm hover:shadow-md hover:bg-[#427256] transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Edit Product
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="p-3 gap-2 rounded-full w-full sm:w-1/2 flex items-center justify-center text-sm sm:text-base font-semibold bg-red-600 text-white border border-transparent shadow-sm hover:shadow-md hover:bg-red-700 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Delete Product
                </button>
              </div>
            ) : (
              // Show Add to Cart, Buy Now, and Favorites for non-owners
              <>
                <div className="flex flex-col sm:flex-row gap-3 mb-4 sm:mb-6">
                  <button
                    onClick={handleAddToCartClick}
                    disabled={isUnavailable}
                    className={`p-3 sm:py-3.5 px-4 gap-2 rounded-full w-full sm:flex-1 flex items-center justify-center text-sm sm:text-base font-semibold border border-gray-200 shadow-sm transition-all duration-300 ease-in-out cursor-pointer ${
                      isUnavailable
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-secondaryButtonBackgroundColor text-gray-700 hover:shadow-md hover:border-gray-300 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {isThisItemInCart ? 'Added to Cart (+)' : 'Add to Cart'}
                  </button>
                  <button
                    onClick={() => {
                      if (!user) {
                        setOnLoginModalContinue(() => handleBuyNow);
                        setLoginModalOpen(true);
                      } else {
                        handleBuyNow();
                      }
                    }}
                    disabled={isUnavailable}
                    className={`p-3 sm:py-3.5 px-4 gap-2 rounded-full w-full sm:flex-1 flex items-center justify-center text-sm sm:text-base font-semibold border border-transparent shadow-sm transition-all duration-300 ease-in-out cursor-pointer ${
                      isUnavailable
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primaryButtonBackgroundColor text-white hover:shadow-md hover:bg-[#427256] hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    Buy Now
                  </button>
                </div>
                <button
                  onClick={() => toggleFavorite(selectedProduct)}
                  disabled={isUnavailable}
                  className={`p-3 sm:py-3.5 px-4 bg-secondaryButtonBackgroundColor gap-2 rounded-full w-full flex items-center justify-center text-gray-700 text-sm sm:text-base font-semibold border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out cursor-pointer ${
                    isUnavailable ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite(selectedProduct.id)
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-600'
                    }`}
                  />
                  {isFavorite(selectedProduct.id) ? 'Added to Favorites' : 'Add to Favorites'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Floating Store Cart Bar */}
      {storeCartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg bg-gray-900/95 backdrop-blur-md text-white rounded-2xl p-3.5 shadow-2xl border border-gray-800 flex items-center justify-between animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3 pl-2">
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-emerald-400" />
              <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {storeCartCount}
              </span>
            </div>
            <div>
              <div className="text-sm font-bold">₹{storeCartTotal.toLocaleString()}</div>
              <div className="text-[11px] text-gray-300">
                {storeCartCount} item{storeCartCount > 1 ? 's' : ''} in {selectedProduct?.store?.storeName || 'store'} cart
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
          >
            View Cart & Order <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Store Cart Drawer */}
      <StoreCartDrawer
        store={selectedProduct?.store}
        isOpen={isCartDrawerOpen}
        onClose={() => setIsCartDrawerOpen(false)}
      />
    </main>
  );
};

export default ProductPage;