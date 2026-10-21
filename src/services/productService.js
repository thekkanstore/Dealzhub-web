import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  limit,
  startAfter,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { getStoreById, getStoresByIds } from './storeFirestoreService';
import { deleteMultipleImages } from './firebaseStorageService';

export const isStoreSubscriptionValid = (store) => {
  if (!store) return false;
  
  const status = store.vendorStatus?.toLowerCase();
  if (status !== 'approved' && status !== 'private') {
    return false;
  }

  if (store.paymentStatus && store.paymentStatus.toLowerCase() !== 'paid') {
    return false;
  }

  if (store.subscriptionEndDate) {
    const endDate = store.subscriptionEndDate.toDate ? store.subscriptionEndDate.toDate() : new Date(store.subscriptionEndDate);
    if (new Date() > endDate) {
      return false; // Subscription expired
    }
  }

  return true;
};

/**
 * Attaches store metadata to an array of products efficiently.
 * Eliminates N+1 queries by leveraging existing embedded store objects, in-memory cache,
 * and batched queries via getStoresByIds.
 */
export const attachStoresToProducts = async (products = []) => {
  if (!Array.isArray(products) || products.length === 0) return [];

  const missingStoreIds = [];
  products.forEach((product) => {
    if (product.storeId && (!product.store || !product.store.vendorStatus)) {
      missingStoreIds.push(product.storeId);
    }
  });

  const storeMap = await getStoresByIds(missingStoreIds);

  return products.map((product) => {
    const fetchedStore = product.storeId ? storeMap.get(product.storeId) : null;
    return {
      ...product,
      store: fetchedStore || product.store || undefined,
    };
  });
};

export const fetchAllProducts = async (
  category,
  location,
  searchQuery,
  limitVal = 10,
  lastVisibleDoc = null
) => {
  try {
    let validProducts = [];
    let currentLastDoc = lastVisibleDoc;
    let hasMore = true;
    let iterations = 0;
    const maxIterations = 5; // Guard against infinite iteration loops

    // Loop until we reach target limitVal or exhaust active collection (solves SCALE-05 Ghost Pages)
    while (validProducts.length < limitVal && hasMore && iterations < maxIterations) {
      iterations++;
      let q = collection(db, 'products');

      // Apply category filter
      if (category) {
        q = query(q, where('categoryId', '==', category));
      }

      // Apply location filter directly to database query
      if (location && location !== 'Select Location') {
        q = query(q, where('store.city', '==', location));
      }

      // Standardize default ordering to createdAt DESC when no filters are active (MED-06)
      if (!category && (!location || location === 'Select Location')) {
        q = query(q, orderBy('createdAt', 'desc'));
      }

      if (currentLastDoc) {
        q = query(q, startAfter(currentLastDoc));
      }

      const fetchChunkSize = Math.max(limitVal, 15);
      q = query(q, limit(fetchChunkSize));

      const snapshot = await getDocs(q);
      if (snapshot.docs.length === 0) {
        hasMore = false;
        break;
      }

      currentLastDoc = snapshot.docs[snapshot.docs.length - 1];
      hasMore = snapshot.docs.length === fetchChunkSize;

      const rawChunk = snapshot.docs.map((doc) => ({
        id: doc.id,
        docSnapshot: doc,
        ...doc.data()
      }));

      // Hydrate stores without N+1 cascade reads (SCALE-02)
      const chunkWithStores = await attachStoresToProducts(rawChunk);

      // Filter products based on active store subscription
      const filteredChunk = chunkWithStores.filter((p) => {
        if (!p.store) return true; // fallback if store not found
        return isStoreSubscriptionValid(p.store);
      });

      validProducts = [...validProducts, ...filteredChunk];
    }

    const slicedProducts = validProducts.slice(0, limitVal);
    const lastItem = slicedProducts[slicedProducts.length - 1];
    const finalLastDoc = lastItem ? lastItem.docSnapshot : currentLastDoc;

    const cleanedProducts = slicedProducts.map(({ docSnapshot, ...rest }) => rest);

    return {
      products: cleanedProducts,
      lastDoc: finalLastDoc,
      hasMore: hasMore || validProducts.length > limitVal
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return { products: [], lastDoc: null, hasMore: false };
  }
};

export const getProductById = async (id) => {
  try {
    const productRef = doc(db, 'products', id);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return null;
    }

    const product = { id: productSnap.id, ...productSnap.data() };

    // Guard: If storeId missing, prevent crash
    if (!product.storeId) {
      console.warn(`Product ${id} has no storeId`);
      return { ...product, store: undefined };
    }

    const store = await getStoreById(product.storeId);

    return { 
      ...product, 
      store: store || undefined
    };
    
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
};

export const searchProducts = async (
  category,
  location,
  searchQuery,
  limitVal = 10,
  lastVisibleDoc = null
) => {
  try {
    let productsList = [];
    let currentLastDoc = lastVisibleDoc;
    let hasMore = true;
    let searchWords = [];

    if (searchQuery && searchQuery.trim().length > 0) {
      searchWords = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    }

    while (productsList.length < limitVal && hasMore) {
      let q = query(collection(db, 'products'));

      if (category) {
        q = query(q, where("categoryId", "==", category));
      }

      if (location && location !== 'Select Location') {
        q = query(q, where('store.city', '==', location));
      }

      if (searchWords.length > 0) {
        const sortedWords = [...searchWords].sort((a, b) => b.length - a.length);
        const queryWord = sortedWords[0];
        if (queryWord.length < 2) {
          q = query(
            q,
            where('nameLower', '>=', queryWord),
            where('nameLower', '<=', queryWord + '\uf8ff')
          );
        } else {
          q = query(q, where('searchTokens', 'array-contains', queryWord));
        }
      }

      if (currentLastDoc) {
        q = query(q, startAfter(currentLastDoc));
      }
      q = query(q, limit(15)); // Fetch in chunks of 15

      const snapshot = await getDocs(q);
      if (snapshot.docs.length === 0) {
        hasMore = false;
        break;
      }

      currentLastDoc = snapshot.docs[snapshot.docs.length - 1];
      hasMore = snapshot.docs.length === 15;

      let chunkProducts = snapshot.docs.map((doc) => ({
        id: doc.id,
        docSnapshot: doc,
        ...doc.data(),
      }));

      if (searchWords.length > 0) {
        chunkProducts = chunkProducts.filter((product) => {
          const productNameLower = product.name?.toLowerCase() || '';
          const tokens = product.searchTokens || [];
          return searchWords.every((word) =>
            productNameLower.includes(word) || tokens.includes(word)
          );
        });
      }

      productsList = [...productsList, ...chunkProducts];
    }

    const slicedProducts = productsList.slice(0, limitVal);
    const lastProduct = slicedProducts[slicedProducts.length - 1];
    const finalLastDoc = lastProduct ? lastProduct.docSnapshot : currentLastDoc;

    // Clean up temporary docSnapshot field
    const cleanedProducts = slicedProducts.map(({ docSnapshot, ...rest }) => rest);

    return {
      products: cleanedProducts,
      lastDoc: finalLastDoc,
      hasMore: hasMore || productsList.length > limitVal
    };
  } catch (error) {
    console.error("Error searching products:", error);
    return { products: [], lastDoc: null, hasMore: false };
  }
};

export const fetchProductsByStoreAndCategory = async (
  storeId,
  categoryId,
  limitVal = 10,
  lastVisibleDoc = null
) => {
  try {
    let q;
    
    if (categoryId) {
      q = query(
        collection(db, 'products'),
        where('storeId', '==', storeId),
        where('categoryId', '==', categoryId)
      );
    } else {
      q = query(
        collection(db, 'products'),
        where('storeId', '==', storeId)
      );
    }

    if (lastVisibleDoc) {
      q = query(q, startAfter(lastVisibleDoc));
    }
    q = query(q, limit(limitVal));

    const snapshot = await getDocs(q);
    const lastDoc = snapshot.docs[snapshot.docs.length - 1];
    const hasMore = snapshot.docs.length === limitVal;

    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Fetch store data once for this store instead of N+1 cascade roundtrips
    const store = await getStoreById(storeId);
    const productsWithStores = products.map((product) => ({
      ...product,
      store: store || product.store
    }));

    return {
      products: productsWithStores,
      lastDoc,
      hasMore
    };
  } catch (error) {
    console.error('Error fetching products by store and category:', error);
    return { products: [], lastDoc: null, hasMore: false };
  }
};

// Generate search tokens for product name (optimized prefix-based matching capped at 40 tokens - SCALE-03)
function generateSearchTokens(text) {
  if (!text) return [];
  const tokens = new Set();
  const normalizedText = text.toLowerCase().trim();

  // Split by spaces and create tokens
  const words = normalizedText.split(/\s+/).filter(Boolean);

  words.forEach(word => {
    // Add full word
    tokens.add(word);

    // Add prefix n-grams for progressive search matching
    for (let j = 2; j <= word.length; j++) {
      tokens.add(word.substring(0, j));
    }
  });

  return Array.from(tokens).slice(0, 40);
}

export const createNewProduct = async (productData) => {
  try {
    const productsCollectionRef = collection(db, 'products');
    const newProductRef = doc(productsCollectionRef);
    const productId = newProductRef.id;

    const isOutOfStock = Boolean(productData.isOutOfStock);
    const newProductData = {
      ...productData,
      id: productId,
      nameLower: productData.name?.toLowerCase(),
      searchTokens: generateSearchTokens(productData.name.toLowerCase() || ''),
      isOutOfStock: isOutOfStock,
      status: isOutOfStock ? 'outofstock' : 'instock',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isActive: true,
    };

    await setDoc(newProductRef, newProductData);

    const productDetails = await getProductById(productId);
    if (productDetails) {
      return {
        success: true,
        productId: productId,
        message: 'Product Added Successfully',
      };
    } else {
      throw new Error('Product creation failed');
    }
  } catch (error) {
    console.error('Error creating product:', error);
    return {
      success: false,
      productId: null,
      message: `Error creating Product: ${error}`,
    };
  }
};

export const updateProductDetails = async (
  productId,
  productData
) => {
  try {
    const productRef = doc(db, 'products', productId);

    const updatedProductData = {
      ...productData,
      nameLower: productData.name?.toLowerCase(),
      searchTokens: generateSearchTokens(productData.name.toLowerCase() || ''),
      updatedAt: serverTimestamp(),
    };

    if (productData.isOutOfStock !== undefined) {
      const isOutOfStock = Boolean(productData.isOutOfStock);
      updatedProductData.isOutOfStock = isOutOfStock;
      updatedProductData.status = isOutOfStock ? 'outofstock' : 'instock';
    }

    await updateDoc(productRef, updatedProductData);

    const productDetails = await getProductById(productId);
    if (productDetails) {
      return {
        success: true,
        productId: productId,
        message: 'Product updated Successfully',
      };
    } else {
      throw new Error('Product update failed');
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return {
      success: false,
      productId: null,
      message: `Error updating Product: ${error}`,
    };
  }
};

export const deleteProduct = async (product) => {
  try {
    if (!product || !product.id) {
      throw new Error('Invalid product data');
    }
    
    // Delete product document from Firestore
    const productRef = doc(db, 'products', product.id);
    await deleteDoc(productRef);
    
    // Delete images from Firebase Storage
    const imageUrls = product.images && product.images.length > 0
      ? product.images
      : (product.image ? [product.image] : []);
      
    if (imageUrls.length > 0) {
      await deleteMultipleImages(imageUrls);
    }
    
    return { success: true, message: 'Product deleted successfully' };
  } catch (error) {
    console.error('Error deleting product:', error);
    return { success: false, message: `Error deleting product: ${error.message}` };
  }
};