import React, { useState, useEffect } from 'react';
import PersonalDetailsForm from './PersonalDetailsForm';
import { useAppContext } from '../../context/AppContext';
import { getUserData, updateUserProfile } from '../../services/firestore';
import { useNavigate } from "react-router-dom";

const EditProfilePage = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [initialProfileData, setInitialProfileData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: 'Kerala',
  });
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user && user.providerData[0]?.uid) {
        setLoading(true);
        try {
          const data = await getUserData(user.providerData[0].uid);
          if (data) {
            setUserData(data);
            setInitialProfileData({
              fullName: data.name || user.displayName || '',
              email: data.email || user.email || '',
              phone: data.phoneNumber || '',
              address: data.address || '',
              city: data.city || '',
              state: data.state || 'Kerala',
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [user]);

  const handleSubmit = async (formData) => {
    if (user && userData) {
      const updatedData = {
        name: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        updatedAt: new Date(),
        // Keep existing data
        role: userData.role || [],
        favorites: userData.favorites || [],
        cart: userData.cart || [],
        createdAt: userData.createdAt,
      };

      try {
        await updateUserProfile(user.providerData[0].uid, updatedData);
        navigate("/home");
        window.location.reload();
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
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
          <h2 className="text-2xl font-bold text-center mt-4">Edit Profile</h2>
          <PersonalDetailsForm
            initialData={initialProfileData}
            onSubmit={handleSubmit}
            showTermsAndConditions={false}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;