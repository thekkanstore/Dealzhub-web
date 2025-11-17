import React, { useMemo } from 'react';
import CategorySkeleton from '../home/skeletons/CategorySkeleton';
import allCategoriesImage from '../../assets/images/chooseUserTypeBg-1@3x.png';

const CategoryScroller = ({
  categories,
  selectedCategory,
  onCategoryClick,
}) => {
  const allCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    // The "All" category is added for filtering purposes
    return [{ id: null, name: 'All', image: allCategoriesImage }, ...categories];
  }, [categories]);

  return (
    <div className="bg-white shadow-sm mb-4">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4 overflow-x-auto scrollbar-hide">
          {!categories || categories.length === 0 ? (
            Array.from({ length: 6 }).map((_, i) => <CategorySkeleton key={i} />)
          ) : (
            allCategories.map((cat) => (
              <div
                key={cat.id || 'all'}
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
                  onLoad={(e) => (e.target.style.opacity = '1')}
                  style={{ opacity: 0 }}
                />
                <div className="text-sm font-medium text-gray-800">{cat.name}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryScroller;