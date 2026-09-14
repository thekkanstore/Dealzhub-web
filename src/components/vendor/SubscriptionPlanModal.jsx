import React, { useState } from 'react';
import { CheckCircle2, X, ShieldCheck, Users, TrendingUp, Clock, Headset, Sparkles } from 'lucide-react';
import appLogo from '../../assets/images/appLogo@2x.png';

const PLAN_3_MONTHS = {
  id: '3_months',
  title: '3 MONTHS',
  price: 899,
  period: '3 Months',
  tagline: 'Perfect for getting started and growing your business online.',
  features: [
    'Online Store',
    'Store Link',
    'QR Code',
    'Hosting & Server',
    'Dealzhub Marketing Support',
    '2 Online Shop QR Code Stickers',
    'Product Listing Support',
    'Product/Stock Updates',
    'Customer Enquiry/Order Support',
    'Social Media Sharing',
    'Basic Technical Support',
  ],
};

const PLAN_12_MONTHS = {
  id: '12_months',
  title: '12 MONTHS',
  price: 2999,
  period: '12 Months',
  isBestValue: true,
  tagline: 'More features. More support. More visibility. More growth.',
  features: [
    'Online Store',
    'Store Link',
    'QR Code',
    'Hosting & Server',
    'Dealzhub Marketing Support',
    '5 Online Shop QR Code Stickers',
    'Product Listing Support',
    'Product/Stock Updates',
    'Store Performance Insights',
    'Promotional Offers Support',
    'Customer Enquiry/Order Support',
    'Social Media Sharing',
    'Basic Technical Support',
    'Featured Store Opportunity',
  ],
};

const SubscriptionPlanModal = ({ isOpen, onClose, onSelectPlan, initialPlanId = '12_months' }) => {
  const [selectedPlanId, setSelectedPlanId] = useState(initialPlanId);

  if (!isOpen) return null;

  const handleConfirm = () => {
    const selectedPlan = selectedPlanId === '3_months' ? PLAN_3_MONTHS : PLAN_12_MONTHS;
    onSelectPlan(selectedPlan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white text-gray-900 rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Header Section */}
          <div className="text-center space-y-2">
            <div className="flex justify-center items-center">
              <div className="w-16 h-16 p-2 bg-[#E5EEE9]/50 rounded-2xl border border-[#528E6B]/20 flex items-center justify-center shadow-xs">
                <img src={appLogo} alt="Dealzhub Logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 uppercase">
                Choose Subscription Plan
              </h2>
              <p className="text-gray-600 text-sm md:text-base font-medium mt-1">
                Take your local store online with <span className="text-primaryButtonBackgroundColor font-bold">DealzHub</span>
              </p>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid md:grid-cols-2 gap-6 items-stretch pt-2">
            
            {/* 3 Months Plan Card */}
            <div
              onClick={() => setSelectedPlanId('3_months')}
              className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between border-2 ${
                selectedPlanId === '3_months'
                  ? 'bg-[#E5EEE9]/30 text-gray-900 border-primaryButtonBackgroundColor shadow-lg scale-[1.01] ring-2 ring-primaryButtonBackgroundColor/20'
                  : 'bg-white text-gray-800 border-gray-200 hover:border-primaryButtonBackgroundColor/50 hover:bg-gray-50/50 shadow-xs'
              }`}
            >
              {selectedPlanId === '3_months' && (
                <div className="absolute -top-3 right-4 bg-primaryButtonBackgroundColor text-white font-semibold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                </div>
              )}

              <div>
                <div className="text-center pb-4 border-b border-gray-200/80">
                  <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                    selectedPlanId === '3_months' ? 'bg-primaryButtonBackgroundColor text-white' : 'bg-gray-100 text-gray-700'
                  }`}>
                    3 MONTHS
                  </span>
                  <div className="text-4xl font-extrabold my-2 flex items-center justify-center tracking-tight text-gray-900">
                    <span className="text-2xl text-gray-500 font-bold mr-0.5">₹</span>899
                  </div>
                </div>

                <ul className="mt-4 space-y-2.5 text-xs md:text-sm">
                  {PLAN_3_MONTHS.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-primaryButtonBackgroundColor" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`mt-6 p-3 rounded-xl text-center text-xs font-semibold ${
                selectedPlanId === '3_months' ? 'bg-primaryButtonBackgroundColor/15 text-[#254030]' : 'bg-gray-100 text-gray-600'
              }`}>
                {PLAN_3_MONTHS.tagline}
              </div>
            </div>

            {/* 12 Months Plan Card (Best Value) */}
            <div
              onClick={() => setSelectedPlanId('12_months')}
              className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between border-2 ${
                selectedPlanId === '12_months'
                  ? 'bg-[#E5EEE9]/30 text-gray-900 border-primaryButtonBackgroundColor shadow-lg scale-[1.01] ring-2 ring-primaryButtonBackgroundColor/20'
                  : 'bg-white text-gray-800 border-gray-200 hover:border-primaryButtonBackgroundColor/50 hover:bg-gray-50/50 shadow-xs'
              }`}
            >
              <div className="absolute -top-3 left-4 bg-[#254030] text-white font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" /> Best Value
              </div>

              {selectedPlanId === '12_months' && (
                <div className="absolute -top-3 right-4 bg-primaryButtonBackgroundColor text-white font-semibold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                </div>
              )}

              <div>
                <div className="text-center pb-4 border-b border-gray-200/80">
                  <span className={`inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                    selectedPlanId === '12_months' ? 'bg-primaryButtonBackgroundColor text-white' : 'bg-gray-100 text-gray-700'
                  }`}>
                    12 MONTHS
                  </span>
                  <div className="text-4xl font-extrabold my-2 flex items-center justify-center tracking-tight text-gray-900">
                    <span className="text-2xl text-gray-500 font-bold mr-0.5">₹</span>2,999
                  </div>
                </div>

                <ul className="mt-4 space-y-2.5 text-xs md:text-sm">
                  {PLAN_12_MONTHS.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-700">
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-primaryButtonBackgroundColor" />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`mt-6 p-3 rounded-xl text-center text-xs font-semibold ${
                selectedPlanId === '12_months' ? 'bg-primaryButtonBackgroundColor/15 text-[#254030]' : 'bg-gray-100 text-gray-600'
              }`}>
                {PLAN_12_MONTHS.tagline}
              </div>
            </div>

          </div>

          {/* Trust Banner Section */}
          <div className="bg-[#E5EEE9]/40 rounded-2xl p-4 border border-[#528E6B]/20 text-center">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#254030] mb-3">
              Built To Empower Local Businesses
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-[11px] text-gray-700">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-primaryButtonBackgroundColor" />
                <span className="font-medium">Trusted by Stores</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Users className="w-5 h-5 text-primaryButtonBackgroundColor" />
                <span className="font-medium">Reach Customers</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <TrendingUp className="w-5 h-5 text-primaryButtonBackgroundColor" />
                <span className="font-medium">Grow Your Sales</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Clock className="w-5 h-5 text-primaryButtonBackgroundColor" />
                <span className="font-medium">Save Time & Effort</span>
              </div>
              <div className="flex flex-col items-center gap-1 col-span-2 md:col-span-1">
                <Headset className="w-5 h-5 text-primaryButtonBackgroundColor" />
                <span className="font-medium">Dedicated Support</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-1/3 py-3.5 px-6 bg-secondaryButtonBackgroundColor hover:bg-gray-200 text-gray-700 text-base font-semibold rounded-full border border-gray-200 shadow-sm transition-all duration-300 ease-in-out hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleConfirm}
              className={`w-full ${onClose ? 'sm:w-2/3' : ''} py-3.5 px-6 bg-primaryButtonBackgroundColor hover:bg-[#427256] text-white text-base font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer tracking-wide`}
            >
              Proceed to Pay ({selectedPlanId === '3_months' ? '₹899 for 3 Months' : '₹2,999 for 12 Months'})
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlanModal;

