import React, { useState } from "react";
import { Search, X } from "lucide-react";
import axiosInstance from "../../../../lib/axio";
import { useDispatch } from "react-redux";
import { setFilteredJobs } from "../../../../store/features/authSlice";
import { useNavigate } from "react-router-dom";

const FilterModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    jobTitle: "",
    location: "",
    skills: [],
    specializations: [],
    experience: 0,
    jobTypes: [],
    languages: [],
    salaryRange: 0,
  });
  const [newSkill, setNewSkill] = useState("");
  const [newSpec, setNewSpec] = useState("");
  const [newJobType, setNewJobType] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

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

  const handleReset = () => {
    setFilters({
      jobTitle: "",
      location: "",
      skills: [],
      specializations: [],
      experience: 0,
      jobTypes: [],
      languages: [],
      salaryRange: 0,
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
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-semibold">Filters</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Search Inputs */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {["jobTitle", "location"].map((field, idx) => (
              <div key={field} className="relative">
                <input
                  type="text"
                  name={field}
                  placeholder={
                    field === "jobTitle" ? "Dental Surgeon" : "Enter Location"
                  }
                  value={filters[field]}
                  onChange={handleInputChange}
                  className="w-full py-4 pl-5 pr-10 text-base bg-[#f8f9fb] outline-none rounded-lg border border-gray-200 placeholder:text-gray-500"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#1890FF] w-5 h-5" />
              </div>
            ))}
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            {/* Experience */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col">
              <div className="mb-2 text-sm font-medium text-gray-700">
                Experience
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">&lt; 1 year</span>
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
                  className="flex-1 accent-blue-500 h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-400">10 years</span>
              </div>
              <div className="text-xs text-gray-400">
                {filters.experience} year
              </div>
            </div>
            {/* Salary Range */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col">
              <div className="mb-2 text-sm font-medium text-gray-700">
                Salary Range
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-400">Rs 0</span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={filters.salaryRange}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      salaryRange: parseInt(e.target.value),
                    }))
                  }
                  className="flex-1 accent-blue-500 h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-xs text-gray-400">Rs 50L+</span>
              </div>
              <div className="text-xs text-gray-400">
                Rs 0 - Rs {filters.salaryRange}L
              </div>
            </div>
            {/* Job Type */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col">
              <div className="mb-2 text-sm font-medium text-gray-700">
                Job Type
              </div>
              <div className="flex flex-wrap gap-2">
                {["Internship", "Full-Time", "Contract"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`px-4 py-1 rounded-full border text-xs font-medium transition-colors ${
                      filters.jobTypes.includes(type)
                        ? "bg-[#1890FF] text-white border-[#1890FF]"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                    onClick={() => handleToggleSelection("jobTypes", type)}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            {/* Department */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col">
              <div className="mb-2 text-sm font-medium text-gray-700">
                Department
              </div>
              <div className="relative mb-2">
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
                  placeholder="Add Department"
                  className="w-full py-2 pl-4 pr-10 text-sm bg-[#f8f9fb] outline-none rounded-lg border border-gray-200 placeholder:text-gray-500"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#1890FF] w-4 h-4" />
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.specializations.map((dep, idx) => (
                  <button
                    key={dep}
                    type="button"
                    className={`px-4 py-1 rounded-full border text-xs font-medium transition-colors bg-[#E6F4FF] text-[#1890FF] border-[#1890FF]`}
                    onClick={() =>
                      handleToggleSelection("specializations", dep)
                    }
                  >
                    {dep} <span className="ml-1">&times;</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Skills */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col">
              <div className="mb-2 text-sm font-medium text-gray-700">
                Skills
              </div>
              <div className="relative mb-2">
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
                  placeholder="Add Skill"
                  className="w-full py-2 pl-4 pr-10 text-sm bg-[#f8f9fb] outline-none rounded-lg border border-gray-200 placeholder:text-gray-500"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#1890FF] w-4 h-4" />
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.skills.map((skill, idx) => (
                  <button
                    key={skill}
                    type="button"
                    className={`px-4 py-1 rounded-full border text-xs font-medium transition-colors bg-[#E6F4FF] text-[#1890FF] border-[#1890FF]`}
                    onClick={() => handleToggleSelection("skills", skill)}
                  >
                    {skill} <span className="ml-1">&times;</span>
                  </button>
                ))}
              </div>
            </div>
            {/* Languages */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col">
              <div className="mb-2 text-sm font-medium text-gray-700">
                Languages
              </div>
              <div className="relative mb-2">
                <input
                  type="text"
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag("languages", setNewLanguage, newLanguage);
                    }
                  }}
                  placeholder="Add Language"
                  className="w-full py-2 pl-4 pr-10 text-sm bg-[#f8f9fb] outline-none rounded-lg border border-gray-200 placeholder:text-gray-500"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#1890FF] w-4 h-4" />
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.languages.map((lang, idx) => (
                  <button
                    key={lang}
                    type="button"
                    className={`px-4 py-1 rounded-full border text-xs font-medium transition-colors bg-[#E6F4FF] text-[#1890FF] border-[#1890FF]`}
                    onClick={() => handleToggleSelection("languages", lang)}
                  >
                    {lang} <span className="ml-1">&times;</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 font-medium hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-8 py-2 rounded-lg bg-[#1890FF] text-white font-semibold hover:bg-blue-700 transition-colors shadow-sm"
            >
              Apply Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TagInput = ({
  title,
  field,
  tags,
  newTag,
  setNewTag,
  toggle,
  addTag,
}) => (
  <div>
    <h3 className="text-sm font-medium mb-2">{title}</h3>
    <div className="relative mb-3">
      <input
        type="text"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            addTag(field, setNewTag, newTag);
          }
        }}
        placeholder={`Add ${title.toLowerCase()}`}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
      />
      <Search className="absolute right-3 top-2.5 text-[#1890FF] w-5 h-5" />
    </div>
    <div className="flex flex-wrap gap-2 mb-2">
      {tags.map((tag) => (
        <button
          key={tag}
          onClick={() => toggle(field, tag)}
          className={`px-3 py-1 rounded-full text-sm ${
            tags.includes(tag)
              ? "bg-[#1890FF] text-white"
              : "bg-[#E6F4FF] text-[#1890FF]"
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  </div>
);

export default FilterModal;
