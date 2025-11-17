import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VendorDetailsForm from '../../components/vendor/VendorDetailsForm';
import { useAppContext } from '../../context/AppContext';
import { getStoreByUserId, updateStore } from '../../services/firestore'; // Assuming updateStore exists

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

  const handleSubmit = async (formData) => {
    if (user && initialStoreData) {
      const updatedStoreData = {
        storeName: formData.storeName,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        updatedAt: new Date(),
      };

      try {
        await updateStore(user.providerData[0].uid, updatedStoreData);
        navigate('/home');
      } catch (error) {
        console.error('Error updating store:', error);
      }
    } else {
      console.error('User not logged in or initial store data not loaded.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading store details...</div>;
  }

  if (!initialStoreData) {
    return <div className="flex justify-center items-center h-screen">No store data available to edit.</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/home')}
          className="flex items-center gap-2 text-gray-600 mb-6 hover:underline"
        >
          ← Back
        </button>
        <div className="max-w-sm w-full mx-auto">
          <h2 className="text-2xl font-bold text-center mt-4">Edit Store</h2>
          <VendorDetailsForm
            initialData={initialStoreData}
            onSubmit={handleSubmit}
            submitButtonText="Update Store"
          />
        </div>
      </div>
    </div>
  );
};

export default EditStorePage;
