import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

/**
 * Upload a single image to Firebase Storage with specific path
 */
export const uploadImageToStorage = async (file, imagePath) => {
  try {
    if (!file || !(file instanceof File)) {
      return {
        success: false,
        error: 'Invalid file provided',
      };
    }

    if (!imagePath) {
      return {
        success: false,
        error: 'Image path is required',
      };
    }

    // Create a unique filename
    const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}_${file.name}`;
    const fullPath = `${imagePath}/${filename}`;
    const storageRef = ref(storage, fullPath);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);

    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      success: true,
      url: downloadURL,
      path: fullPath,
    };
  } catch (error) {
    let errorMessage = 'Failed to upload image';

    if (error.code === 'storage/unauthorized') {
      errorMessage = 'Unauthorized access to storage';
    } else if (error.code === 'storage/canceled') {
      errorMessage = 'Upload was canceled';
    } else if (error.code === 'storage/unknown') {
      errorMessage = 'Unknown storage error occurred';
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error('Error uploading image:', error);
    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Upload multiple images to Firebase Storage
 */
export const uploadMultipleImages = async (files, imagePath) => {
  try {
    if (!files || !Array.isArray(files) || files.length === 0) {
      return {
        success: false,
        errors: ['No files provided'],
      };
    }

    if (!imagePath) {
      return {
        success: false,
        errors: ['Image path is required'],
      };
    }

    // Upload all files in parallel
    const uploadPromises = files.map(file => uploadImageToStorage(file, imagePath));
    const results = await Promise.all(uploadPromises);

    // Separate successful uploads from failures
    const successfulUploads = results.filter(result => result.success);
    const failedUploads = results.filter(result => !result.success);

    if (successfulUploads.length === 0) {
      return {
        success: false,
        errors: failedUploads.map(result => result.error || 'Unknown error'),
      };
    }

    return {
      success: true,
      urls: successfulUploads.map(result => result.url),
      paths: successfulUploads.map(result => result.path),
      errors: failedUploads.length > 0 
        ? failedUploads.map(result => result.error || 'Unknown error')
        : undefined,
    };
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return {
      success: false,
      errors: [error.message || 'Failed to upload images'],
    };
  }
};

/**
 * Delete an image from Firebase Storage
 */
export const deleteImageFromStorage = async (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return false;
    }

    const baseUrl = 'https://firebasestorage.googleapis.com';
    if (!imageUrl.startsWith(baseUrl)) {
      console.error('Invalid Firebase Storage URL');
      return false;
    }

    const urlParts = imageUrl.split('/o/');
    if (urlParts.length < 2) {
      console.error('Could not parse storage path from URL');
      return false;
    }

    const pathWithParams = urlParts[1];
    const path = decodeURIComponent(pathWithParams.split('?')[0]);

    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return true;
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      return true;
    }
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Delete multiple images from Firebase Storage
 */
export const deleteMultipleImages = async (imageUrls) => {
  try {
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return {
        success: true,
        deletedCount: 0,
        failedCount: 0,
      };
    }

    const deletePromises = imageUrls.map(url => deleteImageFromStorage(url));
    const results = await Promise.all(deletePromises);

    const deletedCount = results.filter(result => result === true).length;
    const failedCount = results.length - deletedCount;

    return {
      success: deletedCount > 0,
      deletedCount,
      failedCount,
    };
  } catch (error) {
    console.error('Error deleting multiple images:', error);
    return {
      success: false,
      deletedCount: 0,
      failedCount: imageUrls.length,
    };
  }
};

/**
 * Check if an image exists in Firebase Storage
 */
export const checkImageExists = async (imageUrl) => {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return false;
    }

    const baseUrl = 'https://firebasestorage.googleapis.com';
    if (!imageUrl.startsWith(baseUrl)) {
      return false;
    }

    const urlParts = imageUrl.split('/o/');
    if (urlParts.length < 2) {
      return false;
    }

    const pathWithParams = urlParts[1];
    const path = decodeURIComponent(pathWithParams.split('?')[0]);

    const storageRef = ref(storage, path);
    await getDownloadURL(storageRef);
    return true;
  } catch (error) {
    if (error.code === 'storage/object-not-found') {
      return false;
    }
    return false;
  }
};