import React, { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export function SkillsSection() {

    const skills = [ // dummy data
        {
          id: '1',
          name: 'React',
          level: 'Expert',
          endorsements: 25,
        },
        {
          id: '2',
          name: 'Node.js',
          level: 'Advanced',
          endorsements: 18,
        },
      ];

    const onAdd = () => {} // pass through props
    const onUpdate = () => {}// pass through props
    const onDelete = () => {}// pass through props
    
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    level: 'Beginner',
    endorsements: 0,
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
      name: '',
      level: 'Beginner',
      endorsements: 0,
    });
  };

  const handleEdit = (skill) => {
    setEditingId(skill.id);
    setFormData(skill);
  };

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Skills</h2>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Skill</span>
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="Skill Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          />
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-md"
            required
          >
            {skillLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {editingId ? 'Update' : 'Add'} Skill
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skills.map((skill) => (
          <div
            key={skill.id}
            className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
          >
            <div>
              <h3 className="font-semibold">{skill.name}</h3>
              <p className="text-sm text-gray-500">{skill.level}</p>
              <p className="text-sm text-gray-500">
                {skill.endorsements} endorsement{skill.endorsements !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(skill)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(skill.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-full"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
