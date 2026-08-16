import React from 'react';
import { useNavigate } from 'react-router-dom';
import appLogo from '../../assets/images/appLogo@2x.png';
import VendorDetailsForm from '../../components/vendor/VendorDetailsForm';
import { useAppContext } from '../../context/AppContext';
import { createNewStore, updateUserRole } from '../../services/firestore';

const VendorDetailsPage = () => {
  const { user, appConfigs } = useAppContext();
  const navigate = useNavigate();
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
      const storeData = {
        userId: user.providerData[0].uid,
        storeName: formData.storeName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        vendorStatus: 'pending',
      };

      try {
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
        // You might want to show an error message to the user here
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
