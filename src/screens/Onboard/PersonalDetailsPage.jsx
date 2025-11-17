import React from 'react';
import PersonalDetailsForm from './PersonalDetailsForm';
import { useAppContext } from '../../context/AppContext';
import { createNewUser } from '../../services/firestore';
import { useNavigate } from 'react-router-dom';
import { Roles } from '../../config/common';

const PersonalDetailsPage = () =>  {
  const { user } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    if (user) {
      const userData = {
        id: user.providerData[0].uid,
        photo: user.photoURL || '',
        name: formData.fullName || '',
        email: formData.email || '',
        phoneNumber: formData.phone || '',
        address: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        role: [Roles.CUSTOMER], // Default role set to customer
        favorites: [],
        cartItems: [],
        isAgreeTermsAndConditions: formData.termsAccepted || false,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      try {
        await createNewUser(userData);
        navigate('/chooseusertype');
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="flex h-screen">
      <div className="flex flex-col w-full justify-center items-center p-8 bg-white">
        <div className="max-w-sm w-full">
          <PersonalDetailsForm
            initialData={{
              fullName: user?.displayName || '',
              email: user?.email || '',
            }}
            onSubmit={handleSubmit}
            showTermsAndConditions={true}
          />
        </div>
      </div>
    </div>
  );
};

export default PersonalDetailsPage;
