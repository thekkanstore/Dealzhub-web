import { collection, getDocs, doc, getDoc, addDoc, updateDoc, setDoc, query, where, limit, startAfter } from 'firebase/firestore';
import { db } from '../firebase';
import { FireStoreCollections } from "../config/common";

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

export const getUserData = async (uid) => {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      return null;
    }

    const data = userDoc.data();

    return {
      id: userDoc.id,
      cart: data.cart || [],
      ...data,
    };
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
    const newStoreDocRef = await addDoc(storesCollectionRef, storeData);
    
    return newStoreDocRef.id; // Return the generated store ID
  } catch (error) {
    console.error('Error creating new store:', error);
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

export const updateUserRole = async (userId, role) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const currentRoles = userData.role || [];
      
      // Add the new role if it doesn't already exist
      if (!currentRoles.includes(role)) {
        const updatedRoles = [...currentRoles, role];
        await updateDoc(userDocRef, {
          role: updatedRoles,
          updatedAt: new Date()
        });
      } else {
        console.log('User already has this role');
      }
    } else {
      console.error('User document does not exist');
    }
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
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

export const updateUserProfile = async (userId, userData) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, userData);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const getStoreByUserId = async (userId) => {
  try {
    const q = query(
      collection(db, "stores"),
      where("userId", "==", userId)
    );

    const snap = await getDocs(q);

    if (snap.empty) return null;

    const docSnap = snap.docs[0];

    return {
      id: docSnap.id,
      ...docSnap.data(),
    };    
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
      const storeDocRef = doc(db, 'stores', querySnapshot.docs[0].id);
      await updateDoc(storeDocRef, storeData);
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

export const getCategoryById = async (categoryId) => {
  try {
    // Validate categoryId is a string
    if (!categoryId || typeof categoryId !== 'string') {
      console.error('Invalid categoryId:', categoryId);
      return null;
    }

    const categoryRef = doc(db, 'categories', categoryId);
    console.log('Fetching category with ID:', categoryId);
    const categorySnap = await getDoc(categoryRef);

    if (!categorySnap.exists()) {
      console.log('No such category!');
      return null;
    }

    return {
      id: categorySnap.id,
      ...categorySnap.data()
    };
  } catch (error) {
    console.error('Error fetching category by ID:', error);
    return null;
  }
};