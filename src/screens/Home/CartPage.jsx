import React from 'react';
import noDataFound from '../../assets/images/noDataFound@3x.png';
import { Minus, Plus } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalDiscount } = useAppContext();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Shopping Cart ({cart.length})</h1>
        {cart.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <img src={noDataFound} alt="No Favorites" className="w-48 h-48 mx-auto mb-6" loading="lazy" />
            <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add items to get started</p>
            <div className='w-full flex items-center justify-center'>
              <button
                onClick={() => navigate('/home')}
                className="p-2 bg-primaryButtonBackgroundColor gap-2 rounded-full w-4/12 flex items-center justify-center text-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-6 flex gap-6">
                  <div className="w-44 h-44 bg-gray-200 rounded-3xl flex items-center justify-center overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-3xl transition-opacity duration-300"
                      loading="lazy"
                      onLoad={(e) => (e.currentTarget.style.opacity = '1')}
                      style={{ opacity: 0 }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-lg mb-2">{item.name}</h3>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-xl font-bold">₹{item.actualPrice.toLocaleString()}</span>
                      <span className="text-sm text-gray-400 line-through">
                        ₹{item.discountPrice.toLocaleString()}
                      </span>
                    </div>
                      <span className="text-sm text-gray-800  mb-4">
                        {item.description}
                      </span>
                    <div className="flex items-center gap-4 mt-4">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 bg-red-500/10 gap-2 rounded-full w-5/12 flex items-center justify-center text-red-700 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Remove
                      </button>
                      <button
                        onClick={() => navigate(`/product/${item.id}`)} className="p-2 bg-primaryButtonBackgroundColor gap-2 rounded-full w-5/12 flex items-center justify-center text-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]">
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
