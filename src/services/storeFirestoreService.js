import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
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
 * Generates a clean base URL slug from a store name.
 * e.g., "My Super Store" -> "my-super-store"
 */
export const generateBaseSlug = (storeName) => {
  if (!storeName || typeof storeName !== 'string') return 'shop';
  const cleaned = storeName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned || 'shop';
};

/**
 * Generates a unique store slug. If the base slug is already used by another store,
 * appends a random number (e.g. -4829).
 * If no duplicate exists, it does NOT add any number.
 */
export const generateUniqueStoreSlug = async (storeName, currentStoreId = null) => {
  const baseSlug = generateBaseSlug(storeName);
  try {
    const storesRef = collection(db, FireStoreCollections.STORES);
    const snapshot = await getDocs(storesRef);

    const usedSlugs = new Set();
    const storeList = [];

    snapshot.forEach((docSnap) => {
      if (currentStoreId && docSnap.id === currentStoreId) {
        return; // Exclude current store
      }
      const data = docSnap.data();
      storeList.push({ id: docSnap.id, ...data });
      if (data.slug) {
        usedSlugs.add(data.slug.toLowerCase().trim());
      }
    });

    const assignedSlugs = new Set(usedSlugs);
    for (const s of storeList) {
      if (!s.slug && s.storeName) {
        const sBase = generateBaseSlug(s.storeName);
        assignedSlugs.add(sBase);
      }
    }

    // If baseSlug is not taken by any other store, use it cleanly without numbers
    if (!assignedSlugs.has(baseSlug)) {
      return baseSlug;
    }

    // If already in use, append a random 4-digit number (e.g., -4829)
    let candidateSlug = '';
    do {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      candidateSlug = `${baseSlug}-${randomNum}`;
    } while (assignedSlugs.has(candidateSlug));

    return candidateSlug;
  } catch (error) {
    console.error('Error generating unique store slug:', error);
    return baseSlug;
  }
};

/**
 * Resolves or computes the unique slug for a store.
 * If store doesn't have a slug field yet, calculates one and updates Firestore with slug and storeUrl.
 */
export const resolveOrAssignStoreSlug = async (store) => {
  if (!store) return 'shop';
  
  if (store.slug) {
    // If slug exists but storeUrl wasn't saved yet, save it to DB
    if (store.id && !store.storeUrl) {
      try {
        const storeDocRef = doc(db, FireStoreCollections.STORES, store.id);
        const storeUrl = `https://dealzhub.co.in/shop/${store.slug}`;
        await updateDoc(storeDocRef, { storeUrl });
        store.storeUrl = storeUrl;
      } catch (err) {
        console.warn('Could not persist storeUrl to store doc:', err);
      }
    }
    return store.slug;
  }

  const uniqueSlug = await generateUniqueStoreSlug(store.storeName, store.id);
  const storeUrl = `https://dealzhub.co.in/shop/${uniqueSlug}`;

  if (store.id) {
    try {
      const storeDocRef = doc(db, FireStoreCollections.STORES, store.id);
      await updateDoc(storeDocRef, { slug: uniqueSlug, storeUrl });
      store.slug = uniqueSlug;
      store.storeUrl = storeUrl;
      storeCache.set(store.id, { ...store, slug: uniqueSlug, storeUrl });
    } catch (err) {
      console.warn('Could not persist unique slug and storeUrl to store doc:', err);
    }
  }

  return uniqueSlug;
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
 * Fetches a store document matching a shop URL slug (e.g. 'test-store' or 'test-store-1')
 */
export const getStoreBySlug = async (slug) => {
  if (!slug) return null;
  try {
    const cleanSlug = slug.toLowerCase().trim();
    // Check if slug is directly the doc id in cache
    if (storeCache.has(slug)) {
      return storeCache.get(slug);
    }
    const storesRef = collection(db, FireStoreCollections.STORES);
    const snapshot = await getDocs(storesRef);

    // 1. Check exact doc ID match
    const idMatch = snapshot.docs.find(d => d.id === slug);
    if (idMatch) {
      const storeData = { id: idMatch.id, ...idMatch.data() };
      storeCache.set(idMatch.id, storeData);
      return storeData;
    }

    // 2. Check explicit slug match
    const explicitMatch = snapshot.docs.find(d => {
      const data = d.data();
      return data.slug && data.slug.toLowerCase().trim() === cleanSlug;
    });
    if (explicitMatch) {
      const storeData = { id: explicitMatch.id, ...explicitMatch.data() };
      storeCache.set(explicitMatch.id, storeData);
      return storeData;
    }

    // 3. Fallback deterministic computation for legacy stores without explicit slug
    const storeList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    storeList.sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || a.createdAt?.seconds * 1000 || (typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : 0);
      const timeB = b.createdAt?.toMillis?.() || b.createdAt?.seconds * 1000 || (typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : 0);
      return timeA - timeB;
    });

    const assignedSlugs = new Map();
    const usedSlugs = new Set();

    // First pass: register all explicit slugs
    for (const s of storeList) {
      if (s.slug) {
        const sl = s.slug.toLowerCase().trim();
        usedSlugs.add(sl);
        assignedSlugs.set(s.id, sl);
      }
    }

    // Second pass: compute missing slugs
    for (const s of storeList) {
      if (!s.slug && s.storeName) {
        const sBase = generateBaseSlug(s.storeName);
        if (!usedSlugs.has(sBase)) {
          usedSlugs.add(sBase);
          assignedSlugs.set(s.id, sBase);
        } else {
          let counter = 1;
          while (usedSlugs.has(`${sBase}-${counter}`)) {
            counter++;
          }
          const finalSlug = `${sBase}-${counter}`;
          usedSlugs.add(finalSlug);
          assignedSlugs.set(s.id, finalSlug);
        }
      }
    }

    // Check if any store was assigned this slug
    for (const [storeId, sSlug] of assignedSlugs.entries()) {
      if (sSlug === cleanSlug) {
        const matchedDoc = snapshot.docs.find(d => d.id === storeId);
        if (matchedDoc) {
          const storeData = { id: matchedDoc.id, ...matchedDoc.data(), slug: sSlug };
          storeCache.set(matchedDoc.id, storeData);
          return storeData;
        }
      }
    }

    return null;
  } catch (error) {
    console.error('Error fetching store by slug:', error);
    return null;
  }
};