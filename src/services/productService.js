import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../firebase';
import { getStoreById } from './storeFirestoreService';

export const fetchAllProducts = async (
  category,
  location,
  searchQuery
) => {
  try {
    let q;
    
    if (category) {
      // Only filter by category in Firestore
      q = query(
        collection(db, 'products'),
        where('categoryId', '==', category)
      );
    } else if (searchQuery) {
      // Only search query (no category filter)
      q = query(
        collection(db, 'products'),
        where('name', '>=', searchQuery),
        where('name', '<=', searchQuery + '\uf8ff')
      );
    } else {
      // No filters
      q = query(collection(db, 'products'), orderBy('name'));
    }

    const snapshot = await getDocs(q);
    
    let products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    
    // If both category and searchQuery exist, filter by name in JavaScript
    if (category && searchQuery) {
      const lowerSearchQuery = searchQuery.toLowerCase();
      products = products.filter(product => 
        product.name.toLowerCase().includes(lowerSearchQuery)
      );
    }

    const productsWithStores = await Promise.all(
      products.map(async (product) => {
        const store = await getStoreById(product.storeId);
        return { 
          ...product, 
          store: store || undefined
        };
      })
    );

    if (location && location !== 'Select Location') {
      const filtered = productsWithStores.filter(p => p.store && p.store.city === location);
      return filtered;
    }

    return productsWithStores;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
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
  searchQuery
) => {
  try {
    let q = query(collection(db, 'products'));

    // Filter category only if provided
    if (category) {
      q = query(q, where("categoryId", "==", category));
    }

    // Search using tokens
    if (searchQuery && searchQuery.trim().length > 0) {
      const cleanQuery = searchQuery.trim().toLowerCase();
      q = query(q, where("searchTokens", "array-contains", cleanQuery));
    }

    const snapshot = await getDocs(q);

    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const productsWithStores = await Promise.all(
      products.map(async (product) => {
        const store = await getStoreById(product.storeId);
        return { 
          ...product, 
          store: store || undefined
        };
      })
    );

    // Filter location if provided
    if (location && location !== "Select Location") {
      return productsWithStores.filter(
        (p) => p.store && p.store.city === location
      );
    }

    return productsWithStores;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
};

export const fetchProductsByStoreAndCategory = async (
  storeId,
  categoryId
) => {
  try {
    let q;
    
    if (categoryId) {
      // Filter by both storeId and categoryId
      q = query(
        collection(db, 'products'),
        where('storeId', '==', storeId),
        where('categoryId', '==', categoryId)
      );
    } else {
      // Filter only by storeId
      q = query(
        collection(db, 'products'),
        where('storeId', '==', storeId),
        orderBy('name')
      );
    }

    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    // Fetch store data for each product
    const productsWithStores = await Promise.all(
      products.map(async (product) => {
        const store = await getStoreById(product.storeId);
        return { ...product, store };
      })
    );

    return productsWithStores;
  } catch (error) {
    console.error('Error fetching products by store and category:', error);
    return [];
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