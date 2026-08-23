import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Pencil, Trash2, Check, X, Plus } from 'lucide-react';
import { getSubCategories, createSubCategory, renameSubCategory, deleteSubCategory } from '../../services/subcategoryService';
import { db } from '../../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const SubCategoryInput = ({ storeId, categoryId, selectedIds = [], onChange }) => {
  const [fetchedSubCategories, setFetchedSubCategories] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const containerRef = useRef(null);

  const loadSubCategories = useCallback(async () => {
    if (!storeId || !categoryId) {
      setFetchedSubCategories([]);
      return;
    }
    try {
      const subs = await getSubCategories(storeId, categoryId);
      setFetchedSubCategories(subs);
    } catch (err) {
      console.error('Error fetching subcategories:', err);
    }
  }, [storeId, categoryId]);

  useEffect(() => {
    loadSubCategories();
  }, [loadSubCategories]);

  // Click outside listener to close suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddSubCategory = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed || !storeId || !categoryId) return;

    // Check locally if it's already in the fetched list
    const existing = fetchedSubCategories.find(
      sub => sub.name.toLowerCase() === trimmed.toLowerCase()
    );

    if (existing) {
      if (!selectedIds.includes(existing.id)) {
        onChange([...selectedIds, existing.id]);
      }
      setInputValue('');
      return;
    }

    try {
      const newId = await createSubCategory(storeId, categoryId, trimmed);
      onChange([...selectedIds, newId]);
      await loadSubCategories();
      setInputValue('');
    } catch (err) {
      if (err.message === 'subCategoryExists') {
        // Query the document if it exists but wasn't in the local list
        try {
          const q = query(
            collection(db, 'sub_categories'),
            where('storeId', '==', storeId),
            where('categoryId', '==', categoryId),
            where('nameLower', '==', trimmed.toLowerCase()),
            where('isActive', '==', true)
          );
          const snap = await getDocs(q);
          if (!snap.empty) {
            const foundId = snap.docs[0].id;
            if (!selectedIds.includes(foundId)) {
              onChange([...selectedIds, foundId]);
            }
          }
          await loadSubCategories();
          setInputValue('');
        } catch (queryErr) {
          console.error(queryErr);
        }
      } else {
        alert('Failed to create sub-category: ' + err.message);
      }
    }
  };

  const handleRemoveChip = (id) => {
    onChange(selectedIds.filter(x => x !== id));
  };

  const handleDelete = async (sub, e) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete the sub-category "${sub.name}"?`)) {
      try {
        await deleteSubCategory(sub.id);
        if (selectedIds.includes(sub.id)) {
          onChange(selectedIds.filter(x => x !== sub.id));
        }
        await loadSubCategories();
      } catch (err) {
        alert('Failed to delete: ' + err.message);
      }
    }
  };

  const handleEditClick = (sub, e) => {
    e.stopPropagation();
    setEditingId(sub.id);
    setEditingName(sub.name);
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
    setEditingName('');
  };

  const handleSaveRename = async (sub, e) => {
    e.stopPropagation();
    const trimmed = editingName.trim();
    if (!trimmed) return;
    if (trimmed.toLowerCase() === sub.name.toLowerCase()) {
      setEditingId(null);
      return;
    }
    // Check if name already exists in others
    const duplicate = fetchedSubCategories.find(
      x => x.id !== sub.id && x.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      alert('A sub-category with this name already exists.');
      return;
    }

    try {
      await renameSubCategory(sub.id, trimmed);
      setEditingId(null);
      setEditingName('');
      await loadSubCategories();
    } catch (err) {
      alert('Failed to rename: ' + err.message);
    }
  };

  const handleSelectSuggestion = (sub) => {
    if (editingId) return; // Don't select while editing name
    if (!selectedIds.includes(sub.id)) {
      onChange([...selectedIds, sub.id]);
    }
    setInputValue('');
    setIsFocused(false);
  };

  const suggestions = fetchedSubCategories.filter(sub => 
    sub.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const resolvedSelectedTags = selectedIds
    .map(id => fetchedSubCategories.find(sub => sub.id === id))
    .filter(Boolean);

  if (!categoryId) return null;

  return (
    <div className="mb-4 relative" ref={containerRef}>
      <label className="block text-[#150A33] text-sm font-bold mb-2">
        Sub-categories
      </label>

      {/* Input and Add Button */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Type sub-category name..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsFocused(true);
          }}
          onFocus={() => setIsFocused(true)}
          className="bg-gray-50/80 border border-transparent rounded-lg h-12 flex-1 p-3 text-[#524B6B] focus:outline-none focus:border-blue-500 text-sm"
        />
        <button
          type="button"
          onClick={handleAddSubCategory}
          className="bg-primaryButtonBackgroundColor hover:bg-opacity-90 text-white rounded-lg h-12 w-12 flex items-center justify-center transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Selected tags */}
      {resolvedSelectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {resolvedSelectedTags.map(sub => (
            <span
              key={sub.id}
              className="inline-flex items-center gap-1 bg-[#E5EEE9] text-[#254030] px-3 py-1 rounded-full text-xs font-semibold"
            >
              {sub.name}
              <button
                type="button"
                onClick={() => handleRemoveChip(sub.id)}
                className="hover:bg-black/10 rounded-full p-0.5 text-gray-500 hover:text-gray-800 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Suggestions dropdown */}
      {isFocused && (inputValue !== '' || suggestions.length > 0) && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestions.length === 0 ? (
            <div className="p-3 text-sm text-gray-500">No matching sub-categories found. Click '+' to add.</div>
          ) : (
            suggestions.map(sub => (
              <div
                key={sub.id}
                onClick={() => handleSelectSuggestion(sub)}
                className={`flex items-center justify-between p-3 border-b border-gray-50 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedIds.includes(sub.id) ? 'bg-blue-50/30 font-medium' : ''
                }`}
              >
                {editingId === sub.id ? (
                  <div className="flex items-center gap-2 w-full" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm flex-1 focus:outline-none focus:border-blue-500"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={(e) => handleSaveRename(sub, e)}
                      className="p-1 hover:bg-green-100 text-green-600 rounded"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="p-1 hover:bg-red-100 text-red-600 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="text-sm text-gray-700">
                      {sub.name} {selectedIds.includes(sub.id) && <span className="text-xs text-blue-500 font-semibold ml-1">(selected)</span>}
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleEditClick(sub, e)}
                        className="p-1 hover:bg-gray-200 text-gray-500 hover:text-gray-700 rounded transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(sub, e)}
                        className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SubCategoryInput;
