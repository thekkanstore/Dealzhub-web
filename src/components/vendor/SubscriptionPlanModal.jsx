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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-gradient-to-b from-[#064E3B] via-[#047857] to-[#064E3B] text-white rounded-3xl shadow-2xl border border-emerald-400/30 overflow-hidden my-8 max-h-[90vh] flex flex-col">
        
        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-emerald-950/40 text-emerald-100 hover:bg-emerald-900 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-6">
          
          {/* Header Section */}
          <div className="text-center space-y-3">
            <div className="flex justify-center items-center">
              <img src={appLogo} alt="Dealzhub Logo" className="w-16 h-16 object-contain bg-white/90 rounded-2xl p-1.5 shadow-md" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-amber-300 uppercase font-serif">
                SUBSCRIPTION PLANS
              </h2>
              <p className="text-emerald-100 text-sm md:text-base font-medium mt-1">
                Take Your Local Store Online with <span className="text-amber-300 font-bold">Dealzhub</span>
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
                  ? 'bg-gradient-to-b from-amber-50 to-amber-100/95 text-emerald-950 border-amber-400 shadow-2xl scale-[1.02]'
                  : 'bg-emerald-950/60 text-emerald-50 border-emerald-500/40 hover:border-emerald-300/80 hover:bg-emerald-900/60'
              }`}
            >
              {selectedPlanId === '3_months' && (
                <div className="absolute -top-3 right-4 bg-amber-500 text-emerald-950 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                </div>
              )}

              <div>
                <div className="text-center pb-4 border-b border-emerald-600/30">
                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                    selectedPlanId === '3_months' ? 'bg-emerald-800 text-amber-300' : 'bg-emerald-800/80 text-emerald-200'
                  }`}>
                    3 MONTHS
                  </span>
                  <div className="text-4xl font-extrabold my-2 flex items-center justify-center tracking-tight">
                    <span className="text-2xl mr-0.5">₹</span>899
                  </div>
                </div>

                <ul className="mt-4 space-y-2.5 text-xs md:text-sm">
                  {PLAN_3_MONTHS.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${
                        selectedPlanId === '3_months' ? 'text-emerald-700' : 'text-emerald-300'
                      }`} />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`mt-6 p-3 rounded-xl text-center text-xs font-semibold ${
                selectedPlanId === '3_months' ? 'bg-emerald-900 text-emerald-50' : 'bg-emerald-900/70 text-emerald-200'
              }`}>
                {PLAN_3_MONTHS.tagline}
              </div>
            </div>

            {/* 12 Months Plan Card (Best Value) */}
            <div
              onClick={() => setSelectedPlanId('12_months')}
              className={`relative cursor-pointer rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between border-2 ${
                selectedPlanId === '12_months'
                  ? 'bg-gradient-to-b from-amber-50 to-amber-100/95 text-emerald-950 border-amber-400 shadow-2xl scale-[1.02]'
                  : 'bg-emerald-950/60 text-emerald-50 border-emerald-500/40 hover:border-emerald-300/80 hover:bg-emerald-900/60'
              }`}
            >
              <div className="absolute -top-3 left-4 bg-amber-400 text-emerald-950 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-emerald-950" /> Most Popular
              </div>

              {selectedPlanId === '12_months' && (
                <div className="absolute -top-3 right-4 bg-amber-500 text-emerald-950 font-bold text-xs px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                </div>
              )}

              <div>
                <div className="text-center pb-4 border-b border-emerald-600/30">
                  <span className={`inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${
                    selectedPlanId === '12_months' ? 'bg-emerald-900 text-amber-300' : 'bg-emerald-800/80 text-emerald-200'
                  }`}>
                    12 MONTHS
                  </span>
                  <div className="text-4xl font-extrabold my-2 flex items-center justify-center tracking-tight">
                    <span className="text-2xl mr-0.5">₹</span>2,999
                  </div>
                </div>

                <ul className="mt-4 space-y-2.5 text-xs md:text-sm">
                  {PLAN_12_MONTHS.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${
                        selectedPlanId === '12_months' ? 'text-emerald-700' : 'text-emerald-300'
                      }`} />
                      <span className="font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`mt-6 p-3 rounded-xl text-center text-xs font-semibold ${
                selectedPlanId === '12_months' ? 'bg-emerald-900 text-emerald-50' : 'bg-emerald-900/70 text-emerald-200'
              }`}>
                {PLAN_12_MONTHS.tagline}
              </div>
            </div>

          </div>

          {/* Trust Banner Section */}
          <div className="bg-emerald-950/70 rounded-2xl p-4 border border-emerald-500/30 text-center">
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-300 mb-3">
              BUILT TO EMPOWER LOCAL BUSINESSES
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center text-[11px] text-emerald-100">
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-5 h-5 text-amber-300" />
                <span>Trusted by Local Stores</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Users className="w-5 h-5 text-amber-300" />
                <span>Reach More Customers</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <TrendingUp className="w-5 h-5 text-amber-300" />
                <span>Grow Your Business</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Clock className="w-5 h-5 text-amber-300" />
                <span>Save Time & Effort</span>
              </div>
              <div className="flex flex-col items-center gap-1 col-span-2 md:col-span-1">
                <Headset className="w-5 h-5 text-amber-300" />
                <span>Support Ready</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleConfirm}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-emerald-950 text-base font-bold rounded-full shadow-xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
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
