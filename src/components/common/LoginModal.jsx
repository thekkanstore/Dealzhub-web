import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginModal = ({ isOpen, onClose, onContinue }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleContinue = () => {
    onClose();
    if (onContinue) {
      onContinue();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-500/70 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-sm w-full mx-4">
        <h2 className="text-lg font-semibold mb-4">Login Required</h2>
        <p className="text-gray-600 mb-6">You need to be logged in to perform this action.</p>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="p-2 bg-secondaryButtonBackgroundColor gap-2 rounded-full w-1/2 flex items-center justify-center text-gray-700 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleLogin}
              className="p-2 bg-primaryButtonBackgroundColor gap-2 rounded-full w-1/2 flex items-center justify-center text-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              Login
            </button>
          </div>
          {onContinue && (
            <button
              onClick={handleContinue}
              className="text-primaryButtonBackgroundColor hover:underline text-sm font-medium focus:outline-none transition-all duration-200 mt-1 cursor-pointer"
            >
              Continue without login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
