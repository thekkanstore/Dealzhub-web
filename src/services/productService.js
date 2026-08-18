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
  startAfter
} from 'firebase/firestore';
import { db } from '../firebase';
import { getStoreById } from './storeFirestoreService';

export const fetchAllProducts = async (
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

    // We loop to fetch chunks until we get enough products matching the location filter,
    // or until there are no more products to fetch.
    while (productsList.length < limitVal && hasMore) {
      let q;
      if (category) {
        q = query(
          collection(db, 'products'),
          where('categoryId', '==', category)
        );
      } else if (searchQuery) {
        q = query(
          collection(db, 'products'),
          where('name', '>=', searchQuery),
          where('name', '<=', searchQuery + '\uf8ff')
        );
      } else {
        q = query(collection(db, 'products'), orderBy('name'));
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

      let chunkProducts = snapshot.docs.map((doc) => ({ id: doc.id, docSnapshot: doc, ...doc.data() }));

      if (category && searchQuery) {
        const lowerSearchQuery = searchQuery.toLowerCase();
        chunkProducts = chunkProducts.filter(product => 
          product.name.toLowerCase().includes(lowerSearchQuery)
        );
      }

      const productsWithStores = await Promise.all(
        chunkProducts.map(async (product) => {
          const store = await getStoreById(product.storeId);
          return { 
            ...product, 
            store: store || undefined
          };
        })
      );

      let filteredChunk = productsWithStores;
      if (location && location !== 'Select Location') {
        filteredChunk = productsWithStores.filter(p => p.store && p.store.city === location);
      }

      productsList = [...productsList, ...filteredChunk];
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

      const productsWithStores = await Promise.all(
        chunkProducts.map(async (product) => {
          const store = await getStoreById(product.storeId);
          return { 
            ...product, 
            store: store || undefined
          };
        })
      );

      let filteredChunk = productsWithStores;
      if (location && location !== "Select Location") {
        filteredChunk = productsWithStores.filter(
          (p) => p.store && p.store.city === location
        );
      }

      productsList = [...productsList, ...filteredChunk];
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
        where('storeId', '==', storeId),
        orderBy('name')
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

    // Fetch store data for each product
    const productsWithStores = await Promise.all(
      products.map(async (product) => {
        const store = await getStoreById(product.storeId);
        return { ...product, store };
      })
    );

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

// Generate search tokens for product name
function generateSearchTokens(text) {
  const tokens = new Set();
  const normalizedText = text.toLowerCase().trim();

  // Split by spaces and create tokens
  const words = normalizedText.split(/\s+/);

  words.forEach(word => {
    // Add full word
    tokens.add(word);

    // Add n-grams (substrings) for partial matching
    for (let i = 0; i < word.length; i++) {
      for (let j = i + 2; j <= word.length; j++) {
        tokens.add(word.substring(i, j));
      }
    }
  });

  return Array.from(tokens);
}

export const createNewProduct = async (productData) => {
  try {
    const productsCollectionRef = collection(db, 'products');
    const newProductRef = doc(productsCollectionRef);
    const productId = newProductRef.id;

    const newProductData = {
      ...productData,
      id: productId,
      nameLower: productData.name?.toLowerCase(),
      searchTokens: generateSearchTokens(productData.name.toLowerCase() || ''),
      createdAt: new Date(),
      updatedAt: new Date(),
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
      updatedAt: new Date(),
    };

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