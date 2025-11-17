import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { getActiveCategories, getAppConfigBanners, getAllProducts, updateUserFavorites, getUserData, getAppConfigs, updateUserCart } from '../services/firestore';
import { getProductById } from '../services/productService';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]); // Store only product IDs
  const [cartProducts, setCartProducts] = useState([]); // Full product details for display
  const [favorites, setFavorites] = useState([]); // Store only product IDs
  const [user, setUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]); // This is used for filtering on StorePage
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search
  const [appConfigs, setAppConfigs] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch user-specific data like favorites and cart
        const userData = await getUserData(currentUser.providerData[0].uid);
        if (userData) {
          setFavorites(userData.favorites || []);
          setCart(userData.cart || []); // Load cart from Firestore
        } else {
          setFavorites([]);
          setCart([]);
        }
      } else {
        setFavorites([]); // Clear favorites if no user
        setCart([]); // Clear cart if no user
        setCartProducts([]); // Clear cart products
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch full product details whenever cart changes
  useEffect(() => {
    const fetchCartProducts = async () => {
      if (cart.length === 0) {
        setCartProducts([]);
        return;
      }

      try {
        const productsPromises = cart.map(productId => getProductById(productId));
        const fetchedProducts = await Promise.all(productsPromises);
        
        // Filter out null products
        const validProducts = fetchedProducts.filter(product => product !== null);
        
        setCartProducts(validProducts);
      } catch (error) {
        console.error('Error fetching cart products:', error);
      }
    };

    fetchCartProducts();
  }, [cart]);

  useEffect(() => {
    const fetchInitialData = async () => {
      // Fetch categories, banners, and all products in parallel
      const [fetchedCategories, fetchedBanners, fetchedProducts, fetchedAppConfigs] = await Promise.all([
        getActiveCategories(),
        getAppConfigBanners(),
        getAllProducts(), // Still needed for StorePage filtering for now
        getAppConfigs()
      ]);
      setCategories(fetchedCategories);
      setBanners(fetchedBanners);
      setProducts(fetchedProducts);
      setAppConfigs(fetchedAppConfigs);
    };

    fetchInitialData();
  }, []);

  const updateUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  const updateNewUserStatus = useCallback((status) => {
    setIsNewUser(status);
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      setFavorites([]);
      setCart([]); // Clear cart on logout
      setCartProducts([]); // Clear cart products
    } catch (error) {
      console.error(error);
    }
  }, []);

  const addToCart = useCallback(async (product) => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }

    let updatedCart;

    if (cart.includes(product.id)) {
      return;
    } else {
      updatedCart = [...cart, product.id];
    }

    setCart(updatedCart);

    try {
      await updateUserCart(user.providerData[0].uid, updatedCart);
    } catch (error) {
      console.error('Failed to update cart in Firestore:', error);
    }
  }, [user, cart]);

  const removeFromCart = useCallback(async (productId) => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }

    const updatedCart = cart.filter((id) => id !== productId);
    
    setCart(updatedCart);

    try {
      await updateUserCart(user.providerData[0].uid, updatedCart);
    } catch (error) {
      console.error('Failed to update cart in Firestore:', error);
    }
  }, [user, cart]);

  const isInCart = useCallback((productId) => cart.includes(productId), [cart]);

  const toggleFavorite = useCallback(async (product) => {
    if (!user) {
      setLoginModalOpen(true);
      return;
    }

    const productId = product.id;
    let updatedFavorites;

    if (favorites.includes(productId)) {
      updatedFavorites = favorites.filter((id) => id !== productId);
    } else {
      updatedFavorites = [...favorites, productId];
    }
    
    try {
      await updateUserFavorites(user.providerData[0].uid, updatedFavorites);
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Failed to update favorites in Firestore:', error);
    }
  }, [user, favorites]);

  const isFavorite = useCallback((productId) => favorites.includes(productId), [favorites]);

  const getTotalPrice = useCallback(() => {
    const price = cartProducts.reduce((sum, item) => sum + (item.discountPrice || item.price || 0), 0);
    return price;
  }, [cartProducts]);

  const getTotalDiscount = useCallback(() => {
    const discount = cartProducts.reduce((sum, item) => sum + ((item.actualPrice || item.originalPrice || 0) - (item.discountPrice || item.price || 0)), 0);
    return discount;
  }, [cartProducts]);

  const updateLocation = useCallback((location) => {
    setSelectedLocation(location);
  }, []);

  return (
    <AppContext.Provider
      value={{
        cart: cartProducts, // Provide full product details for display
        favorites,
        products,
        categories,
        banners,
        user,
        isNewUser,
        loginModalOpen,
        setLoginModalOpen,
        selectedLocation,
        updateLocation,
        searchQuery,      // Provide search query
        setSearchQuery,   // Provide setter for search query
        appConfigs,
        updateUser,
        updateNewUserStatus,
        addToCart,
        removeFromCart,
        isInCart, // New helper function
        toggleFavorite,
        isFavorite,
        getTotalPrice,
        getTotalDiscount,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}