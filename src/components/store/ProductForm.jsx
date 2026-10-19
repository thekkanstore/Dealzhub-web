import React, { useState, useEffect, useMemo } from 'react';
import { getActiveCategories } from '../../services/firestore';
import SubCategoryInput from './SubCategoryInput';
import { 
  getCategoryMeasurementProfile, 
  ALL_MEASUREMENT_UNITS,
  parseWeightOption,
  parseWeightOptionsList
} from '../../utils/measurementUtils';
import { Plus, X } from 'lucide-react';

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
  const [unit, setUnit] = useState(initialData?.unit || 'pcs');
  const [unitValue, setUnitValue] = useState(initialData?.unitValue || 1);
  const [sizes, setSizes] = useState(initialData?.sizes || []);
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [weightOptions, setWeightOptions] = useState(initialData?.weightOptions || []);
  const [customWeightInput, setCustomWeightInput] = useState('');
  const [customWeightUnit, setCustomWeightUnit] = useState('g');
  const [showOverride, setShowOverride] = useState(false);
  const [images, setImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState(initialData?.status || 'instock');
  const [isSecondHand, setIsSecondHand] = useState(initialData?.isSecondHand || false);
  const [isOutOfStock, setIsOutOfStock] = useState(initialData?.isOutOfStock || false);
  const [isSoldOut, setIsSoldOut] = useState(initialData?.isSoldOut || false);
  const [subcategoryIds, setSubcategoryIds] = useState(initialData?.subcategoryIds || []);

  const selectedCategory = useMemo(() => {
    return categories.find(c => c.id === categoryId) || null;
  }, [categories, categoryId]);

  const categoryProfile = useMemo(() => {
    return getCategoryMeasurementProfile(selectedCategory);
  }, [selectedCategory]);

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategoryId(value);
    setSubcategoryIds([]); // Reset sub-categories on category change

    const nextCat = categories.find(c => c.id === value);
    const nextProfile = getCategoryMeasurementProfile(nextCat);

    // If category does not need measurement options (e.g. Pets & Animals, Books, Furniture)
    if (!nextProfile.hasMeasurementOptions) {
      setUnit('pcs');
      setUnitValue('1');
      setSizes([]);
      setWeightOptions([]);
      setShowOverride(false);
    } else {
      if (!nextProfile.allowedUnits.includes(unit)) {
        setUnit(nextProfile.defaultUnit);
      }
      if (!nextProfile.supportsSizes && !showOverride) {
        setSizes([]);
      }
      if (!nextProfile.allowWeightOptions && !showOverride) {
        setWeightOptions([]);
      }
    }
  };

  const toggleSize = (size) => {
    if (sizes.includes(size)) {
      setSizes(sizes.filter(s => s !== size));
    } else {
      setSizes([...sizes, size]);
    }
  };

  const handleAddCustomSize = (e) => {
    if (e) e.preventDefault();
    const val = customSizeInput.trim();
    if (val && !sizes.includes(val)) {
      setSizes([...sizes, val]);
      setCustomSizeInput('');
    }
  };

  const handleRemoveSize = (size) => {
    setSizes(sizes.filter(s => s !== size));
  };

  useEffect(() => {
    if (categoryProfile.defaultUnit && ['g', 'kg', 'ml', 'ltr', 'pack', 'pcs'].includes(categoryProfile.defaultUnit)) {
      setCustomWeightUnit(categoryProfile.defaultUnit);
    } else if (['ml', 'ltr'].includes(unit)) {
      setCustomWeightUnit('ml');
    } else if (['kg', 'g'].includes(unit)) {
      setCustomWeightUnit('g');
    }
  }, [categoryProfile, unit]);

  const handleAddCustomWeight = (e) => {
    if (e) e.preventDefault();
    const raw = customWeightInput.trim();
    if (!raw) return;

    // Support comma or semicolon separation for multiple weights
    const parts = raw.split(/[,;]+/).map(p => p.trim()).filter(Boolean);
    const nextWeights = [...weightOptions];

    parts.forEach(part => {
      const parsed = parseWeightOption(part, customWeightUnit || unit || 'g');
      const label = parsed?.label || part;
      if (label && !nextWeights.includes(label)) {
        nextWeights.push(label);
      }
    });

    if (nextWeights.length > weightOptions.length) {
      setWeightOptions(nextWeights);
      setCustomWeightInput('');

      // Auto-sync baseline unit and unitValue to first package
      const firstOpt = parseWeightOption(nextWeights[0], customWeightUnit || unit);
      if (firstOpt) {
        setUnitValue(firstOpt.value);
        if (firstOpt.unit) setUnit(firstOpt.unit);
      }
    }
  };

  const addSuggestedWeight = (sugg) => {
    const parsed = parseWeightOption(sugg, customWeightUnit || unit || 'g');
    const label = parsed?.label || sugg;
    if (!weightOptions.includes(label)) {
      const next = [...weightOptions, label];
      setWeightOptions(next);

      if (next.length === 1 && parsed) {
        setUnitValue(parsed.value);
        if (parsed.unit) setUnit(parsed.unit);
      }
    }
  };

  const handleRemoveWeight = (opt) => {
    setWeightOptions(weightOptions.filter(o => o !== opt));
  };

  const [errors, setErrors] = useState({
    name: '',
    description: '',
    actualPrice: '',
    discountPrice: '',
    categoryId: '',
    unitValue: '',
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
    setUnit(initialData?.unit || 'pcs');
    setUnitValue(initialData?.unitValue || 1);
    setSizes(Array.isArray(initialData?.sizes) ? initialData.sizes : []);
    
    const loadedWeights = Array.isArray(initialData?.weightOptions) ? initialData.weightOptions : [];
    setWeightOptions(loadedWeights);
    if (loadedWeights.length > 0 || (Array.isArray(initialData?.sizes) && initialData.sizes.length > 0)) {
      setShowOverride(true);
    }

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

    if (unitValue && (isNaN(parseFloat(unitValue)) || parseFloat(unitValue) <= 0)) {
      newErrors.unitValue = 'Unit value must be greater than 0';
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
      const firstOptParsed = weightOptions.length > 0 ? parseWeightOption(weightOptions[0]) : null;
      const finalUnit = firstOptParsed?.unit || (unit || 'pcs');
      const finalUnitValue = firstOptParsed ? firstOptParsed.value : (parseFloat(unitValue) || 1);

      onSubmit({ 
        name, 
        description, 
        actualPrice, 
        discountPrice, 
        categoryId,
        subcategoryIds,
        unit: finalUnit,
        unitValue: finalUnitValue,
        sizes: (categoryProfile.supportsSizes || showOverride || sizes.length > 0) ? sizes : [],
        weightOptions: (categoryProfile.allowFractionalWeight || categoryProfile.allowWeightOptions || showOverride || weightOptions.length > 0) ? weightOptions : [],
        category: selectedCategory,
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

  // Determine allowed units for dropdown
  const availableUnits = useMemo(() => {
    if (showOverride) return ALL_MEASUREMENT_UNITS;
    if (!categoryId || categoryProfile.type === 'none') return [];
    return ALL_MEASUREMENT_UNITS.filter(u => categoryProfile.allowedUnits.includes(u.value));
  }, [categoryId, categoryProfile, showOverride]);

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
          rows="4"
          required
        ></textarea>
        {errors.description && <p className="text-red-500 text-xs italic mt-1">{errors.description}</p>}
      </div>

      {/* Category Selection - placed prominently before measurements & pricing */}
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

      {/* Category-Driven Measurement & Sizing Section: Only renders if category supports measurements or owner enables override */}
      {categoryId && (categoryProfile.hasMeasurementOptions || showOverride) ? (
        <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-white shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
              Product Options
            </h3>
            <button
              type="button"
              onClick={() => setShowOverride(!showOverride)}
              className="text-xs text-emerald-700 hover:underline font-medium cursor-pointer"
            >
              {showOverride ? 'Reset to defaults' : 'More options'}
            </button>
          </div>

          {/* Sizes: Shown for Apparel & Footwear */}
          {(categoryProfile.supportsSizes || showOverride) && (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-700">
                Available Sizes
              </label>

              {/* Preset buttons */}
              {categoryProfile.presetSizes?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {categoryProfile.presetSizes.map((preset) => {
                    const isSelected = sizes.includes(preset);
                    return (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => toggleSize(preset)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {preset}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Custom size input */}
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Type size (e.g. 32, UK 8)"
                  value={customSizeInput}
                  onChange={(e) => setCustomSizeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomSize(e);
                    }
                  }}
                  className="bg-gray-50/80 appearance-none border border-gray-200 rounded-lg h-9 px-3 text-xs text-[#524B6B] focus:outline-none focus:border-emerald-600 flex-1 min-w-0"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSize}
                  className="h-9 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {/* Selected sizes */}
              {sizes.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {sizes.map((s) => (
                    <span
                      key={s}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-medium"
                    >
                      {s}
                      <button
                        type="button"
                        onClick={() => handleRemoveSize(s)}
                        className="hover:text-red-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Weights & Packages: Shown for Grocery/Liquids/Produce */}
          {(categoryProfile.allowFractionalWeight || categoryProfile.allowWeightOptions || showOverride) && (
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <label className="block text-xs font-semibold text-gray-700">
                Available Weights / Packages
              </label>

              {/* Input to type custom weight */}
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Amount or package (e.g. 250, 500, 1kg)"
                  value={customWeightInput}
                  onChange={(e) => setCustomWeightInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomWeight(e);
                    }
                  }}
                  className="bg-gray-50/80 appearance-none border border-gray-200 rounded-lg h-9 px-3 text-xs text-[#524B6B] focus:outline-none focus:border-emerald-600 flex-1 min-w-0"
                />
                <select
                  value={customWeightUnit}
                  onChange={(e) => setCustomWeightUnit(e.target.value)}
                  className="bg-gray-50/80 border border-gray-200 rounded-lg h-9 px-2 text-xs text-gray-700 focus:outline-none focus:border-emerald-600 shrink-0 cursor-pointer font-medium"
                >
                  {(categoryProfile.allowedUnits && categoryProfile.allowedUnits.length > 0
                    ? categoryProfile.allowedUnits
                    : ['g', 'kg', 'ml', 'ltr', 'pack', 'pcs']
                  ).map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAddCustomWeight}
                  className="h-9 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>

              {/* Quick suggestion pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-gray-400 mr-0.5">Quick add:</span>
                {(categoryProfile.suggestedWeights || (['kg', 'g'].includes(unit) 
                  ? ['100g', '250g', '500g', '1kg', '2kg', '5kg'] 
                  : ['100ml', '250ml', '500ml', '1L', '2L'])
                ).map((sugg) => (
                  <button
                    key={sugg}
                    type="button"
                    onClick={() => addSuggestedWeight(sugg)}
                    className="text-[11px] px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors cursor-pointer font-medium"
                  >
                    + {sugg}
                  </button>
                ))}
              </div>

              {/* Added weight chips */}
              {weightOptions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {weightOptions.map((opt) => (
                    <span
                      key={opt}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-medium"
                    >
                      {opt}
                      <button
                        type="button"
                        onClick={() => handleRemoveWeight(opt)}
                        className="hover:text-red-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : categoryId ? (
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={() => setShowOverride(true)}
            className="text-[11px] text-gray-400 hover:text-emerald-700 font-medium transition-colors cursor-pointer"
          >
            + Add sizes or weight options (optional)
          </button>
        </div>
      ) : null}

      {/* Pricing Inputs */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-[#150A33] text-sm font-bold mb-2" htmlFor="actualPrice">
            Actual Price (₹){weightOptions.length > 0 ? ` (for ${weightOptions[0]})` : ''}
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
            Discount Price (₹){weightOptions.length > 0 ? ` (for ${weightOptions[0]})` : ''}
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