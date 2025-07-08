import { useState } from "react";
import { ArrowLeft, Link as LinkIcon, Users } from "lucide-react";

const NewGroupModal = ({
  isOpen,
  onClose,
  onCreate,
  groupName = "",
  setGroupName = () => {}, // Default empty function
  description = "",
  setDescription = () => {}, // Default empty function
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCreate = () => {
    // Ensure groupName exists and isn't just whitespace
    if (!groupName?.trim()) return;

    const newGroup = {
      id: `group-${Date.now()}`,
      name: groupName.trim(),
      description: (description || "").trim(), // Safe trim
      lastMessage: "Group created",
      time: "Just now",
      image: "/group-default.png",
      isGroup: true,
      members: [],
    };

    onCreate(newGroup);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-4 flex items-center gap-4">
          <button
            onClick={onClose}
            className="hover:bg-gray-100 p-1 rounded-full"
          >
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-semibold">New Group</h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Group Icon */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <LinkIcon className="text-blue-500" size={24} />
            </div>
            <span className="text-gray-500">
              Add Group Icon <span className="text-gray-400">(Optional)</span>
            </span>
          </div>

          {/* Group Name */}
          <div className="space-y-2">
            <label className="block font-medium">Group Name</label>
            <input
              type="text"
              placeholder="Group name"
              value={groupName}
              onChange={(e) => {
                console.log("Updating Group Name:", e.target.value); // ✅ Debug log
                setGroupName(e.target.value);
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>

          {/* Group Description */}
          <div className="space-y-2">
            <label className="block font-medium">Group Description</label>
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => {
                console.log("Updating Description:", e.target.value); // ✅ Debug log
                setDescription(e.target.value);
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 h-32 resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!groupName?.trim()} // Safe check
            className={`flex-1 px-4 py-2 rounded-lg ${
              groupName?.trim()
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewGroupModal;
