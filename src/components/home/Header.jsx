import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, User, Heart, ShoppingCart, Menu, X, Store, Phone } from 'lucide-react';
import appLogo from '../../assets/images/appLogo@2x.png'
import { TKFrameIcon } from '../common/Icons/TKFrameIcon';
import { useAppContext } from '../../context/AppContext';
import { getUserData } from '../../services/firestore';
import { getStoreByUserId } from '../../services/storeFirestoreService';
import { KERALA_DISTRICTS } from '../../config/common';


const Header = ({
  searchQuery,
  setSearchQuery,
  navigateTo,
  favoritesCount,
  cartCount,
  logout,
}) => {
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, selectedLocation, updateLocation, activeStore } = useAppContext();
  const [role, setRole] = useState(false);
  const [storeId, setStoreId] = useState(null);
  const currentUserId = user?.uid || user?.providerData?.[0]?.uid;
  const currentUserEmail = user?.email || user?.providerData?.[0]?.email;

  const isStorePage = location.pathname.startsWith('/vendor/') || location.pathname.startsWith('/shop/');

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUserId || currentUserEmail) {
        // User is logged in. Fetch all user-related data.
        const userData = await getUserData(currentUserId, currentUserEmail);
        if (userData) {
          // Set location from user profile. This is the source of truth on login.
          if (userData.city) {
            updateLocation(userData.city);
          }
          if (userData.role) {
            setRole(userData.role);
          }
        }
      }
    };
    fetchUserData();
  }, [currentUserId, currentUserEmail]);

  useEffect(() => {
    const fetchStore = async () => {
      if (currentUserId) {
        try {
          const store = await getStoreByUserId(currentUserId);
          if (store) {
            setStoreId(store.id);
          }
        } catch (error) {
          console.error('Error fetching store:', error);
        }
      }
    };
    fetchStore();
  }, [currentUserId]);

  const handleLocationSelect = (district) => {
    updateLocation(district);
    setIsLocationDropdownOpen(false);
  };

  const handleProfileClick = () => {
    if (user) {
      setIsDropdownOpen(!isDropdownOpen);
    } else {
      navigateTo('/login');
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    navigateTo('/login');
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-container')) {
        setIsDropdownOpen(false);
        setIsLocationDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container') && !event.target.closest('.mobile-menu-button')) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);
  
  useEffect(() => {
    if (selectedLocation && selectedLocation !== 'Select Location') {
      localStorage.setItem('selectedLocation', selectedLocation);
    }
  }, [selectedLocation]);

  // Exclusive Store Page Navbar
  if (isStorePage) {
    const storeLogo = activeStore?.logoUrl || activeStore?.logo || activeStore?.storeLogo || activeStore?.imageUrl;
    const storeName = activeStore?.storeName || 'Store';

    return (
      <header className="bg-white shadow-xs border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Store Brand: Store Logo replacing DealzHub logo */}
            <div className="flex items-center gap-3">
              {storeLogo ? (
                <img
                  src={storeLogo}
                  alt={`${storeName} Logo`}
                  className="h-10 sm:h-11 w-auto max-w-[160px] rounded-xl object-contain"
                />
              ) : (
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#E5EEE9] border border-[#528E6B]/30 flex items-center justify-center text-[#254030] font-black text-xl shadow-xs">
                  {storeName ? storeName.charAt(0).toUpperCase() : <Store className="w-6 h-6 text-[#528E6B]" />}
                </div>
              )}
            </div>

            {/* Right Side: Store Direct Contact */}
            <div className="flex items-center gap-3">
              {activeStore?.phoneNumber && (
                <a
                  href={`tel:${activeStore.phoneNumber}`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 bg-[#E5EEE9]/60 hover:bg-[#E5EEE9] text-[#254030] border border-[#528E6B]/20 rounded-full transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-[#528E6B]" />
                  <span className="hidden sm:inline">{activeStore.phoneNumber}</span>
                  <span className="sm:hidden">Call</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo and Location - Desktop */}
          <div className="hidden md:flex items-center gap-8">
            <div className='flex items-center gap-4'>
              <img
                src={appLogo}
                alt="App Logo"
                className="w-20 h-20 object-cover cursor-pointer"
                loading="lazy"
                onClick={() => {
                  window.location.href = "/home";
                }}
              />
              <div className="relative dropdown-container">
                <button
                  type="button"
                  className="flex gap-1 text-sm cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLocationDropdownOpen((prev) => !prev);
                  }}
                >
                  <TKFrameIcon />
                  <div className='flex flex-col justify-start items-start'>
                    <p className='text-sm font-bold'>Location</p>
                    <span className='flex items-center gap-1 text-quaternaryTextColor'>
                      <span>{selectedLocation || 'Select Location'}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </span>
                  </div>
                </button>
                {isLocationDropdownOpen && (
                  <div 
                    className="absolute left-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 max-h-[calc(100vh-100px)] overflow-y-auto border border-gray-100"
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    {KERALA_DISTRICTS.map((district) => (
                      <button
                        type="button"
                        key={district}
                        className={`block w-[calc(100%-16px)] text-left px-4 py-2 mx-2 text-sm rounded-lg transition-colors cursor-pointer ${
                          selectedLocation === district ? 'bg-[#E5EEE9] text-[#254030] font-bold' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          updateLocation(district);
                          setIsLocationDropdownOpen(false);
                          setShowLocationPrompt(false);
                        }}
                      >
                        {district}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-inputBackground border border-inputBorder px-3 py-2 rounded-full w-52 lg:w-[360px]">
              <Search className="w-5 h-5 text-iconShadeColor" />
              <input
                type="text"
                placeholder="Search for products and stores"
                className="bg-transparent outline-none flex-1 text-sm leading-5"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Mobile - Logo and Hamburger */}
          <div className="md:hidden flex items-center justify-between w-full">
            <img
              src={appLogo}
              alt="App Logo"
              className="w-16 h-16 object-cover cursor-pointer"
              loading="lazy"
              onClick={() => {
                window.location.href = "/home";
              }}
            />
            <button
              className="p-2 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <div className="relative dropdown-container">
                  <button
                    type="button"
                    className="flex items-center gap-2 w-10 h-10 rounded-full bg-primaryButtonBackgroundColor justify-center cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDropdownOpen((prev) => !prev);
                    }}
                  >
                    <User className="w-6 h-6 fill-secondaryButtonBackgroundColor text-secondaryButtonBackgroundColor" />
                  </button>
                  {isDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-green-50">
                        <img
                          src={user?.photoURL || user?.providerData?.[0]?.photoURL || ''}
                          alt="Profile"
                          className="w-12 h-12 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{user?.displayName || user?.providerData?.[0]?.displayName || 'User'}</p>
                          <p className="text-xs text-gray-800">{user?.email || user?.providerData?.[0]?.email || ''}</p>
                        </div>
                      </div>
                      {storeId ? (
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigateTo(`/vendor/${storeId}`);
                          }}
                          className="block w-full text-left px-4 py-2 m-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                        >
                          My Store
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            navigateTo('/vendordetails');
                          }}
                          className="block w-full text-left px-4 py-2 m-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        >
                          Create Store
                        </button>
                      )}
                      <a
                        href="/editprofile"
                        className="block px-4 py-2 m-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        Edit Profile
                      </a>
                      <a
                        href=""
                        className="block px-4 py-2 m-2 text-sm text-gray-700 hover:bg-red-100 hover:text-red-600 rounded-md"
                        onClick={logout}
                      >
                        Logout
                      </a>
                    </div>
                  )}
                </div>
                 {storeId ? (
                  <button
                    className="p-2 bg-secondaryButtonBackgroundColor gap-2 rounded-full flex items-center justify-center text-gray-700 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => navigateTo(`/vendor/${storeId}`)}
                  >
                    My Store
                  </button>
                ) : (
                  <button
                    className="p-2 bg-secondaryButtonBackgroundColor gap-2 rounded-full flex items-center justify-center text-gray-700 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                    onClick={() => navigateTo('/vendordetails')}
                  >
                    Create Store
                  </button>
                )}
                <button
                  className="relative hover:text-blue-600"
                  onClick={() => navigateTo('/favorites')}
                >
                  <Heart className="w-6 h-6" />
                  {favoritesCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </button>
                <button
                  className="relative hover:text-blue-600"
                  onClick={() => navigateTo('/cart')}
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  className="p-2 px-5 bg-secondaryButtonBackgroundColor gap-2 rounded-full flex items-center justify-center text-gray-700 border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98] text-sm font-medium"
                  onClick={() => navigateTo('/login')}
                >
                  Create Store
                </button>
                <button
                  className="p-2 bg-primaryButtonBackgroundColor text-white rounded-full px-6 py-2 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                  onClick={() => navigateTo('/login')}
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-3">
          <div className="flex items-center gap-2 bg-inputBackground border border-inputBorder px-3 py-2 rounded-full">
            <Search className="w-5 h-5 text-iconShadeColor" />
            <input
              type="text"
              placeholder="Search for products and stores"
              className="bg-transparent outline-none flex-1 text-sm leading-5"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu Sidebar */}
      <div className={`mobile-menu-container md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Menu</h2>
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Location Selector */}
          <div className="mb-6 pb-4 border-b dropdown-container">
            <button
              type="button"
              className="flex items-center gap-2 w-full text-left cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setIsLocationDropdownOpen((prev) => !prev);
              }}
            >
              <TKFrameIcon />
              <div className='flex flex-col'>
                <p className='text-sm font-bold'>Location</p>
                <span className='flex items-center gap-1 text-quaternaryTextColor text-sm'>
                  <span>{selectedLocation || 'Select Location'}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </span>
              </div>
            </button>
            {isLocationDropdownOpen && (
              <div 
                className="mt-2 max-h-48 overflow-y-auto bg-gray-50 rounded-xl p-1 border border-gray-100"
                onMouseDown={(e) => e.stopPropagation()}
              >
                {KERALA_DISTRICTS.map((district) => (
                  <button
                    type="button"
                    key={district}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                      selectedLocation === district ? 'bg-[#E5EEE9] text-[#254030] font-bold' : 'text-gray-700 hover:bg-gray-200/60'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      updateLocation(district);
                      setIsLocationDropdownOpen(false);
                      setShowLocationPrompt(false);
                    }}
                  >
                    {district}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              {/* User Profile Section */}
              <div className="mb-4 pb-4 border-b">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={user?.photoURL || user?.providerData?.[0]?.photoURL || ''}
                    alt="Profile"
                    className="w-12 h-12 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{user?.displayName || user?.providerData?.[0]?.displayName || 'User'}</p>
                    <p className="text-xs text-gray-600">{user?.email || user?.providerData?.[0]?.email || ''}</p>
                  </div>
                </div>
                <a
                  href="/editprofile"
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Edit Profile
                </a>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                <button
                  className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    navigateTo('/favorites');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <Heart className="w-5 h-5" />
                  <span>Favorites</span>
                  {favoritesCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {favoritesCount}
                    </span>
                  )}
                </button>

                <button
                  className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => {
                    navigateTo('/cart');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart</span>
                  {cartCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>

                {storeId ? (
                  <button
                    className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => {
                      navigateTo(`/vendor/${storeId}`);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="w-5 h-5" />
                    <span>My Store</span>
                  </button>
                ) : (
                  <button
                    className="flex items-center gap-3 w-full px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                    onClick={() => {
                      navigateTo('/vendordetails');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <User className="w-5 h-5" />
                    <span>Create Store</span>
                  </button>
                )}

                <button
                  className="flex items-center gap-3 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-md mt-4"
                  onClick={(e) => {
                    logout(e);
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span>Logout</span>
                </button>
              </nav>
            </>
          ) : (
            <div className="space-y-3">
              <button
                className="w-full p-2.5 bg-secondaryButtonBackgroundColor text-gray-800 border border-gray-200 rounded-full font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
                onClick={() => {
                  navigateTo('/login');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Store className="w-4 h-4 text-emerald-700" />
                <span>Create Store</span>
              </button>
              <button
                className="w-full p-2.5 bg-primaryButtonBackgroundColor text-white rounded-full font-medium text-sm shadow-sm"
                onClick={() => {
                  navigateTo('/login');
                  setIsMobileMenuOpen(false);
                }}
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>

      {showLocationPrompt && selectedLocation === 'Select Location' && (
        <div className="fixed inset-0 bg-gray-500/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center mx-4">
            <p className="text-lg font-semibold mb-4">Please select your location in the top navigation bar.</p>
            <div className='w-full flex justify-center'>
              <button
                className="p-2 bg-primaryButtonBackgroundColor gap-2 rounded-full w-full md:w-5/12 flex items-center justify-center text-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => setShowLocationPrompt(false)}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;