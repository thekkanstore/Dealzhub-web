import React, { useState, useEffect } from 'react';
import { getActiveCategories } from '../../services/firestore';
import SubCategoryInput from './SubCategoryInput';

const ProductForm = ({
  initialData,
  onSubmit,
  submitButtonText = 'Add Product',
  storeId,
  userId,
}) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [actualPrice, setActualPrice] = useState(initialData?.actualPrice || '');
  const [discountPrice, setDiscountPrice] = useState(initialData?.discountPrice || '');
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '');
  const [images, setImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState(initialData?.status || 'instock');
  const [isSecondHand, setIsSecondHand] = useState(initialData?.isSecondHand || false);
  const [isOutOfStock, setIsOutOfStock] = useState(initialData?.isOutOfStock || false);
  const [isSoldOut, setIsSoldOut] = useState(initialData?.isSoldOut || false);
  const [subcategoryIds, setSubcategoryIds] = useState(initialData?.subcategoryIds || []);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategoryId(value);
    setSubcategoryIds([]); // Reset sub-categories on category change
  };

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    actualPrice: '',
    discountPrice: '',
    categoryId: '',
    images: '',
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = await getActiveCategories();
      setCategories(fetchedCategories);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setName(initialData?.name || '');
    setDescription(initialData?.description || '');
    setActualPrice(initialData?.actualPrice || '');
    setDiscountPrice(initialData?.discountPrice || '');
    setCategoryId(initialData?.categoryId || '');
    setStatus(initialData?.status || 'instock');
    setIsSecondHand(initialData?.isSecondHand || false);
    setIsOutOfStock(initialData?.isOutOfStock || false);
    setIsSoldOut(initialData?.isSoldOut || false);
    setSubcategoryIds(initialData?.subcategoryIds || []);
    
    // Handle existing images for edit mode
    if (initialData?.images && Array.isArray(initialData.images) && initialData.images.length > 0) {
      setExistingImages(initialData.images);
    }
  }, [initialData]);

  const validate = () => {
    let newErrors = {
      name: '',
      description: '',
      actualPrice: '',
      discountPrice: '',
      categoryId: '',
      images: '',
    };
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Product Name is required';
      isValid = false;
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required';
      isValid = false;
    }
    if (!actualPrice || parseFloat(actualPrice) <= 0) {
      newErrors.actualPrice = 'Actual Price must be greater than 0';
      isValid = false;
    }
    if (!discountPrice || parseFloat(discountPrice) <= 0) {
      newErrors.discountPrice = 'Discount Price must be greater than 0';
      isValid = false;
    }
    if (parseFloat(discountPrice) > parseFloat(actualPrice)) {
      newErrors.discountPrice = 'Discount Price cannot be greater than Actual Price';
      isValid = false;
    }
    if (!categoryId) {
      newErrors.categoryId = 'Category is required';
      isValid = false;
    }
    // Check if we have either new images or existing images
    if (images.length === 0 && existingImages.length === 0) {
      newErrors.images = 'At least one image is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      
      // Add new images to existing ones instead of replacing
      setImages(prev => [...prev, ...filesArray]);

      // Create preview URLs for new files
      const previewUrls = filesArray.map(file => URL.createObjectURL(file));
      setNewImagePreviews(prev => [...prev, ...previewUrls]);
      
      // Reset the file input so the same files can be selected again if needed
      e.target.value = '';
    }
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(newImagePreviews[index]);
    
    setImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({ 
        name, 
        description, 
        actualPrice, 
        discountPrice, 
        categoryId,
        subcategoryIds,
        images, // New images (File objects)
        existingImages, // Existing images (URLs)
        status,
        isSecondHand,
        isOutOfStock,
        isSoldOut,
        storeId,
        userId
      });
    }
  };

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      newImagePreviews.forEach(url => {
        if (url.startsWith('blob:')) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [newImagePreviews]);

  return (
    <form className="mt-8" onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="name">
          Product Name
        </label>
        <input
          className={`bg-gray-50/80 appearance-none border rounded-lg h-12 w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline ${errors.name ? 'border-red-500' : 'border-transparent'}`}
          id="name"
          type="text"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        {errors.name && <p className="text-red-500 text-xs italic mt-1">{errors.name}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          className={`bg-gray-50/80 appearance-none border rounded-lg w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline ${errors.description ? 'border-red-500' : 'border-transparent'}`}
          id="description"
          placeholder="Product Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          required
        ></textarea>
        {errors.description && <p className="text-red-500 text-xs italic mt-1">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="actualPrice">
            Actual Price (₹)
          </label>
          <input
            className={`bg-gray-50/80 appearance-none border rounded-lg h-12 w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline ${errors.actualPrice ? 'border-red-500' : 'border-transparent'}`}
            id="actualPrice"
            type="number"
            placeholder="Actual Price"
            value={actualPrice}
            onChange={(e) => setActualPrice(e.target.value)}
            required
            min="0.01"
            step="0.01"
          />
          {errors.actualPrice && <p className="text-red-500 text-xs italic mt-1">{errors.actualPrice}</p>}
        </div>

        <div>
          <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="discountPrice">
            Discount Price (₹)
          </label>
          <input
            className={`bg-gray-50/80 appearance-none border rounded-lg h-12 w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline ${errors.discountPrice ? 'border-red-500' : 'border-transparent'}`}
            id="discountPrice"
            type="number"
            placeholder="Discount Price"
            value={discountPrice}
            onChange={(e) => setDiscountPrice(e.target.value)}
            required
            min="0.01"
            step="0.01"
          />
          {errors.discountPrice && <p className="text-red-500 text-xs italic mt-1">{errors.discountPrice}</p>}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="categoryId">
          Category
        </label>
        <select
          className={`bg-gray-50/80 appearance-none border rounded-lg h-12 w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline ${errors.categoryId ? 'border-red-500' : 'border-transparent'}`}
          id="categoryId"
          value={categoryId}
          onChange={handleCategoryChange}
          required
        >
          <option value="">Select Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && <p className="text-red-500 text-xs italic mt-1">{errors.categoryId}</p>}
      </div>

      {categoryId && (
        <SubCategoryInput
          storeId={storeId}
          categoryId={categoryId}
          selectedIds={subcategoryIds}
          onChange={setSubcategoryIds}
        />
      )}

      <div className="mb-4">
        <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="status">
          Status
        </label>
        <select
          className="bg-gray-50/80 appearance-none border border-transparent rounded-lg h-12 w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline"
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="instock">In Stock</option>
          <option value="outofstock">Out of Stock</option>
        </select>
      </div>

      <div className="mb-4 space-y-2">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isSecondHand}
            onChange={(e) => setIsSecondHand(e.target.checked)}
            className="mr-2 w-4 h-4"
          />
          <span className="text-sm text-[#524B6B]">Second Hand Product</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isOutOfStock}
            onChange={(e) => setIsOutOfStock(e.target.checked)}
            className="mr-2 w-4 h-4"
          />
          <span className="text-sm text-[#524B6B]">Out of Stock</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isSoldOut}
            onChange={(e) => setIsSoldOut(e.target.checked)}
            className="mr-2 w-4 h-4"
          />
          <span className="text-sm text-[#524B6B]">Sold Out</span>
        </label>
      </div>

      <div className="mb-4">
        <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="images">
          Product Images (Multiple)
        </label>
        <input
          className={`bg-gray-50/80 appearance-none border rounded-lg h-12 w-full p-3 text-[#524B6B] leading-tight focus:outline-none focus:shadow-outline ${errors.images ? 'border-red-500' : 'border-transparent'}`}
          id="images"
          type="file"
          multiple
          onChange={handleImageChange}
          accept="image/*"
        />
        {errors.images && <p className="text-red-500 text-xs italic mt-1">{errors.images}</p>}
        
        {/* Display images in a grid */}
        {(existingImages.length > 0 || newImagePreviews.length > 0) && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">
              Total Images: {existingImages.length + newImagePreviews.length}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {/* Show existing images first */}
              {existingImages.map((imageUrl, index) => (
                <div key={`existing-${index}`} className="relative">
                  <img 
                    src={imageUrl} 
                    alt={`Existing ${index + 1}`} 
                    className="w-full h-24 object-cover rounded-lg border border-gray-300"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                  <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                    Existing
                  </span>
                </div>
              ))}
              
              {/* Show new image previews */}
              {newImagePreviews.map((preview, index) => (
                <div key={`new-${index}`} className="relative">
                  <img 
                    src={preview} 
                    alt={`New ${index + 1}`} 
                    className="w-full h-24 object-cover rounded-lg border border-green-300"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                  <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                    New
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          className="p-2 bg-primaryButtonBackgroundColor gap-2 rounded-full w-full flex items-center justify-center text-white shadow-sm hover:shadow-md transition-all duration-300 ease-in-out hover:scale-[1.02] active:scale-[0.98]"
          type="submit"
        >
          {submitButtonText}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;