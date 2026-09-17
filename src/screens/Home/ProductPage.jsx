import React, { useState, useEffect, useMemo } from 'react';
import { Star, Heart, ChevronLeft, ChevronRight, ArrowLeft, Package } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { getProductById, deleteProduct } from '../../services/productService';
import { TKArrowIcon } from '../../components/common/Icons/TKArrowIcon';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { ProductPageSkeleton } from '../../components/common/SkeletonLoader';
import { getSubCategories } from '../../services/subcategoryService';
import SEO from '../../components/common/SEO';

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isInCart, toggleFavorite, isFavorite, user, addToCart, setLoginModalOpen, setOnLoginModalContinue } = useAppContext();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [resolvedSubCategoryNames, setResolvedSubCategoryNames] = useState([]);

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
          alert('Product deleted successfully!');
          navigate(selectedProduct.storeId ? `/vendor/${selectedProduct.storeId}` : '/home');
        } else {
          alert(result.message || 'Failed to delete product.');
        }
      } catch (error) {
        console.error('Error in handleDeleteProduct:', error);
        alert('Failed to delete product.');
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
    const storePhoneNumber = selectedProduct.store?.phoneNumber;
    if (storePhoneNumber) {
      let cleanedPhoneNumber = storePhoneNumber.replace(/\D/g, '');
      if (cleanedPhoneNumber.length === 10) {
        cleanedPhoneNumber = '91' + cleanedPhoneNumber;
      }
      const message = `Hi, I'm interested in this product:\n\nName: ${selectedProduct.name}\nDescription: ${selectedProduct.description || ''}\n\nCan you tell me more?`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanedPhoneNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert("This store's contact information is not available.");
    }
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
    <main className="min-h-screen bg-gray-50/70">
      <SEO
        title={`${selectedProduct.name} - ₹${selectedProduct.discountPrice}`}
        description={selectedProduct.description ? `${selectedProduct.description.slice(0, 155)}... Buy online at ₹${selectedProduct.discountPrice}` : `Buy ${selectedProduct.name} for ₹${selectedProduct.discountPrice} on DealzHub.`}
        image={images[0]}
        url={`/product/${selectedProduct.id}`}
        type="product"
        schema={productSchema}
      />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={handleBack}
          className="px-4 py-1.5 mb-4 text-sm cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-secondaryButtonBackgroundColor rounded-full transition-colors w-fit flex items-center gap-1.5"
          aria-label="Go Back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium text-xs">Back</span>
        </button>
        <div className="bg-white rounded-3xl p-6 sm:p-8 grid md:grid-cols-2 gap-8 border border-gray-100 shadow-sm">
          <div>
            <div className="relative bg-gray-50 rounded-2xl flex items-center justify-center min-h-[20rem] sm:min-h-[24rem] overflow-hidden">
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
                className={`w-full h-80 sm:h-96 object-contain rounded-2xl transition-all duration-300 ${isImageLoading ? 'opacity-0 scale-98' : 'opacity-100 scale-100'} ${isUnavailable ? 'opacity-50' : ''}`} 
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
              <div className="flex gap-2.5 mt-4 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => handleThumbnailClick(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer bg-gray-50 ${
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

          <div>
            <h1 className="text-3xl font-bold mb-4">{selectedProduct.name}</h1>
            <div className="mb-6">
              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-4xl font-bold">
                  ₹{selectedProduct.discountPrice}
                </span>
                <span className="text-xl text-gray-400 line-through">
                  ₹{selectedProduct.actualPrice}
                </span>
              </div>
            </div>
            <p className="text-gray-600 mb-6">{selectedProduct.description}</p>
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
                className='py-5 px-6 bg-white shadow rounded-4xl flex flex-col mb-6 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01]'
              >
                <div className='flex justify-between items-center w-full'>
                  <p className="text-base text-gray-900 font-bold mb-2">{selectedProduct.store.storeName}</p>
                  <TKArrowIcon />
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">{selectedProduct.store.address}</p>
                  <p className="text-sm text-gray-600">{selectedProduct.store.phoneNumber}/{selectedProduct.store.email}</p>
                </div>
              </div>
            )}

            {/* Conditional Button Rendering */}
            {isProductOwner ? (
              <div className='w-full flex items-center gap-4'>
                <button
                  onClick={() => navigate(`/edit-product/${selectedProduct.id}`)}
                  className="p-2 gap-2 rounded-full w-1/2 flex items-center justify-center text-xl bg-primaryButtonBackgroundColor text-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                >
                  Edit Product
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="p-2 gap-2 rounded-full w-1/2 flex items-center justify-center text-xl bg-red-600 text-white border border-transparent shadow-sm hover:shadow-md hover:bg-red-700 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                >
                  Delete Product
                </button>
              </div>
            ) : (
              // Show Add to Cart, Buy Now, and Favorites for non-owners
              <>
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => addToCart(selectedProduct)}
                    disabled={isUnavailable}
                    className={`p-2 gap-2 rounded-full w-full flex items-center justify-center text-xl border border-gray-200 shadow-sm transition-all duration-300 ease-in-out ${
                      isUnavailable
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-secondaryButtonBackgroundColor text-gray-700 hover:shadow-md hover:border-gray-300 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {isInCart(selectedProduct.id) ? 'Added to Cart' : 'Add to Cart'}
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
                    className={`p-2 gap-2 rounded-full w-full flex items-center justify-center text-xl border border-gray-200 shadow-sm transition-all duration-300 ease-in-out ${
                      isUnavailable
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-primaryButtonBackgroundColor text-white hover:shadow-md hover:border-gray-300 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    Buy Now
                  </button>
                </div>
                <button
                  onClick={() => toggleFavorite(selectedProduct)}
                  disabled={isUnavailable}
                  className={`p-2 bg-secondaryButtonBackgroundColor gap-2 rounded-full w-full flex items-center justify-center text-gray-700 text-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out ${
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
    </main>
  );
};

export default ProductPage;