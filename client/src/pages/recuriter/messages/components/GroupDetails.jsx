import { useState } from "react";
import { Pencil, LogOut, X } from "lucide-react";

const GroupDetails = ({
  initialName = "HealthCare",
  initialDescription = "Hello guys, we have discussed about post-corona vacation plan and our decision is to go to Ba",
  groupImage = "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
  };

  return (
    <div className="w-[320px] p-6 border-r border-gray-200 flex flex-col relative">
      <div className="relative mb-6">
        <img
          src={groupImage}
          alt={name}
          className="w-32 h-32 rounded-full mx-auto object-cover"
        />
        <button className="absolute bottom-0 right-24 bg-white p-2 rounded-full shadow-lg hover:bg-gray-50">
          <Pencil size={16} className="text-gray-600" />
        </button>
      </div>

      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-4">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
            <button
              onClick={handleSave}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
              <button
                onClick={() => setIsEditing(true)}
                className="text-gray-600 hover:text-gray-800 p-1"
              >
                <Pencil size={16} />
              </button>
            </div>
            <p className="text-gray-600 text-sm">{description}</p>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Group Link:</span>
            <a
              href="mailto:yourexample@.com"
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              yourexample@.com
            </a>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-600 text-sm">Members:</span>
            <div className="flex items-center">
              <div className="flex -space-x-2">
                <img
                  src={groupImage}
                  alt="Member"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <img
                  src={groupImage}
                  alt="Member"
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
              </div>
              <span className="ml-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                20+
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowLeaveModal(true)}
          className="mt-6 text-red-500 hover:text-red-600 flex items-center justify-between py-2 w-full px-4"
        >
          <span>Leave Group</span>
          <LogOut size={18} />
        </button>
      </div>

      {/* Leave Group Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg p-6 w-[450px] shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Exit “{name}” group?</h2>
              <button onClick={() => setShowLeaveModal(false)}>
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              You will not be receiving any further messages or information from
              this group anymore.
            </p>
            <div className="flex justify-start gap-4">
              <button className="bg-red-500 text-white px-6 py-2 w-1/2 rounded-lg hover:bg-red-600">
                Exit
              </button>
              <button
                onClick={() => setShowLeaveModal(false)}
                className="border border-gray-300 px-6 py-2 w-1/2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetails;