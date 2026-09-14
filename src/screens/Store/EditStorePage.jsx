import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorDetailsForm from '../../components/vendor/VendorDetailsForm';
import { useAppContext } from '../../context/AppContext';
import { getStoreByUserId, updateStore } from '../../services/firestore'; // Assuming updateStore exists
import { uploadImageToStorage } from '../../services/firebaseStorageService';
import { ArrowLeft } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';

const EditStorePage = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [initialStoreData, setInitialStoreData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStoreData = async () => {
      if (user) {
        try {
          const store = await getStoreByUserId(user.providerData[0].uid);
          if (store) {
            setInitialStoreData({
              storeName: store.storeName,
              address: store.address,
              city: store.city,
              state: store.state,
              phoneNumber: store.phoneNumber,
              email: store.email,
              logoUrl: store.logoUrl || store.logo || '',
              logoBase64: store.logoBase64 || '',
            });
          } else {
            navigate('/vendor-details'); // Or a more appropriate page
          }
        } catch (error) {
          console.error('Error fetching store data:', error);
          // Handle error, e.g., show a toast notification
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    };

    fetchStoreData();
  }, [user, navigate]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (formData) => {
    if (user && initialStoreData) {
      setIsSaving(true);
      try {
        let finalLogoUrl = formData.logoUrl || initialStoreData.logoUrl || '';
        if (formData.logoFile) {
          const uploadRes = await uploadImageToStorage(
            formData.logoFile,
            `images/stores/${user.providerData[0].uid}`
          );
          if (uploadRes.success && uploadRes.url) {
            finalLogoUrl = uploadRes.url;
          } else {
            console.error('Failed to upload store logo:', uploadRes.error);
            alert(`Failed to upload store logo: ${uploadRes.error || 'Storage error'}`);
            setIsSaving(false);
            return;
          }
        }

        const updatedStoreData = {
          storeName: formData.storeName,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          phoneNumber: formData.phoneNumber,
          email: formData.email,
          logoUrl: finalLogoUrl,
          logo: finalLogoUrl,
          logoBase64: formData.logoBase64 || initialStoreData.logoBase64 || '',
          updatedAt: new Date(),
        };

        await updateStore(user.providerData[0].uid, updatedStoreData);
        alert('Store details and logo saved successfully!');
        navigate('/home');
      } catch (error) {
        console.error('Error updating store:', error);
        alert('Failed to update store. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else {
      console.error('User not logged in or initial store data not loaded.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!initialStoreData) {
    return <div className="flex justify-center items-center h-screen">No store data available to edit.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/home')}
          className="px-4 py-1.5 mb-4 cursor-pointer text-sm text-gray-600 hover:text-gray-900 hover:bg-secondaryButtonBackgroundColor rounded-full transition-colors w-fit"
        >
          <ArrowLeft/>
        </button>
        <div className="max-w-sm w-full mx-auto">
          <h2 className="text-2xl font-bold text-center mt-4">Edit Store</h2>
          <VendorDetailsForm
            initialData={initialStoreData}
            onSubmit={handleSubmit}
            submitButtonText={isSaving ? "Updating Store..." : "Update Store"}
          />
        </div>
      </div>
    </div>
  );
};

export default EditStorePage;
