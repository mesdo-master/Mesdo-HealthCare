import { useState } from "react";
import { Search, UserPlus, X } from "lucide-react";
import GroupDetails from "./GroupDetails";

const mockMembers = [
  {
    id: "1",
    name: "Dr. Rajeev Bhatt",
    role: "Dental Surgeon",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop",
  },
  {
    id: "2",
    name: "Dr. Rajeev Bhatt",
    role: "Dental Surgeon",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop",
  },
  {
    id: "3",
    name: "Dr. Rajeev Bhatt",
    role: "Dental Surgeon",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop",
  },
  {
    id: "4",
    name: "Dr. Rajeev Bhatt",
    role: "Dental Surgeon",
    avatar:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop",
  },
];

const AddGroupModal = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState(mockMembers);
  const selectedCount = members.filter((m) => m.selected).length;

  if (!isOpen) return null;

  const toggleMemberSelection = (id) => {
    setMembers(
      members.map((member) =>
        member.id === id ? { ...member, selected: !member.selected } : member
      )
    );
  };

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] flex shadow-lg overflow-hidden">
        <GroupDetails />

        <div className="flex-1 flex flex-col">
          <div className="flex justify-between items-center p-6">
            <h2 className="text-xl font-semibold text-gray-800">Members(40)</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="px-6 mb-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="px-6 mb-4">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-3 flex items-center justify-center gap-2">
              <UserPlus size={20} />
              Add {selectedCount || 2} Members
            </button>
          </div>

          <div className="px-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        {member.name}
                      </h3>
                      <p className="text-gray-500 text-sm">{member.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleMemberSelection(member.id)}
                    className={`w-6 h-6 rounded border ${
                      member.selected
                        ? "bg-blue-500 border-blue-500 text-white"
                        : "border-gray-300"
                    } flex items-center justify-center`}
                  >
                    {member.selected && <span>✓</span>}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddGroupModal;