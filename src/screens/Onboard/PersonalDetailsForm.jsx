import React, { useState, useEffect } from 'react';
import { KERALA_DISTRICTS } from '../../config/common';

const PersonalDetailsForm = ({
  initialData,
  onSubmit,
  showTermsAndConditions,
}) => {
  const [fullName, setFullName] = useState(initialData.fullName || '');
  const [email, setEmail] = useState(initialData.email || '');
  const [phone, setPhone] = useState(initialData.phone || '');
  const [address, setAddress] = useState(initialData.address || '');
  const [city, setCity] = useState(initialData.city || '');
  const [state, setState] = useState(initialData.state || 'Kerala');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    terms: '',
  });

  useEffect(() => {
    setFullName(initialData.fullName || '');
    setEmail(initialData.email || '');
    setPhone(initialData.phone || '');
    setAddress(initialData.address || '');
    setCity(initialData.city || '');
    setState(initialData.state || 'Kerala');
  }, [initialData]);

  const validate = () => {
    let newErrors = {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      terms: '',
    };
    let isValid = true;

    if (!fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
      isValid = false;
    }
    if (!email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
      newErrors.email = 'Invalid email address';
      isValid = false;
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone Number is required';
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
    if (showTermsAndConditions && !termsAccepted) {
      newErrors.terms = 'You must accept the terms and conditions';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ fullName, email, phone, address, city, state, termsAccepted });
    }
  };

  return (
    <form className="mt-8" onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="fullName">
          Full Name
        </label>
        <input
          className={`bg-gray-50/80 appearance-none border border-transparent rounded-lg h-12 w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline ${errors.fullName ? 'border-red-500' : ''}`}
          id="fullName"
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          disabled={!!initialData.fullName}
        />
        {errors.fullName && <p className="text-red-500 text-xs italic">{errors.fullName}</p>}
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
          disabled={!!initialData.email}
        />
        {errors.email && <p className="text-red-500 text-xs italic">{errors.email}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="phone">
          Phone Number
        </label>
        <input
          className={`bg-gray-50/80 appearance-none border border-transparent rounded-lg h-12 w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline ${errors.phone ? 'border-red-500' : ''}`}
          id="phone"
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        {errors.phone && <p className="text-red-500 text-xs italic">{errors.phone}</p>}
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
      <div className="mb-6">
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
      {showTermsAndConditions && (
        <div className="mb-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              className="hidden"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <label htmlFor="terms" className="flex cursor-pointer">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-2 transition-all duration-200 ease-in-out
                  ${errors.terms ? 'border-red-500' : termsAccepted ? 'border-primaryButtonBackgroundColor ring-2 ring-primaryButtonBackgroundColor ring-opacity-50' : 'border-gray-400'}`}
              >
                {termsAccepted && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primaryButtonBackgroundColor"></div>
                )}
              </div>
              <span className="text-[#7d7d7d] text-sm w-11/12">
                By proceeding, I acknowledge that I have read and agree to the  <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-black hover:underline">Terms and Conditions</a>
              </span>
            </label>
          </div>
          {errors.terms && <p className="text-red-500 text-xs italic mt-2">{errors.terms}</p>}
        </div>
      )}
      <div className="flex items-center justify-between">
        <button
          className="p-2 bg-primaryButtonBackgroundColor gap-2 rounded-full w-full flex items-center justify-center text-white border border-transparent shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
          type="submit"
        >
          Continue
        </button>
      </div>
    </form>
  );
};

export default PersonalDetailsForm;