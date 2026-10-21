import { doc, getDoc, collection, query, where, getDocs, updateDoc, limit, documentId } from 'firebase/firestore';
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
 * Fetches multiple stores by IDs in batches of up to 30, utilizing storeCache.
 * Returns a Map of storeId -> storeData.
 */
export const getStoresByIds = async (storeIds = []) => {
  const result = new Map();
  if (!storeIds || storeIds.length === 0) return result;

  const uniqueIds = Array.from(new Set(storeIds.filter(Boolean)));
  const missingIds = [];

  for (const id of uniqueIds) {
    if (storeCache.has(id)) {
      result.set(id, storeCache.get(id));
    } else {
      missingIds.push(id);
    }
  }

  if (missingIds.length === 0) {
    return result;
  }

  // Firestore where(documentId(), 'in', ...) supports up to 30 items per query
  const BATCH_SIZE = 30;
  for (let i = 0; i < missingIds.length; i += BATCH_SIZE) {
    const chunk = missingIds.slice(i, i + BATCH_SIZE);
    try {
      const q = query(
        collection(db, FireStoreCollections.STORES),
        where(documentId(), 'in', chunk)
      );
      const snap = await getDocs(q);
      snap.forEach((docSnap) => {
        const storeData = { id: docSnap.id, ...docSnap.data() };
        storeCache.set(docSnap.id, storeData);
        result.set(docSnap.id, storeData);
      });
    } catch (err) {
      console.error('Error batch fetching stores by IDs:', err);
      // Fallback to individual getStoreById for this chunk
      await Promise.all(
        chunk.map(async (id) => {
          const store = await getStoreById(id);
          if (store) result.set(id, store);
        })
      );
    }
  }

  return result;
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
 * Checks if a slug is already assigned to another store in Firestore
 */
export const isStoreSlugTaken = async (slug, currentStoreId = null) => {
  if (!slug) return false;
  const storesRef = collection(db, FireStoreCollections.STORES);
  const q = query(storesRef, where('slug', '==', slug.toLowerCase().trim()), limit(1));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return false;
  if (currentStoreId && snapshot.docs[0].id === currentStoreId) return false;
  return true;
};

/**
 * Generates a unique store slug using targeted O(1) point queries instead of full O(N) scans.
 * If the base slug is free, uses it cleanly without numbers.
 * If collision exists, appends an available 4-digit number.
 */
export const generateUniqueStoreSlug = async (storeName, currentStoreId = null) => {
  const baseSlug = generateBaseSlug(storeName);
  try {
    const isTaken = await isStoreSlugTaken(baseSlug, currentStoreId);
    if (!isTaken) {
      return baseSlug;
    }

    // Try finding an available suffixed slug with up to 5 attempts
    let attempts = 0;
    while (attempts < 5) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const candidateSlug = `${baseSlug}-${randomNum}`;
      const taken = await isStoreSlugTaken(candidateSlug, currentStoreId);
      if (!taken) {
        return candidateSlug;
      }
      attempts++;
    }

    return `${baseSlug}-${Date.now().toString().slice(-4)}`;
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
      const rawEmail = userEmail;
      const normalizedEmail = userEmail.trim().toLowerCase();
      const emailsToCheck = Array.from(new Set([rawEmail, normalizedEmail].filter(Boolean)));
      for (const emailVal of emailsToCheck) {
        const qEmail = query(storesRef, where('email', '==', emailVal));
        const snapshotEmail = await getDocs(qEmail);

        if (!snapshotEmail.empty) {
          const storeDoc = snapshotEmail.docs[0];
          return {
            id: storeDoc.id,
            ...storeDoc.data()
          };
        }
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
    if (storeCache.has(cleanSlug)) {
      return storeCache.get(cleanSlug);
    }
    const storesRef = collection(db, FireStoreCollections.STORES);

    // 1. Fast indexed point query by slug field (O(1) read)
    try {
      const qSlug = query(storesRef, where('slug', '==', cleanSlug), limit(1));
      const snapSlug = await getDocs(qSlug);
      if (!snapSlug.empty) {
        const docSnap = snapSlug.docs[0];
        const storeData = { id: docSnap.id, ...docSnap.data() };
        storeCache.set(docSnap.id, storeData);
        storeCache.set(cleanSlug, storeData);
        return storeData;
      }
    } catch (queryErr) {
      console.warn('Direct slug query fallback:', queryErr);
    }

    // 2. Fast point query by doc ID
    try {
      const directRef = doc(db, FireStoreCollections.STORES, cleanSlug);
      const directSnap = await getDoc(directRef);
      if (directSnap.exists()) {
        const storeData = { id: directSnap.id, ...directSnap.data() };
        storeCache.set(directSnap.id, storeData);
        storeCache.set(cleanSlug, storeData);
        return storeData;
      }
    } catch (idErr) {
      // not a doc id
    }

    // 3. Fallback scan only for unmigrated legacy stores without explicit slug
    const snapshot = await getDocs(storesRef);

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