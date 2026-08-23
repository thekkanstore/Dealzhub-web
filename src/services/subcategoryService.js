import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Retrieve active subcategories for a given store and category.
 */
export const getSubCategories = async (storeId, categoryId) => {
  try {
    const q = query(
      collection(db, "sub_categories"),
      where("storeId", "==", storeId),
      where("categoryId", "==", categoryId),
      where("isActive", "==", true)
    );
    const snapshot = await getDocs(q);
    const subcategories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return subcategories.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    return [];
  }
};

/**
 * Creates a new subcategory after checking for case-insensitive duplicates.
 */
export const createSubCategory = async (storeId, categoryId, name) => {
  const nameLower = name.trim().toLowerCase();
  
  // Check duplicates
  const q = query(
    collection(db, "sub_categories"),
    where("storeId", "==", storeId),
    where("categoryId", "==", categoryId),
    where("nameLower", "==", nameLower),
    where("isActive", "==", true)
  );
  const duplicateCheck = await getDocs(q);
  if (!duplicateCheck.empty) {
    throw new Error("subCategoryExists");
  }

  // Add document
  const docRef = await addDoc(collection(db, "sub_categories"), {
    name: name.trim(),
    nameLower,
    categoryId,
    storeId,
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });

  return docRef.id;
};

/**
 * Renames a subcategory inline.
 */
export const renameSubCategory = async (id, name) => {
  const subRef = doc(db, "sub_categories", id);
  await updateDoc(subRef, {
    name: name.trim(),
    nameLower: name.trim().toLowerCase(),
    updatedAt: serverTimestamp()
  });
};

/**
 * Soft-deletes a subcategory.
 */
export const deleteSubCategory = async (id) => {
  const subRef = doc(db, "sub_categories", id);
  await updateDoc(subRef, {
    isActive: false,
    updatedAt: serverTimestamp()
  });
};
