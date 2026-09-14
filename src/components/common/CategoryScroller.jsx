import React, { useMemo } from 'react';
import { LayoutGrid } from 'lucide-react';

const CategoryScroller = React.memo(({
  categories,
  selectedCategory,
  onCategoryClick,
}) => {

  const allCategories = useMemo(() => {
    // Always include ALL category
    const list = [
      { id: null, name: 'All', image: null }
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
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div 
          className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide p-1.5"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >

          {allCategories.map(cat => (
            <div
              key={cat.id ?? 'all'}
              onClick={() => onCategoryClick(cat.id)}
              className={`min-w-[110px] sm:min-w-[120px] p-3 sm:p-4 rounded-2xl text-center cursor-pointer transition-all duration-200 ${
                selectedCategory === cat.id 
                  ? 'border-2 border-primaryButtonBackgroundColor bg-[#E5EEE9]/40 shadow-xs font-bold' 
                  : 'bg-white border border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
              }`}
            >
              {cat.image ? (
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover mx-auto mb-2 border border-gray-200 shadow-xs"
                  loading="lazy"
                />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#E5EEE9] border border-[#528E6B]/30 flex items-center justify-center mx-auto mb-2 text-[#254030] shadow-xs">
                  <LayoutGrid className="w-7 h-7 text-[#528E6B]" />
                </div>
              )}

              <div className={`text-xs sm:text-sm font-medium ${selectedCategory === cat.id ? 'text-[#254030] font-bold' : 'text-gray-800'}`}>
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

