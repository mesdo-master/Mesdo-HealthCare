import React, { useState } from "react";
import { Search, MapPin, Filter, Plus } from "lucide-react";
import FilterModal from "./FilterModal";
import axiosInstance from "../../../../lib/axio";
import { useDispatch } from "react-redux";
import { setFilteredJobs } from "../../../../store/features/authSlice";
import FilterIcon from "../../../../assets/List.png";

const JobFilters = ({ category = "Jobs" }) => {
  const dispatch = useDispatch();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [onSearch, setOnSearch] = useState("");
  const [onLocationChange, setOnLocationChange] = useState("");

  const onEnterSearchHandler = async (e) => {
    if (e.key === "Enter") {
      try {
        const response = await axiosInstance.post("/userSide/filters", {
          jobTitle: onSearch,
          location: onLocationChange,
        });
        console.log("response: ", response.data);
        await dispatch(setFilteredJobs(response.data));
        console.log("Filtered Jobs: ", response);
      } catch (err) {
        console.error("Error fetching filtered jobs:", err);
      }
    }
  };

  return (
    <div className="bg-[#f6f8fb] p-4 rounded-xl w-full">
      {/* Top Buttons: New Search + Plus */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={""}
          className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white text-[#1890FF] hover:text-blue-700 transition-colors shadow-none"
        >
          New Search
        </button>
        <button
          onClick={""}
          className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-lg bg-white text-[#8C8C8C] hover:text-blue-700 transition-colors shadow-none"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Search Box Section */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden w-full">
        <div className="grid grid-cols-2 gap-4 p-4 bg-white w-full">
          {/* Job Title Input (only for Jobs) */}
          {category === "Jobs" && (
            <div className="relative bg-[#f8f9fb] rounded-lg border border-gray-200 flex items-center">
              <input
                type="text"
                placeholder="Dental Surgeon"
                className="w-full py-4 pl-5 pr-10 text-base bg-transparent outline-none rounded-lg border-none placeholder:text-gray-500"
                onChange={(e) => setOnSearch(e.target.value)}
                onKeyDown={(e) => onEnterSearchHandler(e)}
              />
              <Search
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#1890FF]"
                size={20}
              />
            </div>
          )}

          {/* Location Input (always show, but full width if not Jobs) */}
          <div
            className={`relative bg-[#f8f9fb] rounded-lg border border-gray-200 flex items-center ${
              category !== "Jobs" ? "col-span-2" : ""
            }`}
          >
            <input
              type="text"
              placeholder="Enter Location"
              className="w-full py-4 pl-5 pr-10 text-base bg-transparent outline-none rounded-lg border-none placeholder:text-gray-500"
              onChange={(e) => setOnLocationChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onEnterSearchHandler(e);
                }
              }}
            />
            <Search
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#1890FF]"
              size={20}
            />
          </div>
        </div>

        {/* Filter button */}
        <div className="border-t border-gray-200 py-3 flex justify-center">
          <button
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center gap-1 text-[#1890FF] text-base font-medium hover:text-blue-700 transition-colors"
          >
            <span>Filter</span>
            <img
              src={FilterIcon}
              alt="Applied Jobs"
              className="w-[20px] h-[20px] object-contain"
            />
          </button>
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />
    </div>
  );
};

export default JobFilters;
