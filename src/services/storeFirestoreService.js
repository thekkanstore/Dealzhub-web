import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { FireStoreCollections } from '../config/common';

const storeCache = new Map();

/**
 * Clears the in-memory store cache
 * @param storeId Optional store ID to clear specific entry
 */
export const clearStoreCache = (storeId) => {
  if (storeId) {
    storeCache.delete(storeId);
  } else {
    storeCache.clear();
  }
};

/**
 * Fetches a single store document from Firestore by its ID.
 * @param storeId The ID of the store to fetch.
 * @param forceRefresh Whether to bypass cache and fetch fresh document.
 * @returns The store data object or null if not found.
 */
export const getStoreById = async (storeId, forceRefresh = false) => {
  if (!storeId) return null;
  if (!forceRefresh && storeCache.has(storeId)) {
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

/**
 * Fetches a store document matching a shop URL slug (e.g. 'test-store')
 */
export const getStoreBySlug = async (slug) => {
  if (!slug) return null;
  try {
    const cleanSlug = slug.toLowerCase().trim();
    // Check if slug is directly the doc id
    if (storeCache.has(slug)) {
      return storeCache.get(slug);
    }
    const storesRef = collection(db, FireStoreCollections.STORES);
    const snapshot = await getDocs(storesRef);
    const matched = snapshot.docs.find(d => {
      const data = d.data();
      const sSlug = (data.storeName || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return sSlug === cleanSlug || d.id === slug;
    });

    if (matched) {
      const storeData = { id: matched.id, ...matched.data() };
      storeCache.set(matched.id, storeData);
      return storeData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching store by slug:', error);
    return null;
  }
};