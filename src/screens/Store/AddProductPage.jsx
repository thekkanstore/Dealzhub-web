import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../../components/store/ProductForm';
import { useAppContext } from '../../context/AppContext';
import { createNewProduct } from '../../services/productService';
import { getStoreByUserId } from '../../services/storeFirestoreService';
import { uploadMultipleImages } from '../../services/firebaseStorageService';
import { getCategoryById } from '../../services/firestore'; // Add this import

// Utility function to convert to snake_case
function toSnakeCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const AddProductPage = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const [storeId, setStoreId] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchStore = async () => {
      if (user) {
        try {
          const store = await getStoreByUserId(user.providerData[0].uid);
          if (store) {
            setStoreId(store.id);
            setStoreData(store);
          } else {
            console.error('No store found for this user.');
            alert('You need to create a store first!');
            navigate('/vendordetails');
          }
        } catch (error) {
          console.error('Error fetching store:', error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    };

    fetchStore();
  }, [user, navigate]);

  const handleSubmit = async (formData) => {
    if (!user || !storeId || !storeData) {
      console.error('User not logged in or store not found.');
      alert('User not logged in or store not found.');
      return;
    }

    try {
      setUploading(true);
      let imageUrls = [];
      
      // Generate imagePath using store ID and product name
      const imagePath = `images/${toSnakeCase(storeData.id)}/${toSnakeCase(formData.name)}`;
      
      // Handle multiple image uploads
      if (formData.images && Array.isArray(formData.images) && formData.images.length > 0) {
        const uploadResult = await uploadMultipleImages(
          formData.images, 
          imagePath
        );
        
        if (uploadResult.success && uploadResult.urls) {
          imageUrls = uploadResult.urls;
          
          // If some images failed, show a warning
          if (uploadResult.errors && uploadResult.errors.length > 0) {
            console.warn('Some images failed to upload:', uploadResult.errors);
            alert(`Warning: ${uploadResult.errors.length} image(s) failed to upload, but continuing with ${imageUrls.length} successful upload(s).`);
          }
        } else {
          throw new Error('Failed to upload images: ' + (uploadResult.errors?.join(', ') || 'Unknown error'));
        }
      } else {
        alert('Please select at least one image.');
        setUploading(false);
        return;
      }

      // Fetch category data using categoryId
      let categoryData = null;
      if (formData.categoryId) {
        try {
          categoryData = await getCategoryById(formData.categoryId);
        } catch (error) {
          console.error('Error fetching category:', error);
          alert('Warning: Could not fetch category data. Continuing without it.');
        }
      }

      // Create product data with uploaded image URLs and full objects
      const productData = {
        name: formData.name,
        description: formData.description || '',
        actualPrice: parseFloat(formData.actualPrice),
        discountPrice: parseFloat(formData.discountPrice),
        images: imageUrls,
        imagePath: imagePath,
        categoryId: formData.categoryId,
        category: categoryData, // Add full category object
        storeId: storeId,
        store: storeData, // Add full store object
        userId: user.providerData[0].uid,
        isSecondHand: formData.isSecondHand || false,
        isOutOfStock: formData.isOutOfStock || false,
        isSoldOut: formData.isSoldOut || false,
        status: formData.status || 'instock',
      };

      const result = await createNewProduct(productData);
      
      if (result.success) {
        alert(result.message || 'Product added successfully!');
        navigate(`/vendor/${storeId}`);
      } else {
        alert(result.message || 'Failed to add product.');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product: ' + (error.message || 'Please try again.'));
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!storeId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No Store Found</h2>
          <p className="text-gray-600 mb-4">You need to create a store before adding products.</p>
          <button
            onClick={() => navigate('/vendordetails')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create Store
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {uploading && (
        <div className="fixed inset-0 bg-gray-500/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-700 font-medium">Uploading images and creating product...</p>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(`/vendor/${storeId}`)}
          className="flex items-center gap-2 text-gray-600 mb-6 hover:underline"
          disabled={uploading}
        >
          ← Back to Store
        </button>
        <div className="max-w-sm w-full mx-auto">
          <h2 className="text-2xl font-bold text-center mt-4 mb-6">Add New Product</h2>
          <ProductForm
            onSubmit={handleSubmit}
            submitButtonText={uploading ? "Uploading..." : "Add Product"}
            storeId={storeId}
            userId={user?.providerData[0].uid || ''}
          />
        </div>
      </div>
    </div>
  );
};

export default AddProductPage;