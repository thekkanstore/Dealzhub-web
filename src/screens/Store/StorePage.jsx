import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import CategoryScroller from '../../components/common/CategoryScroller';
import { getStoreById } from '../../services/storeFirestoreService';
import 'react-virtualized/styles.css';
import noDataFound from '../../assets/images/noDataFound@3x.png';
import VirtualizedProductGrid from '../../components/common/VirtualizedProductGrid';
import { fetchAllProducts, fetchProductsByStoreAndCategory } from '../../services/productService';
import QRCode from 'qrcode';
import { ArrowLeft, Download } from 'lucide-react';
import appLogo from '../../assets/images/appLogo@2x.png';
import { getCategoryById } from '../../services/firestore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getSubCategories } from '../../services/subcategoryService';

const StorePage = () => {
  const { id: storeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAppContext();
  const qrCanvasRef = useRef(null);

  // State for store data
  const [store, setStore] = useState(null);
  const [isStoreLoading, setIsStoreLoading] = useState(true);

  // State for category filtering
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categories, setCategories] = useState([]);
  // State for products
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const observerTarget = useRef(null);
  const isFetchingRef = useRef(false);
  const lastDocRef = useRef(null);

  const categoryRef = useRef(selectedCategory);
  const storeIdRef = useRef(storeId);

  useEffect(() => {
    categoryRef.current = selectedCategory;
    storeIdRef.current = storeId;
  }, [selectedCategory, storeId]);

  // Check if current user owns this store
  const isStoreOwner = useMemo(() => {
    if (!user || !store) return false;
    return store.userId === user.providerData[0].uid;
  }, [user, store]);

  // --- Data Fetching ---
  // Fetch store details
  useEffect(() => {
    if (!storeId) return;
    setIsStoreLoading(true);
    getStoreById(storeId).then(storeData => {
      setStore(storeData);
      setIsStoreLoading(false);
    });
  }, [storeId]);

  // Generate QR Code
  useEffect(() => {
    if (!storeId || !isStoreOwner) return;

    const generateQRCode = async () => {
      try {
        const deepLink = `https://dealzhub.co.in/store-redirect?id=${storeId}`;
        const qrDataUrl = await QRCode.toDataURL(deepLink, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrCodeUrl(qrDataUrl);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQRCode();
  }, [storeId, isStoreOwner]);

  // Fetch products when storeId or selectedCategory changes
  useEffect(() => {
    if (!storeId) return;

    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setProducts([]);
      setLastDoc(null);
      lastDocRef.current = null;
      setHasMore(false);
      isFetchingRef.current = false;
      try {
        const catId = selectedCategory === 'all' ? null : selectedCategory;
        const response = await fetchProductsByStoreAndCategory(storeId, catId, 12, null);
        setProducts(response.products);
        setLastDoc(response.lastDoc);
        lastDocRef.current = response.lastDoc;
        setHasMore(response.hasMore);
      } catch (error) {
        console.error('Error fetching store products:', error);
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [storeId, selectedCategory]);

  const handleLoadMore = async () => {
    if (!hasMore || isLoadingMore || isLoadingProducts || isFetchingRef.current) return;

    const currentCategory = selectedCategory;
    const currentStoreId = storeId;

    isFetchingRef.current = true;
    setIsLoadingMore(true);
    try {
      const catId = selectedCategory === 'all' ? null : selectedCategory;
      const response = await fetchProductsByStoreAndCategory(storeId, catId, 12, lastDocRef.current);
      
      if (categoryRef.current !== currentCategory || storeIdRef.current !== currentStoreId) {
        isFetchingRef.current = false;
        setIsLoadingMore(false);
        return;
      }

      setProducts(prev => [...prev, ...response.products]);
      setLastDoc(response.lastDoc);
      lastDocRef.current = response.lastDoc;
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Error loading more store products:', error);
    } finally {
      setIsLoadingMore(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !isLoadingProducts) {
          handleLoadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasMore, isLoadingMore, isLoadingProducts, lastDoc]);

  // Fetch store categories when store data changes
  useEffect(() => {
    const fetchCategory = async () => {
      if (store?.categories) {
        try {
          // Check if categories is an array
          if (Array.isArray(store.categories)) {
            // Map through each category ID and fetch it
            const categoryPromises = store.categories.map(catId => getCategoryById(catId));
            const fetchedCategories = await Promise.all(categoryPromises);
            // Filter out null values
            const validCategories = fetchedCategories.filter(cat => cat !== null);
            setCategories(validCategories);
          }
          // If categories is a single string ID
          else if (typeof store.categories === 'string') {
            const category = await getCategoryById(store.categories);
            setCategories(category ? [category] : []);
          }
          // Handle unexpected format
          else {
            console.warn('Unexpected categories format:', store.categories);
            setCategories([]);
          }
        } catch (error) {
          console.error('Error fetching category:', error);
          setCategories([]);
        }
      } else {
        // If no categories, set empty array
        setCategories([]);
      }
    };

    fetchCategory();
  }, [store]);

  // --- Filtering ---

  const handleCategoryClick = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  const [subCategories, setSubCategories] = useState([]);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
  const [isSubCategoriesLoading, setIsSubCategoriesLoading] = useState(false);

  useEffect(() => {
    if (!storeId || !selectedCategory) {
      setSubCategories([]);
      setSelectedSubCategoryId(null);
      return;
    }

    const fetchSubCategories = async () => {
      setIsSubCategoriesLoading(true);
      try {
        const subs = await getSubCategories(storeId, selectedCategory);
        setSubCategories(subs);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setSubCategories([]);
      } finally {
        setIsSubCategoriesLoading(false);
      }
    };

    fetchSubCategories();
    setSelectedSubCategoryId(null); // Reset sub-category filter on main category change
  }, [storeId, selectedCategory]);

  const filteredProducts = useMemo(() => {
    if (!selectedSubCategoryId) {
      return products;
    }
    return products.filter((p) => p.subcategoryIds?.includes(selectedSubCategoryId));
  }, [products, selectedSubCategoryId]);

  // Download QR Code with logo and store name
  const downloadQRCode = async () => {
    if (!store || !qrCodeUrl) return;

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = 800;
      canvas.height = 1000;

      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Load and draw QR code (larger size)
      const qrImage = new Image();
      qrImage.src = qrCodeUrl;
      await new Promise((resolve) => {
        qrImage.onload = resolve;
      });

      const qrSize = 500;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 100;
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // Load and draw logo
      const logo = new Image();
      logo.src = appLogo;
      await new Promise((resolve) => {
        logo.onload = resolve;
      });

      const logoSize = 150;
      const logoX = (canvas.width - logoSize) / 2;
      const logoY = qrY + qrSize + 40;
      ctx.drawImage(logo, logoX, logoY, logoSize, logoSize);

      // Draw store name
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 40px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(store.storeName, canvas.width / 2, logoY + logoSize + 80);

      // Draw subtitle
      ctx.font = '24px Arial';
      ctx.fillStyle = '#666666';
      ctx.fillText('Scan to visit our store', canvas.width / 2, logoY + logoSize + 120);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${store.storeName}-QRCode.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  // --- Render ---

  if (isStoreLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!store) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Store not found.</div>;
  }

  // Store status check
  const currentStatus = store.vendorStatus?.toLowerCase() || 'pending';
  if (!isStoreOwner && (currentStatus === 'inactive' || currentStatus === 'rejected')) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6 p-2 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
            <img src={appLogo} alt="DealzHub Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Store Inactive</h2>
          <p className="text-gray-600 mb-8">
            This store is currently inactive and cannot be viewed.
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-primaryButtonBackgroundColor text-white border border-gray-200 font-semibold py-3.5 px-6 rounded-full shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
          >
            Go to Home Page
          </button>
        </div>
      </div>
    );
  }

  if (currentStatus === 'rejected' && isStoreOwner) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">This store is currently rejected by admin. Please connect with admin.</div>;
  }

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'approved':
        return 'bg-green-200/50 text-green-400';
      case 'rejected':
        return 'bg-red-200/50 text-red-400';
      case 'pending':
      default:
        return 'bg-yellow-200/50 text-yellow-400';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col">
        <button
          onClick={() => navigate('/home')}
          className="px-4 py-1.5 mb-4 text-sm cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-secondaryButtonBackgroundColor rounded-full transition-colors w-fit"
        >
          <ArrowLeft />
        </button>
        <div className='flex flex-wrap justify-between'>
          <div className='mb-6'>
            <h1 className="text-3xl font-bold mb-2 flex gap-5 items-center">{store.storeName}
              <span
                className={`text-sm px-3 py-1 rounded-full border ${getStatusColor(store.vendorStatus)}`}
              >
                {store.vendorStatus}
              </span>
            </h1>
            <p className="text-gray-600 mb-6">{store.address}</p>
            {(currentStatus === "approved" || currentStatus === "private") && isStoreOwner && (
              <div className='flex flex-wrap items-center gap-3'>
                <button
                  onClick={() => navigate('/editstore')}
                  className="px-6 py-2 bg-red-500/10 gap-2 rounded-full flex items-center justify-center text-red-700 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                >
                  Edit
                </button>
                <button
                  onClick={() => navigate('/add-product')}
                  className="px-6 py-2 bg-primaryButtonBackgroundColor gap-2 rounded-full flex items-center justify-center text-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                >
                  Add Product
                </button>
                <button
                  onClick={() => navigate('/bulk-add-product')}
                  className="px-6 py-2 bg-primaryButtonBackgroundColor gap-2 rounded-full flex items-center justify-center text-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                >
                  Bulk Add Products
                </button>
              </div>)}
          </div>
          
          {/* QR Code Section - Only show to store owner */}
          {(currentStatus === "approved" || currentStatus === "private") && isStoreOwner && (
            <div className="flex flex-col bg-gray-50 p-6 rounded-xl border border-gray-200">
              <div className="flex flex-wrap items-start md:justify-start justify-center w-fit gap-6">

                {/* LEFT: QR CODE */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Store QR Code" className="w-48 h-48" loading="lazy" />
                  ) : (
                    <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-lg"></div>
                  )}
                </div>

                <div className="flex flex-col h-full py-2">
                  <div>
                    <h3 className="text-lg font-semibold md:text-start text-center text-gray-800">Store QR Code</h3>
                    <p className="text-sm text-gray-600 md:text-start text-center mt-1">Scan to visit store</p>
                  </div>

                  <button
                    onClick={downloadQRCode}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-primaryButtonBackgroundColor text-white rounded-full hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Download className="w-4 h-4" />
                    Download QR Code
                  </button>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {(currentStatus === "approved" || currentStatus === "private" || isStoreOwner) && (
        <>
          {categories.length !== 0 && (
            <CategoryScroller
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryClick={handleCategoryClick}
            />)}

          {/* Subcategory Filter Chips */}
          {selectedCategory && subCategories.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-4 max-w-7xl mx-auto -mt-2 mb-4">
              <button
                type="button"
                onClick={() => setSelectedSubCategoryId(null)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer border transition-all duration-300 ${
                  !selectedSubCategoryId
                    ? 'bg-primaryButtonBackgroundColor text-white border-transparent shadow-sm'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
              >
                All
              </button>
              {subCategories.map((sub) => (
                <button
                  key={sub.id}
                  type="button"
                  onClick={() => setSelectedSubCategoryId(sub.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer border whitespace-nowrap transition-all duration-300 ${
                    selectedSubCategoryId === sub.id
                      ? 'bg-primaryButtonBackgroundColor text-white border-transparent shadow-sm'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
          )}

          <div className="mt-8 max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">Products</h2>
            {filteredProducts.length > 0 || isLoadingProducts ? (
              <>
                <VirtualizedProductGrid
                  products={filteredProducts}
                  isLoading={isLoadingProducts}
                />
                {hasMore && (
                  <div ref={observerTarget} className="flex justify-center mt-8 min-h-[50px]">
                    {isLoadingMore && <LoadingSpinner />}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <img src={noDataFound} alt="No Products Found" className="w-48 h-48 mx-auto mb-6" loading="lazy" />
                <h2 className="text-2xl font-medium mb-2">
                  {selectedCategory ? "This category doesn't have any products" : "No products available"}
                </h2>
                <p className="text-gray-600 mb-6">
                  {selectedCategory ? "Select a different category or check back later." : "Check back later for new products."}
                </p>
                <div className="w-full flex items-center justify-center">
                  <button
                    onClick={() => navigate(isStoreOwner ? '/add-product' : '/home')}
                    className="p-2 bg-primaryButtonBackgroundColor gap-2 rounded-full w-4/12 flex items-center justify-center text-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isStoreOwner ? "Add Product" : "Continue Shopping"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <canvas ref={qrCanvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default StorePage;