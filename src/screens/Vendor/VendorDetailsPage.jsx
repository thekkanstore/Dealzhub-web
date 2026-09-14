import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import appLogo from '../../assets/images/appLogo@2x.png';
import VendorDetailsForm from '../../components/vendor/VendorDetailsForm';
import { useAppContext } from '../../context/AppContext';
import { createNewStore, updateUserRole } from '../../services/firestore';
import { uploadImageToStorage } from '../../services/firebaseStorageService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const VendorDetailsPage = () => {
  const { user, appConfigs } = useAppContext();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log("App Config in VendorDetailsPage:", appConfigs);
  const handelMessage = (storeName) => {
    const message = `Vendor request for ${storeName} has been submitted. Kindly review the store details and proceed with the approval.`;
  
    let phone = appConfigs[0]?.adminNo?.replace(/[^0-9]/g, ""); // ensure clean number
    if (phone && phone.length === 10) {
      phone = '91' + phone;
    }
    console.log("Admin Phone Number:", phone);
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  
    window.open(url, "_blank");
  };  

  const handleSubmit = async (formData) => {
    if (user) {
      setIsSubmitting(true);
      try {
        let finalLogoUrl = formData.logoUrl || '';
        if (formData.logoFile) {
          const uploadRes = await uploadImageToStorage(
            formData.logoFile,
            `store-logos/${user.providerData[0].uid}`
          );
          if (uploadRes.success) {
            finalLogoUrl = uploadRes.url;
          }
        }

        const storeData = {
          userId: user.providerData[0].uid,
          storeName: formData.storeName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          logoUrl: finalLogoUrl,
          logo: finalLogoUrl,
          logoBase64: formData.logoBase64 || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          vendorStatus: 'pending',
        };

        // Create the store
        await createNewStore(storeData);

        // Update user role to include 'vendor'
        await updateUserRole(user.providerData[0].uid, 'vendor');
        if (formData.storeName) {
          handelMessage(formData.storeName);
        }

        navigate('/home');
      } catch (error) {
        console.error('Error creating store or updating user role:', error);
        alert('Failed to register store. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      console.error('User not logged in.');
      navigate('/login');
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-full justify-center items-center p-8 bg-white">
        <div className="max-w-sm w-full">
          <div className="w-full justify-center flex">
            <img
              src={appLogo}
              alt="App Logo"
              className="w-40 h-40 object-cover"
              loading="lazy"
            />
          </div>
          <VendorDetailsForm
            initialData={{
              email: user?.email || '',
              phoneNumber: user?.phoneNumber || '',
            }}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default VendorDetailsPage;
