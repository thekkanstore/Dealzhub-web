import { collection, getDocs, doc, getDoc, addDoc, updateDoc, setDoc, query, where, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import { FireStoreCollections } from "../config/common";
import { clearStoreCache } from './storeFirestoreService';

export const getActiveCategories = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'categories'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const getAppConfigBanners = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'banners'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching banners:', error);
    return [];
  }
};

export const getUserData = async (uid, email = null) => {
  try {
    if (uid) {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          cart: data.cart || [],
          ...data,
        };
      }
    }

    if (email) {
      const q = query(collection(db, "users"), where("email", "==", email), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const data = docSnap.data();
        return {
          id: docSnap.id,
          cart: data.cart || [],
          ...data,
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

export const checkIsUserRegistrationCompleted = async (uid) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData?.registrationCompleted === true;
    } else {
      return false;
    }
  } catch (error) {
    console.error('Error checking user registration:', error);
    return false;
  }
};

export const updateUserRoles = async (uid, roles) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      userType: roles[0], // Assuming only one role is set at a time for userType
    });
  } catch (error) {
    console.error('Error updating user roles:', error);
  }
};

export const createNewUser = async (userData, isUpdate = false) => {
  try {
    const userDocRef = doc(db, 'users', userData.id);
    if (isUpdate) {
      await updateDoc(userDocRef, userData);
    } else {
      await setDoc(userDocRef, userData);
    }
  } catch (error) {
    console.error('Error creating/updating user:', error);
  }
};

export const createNewStore = async (storeData) => {
  try {
    const storesCollectionRef = collection(db, 'stores');

    // Prevent duplicate stores for the same user or email
    if (storeData.userId) {
      const qUser = query(storesCollectionRef, where('userId', '==', storeData.userId), limit(1));
      const userSnap = await getDocs(qUser);
      if (!userSnap.empty) {
        const existingDoc = userSnap.docs[0];
        await setDoc(existingDoc.ref, storeData, { merge: true });
        return existingDoc.id;
      }
    }

    if (storeData.email) {
      const qEmail = query(storesCollectionRef, where('email', '==', storeData.email), limit(1));
      const emailSnap = await getDocs(qEmail);
      if (!emailSnap.empty) {
        const existingDoc = emailSnap.docs[0];
        await setDoc(existingDoc.ref, storeData, { merge: true });
        return existingDoc.id;
      }
    }

    const newStoreDocRef = await addDoc(storesCollectionRef, storeData);
    return newStoreDocRef.id;
  } catch (error) {
    console.error('Error creating/updating store:', error);
    throw error;
  }
};

export const updateUserFavorites = async (userId, favoriteProductIds) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await setDoc(userDocRef, {
      favorites: favoriteProductIds,
    }, { merge: true });
  } catch (error) {
    console.error('Error updating user favorites:', error);
    throw error;
  }
};

export const updateUserCart = async (userId, cart) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, {
      cartItems: cart
    });
  } catch (error) {
    console.error('Error updating user cart:', error);
    throw error;
  }
};

export const updateUserRole = async (userId, role, userEmail = null) => {
  try {
    let userDocRef = null;
    if (userId) {
      const ref = doc(db, 'users', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        userDocRef = ref;
      }
    }

    if (!userDocRef && userEmail) {
      const q = query(collection(db, 'users'), where('email', '==', userEmail), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        userDocRef = snap.docs[0].ref;
      }
    }

    if (userDocRef) {
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      const currentRoles = userData.role || [];
      
      if (!currentRoles.includes(role)) {
        const updatedRoles = [...currentRoles, role];
        await updateDoc(userDocRef, {
          role: updatedRoles,
          updatedAt: new Date()
        });
      }
    }
  } catch (error) {
    console.error('Error updating user role:', error);
  }
};

export const getProductsByStore = async (storeId, limitCount, lastVisible = null) => {
  try {
    let productsQuery = query(
      collection(db, FireStoreCollections.PRODUCTS),
      where('vendorId', '==', storeId),
      limit(limitCount)
    );

    if (lastVisible) {
      productsQuery = query(productsQuery, startAfter(lastVisible));
    }

    const snapshot = await getDocs(productsQuery);
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const newLastVisible = snapshot.docs[snapshot.docs.length - 1];

    return { products, lastVisible: newLastVisible };
  } catch (error) {
    console.error('Error fetching products by store:', error);
    return { products: [], lastVisible: null };
  }
};

export const getAllProducts = async () => {
  try {
    const snapshot = await getDocs(collection(db, FireStoreCollections.PRODUCTS));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
};

export const getAppConfigs = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'appConfig'));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching app configs:', error);
    return [];
  }
};

export const updateUserProfile = async (userId, userData, userEmail = null) => {
  try {
    let userDocRef = null;
    if (userId) {
      const ref = doc(db, 'users', userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        userDocRef = ref;
      }
    }

    if (!userDocRef && userEmail) {
      const q = query(collection(db, 'users'), where('email', '==', userEmail), limit(1));
      const snap = await getDocs(q);
      if (!snap.empty) {
        userDocRef = snap.docs[0].ref;
      }
    }

    if (!userDocRef && userId) {
      userDocRef = doc(db, 'users', userId);
    }

    if (userDocRef) {
      await setDoc(userDocRef, userData, { merge: true });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getStoreByUserId = async (userId, userEmail = null) => {
  if (!userId && !userEmail) return null;
  try {
    if (userId) {
      const q = query(
        collection(db, "stores"),
        where("userId", "==", userId),
        limit(1)
      );
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      }
    }

    if (userEmail) {
      const qEmail = query(
        collection(db, "stores"),
        where("email", "==", userEmail),
        limit(1)
      );
      const emailSnap = await getDocs(qEmail);
      if (!emailSnap.empty) {
        const docSnap = emailSnap.docs[0];
        return {
          id: docSnap.id,
          ...docSnap.data(),
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error fetching store by userId:", error);
    return null;
  }
};

export const updateStore = async (userId, storeData) => {
  try {
    const q = query(collection(db, 'stores'), where('userId', '==', userId), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const storeDocId = querySnapshot.docs[0].id;
      const storeDocRef = doc(db, 'stores', storeDocId);
      await updateDoc(storeDocRef, storeData);
      clearStoreCache(storeDocId);
      console.log('Store updated successfully!');
    } else {
      console.error('No store found for this user to update.');
      throw new Error('No store found for this user to update.');
    }
  } catch (error) {
    console.error('Error updating store:', error);
    throw error;
  }
};

export const addProduct = async (productData) => {
  try {
    const productsCollectionRef = collection(db, FireStoreCollections.PRODUCTS);
    const newProductDocRef = await addDoc(productsCollectionRef, productData);
    return newProductDocRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

const categoryCache = new Map();

export const getCategoryById = async (categoryId) => {
  if (!categoryId || typeof categoryId !== 'string') {
    console.error('Invalid categoryId:', categoryId);
    return null;
  }
  if (categoryCache.has(categoryId)) {
    return categoryCache.get(categoryId);
  }
  try {
    const categoryRef = doc(db, 'categories', categoryId);
    console.log('Fetching category with ID:', categoryId);
    const categorySnap = await getDoc(categoryRef);

    if (!categorySnap.exists()) {
      console.log('No such category!');
      return null;
    }

    const categoryData = {
      id: categorySnap.id,
      ...categorySnap.data()
    };
    categoryCache.set(categoryId, categoryData);
    return categoryData;
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    return null;
  }
};