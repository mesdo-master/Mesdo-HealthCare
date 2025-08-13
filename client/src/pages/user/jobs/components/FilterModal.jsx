import React, { useState } from "react";
import { Search, X } from "lucide-react";
import Select from "react-select";
import axiosInstance from "../../../../lib/axio";
import { useDispatch } from "react-redux";
import { setFilteredJobs } from "../../../../store/features/authSlice";
import { useNavigate } from "react-router-dom";

const FilterModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    jobTitle: "Dental Surgeon",
    location: "",
    skills: [],
    specializations: [],
    experience: 0,
    jobTypes: [],
    languages: [],
    salaryRange: [0, 50], // Changed to array for dual pointer
  });
  const [newSkill, setNewSkill] = useState("");
  const [newSpec, setNewSpec] = useState("");
  // Removed newJobType and newLanguage since we're using dropdowns now

  const dispatch = useDispatch();

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleSelection = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((item) => item !== value)
        : [...prev[field], value],
    }));
  };

  const handleAddTag = (field, valueSetter, value) => {
    if (!value.trim()) return;
    setFilters((prev) => ({
      ...prev,
      [field]: [...new Set([...prev[field], value.trim()])],
    }));
    valueSetter("");
  };

  const handleSalaryRangeChange = (index, value) => {
    const newRange = [...filters.salaryRange];
    newRange[index] = parseInt(value);

    // Ensure min doesn't exceed max and vice versa
    if (index === 0 && newRange[0] > newRange[1]) {
      newRange[1] = newRange[0];
    } else if (index === 1 && newRange[1] < newRange[0]) {
      newRange[0] = newRange[1];
    }

    setFilters((prev) => ({
      ...prev,
      salaryRange: newRange,
    }));
  };

  const handleReset = () => {
    setFilters({
      jobTitle: "Dental Surgeon",
      location: "",
      skills: [],
      specializations: [],
      experience: 0,
      jobTypes: [],
      languages: [],
      salaryRange: [0, 50], // Reset to array
    });
  };

  const handleApply = async () => {
    try {
      const response = await axiosInstance.post("/userSide/filters", filters);
      await dispatch(setFilteredJobs(response.data));
      onClose();
      console.log("Filtered Jobs: ", response);
    } catch (err) {
      console.error("Error fetching filtered jobs:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-sm flex items-center justify-center z-50 p-4 mt-16">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[95vh] overflow-y-auto border border-gray-100">
        <div className="p-8">
          {/* Search Inputs */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="relative">
              <input
                type="text"
                name="jobTitle"
                value={filters.jobTitle}
                onChange={handleInputChange}
                placeholder="Dental Surgeon"
                className="w-full py-4 pl-5 pr-10 text-base bg-white outline-none rounded-lg border border-gray-200 placeholder:text-gray-500"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#1890FF] w-5 h-5" />
            </div>
            <div className="relative">
              <input
                type="text"
                name="location"
                value={filters.location}
                onChange={handleInputChange}
                placeholder="Enter Location"
                className="w-full py-4 pl-5 pr-10 text-base bg-white outline-none rounded-lg border border-gray-200 placeholder:text-gray-500"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#1890FF] w-5 h-5" />
            </div>
          </div>

          {/* Filters Heading */}
          <h2 className="text-xl font-bold text-gray-900 mb-6">Filters</h2>

          {/* Filters Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Experience */}
            <div className="bg-white border border-[#E4E5E8] rounded-xl p-6">
              <div className="mb-4 text-sm font-medium text-gray-900">
                Experience
              </div>
              <div className="mb-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={filters.experience}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      experience: parseInt(e.target.value),
                    }))
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #1890FF 0%, #1890FF ${
                      (filters.experience / 10) * 100
                    }%, #E5E7EB ${
                      (filters.experience / 10) * 100
                    }%, #E5E7EB 100%)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>&lt; 1 year</span>
                <span>10 years</span>
              </div>
              <div className="text-xs text-gray-500">
                {filters.experience} year
              </div>
            </div>

            {/* Salary Range */}
            <div className="bg-white border border-[#E4E5E8] rounded-xl p-6">
              <div className="mb-4 text-sm font-medium text-gray-900">
                Salary Range
              </div>
              <div className="mb-2 relative">
                {/* Background track */}
                <div className="w-full h-2 bg-gray-200 rounded-lg"></div>

                {/* Blue highlight between pointers */}
                <div
                  className="absolute h-2 bg-[#1890FF] rounded-lg top-0"
                  style={{
                    left: `${(filters.salaryRange[0] / 50) * 100}%`,
                    width: `${
                      ((filters.salaryRange[1] - filters.salaryRange[0]) / 50) *
                      100
                    }%`,
                  }}
                ></div>

                {/* Min value slider */}
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={filters.salaryRange[0]}
                  onChange={(e) => handleSalaryRangeChange(0, e.target.value)}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider top-0 z-10"
                />

                {/* Max value slider */}
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={filters.salaryRange[1]}
                  onChange={(e) => handleSalaryRangeChange(1, e.target.value)}
                  className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer slider top-0 z-10"
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Rs 0</span>
                <span>Rs 50L+</span>
              </div>
              <div className="text-xs text-gray-500">
                Rs {filters.salaryRange[0]}L - Rs {filters.salaryRange[1]}L
              </div>
            </div>

            {/* Job Type */}
            <div className="bg-white border border-[#E4E5E8] rounded-xl p-6">
              <div className="mb-4 text-sm font-medium text-gray-900">
                Job Type
              </div>
              <div className="mb-4">
                <Select
                  isMulti
                  value={filters.jobTypes.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                  onChange={(selectedOptions) => {
                    const selectedValues = selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : [];
                    setFilters((prev) => ({
                      ...prev,
                      jobTypes: selectedValues,
                    }));
                  }}
                  options={[
                    { value: "Internship", label: "Internship" },
                    { value: "Part-time", label: "Part-time" },
                    { value: "Contract", label: "Contract" },
                    { value: "Full-time", label: "Full-time" },
                  ]}
                  placeholder="Select Job Types"
                  className="text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "40px",
                      borderColor: "#e5e7eb",
                      borderRadius: "0.5rem",
                      backgroundColor: "white",
                      "&:hover": {
                        borderColor: "#e5e7eb",
                      },
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: "0 12px",
                    }),
                    input: (base) => ({
                      ...base,
                      margin: 0,
                      padding: 0,
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#9ca3af",
                    }),
                  }}
                />
              </div>
              <div className="flex gap-2">
                {filters.jobTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => handleToggleSelection("jobTypes", type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.jobTypes.includes(type)
                        ? "bg-[#1890FF] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Department */}
            <div className="bg-white border border-[#E4E5E8] rounded-xl p-6">
              <div className="mb-4 text-sm font-medium text-gray-900">
                Department
              </div>
              <div className="relative mb-4">
                <input
                  type="text"
                  value={newSpec}
                  onChange={(e) => setNewSpec(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag("specializations", setNewSpec, newSpec);
                    }
                  }}
                  placeholder="Dermatologist"
                  className="w-full py-2 pl-4 pr-10 text-sm bg-white outline-none rounded-lg border border-gray-200 placeholder:text-gray-500"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#1890FF] w-4 h-4" />
              </div>
              <div className="flex gap-2">
                {filters.specializations.map((dept) => (
                  <button
                    key={dept}
                    onClick={() =>
                      handleToggleSelection("specializations", dept)
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.specializations.includes(dept)
                        ? "bg-[#1890FF] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white border border-[#E4E5E8] rounded-xl p-6">
              <div className="mb-4 text-sm font-medium text-gray-900">
                Skills
              </div>
              <div className="relative mb-4">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag("skills", setNewSkill, newSkill);
                    }
                  }}
                  placeholder="Add Skills"
                  className="w-full py-2 pl-4 pr-10 text-sm bg-white outline-none rounded-lg border border-gray-200 placeholder:text-gray-500"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#1890FF] w-4 h-4" />
              </div>
              <div className="flex gap-2">
                {filters.skills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => handleToggleSelection("skills", skill)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.skills.includes(skill)
                        ? "bg-[#1890FF] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-white border border-[#E4E5E8] rounded-xl p-6">
              <div className="mb-4 text-sm font-medium text-gray-900">
                Languages
              </div>
              <div className="mb-4">
                <Select
                  isMulti
                  value={filters.languages.map((lang) => ({
                    value: lang,
                    label: lang,
                  }))}
                  onChange={(selectedOptions) => {
                    const selectedValues = selectedOptions
                      ? selectedOptions.map((option) => option.value)
                      : [];
                    setFilters((prev) => ({
                      ...prev,
                      languages: selectedValues,
                    }));
                  }}
                  options={[
                    { value: "Hindi", label: "Hindi" },
                    { value: "English", label: "English" },
                  ]}
                  placeholder="Select Languages"
                  className="text-sm"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "40px",
                      borderColor: "#e5e7eb",
                      borderRadius: "0.5rem",
                      backgroundColor: "white",
                      "&:hover": {
                        borderColor: "#e5e7eb",
                      },
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: "0 12px",
                    }),
                    input: (base) => ({
                      ...base,
                      margin: 0,
                      padding: 0,
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#9ca3af",
                    }),
                  }}
                />
              </div>
              <div className="flex gap-2">
                {filters.languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => handleToggleSelection("languages", lang)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.languages.includes(lang)
                        ? "bg-[#1890FF] text-white"
                        : "bg-gray-700"
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2 rounded-lg bg-[#1890FF] text-white font-medium hover:bg-blue-700 transition-colors"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 1px solid #f2f2f2;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 20;
        }

        .slider::-moz-range-thumb {
          height: 18px;
          width: 18px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 1px solid #f2f2f2;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          z-index: 20;
        }

        .slider::-webkit-slider-track {
          background: transparent;
        }

        .slider::-moz-range-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
};

export default FilterModal;
