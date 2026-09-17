import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import appLogo from '../../assets/images/appLogo@2x.png';
import VendorDetailsForm from '../../components/vendor/VendorDetailsForm';
import { useAppContext } from '../../context/AppContext';
import { createNewStore, updateUserRole } from '../../services/firestore';
import { uploadImageToStorage } from '../../services/firebaseStorageService';
import { createCashfreeOrder, initiateCashfreeWebCheckout } from '../../services/cashfreeService';
import { Loader2 } from 'lucide-react';

const VendorDetailsPage = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Creating store and redirecting to payment gateway...');

  const handleSubmit = async (formData) => {
    if (!user) {
      console.error('User not logged in.');
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setLoadingText('Saving store details...');

      const currentUserId = user?.uid || user?.providerData?.[0]?.uid || '';

      let finalLogoUrl = formData.logoUrl || '';
      if (formData.logoFile) {
        const uploadRes = await uploadImageToStorage(
          formData.logoFile,
          `store-logos/${currentUserId}`
        );
        if (uploadRes.success && uploadRes.url) {
          finalLogoUrl = uploadRes.url;
        }
      }

      const storeData = {
        userId: currentUserId,
        storeName: formData.storeName,
        bio: formData.bio || '',
        address: formData.address,
        city: formData.city,
        state: formData.state,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        logoUrl: finalLogoUrl,
        logo: finalLogoUrl,
        logoBase64: formData.logoBase64 || '',
        subscriptionPlan: formData.subscriptionPlan || '12_months',
        subscriptionAmount: formData.subscriptionAmount || 2999,
        paymentStatus: 'pending',
        vendorStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      // 1. Save store in Firestore
      const createdStoreId = await createNewStore(storeData);
      const timestamp = Date.now();
      const orderId = `order_${createdStoreId}_${timestamp}`;

      // Update store doc with exact orderId
      const { doc: firestoreDoc, updateDoc: firestoreUpdateDoc } = await import('firebase/firestore');
      const { db } = await import('../../firebase');
      await firestoreUpdateDoc(firestoreDoc(db, 'stores', createdStoreId), {
        paymentOrderId: orderId
      });

      // 2. Update user role
      await updateUserRole(currentUserId, 'vendor', formData.email);

      setLoadingText('Connecting to Cashfree Payment Gateway...');

      // 3. Create Cashfree Order
      const returnUrl = `${window.location.origin}/payment-status?order_id=${orderId}`;
      const cashfreeOrder = await createCashfreeOrder({
        orderId: orderId,
        orderAmount: formData.subscriptionAmount || 2999,
        customerName: formData.storeName,
        customerEmail: formData.email,
        customerPhone: formData.phoneNumber,
        returnUrl: returnUrl,
      });

      if (cashfreeOrder && cashfreeOrder.payment_session_id) {
        setLoadingText('Redirecting to Cashfree Checkout...');
        await initiateCashfreeWebCheckout(cashfreeOrder.payment_session_id);
      } else {
        throw new Error('Could not obtain Cashfree payment session ID.');
      }
    } catch (error) {
      console.error('Error during store registration and payment setup:', error);
      alert('Error initiating store registration: ' + (error.message || 'Please try again.'));
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {loading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
            <h3 className="text-xl font-bold text-gray-900">Processing Registration</h3>
            <p className="text-sm text-gray-600 font-medium">{loadingText}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full justify-center items-center p-8 bg-white">
        <div className="max-w-md w-full">
          <div className="w-full justify-center flex">
            <img
              src={appLogo}
              alt="App Logo"
              className="w-36 h-36 object-cover"
              loading="lazy"
            />
          </div>
          <VendorDetailsForm
            initialData={{
              email: user?.email || user?.providerData?.[0]?.email || '',
              phoneNumber: user?.phoneNumber || user?.providerData?.[0]?.phoneNumber || '',
            }}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
};

export default VendorDetailsPage;
