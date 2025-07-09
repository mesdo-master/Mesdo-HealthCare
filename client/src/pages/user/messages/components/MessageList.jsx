import UserListItem from "../components/UserListItem";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import CreateGroupModal from "./CreateGroupModal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../lib/axio";

const MessageList = ({
  users, // <------ AllConversations
  selectedId, // <------ Selected conversation ID
  setSelectedId,
  activeTab,
  setActiveTab,
  onCreateGroup,
}) => {
  // console.log(users)

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const navigate = useNavigate();
  const filteredConversations = users.filter((conv) => {
    if (activeTab === "Jobs") return conv.category === "Recruitment";
    return conv.category === activeTab;
  });

  const handleOpenMessage = (conversation) => {
    navigate(`/messages/${conversation._id}`);
  };

  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await axiosInstance.get("/users/getConnections");
        setConnections(response.data.connections);
      } catch (error) {
        console.error("Error fetching connections:", error);
      }
    };

    fetchConnections();
  }, []);

  return (
    <div className="w-[360px] bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold mb-4">Messages</h1>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1890FF] w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none"
            />
          </div>

          <button
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            onClick={() => setShowCreateGroupModal(true)}
            aria-label="Create new chat or group"
          >
            <img
              src="https://res.cloudinary.com/dy9voteoc/image/upload/v1743997226/CreateMessage_vz54wg.png"
              alt="Create"
              className="w-5 h-5"
            />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-1 mb-4">
          <div className="flex">
            {["Personal", "Jobs", "Groups"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white text-blue-500 shadow-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "Groups" && filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="mb-2">No groups yet</p>
            <button
              onClick={() => setShowCreateGroupModal(true)} // Open modal instead of calling onCreateGroup
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Create new group"
            >
              <img
                src="https://res.cloudinary.com/dy9voteoc/image/upload/v1743997226/CreateMessage_vz54wg.png"
                alt="Create group"
                className="w-5 h-5"
              />
            </button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No {activeTab.toLowerCase()} messages
          </div>
        ) : (
          filteredConversations.map((conv) => {
            return (
              <UserListItem
                key={conv._id}
                user={conv}
                selectedId={selectedId}
                onClick={() => handleOpenMessage(conv)}
                isGroup={conv.category === "Groups"}
              />
            );
          })
        )}
      </div>

      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        users={connections}
        onCreateGroup={onCreateGroup}
      />
    </div>
  );
};

export default MessageList;
