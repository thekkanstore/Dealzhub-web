import React, { useState, useEffect } from 'react';
import { KERALA_DISTRICTS } from '../../config/common';
import SubscriptionPlanModal from './SubscriptionPlanModal';
import { CheckCircle2, Sparkles } from 'lucide-react';

const VendorDetailsForm = ({
  initialData,
  onSubmit,
  submitButtonText = 'Proceed to Subscription & Payment',
}) => {
  const [storeName, setStoreName] = useState(initialData.storeName || '');
  const [address, setAddress] = useState(initialData.address || '');
  const [city, setCity] = useState(initialData.city || '');
  const [state, setState] = useState(initialData.state || 'Kerala');
  const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber || '');
  const [email, setEmail] = useState(initialData.email || '');

  // Subscription plan state
  const [selectedPlan, setSelectedPlan] = useState({
    id: '12_months',
    title: '12 MONTHS',
    price: 2999,
    period: '12 Months',
  });
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  const [errors, setErrors] = useState({
    storeName: '',
    address: '',
    city: '',
    phoneNumber: '',
    email: '',
  });

  useEffect(() => {
    setStoreName(initialData.storeName || '');
    setAddress(initialData.address || '');
    setCity(initialData.city || '');
    setState(initialData.state || 'Kerala');
    setPhoneNumber(initialData.phoneNumber || '');
    setEmail(initialData.email || '');
  }, [initialData]);

  const validate = () => {
    let newErrors = {
      storeName: '',
      address: '',
      city: '',
      phoneNumber: '',
      email: '',
    };
    let isValid = true;

    if (!storeName.trim()) {
      newErrors.storeName = 'Store Name is required';
      isValid = false;
    }
    if (!address.trim()) {
      newErrors.address = 'Address is required';
      isValid = false;
    }
    if (!city) {
      newErrors.city = 'City is required';
      isValid = false;
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required';
      isValid = false;
    }
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
      newErrors.email = 'Invalid email address';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        storeName,
        address,
        city,
        state,
        phoneNumber,
        email,
        subscriptionPlan: selectedPlan.id,
        subscriptionAmount: selectedPlan.price,
      });
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setIsPlanModalOpen(false);
  };

  return (
    <>
      <form className="mt-8" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="storeName">
            Store Name
          </label>
          <input
            className={`bg-gray-50/80 appearance-none border border-transparent rounded-lg h-12 w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline ${errors.storeName ? 'border-red-500' : ''}`}
            id="storeName"
            type="text"
            placeholder="Store Name"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
          />
          {errors.storeName && <p className="text-red-500 text-xs italic">{errors.storeName}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="address">
            Address
          </label>
          <textarea
            className={`bg-gray-50/80 appearance-none border border-transparent rounded-lg w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline ${errors.address ? 'border-red-500' : ''}`}
            id="address"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            rows={3}
            required
          ></textarea>
          {errors.address && <p className="text-red-500 text-xs italic">{errors.address}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="city">
            City
          </label>
          <select
            className={`bg-gray-50/80 appearance-none border border-transparent rounded-lg h-12 w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline ${errors.city ? 'border-red-500' : ''}`}
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
          >
            <option value="">Select City</option>
            {KERALA_DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
          {errors.city && <p className="text-red-500 text-xs italic">{errors.city}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="state">
            State
          </label>
          <input
            className="bg-gray-50/80 appearance-none border border-transparent rounded-lg h-12 w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline"
            id="state"
            type="text"
            value={state}
            disabled
          />
        </div>

        <div className="mb-4">
          <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="phoneNumber">
            Phone Number
          </label>
          <input
            className={`bg-gray-50/80 appearance-none border border-transparent rounded-lg h-12 w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline ${errors.phoneNumber ? 'border-red-500' : ''}`}
            id="phoneNumber"
            type="tel"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          {errors.phoneNumber && <p className="text-red-500 text-xs italic">{errors.phoneNumber}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className={`bg-gray-50/80 appearance-none border border-transparent rounded-lg h-12 w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline ${errors.email ? 'border-red-500' : ''}`}
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
        </div>

        {/* Selected Subscription Plan Card - Only for initial registration */}
        {submitButtonText !== 'Update Store' && (
          <div className="mb-6 bg-gradient-to-r from-emerald-900 to-emerald-800 text-white rounded-2xl p-4 border border-emerald-500/40 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-amber-400 text-emerald-950 p-2 rounded-xl">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">Subscription Plan</p>
                <p className="text-sm font-bold text-amber-300">
                  {selectedPlan.id === '3_months' ? '3 Months (₹899)' : '12 Months (₹2,999)'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(true)}
              className="text-xs font-bold bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full border border-white/20 transition-all cursor-pointer"
            >
              Change Plan
            </button>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            className="p-3.5 bg-primaryButtonBackgroundColor text-white font-semibold rounded-full w-full flex items-center justify-center border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            type="submit"
          >
            {submitButtonText}
          </button>
        </div>
      </form>

      {/* Subscription Modal */}
      {submitButtonText !== 'Update Store' && (
        <SubscriptionPlanModal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          onSelectPlan={handlePlanSelect}
          initialPlanId={selectedPlan.id}
        />
      )}
    </>
  );
};

export default VendorDetailsForm;