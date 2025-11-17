import React, { useState, useEffect } from 'react';
import { KERALA_DISTRICTS } from '../../config/common';

const VendorDetailsForm = ({
  initialData,
  onSubmit,
  submitButtonText = 'Create Store', // Default value
}) => {
  const [storeName, setStoreName] = useState(initialData.storeName || '');
  const [address, setAddress] = useState(initialData.address || '');
  const [city, setCity] = useState(initialData.city || '');
  const [state, setState] = useState(initialData.state || 'Kerala');
  const [phoneNumber, setPhoneNumber] = useState(initialData.phoneNumber || '');
  const [email, setEmail] = useState(initialData.email || '');

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
      onSubmit({ storeName, address, city, state, phoneNumber, email });
    }
  };

  return (
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
      <div className="flex items-center justify-between">
        <button
          className="p-2 bg-primaryButtonBackgroundColor gap-2 rounded-full h-12-full w-full flex items-center justify-center text-white border border-transparent shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
          type="submit"
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default VendorDetailsForm;