import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { FireStoreCollections } from '../config/common';

const storeCache = new Map();

/**
 * Fetches a single store document from Firestore by its ID.
 * @param storeId The ID of the store to fetch.
 * @returns The store data object or null if not found.
 */
export const getStoreById = async (storeId) => {
  if (!storeId) return null;
  if (storeCache.has(storeId)) {
    return storeCache.get(storeId);
  }
  try {
    const storeDocRef = doc(db, FireStoreCollections.STORES, storeId);
    const storeDocSnap = await getDoc(storeDocRef);

    if (storeDocSnap.exists()) {
      const storeData = { id: storeDocSnap.id, ...storeDocSnap.data() };
      storeCache.set(storeId, storeData);
      return storeData;
    } else {
      console.warn(`No store found with ID: ${storeId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching store with ID ${storeId}:`, error);
    return null;
  }
};

export const getStoreByUserId = async (userId, userEmail = null) => {
  if (!userId && !userEmail) return null;
  try {
    const storesRef = collection(db, 'stores');
    if (userId) {
      const q = query(storesRef, where('userId', '==', userId));
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const storeDoc = snapshot.docs[0];
        return {
          id: storeDoc.id,
          ...storeDoc.data()
        };
      }
    }

    if (userEmail) {
      const qEmail = query(storesRef, where('email', '==', userEmail));
      const snapshotEmail = await getDocs(qEmail);

      if (!snapshotEmail.empty) {
        const storeDoc = snapshotEmail.docs[0];
        return {
          id: storeDoc.id,
          ...storeDoc.data()
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching store by userId/email:', error);
    return null;
  }
};