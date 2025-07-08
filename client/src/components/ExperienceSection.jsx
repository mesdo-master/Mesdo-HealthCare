import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function ExperienceSection({ userData, isOwnProfile, onSave }) {
  const [updatedProfile, setUpdatedProfile] = useState(userData);
  const [updatedExperiences, setUpdatedExperiences] = useState(userData.experience || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    startDate: '',
    current: false,
    endDate: null,
    description: '',
  });

  const onAdd = (newExperience) => {
    const newExperiences = [...updatedExperiences, newExperience];
    setUpdatedExperiences(newExperiences);
    
    const newProfile = {
      ...updatedProfile,
      experience: newExperiences,
    };
    setUpdatedProfile(newProfile);
    onSave(newProfile);
    console.log(userData)
  };
  

  const onUpdate = (updatedExperience) => {
    const newExperiences = updatedExperiences.map((experience) =>
      experience._id === updatedExperience.id ? updatedExperience : experience
    );
    setUpdatedExperiences(newExperiences);
    setUpdatedProfile((prevState) => ({
      ...prevState,
      experience: newExperiences,
    }));
    onSave({ ...updatedProfile, experience: newExperiences });
  };

  const onDelete = (id) => {
    const newExperiences = updatedExperiences.filter((experience) => experience._id !== id);
    setUpdatedExperiences(newExperiences);
    setUpdatedProfile((prevState) => ({
      ...prevState,
      experience: newExperiences,
    }));
    onSave({ ...updatedProfile, experience: newExperiences });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData, id: editingId });
      setEditingId(null);
    } else {
      onAdd(formData); // Temporary ID
      setIsAdding(false);
    }
    setFormData({
      title: '',
      company: '',
      location: '',
      startDate: '',
      current: false,
      endDate: null,
      description: '',
      _id:null
    });
  };

  const handleEdit = (experience) => {
    setEditingId(experience._id);
    setFormData(experience);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Experience</h2>
        {!isAdding && !editingId && isOwnProfile && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Experience</span>
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="p-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              className="p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <input
            type="text"
            placeholder="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="p-2 border border-gray-300 rounded-md"
              required
            />
            <div className="flex items-center space-x-4">
              <input
                type="date"
                value={formData.endDate || ''}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="p-2 border border-gray-300 rounded-md flex-1"
                disabled={formData.current}
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.current}
                  onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                  className="rounded text-blue-600"
                />
                <span>Current</span>
              </label>
            </div>
          </div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md h-32"
            required
          />
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingId ? 'Update' : 'Add'} Experience
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6">
        {Array.isArray(updatedExperiences) && updatedExperiences.map((experience,index) => (
          <div
            key={experience._id || index}
            className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{experience.title}</h3>
                <p className="text-gray-600">{experience.company}</p>
                <p className="text-gray-500">
                  {experience.startDate} - {experience.current ? 'Present' : experience.endDate}
                </p>
                <p className="text-gray-500">{experience.location}</p>
                <p className="mt-2 text-gray-600">{experience.description}</p>
              </div>
              {isOwnProfile && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(experience)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(experience._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
