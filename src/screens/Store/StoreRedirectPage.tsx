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
    <main className="min-h-screen bg-gradient-to-br from-[#122319] via-[#1b3425] to-[#0f1d14] flex items-center justify-center p-4 relative overflow-hidden">
      <SEO
        title={`Visit ${displayName}`}
        description={`Explore products, exclusive deals and store updates from ${displayName} on DealzHub.`}
        image={displayLogo || 'https://dealzhub.co.in/appLogo@2x.png'}
        url={`/store-redirect?id=${storeId || ''}`}
        robots="noindex, follow"
      />

      {/* Decorative Glow Elements */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 sm:p-10 max-w-md w-full text-center relative z-10 border border-white/20">
        
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <LoadingSpinner />
            <p className="text-gray-500 text-sm mt-4 animate-pulse">Loading store details...</p>
          </div>
        ) : (
          <>
            {/* Top Store Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified DealzHub Store</span>
            </div>

            {/* Store Logo or Stylized Icon */}
            <div className="w-24 h-24 mx-auto mb-5 rounded-3xl p-1 bg-gradient-to-br from-emerald-500 to-teal-700 shadow-lg flex items-center justify-center">
              {displayLogo ? (
                <img
                  src={displayLogo}
                  alt={`${displayName} Logo`}
                  className="w-full h-full object-cover rounded-[22px] bg-white"
                />
              ) : (
                <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center text-emerald-700 font-black text-3xl">
                  {displayName ? displayName.charAt(0).toUpperCase() : <StoreIcon className="w-10 h-10" />}
                </div>
              )}
            </div>

            {/* Store Name Heading */}
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mb-2">
              {displayName}
            </h1>

            {/* Location */}
            {displayAddress && (
              <div className="flex items-center justify-center gap-1.5 text-gray-600 text-xs sm:text-sm mb-6 max-w-xs mx-auto">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="line-clamp-2">{displayAddress}</span>
              </div>
            )}

            <p className="text-gray-600 text-sm mb-8 leading-relaxed">
              How would you like to explore products and deals from <strong className="text-gray-800 font-semibold">{displayName}</strong>?
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3.5">
              <button
                onClick={handleOpenInApp}
                className="w-full bg-primaryButtonBackgroundColor hover:opacity-95 text-white font-bold py-4 px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 text-base cursor-pointer"
              >
                <Smartphone className="w-5 h-5" />
                <span>Open in DealzHub App</span>
              </button>

              <button
                onClick={handleContinueOnWeb}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3.5 px-6 rounded-full transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm cursor-pointer"
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
