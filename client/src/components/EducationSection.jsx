import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function EducationSection() {
  
  const education = [ // dummy data
    {
      id: '1',
      school: 'University of Technology',
      degree: 'Bachelor of Science',
      field: 'Computer Science',
      startDate: '2012',
      endDate: '2016',
      description: 'Focus on software engineering and distributed systems.',
    },
  ]
  
  const onAdd = () => {} // pass through props
  const onUpdate = () => {}// pass through props
  const onDelete = () => {}// pass through props
  
    const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    school: '',
    degree: '',
    field: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ ...formData, id: editingId });
      setEditingId(null);
    } else {
      onAdd({ ...formData, id: Date.now().toString() });
      setIsAdding(false);
    }
    setFormData({
      id: '',
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: '',
    });
  };

  const handleEdit = (edu) => {
    setEditingId(edu.id);
    setFormData(edu);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Education</h2>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Education</span>
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="School"
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Degree"
              value={formData.degree}
              onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              className="p-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="text"
              placeholder="Field of Study"
              value={formData.field}
              onChange={(e) => setFormData({ ...formData, field: e.target.value })}
              className="p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="p-2 border border-gray-300 rounded-md"
              required
            />
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <textarea
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md h-32"
          />
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingId ? 'Update' : 'Add'} Education
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
        {education.map((edu) => (
          <div
            key={edu.id}
            className="border-b border-gray-200 last:border-0 pb-6 last:pb-0"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{edu.school}</h3>
                <p className="text-gray-600">
                  {edu.degree} in {edu.field}
                </p>
                <p className="text-gray-500">
                  {edu.startDate} - {edu.endDate}
                </p>
                <p className="mt-2 text-gray-600">{edu.description}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(edu)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(edu.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
