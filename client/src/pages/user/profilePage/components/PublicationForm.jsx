import React, { useState, useEffect } from "react";
import { PlusIcon, X } from "lucide-react";

const PublicationForm = ({ achievement, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: "",
    issuer: "",
    date: "",
    description: "",
  });

  // Pre-fill data if editing
  useEffect(() => {
    if (achievement) {
      setFormData({
        title: achievement.title || "",
        issuer: achievement.issuer || "",
        date: achievement.date || "",
        description: achievement.description || "",
      });
    }
  }, [achievement]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="flex">
      <div className="w-full flex flex-col p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Title - Full width */}
          <div>
            <label className="block font-medium text-gray-700 mb-1 text-[15px]">
              Title*
            </label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              type="text"
              className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter publication title"
            />
          </div>

          {/* Publisher and Date in same line */}
          <div className="flex gap-6">
            <div className="w-1/2">
              <label className="block font-medium text-gray-700 mb-1 text-[15px]">
                Publisher*
              </label>
              <input
                name="issuer"
                value={formData.issuer}
                onChange={handleChange}
                required
                type="text"
                className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter publisher name"
              />
            </div>
            <div className="w-1/2">
              <label className="block font-medium text-gray-700 mb-1 text-[15px]">
                Date*
              </label>
              <input
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
                className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>

          {/* Description - Full width */}
          <div>
            <label className="block font-medium text-gray-700 mb-1 text-[15px]">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="w-full h-[120px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Enter description"
            />
          </div>

          {/* Buttons */}
          <div className="mt-4 flex justify-between w-full">
            <button
              type="button"
              onClick={onCancel}
              className="w-[100px] h-[44px] bg-[#F0F0F0] text-[#1890FF] text-[15px] rounded-lg hover:bg-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-[100px] h-[44px] bg-blue-500 text-white text-[15px] rounded-lg hover:bg-blue-600 transition"
            >
              {achievement ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublicationForm;
