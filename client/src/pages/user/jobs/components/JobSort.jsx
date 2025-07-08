import React, { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

const JobSort = ({ totalResults }) => {
  const [open, setOpen] = useState(false);
  const options = [
    "Recommended",
    "Most Recent",
    "Best Match",
    "Salary (High to Low)",
  ];
  const [selected, setSelected] = useState(options[0]);

  return (
    <div className="flex justify-between items-center w-full px-1 mb-2 relative">
      <span className="text-sm text-gray-400 ml-3">
        Showing {totalResults} results
      </span>
      <div className="relative">
        <button
          className="text-sm text-gray-400 flex items-center gap-1 focus:outline-none"
          onClick={() => setOpen((prev) => !prev)}
        >
          Sort by:{" "}
          <span className="text-gray-700 font-semibold ml-1">{selected}</span>
          <FiChevronDown className="ml-1 text-gray-400 text-base" />
        </button>
        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {options.map((option) => (
              <div
                key={option}
                className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                  selected === option
                    ? "text-blue-600 font-semibold"
                    : "text-gray-700"
                }`}
                onClick={() => {
                  setSelected(option);
                  setOpen(false);
                }}
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
