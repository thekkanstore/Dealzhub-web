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
import { ArrowLeft, Download, Store as StoreIcon } from 'lucide-react';
import appLogo from '../../assets/images/appLogo@2x.png';
import { getCategoryById } from '../../services/firestore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getSubCategories } from '../../services/subcategoryService';
import { getImageBlobFromStorage } from '../../services/firebaseStorageService';
import SEO from '../../components/common/SEO';
import SubscriptionPlanModal from '../../components/vendor/SubscriptionPlanModal';
import { createCashfreeOrder, initiateCashfreeWebCheckout } from '../../services/cashfreeService';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';

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

  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const isPendingStatus = store?.vendorStatus?.toLowerCase() === 'pending';
  const isPaymentPending = store?.paymentStatus === 'pending' || store?.paymentStatus === 'FAILED' || (isPendingStatus && store?.paymentStatus !== 'PAID');
  const subscriptionEndDate = store?.subscriptionEndDate
    ? store.subscriptionEndDate.toDate
      ? store.subscriptionEndDate.toDate()
      : new Date(store.subscriptionEndDate)
    : null;
  const isSubscriptionExpired = subscriptionEndDate ? new Date() > subscriptionEndDate : false;

  const handleLaunchPayment = async (planId = '12_months', amount = 2999) => {
    if (!store || !user) return;
    try {
      setPaymentLoading(true);
      const timestamp = Date.now();
      let targetStoreRef = null;
      const storeDocId = store.id || storeId;

      if (storeDocId) {
        const candidateRef = doc(db, 'stores', storeDocId);
        const snap = await getDoc(candidateRef);
        if (snap.exists()) {
          targetStoreRef = candidateRef;
        }
      }

      const currentUserId = user?.uid || user?.providerData?.[0]?.uid || '';

      if (!targetStoreRef && currentUserId) {
        const q = query(collection(db, 'stores'), where('userId', '==', currentUserId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          targetStoreRef = snap.docs[0].ref;
        }
      }

      const activeStoreId = targetStoreRef ? targetStoreRef.id : (storeDocId || currentUserId);
      const orderId = `order_${activeStoreId}_${timestamp}`;
      const returnUrl = `${window.location.origin}/payment-status?order_id=${orderId}`;

      if (targetStoreRef) {
        await setDoc(targetStoreRef, {
          paymentStatus: 'pending',
          subscriptionPlan: planId,
          subscriptionAmount: amount,
          paymentOrderId: orderId,
          updatedAt: new Date(),
        }, { merge: true });
      }

      const cashfreeOrder = await createCashfreeOrder({
        orderId,
        orderAmount: amount,
        customerName: store.storeName,
        customerEmail: store.email,
        customerPhone: store.phoneNumber,
        returnUrl,
      });

      if (cashfreeOrder && cashfreeOrder.payment_session_id) {
        await initiateCashfreeWebCheckout(cashfreeOrder.payment_session_id);
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Error launching payment: ' + (error.message || 'Please try again.'));
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSelectRenewalPlan = (plan) => {
    setIsPlanModalOpen(false);
    handleLaunchPayment(plan.id, plan.price);
  };

  useEffect(() => {
    categoryRef.current = selectedCategory;
    storeIdRef.current = storeId;
  }, [selectedCategory, storeId]);

  // Check if current user owns this store
  const isStoreOwner = useMemo(() => {
    if (!user || !store) return false;
    const currentUserId = user?.uid || user?.providerData?.[0]?.uid;
    return store.userId === currentUserId || (user.uid && store.userId === user.uid) || (user.providerData?.[0]?.uid && store.userId === user.providerData[0].uid);
  }, [user, store]);

  // --- Data Fetching ---
  // Fetch store details
  useEffect(() => {
    if (!storeId) return;
    setIsStoreLoading(true);
    getStoreById(storeId, true).then(storeData => {
      setStore(storeData);
      setIsStoreLoading(false);
    });
  }, [storeId]);

  const storeSlug = useMemo(() => {
    return (store?.storeName || 'shop')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, [store?.storeName]);

  // Generate QR Code
  useEffect(() => {
    if (!storeId || !isStoreOwner) return;

    const generateQRCode = async () => {
      try {
        const deepLink = `https://dealzhub.co.in/shop/${storeSlug}`;
        const qrDataUrl = await QRCode.toDataURL(deepLink, {
          width: 250,
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
  }, [storeId, isStoreOwner, storeSlug]);

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

  // Robust image loader for canvas to avoid CORS/cache errors with remote images
  const loadQrImage = async (url) => {
    if (!url) return null;

    // 1. If local data URL or blob URL (100% same-origin, 0 CORS issues)
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      const img = new Image();
      return new Promise((resolve) => {
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = url;
      });
    }

    // 2. Try CORS Proxy (images.weserv.nl) for remote Firebase Storage / external URLs
    // This allows canvas to load and export remote images with Access-Control-Allow-Origin: *
    try {
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}&w=300&h=300&fit=cover&output=png`;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const loaded = await new Promise((resolve) => {
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = proxyUrl;
      });
      if (loaded) return loaded;
    } catch (err) {
      console.warn('CORS Proxy image load failed:', err);
    }

    // 3. Try alternative CORS proxy (corsproxy.io)
    try {
      const altProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
      const res = await fetch(altProxyUrl);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const img = new Image();
        const loaded = await new Promise((resolve) => {
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = blobUrl;
        });
        if (loaded) return loaded;
      }
    } catch (err) {
      console.warn('Alternative CORS proxy fetch failed:', err);
    }

    // 4. Try Firebase Storage SDK direct getBlob
    try {
      const blob = await getImageBlobFromStorage(url);
      if (blob) {
        const blobUrl = URL.createObjectURL(blob);
        const img = new Image();
        const loaded = await new Promise((resolve) => {
          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
          img.src = blobUrl;
        });
        if (loaded) return loaded;
      }
    } catch (err) {
      console.warn('Firebase SDK getBlob failed:', err);
    }

    return null;
  };

  // Download QR Code with store logo and store name
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

      // Load and draw QR code
      const qrImage = new Image();
      qrImage.src = qrCodeUrl;
      await new Promise((resolve) => {
        qrImage.onload = resolve;
      });

      const qrSize = 480;
      const qrX = (canvas.width - qrSize) / 2;
      const qrY = 80;
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // Load Store Logo (prioritize Base64 -> customLogoUrl -> appLogo)
      const customLogoUrl = store.logoBase64 || store.logoUrl || store.logo || store.storeLogo || store.imageUrl || store.image;
      let logo = null;
      if (customLogoUrl) {
        logo = await loadQrImage(customLogoUrl);
      }
      if (!logo) {
        logo = await loadQrImage(appLogo);
      }

      const logoSize = 120;
      const logoX = (canvas.width - logoSize) / 2;
      const logoY = qrY + qrSize + 35;

      if (logo && (logo.naturalWidth || logo.width)) {
        ctx.save();
        const radius = 24;
        ctx.beginPath();
        ctx.moveTo(logoX + radius, logoY);
        ctx.lineTo(logoX + logoSize - radius, logoY);
        ctx.quadraticCurveTo(logoX + logoSize, logoY, logoX + logoSize, logoY + radius);
        ctx.lineTo(logoX + logoSize, logoY + logoSize - radius);
        ctx.quadraticCurveTo(logoX + logoSize, logoY + logoSize, logoX + logoSize - radius, logoY + logoSize);
        ctx.lineTo(logoX + radius, logoY + logoSize);
        ctx.quadraticCurveTo(logoX, logoY + logoSize, logoX, logoY + logoSize - radius);
        ctx.lineTo(logoX, logoY + radius);
        ctx.quadraticCurveTo(logoX, logoY, logoX + radius, logoY);
        ctx.closePath();

        // Background & border for logo
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
        ctx.strokeStyle = '#E2E8F0';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.clip();

        // Crop & center logo inside square
        const nw = logo.naturalWidth || logo.width;
        const nh = logo.naturalHeight || logo.height;
        const scale = Math.max(logoSize / nw, logoSize / nh);
        const sw = logoSize / scale;
        const sh = logoSize / scale;
        const sx = (nw - sw) / 2;
        const sy = (nh - sh) / 2;

        ctx.drawImage(logo, sx, sy, sw, sh, logoX, logoY, logoSize, logoSize);
        ctx.restore();
      }

      // Draw store name
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(store.storeName || 'Our Store', canvas.width / 2, logoY + logoSize + 55);

      // Draw subtitle
      ctx.font = '500 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('Scan to visit our store', canvas.width / 2, logoY + logoSize + 92);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${(store.storeName || 'Store').replace(/\s+/g, '_')}-QRCode.png`;
          link.click();
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      console.error('Error downloading QR code:', error);
    }
  };

  const storeSchema = useMemo(() => {
    if (!store) return null;
    const storeLogo = store.logoUrl || store.logo || 'https://dealzhub.co.in/appLogo@2x.png';
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': ['LocalBusiness', 'Store'],
          '@id': `https://dealzhub.co.in/vendor/${store.id || storeId}#store`,
          name: store.storeName,
          description: `Visit ${store.storeName} on DealzHub. Explore local products, discounts and contact directly in ${store.city || 'Kerala'}.`,
          image: storeLogo,
          telephone: store.phoneNumber || '',
          email: store.email || '',
          url: `https://dealzhub.co.in/vendor/${store.id || storeId}`,
          address: {
            '@type': 'PostalAddress',
            streetAddress: store.address || '',
            addressLocality: store.city || 'Kerala',
            addressRegion: store.state || 'Kerala',
            addressCountry: 'IN',
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
            {
              '@type': 'ListItem',
              position: 2,
              name: store.storeName,
              item: `https://dealzhub.co.in/vendor/${store.id || storeId}`,
            },
          ],
        },
      ],
    };
  }, [store, storeId]);

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
    <main className="min-h-screen bg-white">
      <SEO
        title={`${store.storeName} - Local Store in ${store.city || 'Kerala'}`}
        description={`Explore products, exclusive deals and store updates from ${store.storeName}, located at ${store.address || store.city || 'Kerala'} on DealzHub.`}
        image={store.logoUrl || store.logo || store.storeLogo || store.imageUrl || appLogo}
        url={`/vendor/${storeId}`}
        type="profile"
        schema={storeSchema}
      />
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col">
        <button
          onClick={() => navigate('/home')}
          className="px-4 py-1.5 mb-4 text-sm cursor-pointer text-gray-600 hover:text-gray-900 hover:bg-secondaryButtonBackgroundColor rounded-full transition-colors w-fit"
        >
          <ArrowLeft />
        </button>
        <div className='flex flex-wrap justify-between items-start gap-6'>
          <div className='mb-6 max-w-xl'>
            {/* Store Logo and Name Header */}
            <div className='flex items-center gap-4 mb-3'>
              {store.logoUrl || store.logo || store.storeLogo || store.imageUrl ? (
                <img
                  src={store.logoUrl || store.logo || store.storeLogo || store.imageUrl}
                  alt={`${store.storeName} logo`}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-gray-200 shadow-sm"
                  loading="lazy"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-2xl shadow-sm">
                  {store.storeName ? store.storeName.charAt(0).toUpperCase() : <StoreIcon className="w-8 h-8" />}
                </div>
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold flex flex-wrap gap-3 items-center">
                  {store.storeName}
                  <span
                    className={`text-xs sm:text-sm px-3 py-1 rounded-full border font-medium ${getStatusColor(store.vendorStatus)}`}
                  >
                    {store.vendorStatus}
                  </span>
                </h1>
                <p className="text-gray-600 text-sm mt-1">{store.address}{store.city ? `, ${store.city}` : ''}</p>
                {store.phoneNumber && (
                  <p className="text-gray-500 text-xs mt-0.5">📞 {store.phoneNumber}</p>
                )}
              </div>
            </div>
            
            {isStoreOwner && (
              <div className='flex flex-wrap items-center gap-3 mt-4'>
                <button
                  onClick={() => navigate('/editstore')}
                  className="px-6 py-2 bg-red-500/10 gap-2 rounded-full flex items-center justify-center text-red-700 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                >
                  Edit
                </button>
                {isPaymentPending ? (
                  <button
                    onClick={() => {
                      if (store.subscriptionPlan) {
                        handleLaunchPayment(store.subscriptionPlan, store.subscriptionAmount || 2999);
                      } else {
                        setIsPlanModalOpen(true);
                      }
                    }}
                    className="px-6 py-2 bg-primaryButtonBackgroundColor text-white font-semibold gap-2 rounded-full flex items-center justify-center border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Complete Payment {store.subscriptionAmount ? `(₹${store.subscriptionAmount})` : ''}
                  </button>
                ) : isSubscriptionExpired ? (
                  <button
                    onClick={() => setIsPlanModalOpen(true)}
                    className="px-6 py-2 bg-primaryButtonBackgroundColor text-white font-semibold gap-2 rounded-full flex items-center justify-center border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Renew Subscription
                  </button>
                ) : (currentStatus === "approved" || currentStatus === "private") ? (
                  <>
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
                  </>
                ) : currentStatus === "pending" ? (
                  <span className="px-6 py-2 bg-amber-100 text-amber-800 border border-amber-200 rounded-full font-medium text-sm flex items-center gap-2 shadow-sm">
                    Wait for approval to add product
                  </span>
                ) : null}
              </div>
            )}
          </div>
          
          {/* QR Code Section - Only show to store owner */}
          {(currentStatus === "approved" || currentStatus === "private") && isStoreOwner && (
            <div className="flex flex-col bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex flex-wrap items-center md:justify-start justify-center w-fit gap-6">

                {/* LEFT: QR CODE */}
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="Store QR Code" className="w-44 h-44" loading="lazy" />
                  ) : (
                    <div className="w-44 h-44 bg-gray-200 animate-pulse rounded-lg"></div>
                  )}
                </div>

                <div className="flex flex-col h-full py-2">
                  <div>
                    <h3 className="text-lg font-semibold md:text-start text-center text-gray-800">{store.storeName} QR Code</h3>
                    <p className="text-xs text-gray-500 font-mono mt-1 break-all">dealzhub.co.in/shop/{storeSlug}</p>
                    <p className="text-xs text-gray-600 md:text-start text-center mt-1">Customers can scan to visit your shop</p>
                  </div>

                  <button
                    onClick={downloadQRCode}
                    className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-primaryButtonBackgroundColor text-white rounded-full hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] text-sm"
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
                  {isStoreOwner ? (
                    currentStatus === 'pending' ? (
                      <span className="px-6 py-2.5 bg-amber-100 text-amber-800 rounded-full font-medium border border-amber-200 shadow-sm text-sm">
                        Wait for approval to add product
                      </span>
                    ) : (
                      <button
                        onClick={() => navigate('/add-product')}
                        className="p-2 bg-primaryButtonBackgroundColor gap-2 rounded-full w-4/12 flex items-center justify-center text-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Add Product
                      </button>
                    )
                  ) : (
                    <button
                      onClick={() => navigate('/home')}
                      className="p-2 bg-primaryButtonBackgroundColor gap-2 rounded-full w-4/12 flex items-center justify-center text-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Continue Shopping
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <canvas ref={qrCanvasRef} style={{ display: 'none' }} />

      <SubscriptionPlanModal
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        onSelectPlan={handleSelectRenewalPlan}
        initialPlanId={store?.subscriptionPlan || '12_months'}
      />
    </main>
  );
};

export default StorePage;