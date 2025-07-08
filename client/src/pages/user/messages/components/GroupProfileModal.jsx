import React, { useState } from "react";
import {
  Users,
  Link as LinkIcon,
  Trash2,
  X,
  SearchIcon,
  Search,
} from "lucide-react";
import GroupDetails from "./GroupDetails"; // import your GroupDetails component

const GroupProfileModal = ({ isOpen, onClose }) => {
  const [members, setMembers] = useState([
    {
      id: "1",
      name: "Dr. Rajeev Bhatt",
      role: "Dental Surgeon",
      avatar:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop",
      isAdmin: true,
    },
    {
      id: "2",
      name: "Dr. Riya Sharma",
      role: "Cardiologist",
      avatar:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop",
    },
  ]);

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  if (!isOpen) return null;

  const handleAddMember = () => {
    const newMember = {
      id: Date.now().toString(),
      name: "New Member",
      role: "General Physician",
      avatar:
        "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop",
    };
    setMembers([...members, newMember]);
  };

  const handleDeleteMember = (id) => {
    setMembers(members.filter((member) => member.id !== id));
    setSelectedMember(null);
  };

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex shadow-lg overflow-hidden">
        {/* Left Section */}
        <GroupDetails />

        {/* Right Section */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex justify-between items-center px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Members ({members.length})
            </h2>
            <div className="flex items-center gap-4">
              {isDeleteMode ? (
                <button
                  onClick={() => setIsDeleteMode(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              ) : (
                <button
                  onClick={() => setIsDeleteMode(true)}
                  className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                >
                  <Trash2 size={16} /> Remove
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="px-6 pt-4">
            <div className="relative">
              <Search
                className="absolute  left-3 top-1/2 -translate-y-1/2 text-[#1890FF]"
                size={18}
              />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg border-[#E4E5E8] bg-[#FAFAFA] focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 space-y-3">
            <button
              onClick={handleAddMember}
              className="w-full  text-black-600 font-sm rounded-lg py-2 flex items-center gap-3 px-4 font-medium"
            >
              <Users size={18} className="text-[#1890FF]" /> Add Members
            </button>
            <button className="w-full  text-black-600 rounded-lg py-2 flex items-center gap-3 px-4 font-medium">
              <LinkIcon size={18} className="text-[#1890FF]" /> Invite to Group
              via Link
            </button>
          </div>

          {/* Members List */}
          <div className="px-6 flex-1 overflow-y-auto space-y-4 pb-4">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between hover:bg-gray-50 rounded-lg px-2 py-2"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-medium text-gray-800">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>

                {isDeleteMode && (
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
                {!isDeleteMode && member.isAdmin && (
                  <span className="text-xs text-gray-500 ml-2">Admin</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg p-6 w-[450px] shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                Remove “{selectedMember.name}” from group?
              </h2>
              <button onClick={() => setSelectedMember(null)}>
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              They will be removed from the group and won’t have access anymore.
            </p>
            <div className="flex justify-start gap-4">
              <button
                onClick={() => handleDeleteMember(selectedMember.id)}
                className="bg-red-500 text-white px-6 py-2 w-1/2 rounded-lg hover:bg-red-600"
              >
                Remove
              </button>
              <button
                onClick={() => setSelectedMember(null)}
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

export default GroupProfileModal;