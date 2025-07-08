import { useState, useEffect, memo } from "react";
import { ArrowLeft } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const WorkExperienceForm = ({ experience, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    institution: "",
    type: "",
    location: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    description: "",
    tags: [],
  });
  const [errors, setErrors] = useState({});
  const [tagInput, setTagInput] = useState(""); // State for temporary tag input

  useEffect(() => {
    console.log("WorkExperienceForm: Received experience prop:", experience);
    if (experience) {
      setFormData({
        title: experience.title || "",
        institution: experience.institution || "",
        type: experience.type || "",
        location: experience.location || "",
        startDate: experience.startDate || "",
        endDate: experience.currentlyWorking ? "" : experience.endDate || "",
        currentlyWorking: experience.currentlyWorking || false,
        description: experience.description || "",
        tags: experience.tags || [],
      });
    } else {
      setFormData({
        title: "",
        institution: "",
        type: "",
        location: "",
        startDate: "",
        endDate: "",
        currentlyWorking: false,
        description: "",
        tags: [],
      });
    }
    setErrors({});
    setTagInput("");
  }, [experience]);

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link"],
      ["clean"],
    ],
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title) newErrors.title = "Job title is required.";
    if (!formData.institution)
      newErrors.institution = "Hospital/clinic is required.";
    if (!formData.startDate) newErrors.startDate = "Start date is required.";
    if (
      formData.endDate &&
      !formData.currentlyWorking &&
      new Date(formData.endDate) < new Date(formData.startDate)
    ) {
      newErrors.endDate = "End date must be after start date.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(
      `WorkExperienceForm: Handling change for ${name}:`,
      value || checked
    );
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "currentlyWorking" && checked ? { endDate: "" } : {}),
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleTagInputChange = (e) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
        }));
        setTagInput("");
        console.log("WorkExperienceForm: Added tag:", newTag);
      }
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
    console.log("WorkExperienceForm: Removed tag:", tagToRemove);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("WorkExperienceForm: Submitting formData:", formData);

    if (!validateForm()) {
      console.log("WorkExperienceForm: Validation failed, errors:", errors);
      return;
    }

    const experienceData = {
      ...(experience ? { id: experience.id } : { id: Date.now() }),
      title: formData.title,
      institution: formData.institution,
      type: formData.type,
      location: formData.location,
      startDate: formData.startDate,
      endDate: formData.currentlyWorking ? "" : formData.endDate,
      currentlyWorking: formData.currentlyWorking,
      description: formData.description,
      tags: formData.tags,
    };

    console.log(
      "WorkExperienceForm: Sending experienceData to onSave:",
      experienceData
    );
    onSave(experienceData);
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="w-1/2">
            <label
              className="block font-medium text-gray-700 mb-1 text-[15px]"
              htmlFor="title"
            >
              Job Title*
            </label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              type="text"
              required
              aria-required="true"
              className={`w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500 ${
                errors.title ? "border-red-500" : ""
              }`}
              placeholder="Enter job title"
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>
          <div className="w-1/2">
            <label
              className="block font-medium text-gray-700 mb-1 text-[15px]"
              htmlFor="institution"
            >
              Hospital/Clinic*
            </label>
            <input
              id="institution"
              name="institution"
              value={formData.institution}
              onChange={handleChange}
              type="text"
              required
              aria-required="true"
              className={`w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500 ${
                errors.institution ? "border-red-500" : ""
              }`}
              placeholder="Enter hospital/clinic"
            />
            {errors.institution && (
              <p className="text-red-500 text-xs mt-1">{errors.institution}</p>
            )}
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-1/2">
            <label
              className="block font-medium text-gray-700 mb-1 text-[15px]"
              htmlFor="type"
            >
              Employment Type
            </label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select</option>
              <option value="Full-Time">Full-Time</option>
              <option value="Part-Time">Part-Time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>
          <div className="w-1/2">
            <label
              className="block font-medium text-gray-700 mb-1 text-[15px]"
              htmlFor="location"
            >
              Location
            </label>
            <input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              type="text"
              className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500"
              placeholder="Enter location"
            />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="w-1/2">
            <label
              className="block font-medium text-gray-700 mb-1 text-[15px]"
              htmlFor="startDate"
            >
              Start Date*
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleChange}
              required
              aria-required="true"
              className={`w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500 ${
                errors.startDate ? "border-red-500" : ""
              }`}
            />
            {errors.startDate && (
              <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
            )}
          </div>
          {!formData.currentlyWorking && (
            <div className="w-1/2">
              <label
                className="block font-medium text-gray-700 mb-1 text-[15px]"
                htmlFor="endDate"
              >
                End Date
              </label>
              <input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                disabled={formData.currentlyWorking}
                className={`w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500 ${
                  errors.endDate ? "border-red-500" : ""
                }`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            name="currentlyWorking"
            id="currentlyWorking"
            checked={formData.currentlyWorking}
            onChange={handleChange}
            className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          <label htmlFor="currentlyWorking" className="text-sm text-gray-700">
            I currently work here
          </label>
        </div>
        <div>
          <label
            className="block font-medium text-gray-700 mb-1 text-[15px]"
            htmlFor="description"
          >
            Job Description
          </label>
          <ReactQuill
            id="description"
            value={formData.description}
            onChange={(value) =>
              setFormData({ ...formData, description: value })
            }
            modules={modules}
            className="h-48 mb-12"
            aria-label="Job description"
          />
        </div>
        <div>
          <label
            className="block font-medium text-gray-700 mb-1 text-[15px]"
            htmlFor="tagInput"
          >
            Skills/Tags (press Enter to add)
          </label>
          <input
            id="tagInput"
            name="tagInput"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleTagInputKeyDown}
            type="text"
            className={`w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500`}
            placeholder="Enter skill and press Enter"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag, index) => (
              <div
                key={index}
                className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="h-[44px] rounded-lg text-[15px] px-6 text-gray-700 bg-gray-100 hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="h-[44px] rounded-lg text-[15px] px-6 text-white bg-blue-500 hover:bg-blue-600"
        >
          {experience ? "Save Changes" : "Add Experience"}
        </button>
      </div>
    </form>
  );
};

export default memo(WorkExperienceForm);
