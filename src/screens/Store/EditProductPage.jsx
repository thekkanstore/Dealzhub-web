import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '../../components/store/ProductForm';
import { useAppContext } from '../../context/AppContext';
import { updateProductDetails, getProductById } from '../../services/productService';
import { getStoreByUserId } from '../../services/storeFirestoreService';
import { uploadMultipleImages, deleteMultipleImages } from '../../services/firebaseStorageService';
import { getCategoryById } from '../../services/firestore';

// Utility function to convert to snake_case
function toSnakeCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const EditProductPage = () => {
  const { user } = useAppContext();
  const { productId } = useParams();
  const navigate = useNavigate();
  const [storeId, setStoreId] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        try {
          // Fetch store data
          const store = await getStoreByUserId(user.providerData[0].uid);
          if (!store) {
            console.error('No store found for this user.');
            alert('You need to create a store first!');
            navigate('/vendordetails');
            return;
          }
          setStoreId(store.id);
          setStoreData(store);

          // Fetch product data
          const product = await getProductById(productId);
          if (!product) {
            alert('Product not found!');
            navigate(`/vendor/${store.id}`);
            return;
          }

          // Verify user owns this product
          if (product.storeId !== store.id) {
            alert('You do not have permission to edit this product.');
            navigate(`/vendor/${store.id}`);
            return;
          }

          setProductData(product);
        } catch (error) {
          console.error('Error fetching data:', error);
          alert('Failed to load product data.');
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    };

    fetchData();
  }, [user, productId, navigate]);

  const handleSubmit = async (formData) => {
    if (!user || !storeId || !storeData || !productData) {
      console.error('Missing required data.');
      alert('Missing required data.');
      return;
    }

    try {
      setUploading(true);
      let finalImageUrls = [];
      let imagesToDelete = [];

      // Generate imagePath using store ID and product name
      const imagePath = `images/${toSnakeCase(storeData.id)}/${toSnakeCase(formData.name)}`;
      
      // Start with existing images that weren't removed
      if (formData.existingImages && Array.isArray(formData.existingImages) && formData.existingImages.length > 0) {
        finalImageUrls = [...formData.existingImages];
      }

      // Identify images that were removed (need to be deleted)
      if (productData.images && Array.isArray(productData.images)) {
        imagesToDelete = productData.images.filter(
          oldUrl => !formData.existingImages?.includes(oldUrl)
        );
      }
      
      // Check if new images were uploaded
      if (formData.images && Array.isArray(formData.images) && formData.images.length > 0) {
        // Upload new images
        const uploadResult = await uploadMultipleImages(
          formData.images, 
          imagePath
        );
        
        if (uploadResult.success && uploadResult.urls) {
          // Add newly uploaded images to the existing ones
          finalImageUrls = [...finalImageUrls, ...uploadResult.urls];
          
          // If some images failed, show a warning
          if (uploadResult.errors && uploadResult.errors.length > 0) {
            console.warn('Some images failed to upload:', uploadResult.errors);
            alert(`Warning: ${uploadResult.errors.length} image(s) failed to upload, but continuing with ${uploadResult.urls.length} successful upload(s).`);
          }
        } else {
          throw new Error('Failed to upload images: ' + (uploadResult.errors?.join(', ') || 'Unknown error'));
        }
      }

      // Ensure at least one image exists
      if (finalImageUrls.length === 0) {
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

      // Update product data with full objects
      const updatedProductData = {
        name: formData.name,
        description: formData.description || '',
        actualPrice: parseFloat(formData.actualPrice),
        discountPrice: parseFloat(formData.discountPrice),
        images: finalImageUrls, // Use combined images (existing + new)
        imagePath: imagePath,
        categoryId: formData.categoryId,
        category: categoryData,
        storeId: storeId,
        store: storeData,
        userId: user.providerData[0].uid,
        isSecondHand: formData.isSecondHand || false,
        isOutOfStock: formData.isOutOfStock || false,
        isSoldOut: formData.isSoldOut || false,
        status: formData.status || 'instock',
      };

      const result = await updateProductDetails(productId, updatedProductData);
      
      if (result.success) {
        // Delete removed images from Firebase Storage
        if (imagesToDelete.length > 0) {
          await deleteMultipleImages(imagesToDelete);
        }
        
        navigate(`/vendor/${storeId}`);
      } else {
        alert(result.message || 'Failed to update product.');
      }
    } catch (error) {
      console.error('Error updating product:', error);
      alert('Failed to update product: ' + (error.message || 'Please try again.'));
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

  if (!storeId || !productData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-4">Unable to load product data.</p>
          <button
            onClick={() => navigate(`/vendor/${storeId}`)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Store
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
            <p className="text-gray-700 font-medium">Updating product...</p>
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
          <h2 className="text-2xl font-bold text-center mt-4 mb-6">Edit Product</h2>
          <ProductForm
            initialData={productData}
            onSubmit={handleSubmit}
            submitButtonText={uploading ? "Updating..." : "Update Product"}
            storeId={storeId}
            userId={user?.providerData[0].uid || ''}
          />
        </div>
      </div>
    </div>
  );
};

export default EditProductPage;