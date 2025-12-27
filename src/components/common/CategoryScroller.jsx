import React, { useMemo } from 'react';
import allCategoriesImage from '../../assets/images/chooseUserTypeBg-1@3x.png';

const CategoryScroller = React.memo(({
  categories,
  selectedCategory,
  onCategoryClick,
}) => {

  const allCategories = useMemo(() => {
    // Always include ALL category
    const list = [
      { id: null, name: 'All', image: allCategoriesImage }
    ];

    // If categories exist → append them
    if (Array.isArray(categories) && categories.length > 0) {
      return [...list, ...categories];
    }

    // If no categories → return only ALL
    return list;

  }, [categories]);

  return (
    <div className="bg-white shadow-sm mb-4">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">

          {allCategories.map(cat => (
            <div
              key={cat.id ?? 'all'}
              onClick={() => onCategoryClick(cat.id)}
              className={`min-w-[120px] p-4 rounded-lg text-center cursor-pointer bg-white ${
                selectedCategory === cat.id ? 'border-2 border-blue-500' : ''
              }`}
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-16 h-16 rounded-full object-cover mx-auto mb-2 border border-gray-200"
                loading="lazy"
              />

              <div className="text-sm font-medium text-gray-800">
                {cat.name}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
});

export default CategoryScroller;
