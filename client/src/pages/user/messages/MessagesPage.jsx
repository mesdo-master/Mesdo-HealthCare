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
    if (activeTab === "Jobs") {
      const fetchJobsConversations = async () => {
        try {
          setLoadingConversations(true);
          const res = await axiosInstance.get("chats/getjobsConversations");
          console.log("Jobs conversations response:", res.data);

          // ✅ Fix: Extract conversations array from response
          const conversations = res.data.conversations || res.data || [];
          setAllConversations(conversations);
          setFetchError(null);
        } catch (err) {
          console.error("Error fetching conversations:", err);
          setFetchError("Failed to load conversations.");
          setAllConversations([]); // ✅ Set empty array on error
        } finally {
          setLoadingConversations(false);
        }
      };

      fetchJobsConversations();
    } else {
      const fetchConversations = async () => {
        try {
          setLoadingConversations(true);
          const res = await axiosInstance.get("chats/allConversations");
          console.log("All conversations response:", res.data);

          // ✅ Fix: Extract conversations array from response
          const conversations = res.data.conversations || res.data || [];
          setAllConversations(conversations);
          setFetchError(null);
        } catch (err) {
          console.error("Error fetching conversations:", err);
          setFetchError("Failed to load conversations.");
          setAllConversations([]); // ✅ Set empty array on error
        } finally {
          setLoadingConversations(false);
        }
      };

      fetchConversations();
    }
  }, [conversationId, activeTab]);

  // ✅ Socket integration for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (messageData) => {
      console.log("New message received:", messageData);

      // Refresh conversations list to update last message
      const refreshConversations = async () => {
        try {
          const endpoint =
            activeTab === "Jobs"
              ? "chats/getjobsConversations"
              : "chats/allConversations";
          const res = await axiosInstance.get(endpoint);
          const conversations = res.data.conversations || res.data || [];
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
          const res = await axiosInstance.get("chats/allConversations");
          const conversations = res.data.conversations || res.data || [];
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
