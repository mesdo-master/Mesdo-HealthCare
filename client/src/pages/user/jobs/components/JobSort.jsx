import React, { useState, useEffect, useRef } from "react";
import { FiChevronDown } from "react-icons/fi";

const JobSort = ({ totalResults, onSortChange }) => {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Recommended");
  const dropdownRef = useRef(null);

  const options = [
    "Recommended",
    "Most Recent",
    "Best Match",
    "Salary (High to Low)",
    "Job Title",
    "Company Name",
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSortChange = (option) => {
    setSelected(option);
    setOpen(false);
    if (onSortChange) {
      onSortChange(option);
    }
  };

  return (
    <div className="flex justify-between items-center w-full mb-2 relative">
      <span className="text-sm text-gray-400">
        Showing {totalResults} results
      </span>
      <div className="relative" ref={dropdownRef}>
        <button
          className="text-sm text-gray-400 flex items-center gap-1 focus:outline-none hover:text-gray-600 transition-colors"
          onClick={() => setOpen((prev) => !prev)}
        >
          Sort by:{" "}
          <span className="text-gray-700 font-semibold ml-1">{selected}</span>
          <FiChevronDown
            className={`ml-1 text-gray-400 text-base transition-transform duration-200 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
            {options.map((option) => (
              <div
                key={option}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 transition-colors ${
                  selected === option
                    ? "text-blue-600 font-semibold bg-blue-50"
                    : "text-gray-700"
                }`}
                onClick={() => handleSortChange(option)}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobSort;
