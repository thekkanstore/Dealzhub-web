import React, { useState, useEffect, useMemo } from 'react';
import { Star, Heart, ChevronLeft, ChevronRight, Edit, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import { getProductById, deleteProduct } from '../../services/productService';
import { TKArrowIcon } from '../../components/common/Icons/TKArrowIcon';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getSubCategories } from '../../services/subcategoryService';

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isInCart, toggleFavorite, isFavorite, user, addToCart, setLoginModalOpen, setOnLoginModalContinue } = useAppContext();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [resolvedSubCategoryNames, setResolvedSubCategoryNames] = useState([]);

  // Check if current user owns this product
  const isProductOwner = useMemo(() => {
    if (!user || !selectedProduct) return false;
    return selectedProduct.userId === user.providerData[0].uid;
  }, [user, selectedProduct]);

  const handleDeleteProduct = async () => {
    if (window.confirm('Are you sure you want to permanently delete this product? This action cannot be undone.')) {
      try {
        const result = await deleteProduct(selectedProduct);
        if (result.success) {
          alert('Product deleted successfully!');
          navigate(`/vendor/${selectedProduct.storeId}`);
        } else {
          alert(result.message || 'Failed to delete product.');
        }
      } catch (error) {
        console.error('Error in handleDeleteProduct:', error);
        alert('Failed to delete product.');
      }
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      if (productId) {
        const product = await getProductById(productId);
        setSelectedProduct(product);
        setCurrentImageIndex(0); // Reset to first image when product changes
        
        if (product && product.storeId && product.categoryId) {
          try {
            const activeSubs = await getSubCategories(product.storeId, product.categoryId);
            const resolved = product.subcategoryIds
              ? product.subcategoryIds
                  .map(id => activeSubs.find(sub => sub.id === id)?.name)
                  .filter(Boolean)
              : [];
            setResolvedSubCategoryNames(resolved);
          } catch (error) {
            console.error('Error fetching subcategories for product:', error);
            setResolvedSubCategoryNames([]);
          }
        } else {
          setResolvedSubCategoryNames([]);
        }
      }
      setLoading(false);
    };

    fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!selectedProduct) {
    return <div>Product not found.</div>;
  }

  const statusText = selectedProduct.isSoldOut ? 'SOLD OUT' : (selectedProduct.isOutOfStock ? 'OUT OF STOCK' : '');
  const isUnavailable = !!statusText;

  // Determine which images to display
  const images = selectedProduct.images && selectedProduct.images.length > 0 
    ? selectedProduct.images 
    : [selectedProduct.image];

  const hasMultipleImages = images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleBuyNow = () => {
    if (!selectedProduct) return;
    const storePhoneNumber = selectedProduct.store?.phoneNumber;
    if (storePhoneNumber) {
      let cleanedPhoneNumber = storePhoneNumber.replace(/\D/g, '');
      if (cleanedPhoneNumber.length === 10) {
        cleanedPhoneNumber = '91' + cleanedPhoneNumber;
      }
      const message = `Hi, I'm interested in this product:\n\nName: ${selectedProduct.name}\nDescription: ${selectedProduct.description}\n\nCan you tell me more?`;
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${cleanedPhoneNumber}?text=${encodedMessage}`;
      window.open(whatsappUrl, '_blank');
    } else {
      alert("This store's contact information is not available.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/70">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/home')}
          className="px-4 py-1.5 mb-4 text-sm cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-secondaryButtonBackgroundColor rounded-full transition-colors w-fit"
        >
          <ArrowLeft/>
        </button>
        <div className="bg-white rounded-lg p-8 grid md:grid-cols-2 gap-8">
          <div>
            <div className="relative bg-white">
              {/* Main Image Display */}
              <img 
                src={images[currentImageIndex]} 
                alt={`${selectedProduct.name} - Image ${currentImageIndex + 1}`} 
                className={`w-full h-96 object-contain rounded-lg transition-opacity duration-300 ${isUnavailable ? 'opacity-50' : ''}`} 
                loading="lazy"
              />
              
              {/* Unavailable Overlay */}
              {isUnavailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-200/50 rounded-lg">
                  <span className="text-red-600 font-bold px-4 py-2 rounded-xl bg-white border border-red-600">{statusText}</span>
                </div>
              )}

              {/* Navigation Arrows - Only show if multiple images */}
              {hasMultipleImages && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-6 h-6 text-gray-700" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all duration-200 hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-6 h-6 text-gray-700" />
                  </button>
                </>
              )}

              {/* Image Counter */}
              {hasMultipleImages && (
                <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnail Navigation - Only show if multiple images */}
            {hasMultipleImages && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      currentImageIndex === index 
                        ? 'border-gray-700 scale-105' 
                        : 'border-gray-200 hover:border-gray-400'
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
    </div>
  );
};

export default ProductPage;