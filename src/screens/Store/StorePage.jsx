import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';
import CategoryScroller from '../../components/common/CategoryScroller';
import { getStoreById } from '../../services/storeFirestoreService';
import 'react-virtualized/styles.css';
import noDataFound from '../../assets/images/noDataFound@3x.png';
import VirtualizedProductGrid from '../../components/common/VirtualizedProductGrid';
import { fetchAllProducts } from '../../services/productService';
import QRCode from 'qrcode';
import { Download } from 'lucide-react';
import appLogo from '../../assets/images/appLogo@2x.png';
import { getCategoryById } from '../../services/firestore';

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
  const [categories, setCategories] = useState(null);
  // State for products
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // State for QR code
  const [qrCodeUrl, setQrCodeUrl] = useState('');

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
        const deepLink = `dealszhub://vendor/${storeId}`;
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

  // Fetch products when store or category changes
  useEffect(() => {
    if (!storeId) return;

    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        // Fetch all products
        const allProducts = await fetchAllProducts(null, null, null);

        // Filter products by storeId
        const storeProducts = allProducts.filter(product => product.storeId === storeId);

        setProducts(storeProducts);
      } catch (error) {
        console.error('Error fetching store products:', error);
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

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

    fetchProducts();
    fetchCategory();
  }, [storeId, store]);

  // --- Filtering ---

  const handleCategoryClick = useCallback((categoryId) => {
    setSelectedCategory(categoryId);
  }, []);

  const filteredProducts = useMemo(() => {
    if (!selectedCategory) {
      return products;
    }
    return products.filter(product => product.categoryId === selectedCategory);
  }, [products, selectedCategory]);

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
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading Store...</div>;
  }

  if (!store) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Store not found.</div>;
  }

  // Assuming store status check is needed
  if (store.vendorStatus === 'rejected') {
    if (isStoreOwner) {
      return <div className="min-h-screen bg-gray-50 flex items-center justify-center">This store is currently rejected by admin. Please connect with admin.</div>;
    } else {
      return <div className="min-h-screen bg-gray-50 flex items-center justify-center">This store is currently inactive.</div>;
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
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
      <div className="max-w-7xl mx-auto px-4 py-8 flex justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex gap-5 items-center">{store.storeName}
            <span
              className={`text-sm px-3 py-1 rounded-full border ${getStatusColor(store.vendorStatus)}`}
            >
              {store.vendorStatus}
            </span>
          </h1>
          <p className="text-gray-600 mb-6">{store.address}</p>
          {store?.vendorStatus === "approved" && isStoreOwner && (
            <div className='flex items-center gap-4'>
              <button
                onClick={() => navigate('/editstore')}
                className="p-2 bg-red-500/10 gap-2 rounded-full w-5/12 flex items-center justify-center text-red-700 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
              >
                Edit
              </button>
              <button
                onClick={() => navigate('/add-product')}
                className="p-2 bg-primaryButtonBackgroundColor gap-2 rounded-full w-5/12 flex items-center justify-center text-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
              >
                Add Product
              </button>
            </div>)}
        </div>

        {/* QR Code Section - Only show to store owner */}
        {store?.vendorStatus === "approved" && isStoreOwner && (
          <div className="flex flex-col bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div className="flex items-start gap-6">

              {/* LEFT: QR CODE */}
              <div className="bg-white p-4 rounded-lg shadow-sm">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="Store QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 bg-gray-200 animate-pulse rounded-lg"></div>
                )}
              </div>

              <div className="flex flex-col h-full py-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Store QR Code</h3>
                  <p className="text-sm text-gray-600 mt-1">Scan to visit store</p>
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

      {store?.vendorStatus === "approved" && (
        <>
          {categories.length !== 0 && (
            <CategoryScroller
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryClick={handleCategoryClick}
            />)}

          <div className="mt-8 max-w-7xl mx-auto px-4 py-8">
            <h2 className="text-2xl font-bold mb-4">Products</h2>
            {filteredProducts.length > 0 || isLoadingProducts ? (
              <VirtualizedProductGrid
                products={filteredProducts}
                isLoading={isLoadingProducts}
              />
            ) : (
              <div className="bg-white rounded-lg p-12 text-center">
                <img src={noDataFound} alt="No Products Found" className="w-48 h-48 mx-auto mb-6" />
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