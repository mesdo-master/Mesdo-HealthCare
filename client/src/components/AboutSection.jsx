import React, { useState } from "react";
import { Pencil } from "lucide-react";

const AboutSection = ({ userData, isOwnProfile, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAbout, setEditedAbout] = useState(userData);

  const handleSave = () => {
    onSave(editedAbout);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">About</h2>
        {!isEditing && isOwnProfile && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <Pencil className="w-5 h-5" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <textarea
            value={editedAbout.about}
            onChange={(e) =>
              setEditedAbout((prevState) => ({
                ...prevState,
                about: e.target.value,
              }))
            }
            className="w-full h-40 p-3 border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none"
            placeholder="Write something about yourself..."
          />
          <div className="flex space-x-4">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-600 whitespace-pre-wrap">{userData.about}</p>
      )}
    </div>
  );
};

export default AboutSection;
