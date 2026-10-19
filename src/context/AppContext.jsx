import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { getActiveCategories, getAppConfigBanners, getAllProducts, updateUserFavorites, getUserData, getAppConfigs, updateUserStoreCarts } from '../services/firestore';
import { getProductById } from '../services/productService';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  // Store-level cart map: { [storeId]: CartItem[] }
  const [storeCarts, setStoreCarts] = useState(() => {
    try {
      const cached = localStorage.getItem('dealzhub_store_carts');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const [favorites, setFavorites] = useState([]); // Store only product IDs
  const [user, setUser] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]); // Kept for backwards compatibility
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      return localStorage.getItem('selectedLocation') || 'Ernakulam';
    } catch {
      return 'Ernakulam';
    }
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [onLoginModalContinue, setOnLoginModalContinue] = useState(null);
  const [searchQuery, setSearchQuery] = useState(''); // New state for search
  const [appConfigs, setAppConfigs] = useState([]);
  const [activeStore, setActiveStore] = useState(null); // Active store context for exclusive store views

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const uid = currentUser.uid || currentUser.providerData?.[0]?.uid;
        // Fetch user-specific data like favorites and store-level carts
        const userData = await getUserData(uid);
        if (userData) {
          setFavorites(userData.favorites || []);

          // Cloud store carts
          const cloudStoreCarts = userData.storeCarts || {};

          // Guest local store carts from session cache
          let localCarts = {};
          try {
            const cached = localStorage.getItem('dealzhub_store_carts');
            localCarts = cached ? JSON.parse(cached) : {};
          } catch {}

          // Merge local guest carts into user's cloud store carts
          let hasMergedChanges = false;
          const mergedCarts = { ...cloudStoreCarts };

          Object.entries(localCarts).forEach(([sId, items]) => {
            if (!Array.isArray(items) || items.length === 0) return;
            if (!mergedCarts[sId] || mergedCarts[sId].length === 0) {
              mergedCarts[sId] = items;
              hasMergedChanges = true;
            } else {
              const currentStoreItems = [...mergedCarts[sId]];
              items.forEach(localItem => {
                const existIdx = currentStoreItems.findIndex(e =>
                  (e.productId || e.id) === (localItem.productId || localItem.id) &&
                  (e.selectedSize || null) === (localItem.selectedSize || null) &&
                  (e.selectedWeight || null) === (localItem.selectedWeight || null)
                );
                if (existIdx > -1) {
                  currentStoreItems[existIdx].quantity = Math.max(
                    currentStoreItems[existIdx].quantity || 1,
                    localItem.quantity || 1
                  );
                  currentStoreItems[existIdx].cartQuantity = currentStoreItems[existIdx].quantity;
                } else {
                  currentStoreItems.push(localItem);
                }
              });
              mergedCarts[sId] = currentStoreItems;
              hasMergedChanges = true;
            }
          });

          setStoreCarts(mergedCarts);
          try {
            localStorage.setItem('dealzhub_store_carts', JSON.stringify(mergedCarts));
          } catch {}

          if (hasMergedChanges) {
            updateUserStoreCarts(uid, mergedCarts).catch(err => {
              console.error('Error syncing merged store carts to Firestore:', err);
            });
          }

          if (userData.city && !localStorage.getItem('selectedLocation')) {
            setSelectedLocation(userData.city);
            try {
              localStorage.setItem('selectedLocation', userData.city);
            } catch {}
          }
        } else {
          setFavorites([]);
        }
      } else {
        // Non-logged-in user: keep / read session cache
        try {
          const cached = localStorage.getItem('dealzhub_store_carts');
          setStoreCarts(cached ? JSON.parse(cached) : {});
        } catch {
          setStoreCarts({});
        }
        setFavorites([]); // Clear favorites if no user
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [fetchedCategories, fetchedBanners, fetchedAppConfigs] = await Promise.all([
          getActiveCategories(),
          getAppConfigBanners(),
          getAppConfigs()
        ]);
        setCategories(fetchedCategories || []);
        setBanners(fetchedBanners || []);
        setAppConfigs(fetchedAppConfigs || []);
      } catch (err) {
        console.error('Error fetching initial config data:', err);
      }
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
      try {
        const cached = localStorage.getItem('dealzhub_store_carts');
        setStoreCarts(cached ? JSON.parse(cached) : {});
      } catch {
        setStoreCarts({});
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  // --- Shop-Level Cart Operations ---

  const getStoreCart = useCallback((storeId) => {
    if (!storeId) return [];
    return storeCarts[storeId] || [];
  }, [storeCarts]);

  const getStoreCartCount = useCallback((storeId) => {
    if (!storeId) return 0;
    const items = storeCarts[storeId] || [];
    return items.reduce((sum, item) => sum + (item.quantity || item.cartQuantity || 1), 0);
  }, [storeCarts]);

  const getStoreCartTotals = useCallback((storeId) => {
    if (!storeId) return { totalCount: 0, totalPrice: 0, totalDiscount: 0 };
    const items = storeCarts[storeId] || [];
    const totalCount = items.reduce((sum, item) => sum + (item.quantity || item.cartQuantity || 1), 0);
    const totalPrice = items.reduce((sum, item) => {
      const qty = item.quantity || item.cartQuantity || 1;
      const unitP = item.unitPrice !== undefined ? item.unitPrice : (item.discountPrice || item.price || 0);
      return sum + (unitP * qty);
    }, 0);
    const totalDiscount = items.reduce((sum, item) => {
      const qty = item.quantity || item.cartQuantity || 1;
      const actual = item.actualPrice || item.originalPrice || 0;
      const unitP = item.unitPrice !== undefined ? item.unitPrice : (item.discountPrice || item.price || 0);
      return sum + Math.max(0, (actual - unitP) * qty);
    }, 0);
    return {
      totalCount,
      totalPrice: Math.round(totalPrice * 100) / 100,
      totalDiscount: Math.round(totalDiscount * 100) / 100,
    };
  }, [storeCarts]);

  const isItemInStoreCart = useCallback((storeId, productId, selectedSize = null, selectedWeight = null) => {
    if (!storeId || !productId) return false;
    const items = storeCarts[storeId] || [];
    return items.some(item => {
      const matchId = (item.productId || item.id) === productId;
      if (!matchId) return false;
      if (selectedSize && (item.selectedSize || null) !== selectedSize) return false;
      if (selectedWeight && (item.selectedWeight || null) !== selectedWeight) return false;
      return true;
    });
  }, [storeCarts]);

  const addToStoreCart = useCallback(async (targetStoreId, product, options = {}) => {
    const finalStoreId = targetStoreId || product.storeId || product.store?.id || (activeStore?.id) || 'general';
    const quantity = options.quantity || 1;
    const selectedSize = options.selectedSize || null;
    const selectedWeight = options.selectedWeight || null;
    const unitPrice = options.unitPrice !== undefined 
      ? options.unitPrice 
      : (product.discountPrice !== undefined ? product.discountPrice : (product.actualPrice || product.price || 0));

    setStoreCarts(prevCarts => {
      const currentItems = prevCarts[finalStoreId] || [];
      const existingIndex = currentItems.findIndex(item => {
        const matchId = (item.productId || item.id) === (product.productId || product.id);
        const matchSize = (item.selectedSize || null) === (selectedSize || null);
        const matchWeight = (item.selectedWeight || null) === (selectedWeight || null);
        return matchId && matchSize && matchWeight;
      });

      let updatedItems;
      if (existingIndex > -1) {
        updatedItems = [...currentItems];
        const existing = updatedItems[existingIndex];
        const newQty = (existing.quantity || existing.cartQuantity || 1) + quantity;
        updatedItems[existingIndex] = {
          ...existing,
          quantity: newQty,
          cartQuantity: newQty,
          unitPrice,
          itemTotalPrice: Math.round(unitPrice * newQty * 100) / 100,
        };
      } else {
        const newItem = {
          id: product.id,
          productId: product.id,
          name: product.name,
          image: (product.images && product.images.length > 0 ? product.images[0] : product.image) || '',
          images: product.images || [],
          actualPrice: product.actualPrice || product.price || 0,
          discountPrice: product.discountPrice || product.price || 0,
          unitPrice,
          quantity,
          cartQuantity: quantity,
          selectedSize,
          selectedWeight,
          unit: product.unit || 'pcs',
          unitValue: product.unitValue || 1,
          storeId: finalStoreId,
          store: product.store || options.storeInfo || (activeStore && activeStore.id === finalStoreId ? activeStore : null),
          itemTotalPrice: Math.round(unitPrice * quantity * 100) / 100,
          addedAt: Date.now(),
        };
        updatedItems = [...currentItems, newItem];
      }

      const newStoreCarts = {
        ...prevCarts,
        [finalStoreId]: updatedItems,
      };

      try {
        localStorage.setItem('dealzhub_store_carts', JSON.stringify(newStoreCarts));
      } catch (err) {
        console.error('Error saving store carts to localStorage:', err);
      }

      if (user) {
        const uid = user.uid || user.providerData?.[0]?.uid;
        updateUserStoreCarts(uid, newStoreCarts).catch(err => {
          console.error('Failed to sync store carts to Firestore:', err);
        });
      }

      return newStoreCarts;
    });
  }, [activeStore, user]);

  const updateStoreCartQuantity = useCallback(async (storeId, productId, newQuantity, selectedSize = null, selectedWeight = null) => {
    if (!storeId) return;
    if (newQuantity <= 0) {
      removeFromStoreCart(storeId, productId, selectedSize, selectedWeight);
      return;
    }

    setStoreCarts(prevCarts => {
      const currentItems = prevCarts[storeId] || [];
      const updatedItems = currentItems.map(item => {
        const matchId = (item.productId || item.id) === productId;
        const matchSize = (item.selectedSize || null) === (selectedSize || null);
        const matchWeight = (item.selectedWeight || null) === (selectedWeight || null);
        if (matchId && matchSize && matchWeight) {
          const unitP = item.unitPrice !== undefined ? item.unitPrice : (item.discountPrice || item.price || 0);
          return {
            ...item,
            quantity: newQuantity,
            cartQuantity: newQuantity,
            itemTotalPrice: Math.round(unitP * newQuantity * 100) / 100,
          };
        }
        return item;
      });

      const newStoreCarts = {
        ...prevCarts,
        [storeId]: updatedItems,
      };

      try {
        localStorage.setItem('dealzhub_store_carts', JSON.stringify(newStoreCarts));
      } catch {}

      if (user) {
        const uid = user.uid || user.providerData?.[0]?.uid;
        updateUserStoreCarts(uid, newStoreCarts).catch(console.error);
      }

      return newStoreCarts;
    });
  }, [user]);

  const removeFromStoreCart = useCallback(async (storeId, productId, selectedSize = null, selectedWeight = null) => {
    if (!storeId) return;

    setStoreCarts(prevCarts => {
      const currentItems = prevCarts[storeId] || [];
      const updatedItems = currentItems.filter(item => {
        const matchId = (item.productId || item.id) === productId;
        const matchSize = (item.selectedSize || null) === (selectedSize || null);
        const matchWeight = (item.selectedWeight || null) === (selectedWeight || null);
        return !(matchId && matchSize && matchWeight);
      });

      const newStoreCarts = { ...prevCarts };
      if (updatedItems.length === 0) {
        delete newStoreCarts[storeId];
      } else {
        newStoreCarts[storeId] = updatedItems;
      }

      try {
        localStorage.setItem('dealzhub_store_carts', JSON.stringify(newStoreCarts));
      } catch {}

      if (user) {
        const uid = user.uid || user.providerData?.[0]?.uid;
        updateUserStoreCarts(uid, newStoreCarts).catch(console.error);
      }

      return newStoreCarts;
    });
  }, [user]);

  const clearStoreCart = useCallback(async (storeId) => {
    if (!storeId) return;

    setStoreCarts(prevCarts => {
      const newStoreCarts = { ...prevCarts };
      delete newStoreCarts[storeId];

      try {
        localStorage.setItem('dealzhub_store_carts', JSON.stringify(newStoreCarts));
      } catch {}

      if (user) {
        const uid = user.uid || user.providerData?.[0]?.uid;
        updateUserStoreCarts(uid, newStoreCarts).catch(console.error);
      }

      return newStoreCarts;
    });
  }, [user]);

  // Backward-compatible delegates
  const activeCartItems = useMemo(() => {
    if (activeStore?.id && storeCarts[activeStore.id]) {
      return storeCarts[activeStore.id];
    }
    const all = [];
    Object.values(storeCarts).forEach(items => {
      if (Array.isArray(items)) all.push(...items);
    });
    return all;
  }, [activeStore, storeCarts]);

  const addToCart = useCallback(async (product, options = {}) => {
    const sId = options.storeId || product.storeId || product.store?.id || activeStore?.id;
    await addToStoreCart(sId, product, options);
  }, [activeStore, addToStoreCart]);

  const updateQuantity = useCallback(async (productId, newQuantity, selectedSize = null, selectedWeight = null, storeId = null) => {
    let targetStoreId = storeId || (activeStore && activeStore.id);
    if (!targetStoreId) {
      for (const [sId, items] of Object.entries(storeCarts)) {
        if (items.some(i => (i.productId || i.id) === productId)) {
          targetStoreId = sId;
          break;
        }
      }
    }
    if (targetStoreId) {
      await updateStoreCartQuantity(targetStoreId, productId, newQuantity, selectedSize, selectedWeight);
    }
  }, [activeStore, storeCarts, updateStoreCartQuantity]);

  const removeFromCart = useCallback(async (productId, selectedSize = null, selectedWeight = null, storeId = null) => {
    let targetStoreId = storeId || (activeStore && activeStore.id);
    if (!targetStoreId) {
      for (const [sId, items] of Object.entries(storeCarts)) {
        if (items.some(i => (i.productId || i.id) === productId)) {
          targetStoreId = sId;
          break;
        }
      }
    }
    if (targetStoreId) {
      await removeFromStoreCart(targetStoreId, productId, selectedSize, selectedWeight);
    }
  }, [activeStore, storeCarts, removeFromStoreCart]);

  const isInCart = useCallback((productId, storeId = null) => {
    const targetStoreId = storeId || (activeStore && activeStore.id);
    if (targetStoreId) {
      return isItemInStoreCart(targetStoreId, productId);
    }
    return Object.values(storeCarts).some(items => items.some(i => (i.productId || i.id) === productId));
  }, [activeStore, storeCarts, isItemInStoreCart]);

  const getTotalPrice = useCallback(() => {
    if (activeStore?.id) {
      return getStoreCartTotals(activeStore.id).totalPrice;
    }
    let total = 0;
    Object.keys(storeCarts).forEach(sId => {
      total += getStoreCartTotals(sId).totalPrice;
    });
    return Math.round(total * 100) / 100;
  }, [activeStore, storeCarts, getStoreCartTotals]);

  const getTotalDiscount = useCallback(() => {
    if (activeStore?.id) {
      return getStoreCartTotals(activeStore.id).totalDiscount;
    }
    let total = 0;
    Object.keys(storeCarts).forEach(sId => {
      total += getStoreCartTotals(sId).totalDiscount;
    });
    return Math.round(total * 100) / 100;
  }, [activeStore, storeCarts, getStoreCartTotals]);

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
      const uid = user.uid || user.providerData?.[0]?.uid;
      await updateUserFavorites(uid, updatedFavorites);
      setFavorites(updatedFavorites);
    } catch (error) {
      console.error('Failed to update favorites in Firestore:', error);
    }
  }, [user, favorites]);

  const isFavorite = useCallback((productId) => favorites.includes(productId), [favorites]);

  const updateLocation = useCallback((location) => {
    setSelectedLocation(location);
    try {
      if (location && location !== 'Select Location') {
        localStorage.setItem('selectedLocation', location);
      }
    } catch (err) {
      console.error('Error saving location to localStorage:', err);
    }
  }, []);

  return (
    <AppContext.Provider
      value={{
        cart: activeCartItems, // Active store cart or all items
        storeCarts,
        getStoreCart,
        getStoreCartCount,
        getStoreCartTotals,
        isItemInStoreCart,
        addToStoreCart,
        updateStoreCartQuantity,
        removeFromStoreCart,
        clearStoreCart,
        favorites,
        products,
        categories,
        banners,
        user,
        isNewUser,
        loginModalOpen,
        setLoginModalOpen,
        onLoginModalContinue,
        setOnLoginModalContinue,
        selectedLocation,
        updateLocation,
        searchQuery,      // Provide search query
        setSearchQuery,   // Provide setter for search query
        appConfigs,
        updateUser,
        updateNewUserStatus,
        addToCart,
        updateQuantity,
        removeFromCart,
        isInCart,
        toggleFavorite,
        isFavorite,
        getTotalPrice,
        getTotalDiscount,
        logout,
        activeStore,
        setActiveStore,
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