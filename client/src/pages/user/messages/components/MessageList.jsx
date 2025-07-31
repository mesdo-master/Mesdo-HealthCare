import UserListItem from "../components/UserListItem";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import CreateGroupModal from "./CreateGroupModal";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../../context/NotificationContextFinal";
import axiosInstance from "../../../../lib/axio";

const MessageList = ({
  users, // <------ AllConversations
  selectedId, // <------ Selected conversation ID
  setSelectedId,
  activeTab,
  setActiveTab,
  onCreateGroup,
  loading,
  error,
}) => {
  console.log("MessageList - users:", users);
  console.log("MessageList - activeTab:", activeTab);

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const navigate = useNavigate();
  const { unreadConversations } = useNotifications();

  // ✅ ENHANCED filtering and sorting logic - prioritize unread and recent messages
  const filteredConversations = Array.isArray(users)
    ? users
        .filter((conv) => {
          if (activeTab === "Jobs") {
            return conv.category === "Recruitment" || conv.category === "Jobs";
          }
          return conv.category === activeTab;
        })
        .sort((a, b) => {
          // First priority: Unread conversations come first
          const aIsUnread = unreadConversations.has(a._id);
          const bIsUnread = unreadConversations.has(b._id);
          
          if (aIsUnread && !bIsUnread) return -1;
          if (!aIsUnread && bIsUnread) return 1;
          
          // Second priority: Sort by last message time (most recent first)
          const aTime = new Date(a.lastMessageAt || a.updatedAt || a.createdAt || 0);
          const bTime = new Date(b.lastMessageAt || b.updatedAt || b.createdAt || 0);
          
          return bTime - aTime; // Most recent first
        })
    : [];

  console.log("🔍 MESSAGE LIST DEBUG:", {
    totalUsers: users?.length,
    filteredCount: filteredConversations?.length,
    unreadConversations: Array.from(unreadConversations),
    activeTab,
    firstFewConversations: filteredConversations?.slice(0, 3).map(conv => ({
      id: conv._id,
      category: conv.category,
      isUnread: unreadConversations.has(conv._id),
      lastMessageAt: conv.lastMessageAt,
      updatedAt: conv.updatedAt,
      createdAt: conv.createdAt,
      lastMessage: conv.lastMessage?.text || 'No message',
      lastMessageSender: conv.lastMessage?.sender || 'Unknown'
    }))
  });

  // Additional debugging for sorting logic
  console.log("🔍 MESSAGE LIST SORT DEBUG:", {
    beforeSort: users?.slice(0, 3).map(conv => ({
      id: conv._id,
      isUnread: unreadConversations.has(conv._id),
      lastMessageAt: conv.lastMessageAt,
      updatedAt: conv.updatedAt
    })),
    afterSort: filteredConversations?.slice(0, 3).map(conv => ({
      id: conv._id,
      isUnread: unreadConversations.has(conv._id),
      lastMessageAt: conv.lastMessageAt,
      updatedAt: conv.updatedAt
    })),
    unreadConversationsSize: unreadConversations.size
  });

  const handleOpenMessage = (conversation) => {
    navigate(`/messages/${conversation._id}`);
  };

  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        const response = await axiosInstance.get("/users/getConnections");
        setConnections(response.data.connections || []);
      } catch (error) {
        console.error("Error fetching connections:", error);
        setConnections([]);
      }
    };

    fetchConnections();
  }, []);

  return (
    <div className="w-[340px] bg-white/90 border-r border-gray-100 flex flex-col rounded-l-2xl shadow-lg h-full">
      <div className="p-4 border-b border-gray-100">
        <h1 className="text-xl font-semibold mb-4">Messages</h1>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 border border-gray-200"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-1 mb-4">
          <div className="flex">
            {["Personal", "Groups", "Jobs"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white text-blue-500 shadow"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading conversations...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500 text-center">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Retry
              </button>
            </div>
          </div>
        ) : activeTab === "Groups" && filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="mb-2">No groups yet</p>
            <button
              onClick={() => setShowCreateGroupModal(true)}
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
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-5xl mb-3">💬</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              No {activeTab.toLowerCase()} conversations
            </h2>
            <p className="text-gray-500 text-center max-w-xs text-sm">
              {activeTab === "Jobs"
                ? "No job-related conversations yet. Apply to jobs to start chatting with recruiters!"
                : `No ${activeTab.toLowerCase()} messages yet. Start a conversation to get started!`}
            </p>
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
