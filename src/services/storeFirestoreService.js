import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { FireStoreCollections } from '../config/common';

/**
 * Fetches a single store document from Firestore by its ID.
 * @param storeId The ID of the store to fetch.
 * @returns The store data object or null if not found.
 */
export const getStoreById = async (storeId) => {
  try {
    const storeDocRef = doc(db, FireStoreCollections.STORES, storeId);
    const storeDocSnap = await getDoc(storeDocRef);

    if (storeDocSnap.exists()) {
      return { id: storeDocSnap.id, ...storeDocSnap.data() };
    } else {
      console.warn(`No store found with ID: ${storeId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching store with ID ${storeId}:`, error);
    return null;
  }
};

export const getStoreByUserId = async (userId) => {
  try {
    const storesRef = collection(db, 'stores');
    const q = query(storesRef, where('userId', '==', userId));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    // Return the first store found (assuming one store per user)
    const storeDoc = snapshot.docs[0];
    return {
      id: storeDoc.id,
      ...storeDoc.data()
    };
  } catch (error) {
    console.error('Error fetching store by userId:', error);
    return null;
  }
};