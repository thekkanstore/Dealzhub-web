import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import appLogo from '../../assets/images/appLogo@2x.png';

const StoreRedirectPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const storeId = searchParams.get('id');
  const navigate = useNavigate();

  useEffect(() => {
    // We could attempt an automatic redirect here, but the user explicitly requested
    // a popup with "Open in App" and "No" buttons.
  }, []);

  const handleOpenInApp = () => {
    if (storeId) {
      // Attempt to open the custom URL scheme
      window.location.href = `dealszhub://vendor/${storeId}`;
      
      // Set a timeout to redirect to the app store if the app doesn't open
      setTimeout(() => {
        // We can show an alert or redirect to a specific app store link here
        // For now, we'll just alert the user. Ideally, this would be a link to 
        // the actual Google Play / App Store page.
        if (window.confirm("It seems you don't have the DealzHub app installed. Would you like to download it now?")) {
          // Replace these with actual store links when available
          // window.location.href = "https://play.google.com/store/apps/details?id=com.dealzhub";
          alert("Redirecting to App Store / Play Store...");
        }
      }, 2500);
    }
  };

  const handleNo = () => {
    if (storeId) {
      navigate(`/vendor/${storeId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
        <div className="w-24 h-24 flex items-center justify-center mx-auto mb-6 p-2 bg-gray-50 rounded-2xl border border-gray-100 shadow-sm">
          <img src={appLogo} alt="DealzHub Logo" className="w-full h-full object-contain" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Open in DealzHub App?</h2>
        <p className="text-gray-600 mb-8">
          For the best shopping experience, we recommend opening this store in the DealzHub mobile app.
        </p>
        
        <div className="flex flex-col gap-4">
          <button 
            onClick={handleOpenInApp}
            className="w-full bg-primaryButtonBackgroundColor text-white border border-gray-200 font-semibold py-3.5 px-6 rounded-full shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
          >
            Open in App
          </button>
          
          <button 
            onClick={handleNo}
            className="w-full bg-secondaryButtonBackgroundColor text-gray-800 font-semibold py-3.5 px-6 rounded-full hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
          >
            No, continue on web
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreRedirectPage;
