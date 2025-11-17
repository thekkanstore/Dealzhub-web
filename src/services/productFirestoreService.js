import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    limit,
    startAfter,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

// Utility function to convert to snake_case
function toSnakeCase(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}

// Generate search tokens for better search functionality
function generateSearchTokens(text) {
    const tokens = new Set();
    const normalizedText = text.toLowerCase().trim();
    const words = normalizedText.split(/\s+/);

    words.forEach(word => {
        tokens.add(word);
        for (let i = 0; i < word.length; i++) {
            for (let j = i + 2; j <= word.length; j++) {
                tokens.add(word.substring(i, j));
            }
        }
    });

    return Array.from(tokens);
}

/**
 * Create a new product in Firestore
 */
export async function createNewProduct(productData) {
    try {
        const productsRef = collection(db, 'products');
        const newProductRef = doc(productsRef);
        const productId = newProductRef.id;

        // Fetch store and category details
        const [storeDoc, categoryDoc] = await Promise.all([
            getDoc(doc(db, 'stores', productData.storeId)),
            getDoc(doc(db, 'categories', productData.categoryId))
        ]);

        if (!storeDoc.exists()) {
            throw new Error('Store not found');
        }
        if (!categoryDoc.exists()) {
            throw new Error('Category not found');
        }

        const store = { id: storeDoc.id, ...storeDoc.data() };
        const category = { id: categoryDoc.id, ...categoryDoc.data() };

        // Generate imagePath
        const imagePath = `images/${toSnakeCase(store.id)}/${toSnakeCase(productData.name)}`;

        const newProductData = {
            id: productId,
            storeId: productData.storeId,
            store: store,
            userId: productData.userId,
            name: productData.name,
            nameLower: productData.name?.toLowerCase() || '',
            description: productData.description || '',
            image: productData.images && productData.images.length > 0 ? productData.images[0] : null,
            images: Array.isArray(productData.images) ? productData.images : null,
            imagePath: imagePath,
            actualPrice: productData.actualPrice.toString(),
            discountPrice: productData.discountPrice.toString(),
            status: productData.status || 'instock',
            categoryId: productData.categoryId,
            category: category,
            isSecondHand: productData.isSecondHand || false,
            isActive: true,
            isSoldOut: productData.isSoldOut || false,
            isOutOfStock: productData.isOutOfStock || false,
            searchTokens: generateSearchTokens(productData.name?.toLowerCase() || ''),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        await setDoc(newProductRef, newProductData);

        const productDetails = await getProductById(productId);

        if (productDetails) {
            return {
                success: true,
                data: productDetails,
                productId: productId,
                message: 'Product Added Successfully',
            };
        } else {
            throw new Error('Product creation failed - unable to retrieve created product');
        }
    } catch (error) {
        console.error('Error creating product:', error);
        return {
            success: false,
            productId: null,
            message: `Error creating Product: ${error.message}`,
        };
    }
}

/**
 * Update an existing product in Firestore
 */
export async function updateProductDetails(productId, productData) {
    try {
        const productRef = doc(db, 'products', productId);

        // Fetch store and category details
        const [storeDoc, categoryDoc] = await Promise.all([
            getDoc(doc(db, 'stores', productData.storeId)),
            getDoc(doc(db, 'categories', productData.categoryId))
        ]);

        if (!storeDoc.exists()) {
            throw new Error('Store not found');
        }
        if (!categoryDoc.exists()) {
            throw new Error('Category not found');
        }

        const store = { id: storeDoc.id, ...storeDoc.data() };
        const category = { id: categoryDoc.id, ...categoryDoc.data() };

        // Generate imagePath
        const imagePath = `images/${toSnakeCase(store.id)}/${toSnakeCase(productData.name)}`;

        const updateData = {
            name: productData.name,
            nameLower: productData.name?.toLowerCase() || '',
            description: productData.description || '',
            image: productData.images && productData.images.length > 0 ? productData.images[0] : null,
            images: Array.isArray(productData.images) ? productData.images : null,
            imagePath: imagePath,
            actualPrice: productData.actualPrice.toString(),
            discountPrice: productData.discountPrice.toString(),
            status: productData.status || 'instock',
            categoryId: productData.categoryId,
            category: category,
            storeId: productData.storeId,
            store: store,
            isSecondHand: productData.isSecondHand || false,
            isSoldOut: productData.isSoldOut || false,
            isOutOfStock: productData.isOutOfStock || false,
            searchTokens: generateSearchTokens(productData.name?.toLowerCase() || ''),
            updatedAt: serverTimestamp(),
        };

        await updateDoc(productRef, updateData);

        const productDetails = await getProductById(productId);

        if (productDetails) {
            return {
                success: true,
                data: productDetails,
                productId: productId,
                message: 'Product updated successfully',
            };
        } else {
            throw new Error('Product update failed - unable to retrieve updated product');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        return {
            success: false,
            productId: null,
            message: `Error updating Product: ${error.message}`,
        };
    }
}

/**
 * Get a list of products with optional filters and pagination
 */
export async function getProductsList({
    storeId,
    categoryId,
    limit: limitCount = 10,
    lastDoc,
    isActive,
}) {
    try {
        const productsRef = collection(db, 'products');
        let q = query(productsRef);

        const constraints = [];

        if (isActive !== undefined) {
            constraints.push(where('isActive', '==', isActive));
        }
        if (storeId) {
            constraints.push(where('storeId', '==', storeId));
        }
        if (categoryId) {
            constraints.push(where('categoryId', '==', categoryId));
        }

        constraints.push(orderBy('createdAt', 'desc'));

        if (lastDoc) {
            constraints.push(startAfter(lastDoc));
        }

        constraints.push(limit(limitCount));

        q = query(productsRef, ...constraints);

        const snapshot = await getDocs(q);

        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        const lastDocument = snapshot.docs[snapshot.docs.length - 1];
        const hasMore = snapshot.docs.length === limitCount;

        return {
            products,
            lastDoc: lastDocument,
            hasMore,
            total: products.length,
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error(`Failed to fetch products: ${error.message}`);
    }
}

/**
 * Get a single product by ID
 */
export async function getProductById(productId) {
    try {
        const productRef = doc(db, 'products', productId);
        const productDoc = await getDoc(productRef);

        if (productDoc.exists()) {
            return {
                id: productDoc.id,
                ...productDoc.data(),
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting product by ID:', error);
        return null;
    }
}

/**
 * Update product status (active/inactive)
 */
export async function updateProductStatus(productId, isActive) {
    try {
        const productRef = doc(db, 'products', productId);

        await updateDoc(productRef, {
            isActive: isActive,
            updatedAt: serverTimestamp(),
        });

        return {
            success: true,
            message: 'Product status updated successfully',
            productId: productId,
        };
    } catch (error) {
        console.error('Error updating product status:', error);
        return {
            success: false,
            message: `Error updating product status: ${error.message}`,
            productId: productId,
        };
    }
}

/**
 * Search products by name using search tokens
 */
export async function searchProductsByName(productName) {
    try {
        const searchTerm = productName.toLowerCase();
        const productsRef = collection(db, 'products');

        const q = query(
            productsRef,
            where('searchTokens', 'array-contains', searchTerm),
            limit(20)
        );

        const snapshot = await getDocs(q);

        const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        return products;
    } catch (error) {
        console.error('Error searching products by name:', error);
        throw new Error(`Failed to search products: ${error.message}`);
    }
}