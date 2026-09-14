import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
import appLogo from '../../assets/images/appLogo@2x.png';
import { getStoreById, getStoreBySlug } from '../../services/storeFirestoreService';
import { Smartphone, Globe, MapPin, Store as StoreIcon, ArrowRight, Sparkles } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SEO from '../../components/common/SEO';

const StoreRedirectPage: React.FC = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const rawId = searchParams.get('id');
  const shopParamName = searchParams.get('shop') || (slug ? slug.replace(/-/g, ' ') : '');
  const navigate = useNavigate();

  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchStore = async () => {
      setLoading(true);
      try {
        if (rawId) {
          const data = await getStoreById(rawId, true);
          setStore(data);
        } else if (slug) {
          const data = await getStoreBySlug(slug);
          setStore(data);
        }
      } catch (err) {
        console.error('Error fetching store details for redirect:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [rawId, slug]);

  const storeId = store?.id || rawId || '';
  const displayName = store?.storeName || shopParamName || 'Featured Store';
  const displayLogo = store?.logoUrl || store?.logo || store?.storeLogo || store?.imageUrl || '';
  const displayAddress = store?.address ? `${store.address}${store.city ? `, ${store.city}` : ''}` : (store?.city || 'Kerala, India');

  const getAppStoreLink = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // iOS detection
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) {
      return "https://apps.apple.com/app/idYOUR_APPLE_APP_ID";
    }

    // Android detection
    if (/android/i.test(userAgent)) {
      return "https://play.google.com/store/apps/details?id=com.thekkanvendor.prod";
    }

    // Fallback URL
    return "https://dealzhub.co.in";
  };

  const handleOpenInApp = () => {
    if (storeId) {
      // Attempt to open the custom URL scheme
      window.location.href = `dealszhub://vendor/${storeId}`;

      // Timeout fallback to app store
      setTimeout(() => {
        if (window.confirm("It seems you don't have the DealzHub app installed. Would you like to download it now?")) {
          const storeUrl = getAppStoreLink();
          window.location.href = storeUrl;
        }
      }, 2500);
    } else {
      window.location.href = getAppStoreLink();
    }
  };

  const handleContinueOnWeb = () => {
    if (storeId) {
      navigate(`/vendor/${storeId}`);
    } else {
      navigate('/home');
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <SEO
        title={`Visit ${displayName}`}
        description={`Explore products, exclusive deals and store updates from ${displayName} on DealzHub.`}
        image={displayLogo || 'https://dealzhub.co.in/appLogo@2x.png'}
        url={`/store-redirect?id=${storeId || ''}`}
        robots="noindex, follow"
      />

      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
        
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <LoadingSpinner />
            <p className="text-gray-500 text-sm mt-4 animate-pulse">Loading store details...</p>
          </div>
        ) : !store && !rawId ? (
          <div className="py-6 space-y-4">
            <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-400 border border-gray-100">
              <StoreIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Store Not Found</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              We couldn't find the store you are looking for. It may have been renamed or removed.
            </p>
            <button
              onClick={() => navigate('/home')}
              className="w-full bg-primaryButtonBackgroundColor text-white font-semibold py-3.5 px-6 rounded-full shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              Browse DealzHub
            </button>
          </div>
        ) : (
          <>
            {/* Store / App Logo */}
            <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6 p-2 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {displayLogo ? (
                <img
                  src={displayLogo}
                  alt={`${displayName} Logo`}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <img
                  src={appLogo}
                  alt="DealzHub Logo"
                  className="w-full h-full object-contain"
                />
              )}
            </div>

            {/* Store Name Heading */}
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {displayName ? `Open ${displayName} in App?` : 'Open in DealzHub App?'}
            </h1>

            {/* Location */}
            {displayAddress && (
              <div className="flex items-center justify-center gap-1.5 text-gray-600 text-xs sm:text-sm mb-3 max-w-xs mx-auto">
                <MapPin className="w-4 h-4 text-primaryButtonBackgroundColor shrink-0" />
                <span className="line-clamp-1">{displayAddress}</span>
              </div>
            )}

            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
              For the best shopping experience, explore exclusive products, deals, and instant updates in the DealzHub mobile app.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3.5">
              <button
                onClick={handleOpenInApp}
                className="w-full bg-primaryButtonBackgroundColor text-white border border-gray-200 font-semibold py-3.5 px-6 rounded-full shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-base cursor-pointer"
              >
                <Smartphone className="w-5 h-5" />
                <span>Open in DealzHub App</span>
              </button>

              <button
                onClick={handleContinueOnWeb}
                className="w-full bg-secondaryButtonBackgroundColor text-gray-800 font-semibold py-3.5 px-6 rounded-full hover:bg-gray-200 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Globe className="w-4 h-4 text-gray-600" />
                <span>Continue on Web</span>
                <ArrowRight className="w-4 h-4 text-gray-400 ml-1" />
              </button>
            </div>
          </>
        )}

      </div>
    </main>
  );
};

export default StoreRedirectPage;
