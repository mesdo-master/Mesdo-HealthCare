import { useEffect, useState } from "react";
import MessageList from "./components/MessageList";
import NoChatSelected from "./components/NoChatSelected";
import ChatContainer from "./components/ChatContainer";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../lib/axio";
import { useSocket } from "../../../context/SocketProvider";

function Messages() {
  const { conversationId } = useParams();
  const socket = useSocket();
  const [selectedConversation, setSelectedConversation] =
    useState(conversationId);

  useEffect(() => {
    setSelectedConversation(conversationId);
  }, [conversationId]);

  const [activeTab, setActiveTab] = useState("Personal");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [groups, setGroups] = useState([]);
  const [showGroupProfileModal, setShowGroupProfileModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);

  const [allConversations, setAllConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const [fetchConvo, setFetchConvo] = useState(true);

  const toggleFetch = () => {
    setFetchConvo(!fetchConvo);
  };

  // ✅ Fetch all conversations on load
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoadingConversations(true);
        setFetchError(null);

        let endpoint;
        if (activeTab === "Jobs") {
          endpoint = "/chats/getjobsConversations";
        } else {
          endpoint = "/chats/allConversations";
        }

        console.log(`Fetching conversations from: ${endpoint}`);
        const res = await axiosInstance.get(endpoint);
        console.log(`${activeTab} conversations response:`, res.data);

        // ✅ Handle different response structures
        let conversations = [];
        if (res.data.success && res.data.conversations) {
          conversations = res.data.conversations;
        } else if (Array.isArray(res.data)) {
          conversations = res.data;
        } else if (res.data.conversations) {
          conversations = res.data.conversations;
        } else {
          conversations = [];
        }

        console.log(`Processed ${activeTab} conversations:`, conversations);
        setAllConversations(conversations);
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setFetchError("Failed to load conversations.");
        setAllConversations([]);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [activeTab, fetchConvo]); // ✅ Added fetchConvo dependency

  // ✅ Socket integration for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (messageData) => {
      console.log("New message received:", messageData);

      // Refresh conversations list to update last message
      const refreshConversations = async () => {
        try {
          let endpoint;
          if (activeTab === "Jobs") {
            endpoint = "/chats/getjobsConversations";
          } else {
            endpoint = "/chats/allConversations";
          }

          const res = await axiosInstance.get(endpoint);
          let conversations = [];
          if (res.data.success && res.data.conversations) {
            conversations = res.data.conversations;
          } else if (Array.isArray(res.data)) {
            conversations = res.data;
          } else if (res.data.conversations) {
            conversations = res.data.conversations;
          }

          setAllConversations(conversations);
        } catch (err) {
          console.error("Error refreshing conversations:", err);
        }
      };

      refreshConversations();
    };

    const handleConversationUpdate = (conversationData) => {
      console.log("Conversation updated:", conversationData);

      // Update the specific conversation in the list
      setAllConversations((prev) => {
        const updated = prev.map((conv) =>
          conv.id === conversationData.id || conv._id === conversationData.id
            ? { ...conv, ...conversationData }
            : conv
        );
        return updated;
      });
    };

    // Listen for socket events
    socket.on("newMessage", handleNewMessage);
    socket.on("conversationUpdate", handleConversationUpdate);

    // Cleanup
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("conversationUpdate", handleConversationUpdate);
    };
  }, [socket, activeTab]);

  const handleProfileClick = (user) => {
    if (user.isGroup) {
      setSelectedGroup(user);
      setShowGroupProfileModal(true);
    } else {
      setProfileUser(user);
      setShowProfileModal(true);
    }
  };

  const handleCreateGroup = async (newGroup) => {
    console.log("New group created:", newGroup);

    try {
      // Add the new group to conversations list immediately
      const groupData = newGroup.conversation || newGroup;
      setAllConversations((prevConversations) => [
        groupData,
        ...prevConversations,
      ]);

      // Refresh conversations after a short delay
      setTimeout(async () => {
        try {
          const res = await axiosInstance.get("/chats/allConversations");
          let conversations = [];
          if (res.data.success && res.data.conversations) {
            conversations = res.data.conversations;
          } else if (Array.isArray(res.data)) {
            conversations = res.data;
          } else if (res.data.conversations) {
            conversations = res.data.conversations;
          }
          setAllConversations(conversations);
        } catch (error) {
          console.error("Error refreshing conversations:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("Error handling group creation:", error);
    }
  };

  // ✅ Safe conversation lookup with array check
  const selectedConversationObj = Array.isArray(allConversations)
    ? allConversations.find(
        (c) => c._id === selectedConversation || c.id === selectedConversation
      )
    : null;

  console.log("Selected conversation object:", selectedConversationObj);
  console.log("All conversations:", allConversations);
  console.log("Active tab:", activeTab);
  console.log("Loading:", loadingConversations);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex flex-1 overflow-hidden pt-16 mb-7 mr-20 ml-18">
        <div className="flex flex-1 ml-[100px] mt-9 mb-5">
          <MessageList
            users={allConversations}
            selectedId={selectedConversation}
            setSelectedId={setSelectedConversation}
            setSelectedUser={setSelectedUser}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onCreateGroup={handleCreateGroup}
            loading={loadingConversations}
            error={fetchError}
          />

          {!selectedConversation ? (
            <NoChatSelected />
          ) : (
            <ChatContainer
              selectedId={selectedConversation}
              conversation={selectedConversationObj}
              setSelectedId={setSelectedConversation}
              toggleFetch={toggleFetch}
              activeTab={activeTab}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages;
