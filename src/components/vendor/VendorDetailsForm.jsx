import React, { useState, useEffect, useRef } from 'react';
import { KERALA_DISTRICTS } from '../../config/common';
import SubscriptionPlanModal from './SubscriptionPlanModal';
import { Camera, Image as ImageIcon, X, Sparkles } from 'lucide-react';

const VendorDetailsForm = ({
  initialData = {},
  onSubmit,
  submitButtonText = 'Proceed to Subscription & Payment',
}) => {
  const [storeName, setStoreName] = useState(initialData.storeName || '');
  const [bio, setBio] = useState(initialData.bio || '');
  const [address, setAddress] = useState(initialData.address || '');
  const [city, setCity] = useState(initialData.city || '');
  const [state, setState] = useState(initialData.state || 'Kerala');
  const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber || '');
  const [email, setEmail] = useState(initialData.email || '');
  const [logoUrl, setLogoUrl] = useState(initialData.logoUrl || initialData.logo || '');
  const [logoBase64, setLogoBase64] = useState(initialData.logoBase64 || '');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(initialData.logoBase64 || initialData.logoUrl || initialData.logo || '');
  const fileInputRef = useRef(null);

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
    setBio(initialData.bio || '');
    setAddress(initialData.address || '');
    setCity(initialData.city || '');
    setState(initialData.state || 'Kerala');
    setPhoneNumber(initialData.phoneNumber || '');
    setEmail(initialData.email || '');
    setLogoUrl(initialData.logoUrl || initialData.logo || '');
    setLogoBase64(initialData.logoBase64 || '');
    setLogoPreview(initialData.logoBase64 || initialData.logoUrl || initialData.logo || '');
  }, [initialData]);

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Logo image size should be less than 5MB');
        return;
      }
      setLogoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setLogoPreview(previewUrl);

      // Generate compact base64 thumbnail for fast, CORS-free canvas rendering
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const cvs = document.createElement('canvas');
          const maxDim = 250;
          let w = img.width;
          let h = img.height;
          if (w > h && w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else if (h > maxDim) {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
          cvs.width = w;
          cvs.height = h;
          const ctx = cvs.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          setLogoBase64(cvs.toDataURL('image/jpeg', 0.85));
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoUrl('');
    setLogoBase64('');
    setLogoPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
        bio,
        address,
        city,
        state,
        phoneNumber,
        email,
        logoFile,
        logoUrl,
        logoBase64,
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
        {/* Store Logo Field */}
        <div className="mb-6 flex flex-col items-center">
          <label className="block text-[#150A33] text-sm font-bold mb-2 self-start">
            Store Logo (Optional)
          </label>
          <div className="flex items-center gap-4 w-full">
            <div className="relative w-20 h-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 group">
              {logoPreview ? (
                <>
                  <img
                    src={logoPreview}
                    alt="Store Logo Preview"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                  <button
                    type="button"
                    onClick={removeLogo}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                    title="Remove logo"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <ImageIcon className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleLogoChange}
                className="hidden"
                id="storeLogoInput"
              />
              <label
                htmlFor="storeLogoInput"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-full cursor-pointer transition-colors shadow-sm"
              >
                <Camera className="w-4 h-4" />
                {logoPreview ? 'Change Logo' : 'Upload Store Logo'}
              </label>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</p>
            </div>
          </div>
        </div>

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
          <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="bio">
            Store Bio / About <span className="text-gray-400 font-normal text-xs">(Optional)</span>
          </label>
          <textarea
            className="bg-gray-50/80 appearance-none border border-transparent rounded-lg w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline focus:border-gray-300 transition-colors"
            id="bio"
            placeholder="Tell customers about your store, specialty, deals, or what you offer..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={500}
          />
          <p className="text-[11px] text-gray-400 text-right mt-1">{bio.length}/500</p>
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
          <div className="mb-6 bg-[#E5EEE9]/60 text-gray-900 rounded-2xl p-4 border border-[#528E6B]/30 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primaryButtonBackgroundColor text-white p-2.5 rounded-xl shadow-xs">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Subscription Plan</p>
                <p className="text-sm font-bold text-gray-900">
                  {selectedPlan.id === '3_months' ? '3 Months (₹899)' : '12 Months (₹2,999)'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsPlanModalOpen(true)}
              className="text-xs font-bold bg-white hover:bg-gray-50 text-gray-800 px-3.5 py-1.5 rounded-full border border-gray-200 shadow-xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
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