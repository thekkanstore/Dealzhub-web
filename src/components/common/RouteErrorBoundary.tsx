import React from 'react';
import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import appLogo from '../../assets/images/appLogo@2x.png';
import { AlertTriangle, Home, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "Something went wrong";
  let message = "An unexpected error occurred while loading this page. Please try again or return home.";
  let statusCode: number | string = "";

  if (isRouteErrorResponse(error)) {
    statusCode = error.status;
    if (error.status === 404) {
      title = "Page Not Found";
      message = "The page or store you are looking for doesn't exist or may have been moved.";
    } else if (error.status === 401 || error.status === 403) {
      title = "Access Restricted";
      message = "You do not have permission to view this resource.";
    } else if (error.status === 500) {
      title = "Server Error";
      message = "We encountered an issue on our server. Please try again in a few moments.";
    } else {
      title = error.statusText || title;
      message = error.data?.message || message;
    }
  } else if (error instanceof Error) {
    message = error.message || message;
  }

  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/home');
    }
  };

  const errorMessage = error instanceof Error ? error.stack : JSON.stringify(error, null, 2);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 max-w-lg w-full text-center border border-gray-100 relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primaryButtonBackgroundColor to-emerald-400" />

        {/* Logo */}
        <div className="w-16 h-16 p-2 bg-[#E5EEE9]/50 rounded-2xl border border-[#528E6B]/20 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <img src={appLogo} alt="DealzHub Logo" className="w-full h-full object-contain" />
        </div>

        {/* Status / Error Icon */}
        <div className="w-14 h-14 bg-red-50 border border-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          {statusCode === 404 ? (
            <ShieldAlert className="w-7 h-7" />
          ) : (
            <AlertTriangle className="w-7 h-7" />
          )}
        </div>

        {/* Error Code & Title */}
        {statusCode && (
          <span className="inline-block px-3 py-1 bg-red-100/70 text-red-700 rounded-full text-xs font-bold mb-2">
            Error {statusCode}
          </span>
        )}
        <h1 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
          {title}
        </h1>

        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={handleGoHome}
            className="flex-1 py-3 px-5 bg-primaryButtonBackgroundColor hover:bg-[#427256] text-white font-semibold rounded-full shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Go to Home</span>
          </button>

          <button
            onClick={handleReload}
            className="py-3 px-5 bg-secondaryButtonBackgroundColor hover:bg-gray-200 text-gray-800 font-semibold rounded-full border border-gray-200 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 text-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-gray-600" />
            <span>Try Again</span>
          </button>

          <button
            onClick={handleGoBack}
            className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 text-sm cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Expandable Technical Details for Developers/Debugging in non-prod or on click */}
        {process.env.NODE_ENV !== 'production' && errorMessage && (
          <details className="text-left bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs text-gray-700">
            <summary className="cursor-pointer font-semibold text-gray-600 hover:text-gray-900 select-none">
              Developer Debug Information
            </summary>
            <pre className="mt-2 p-2 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto text-[11px] leading-snug font-mono whitespace-pre-wrap">
              {errorMessage}
            </pre>
          </details>
        )}

      </div>
    </div>
  );
};

export default RouteErrorBoundary;
