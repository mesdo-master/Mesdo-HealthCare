import React from "react";
import { X, Check } from "lucide-react";

const CaseCategoryModal = ({
  isOpen,
  onClose,
  onCategorySelect,
  selectedCategories = [],
}) => {
  if (!isOpen) return null;

  const categories = [
    "Dentist",
    "ENT",
    "Gynaecology",
    "Dermatology",
    "Nursing",
    "Physiotherapist",
  ];

  const handleCategoryClick = (category) => {
    let updatedCategories;
    if (selectedCategories.includes(category)) {
      // Remove category if already selected
      updatedCategories = selectedCategories.filter((cat) => cat !== category);
    } else {
      // Add category if not selected
      updatedCategories = [...selectedCategories, category];
    }
    onCategorySelect(updatedCategories);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-sm shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">
              Case Category
            </h3>
            <p className="text-xs text-gray-500 mt-1">Everyone & 2 Groups</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories List */}
        <div className="p-4">
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="w-full flex items-center justify-between px-3 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="text-gray-700 text-sm font-medium">
                  {category}
                </span>
                {selectedCategories.includes(category) && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseCategoryModal;
