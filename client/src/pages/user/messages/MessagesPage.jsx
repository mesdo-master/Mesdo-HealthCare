import { useEffect, useState } from "react";
import MessageList from "./components/MessageList";
import NoChatSelected from "./components/NoChatSelected";
import ChatContainer from "./components/ChatContainer";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../lib/axio";

function Messages() {
  const { conversationId } = useParams();
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

  const [fetchConvo, setFetchConvo] = useState(true); // Initialize state

  const toggleFetch = () => {
    setFetchConvo(!fetchConvo); // Update the state using the setter function
  };

  // ✅ Fetch all conversations on load
  useEffect(() => {
    if (activeTab === "Jobs") {
      const fetchJobsConversations = async () => {
        try {
          setLoadingConversations(true);
          const res = await axiosInstance.get("chats/getjobsConversations");
          console.log(res);
          setAllConversations(res.data);
          setFetchError(null);
        } catch (err) {
          console.error("Error fetching conversations:", err);
          setFetchError("Failed to load conversations.");
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
          setAllConversations(res.data);
          setFetchError(null);
        } catch (err) {
          console.error("Error fetching conversations:", err);
          setFetchError("Failed to load conversations.");
        } finally {
          setLoadingConversations(false);
        }
      };

      fetchConversations();
    }
  }, [conversationId, activeTab]);

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
    console.log("New group created:", newGroup); // Debug log

    try {
      // Add the new group to conversations list immediately
      setAllConversations((prevConversations) => [
        ...prevConversations,
        newGroup,
      ]);

      // Switch to Groups tab to show the new group
      setActiveTab("Groups");

      // Close the modal
      setShowGroupModal(false);

      // Clear form states
      setGroupName("");
      setGroupDescription("");

      // Navigate to the new group
      setSelectedConversation(newGroup._id);

      // Refresh conversations from server to ensure consistency
      setTimeout(async () => {
        try {
          const res = await axiosInstance.get("chats/allConversations");
          setAllConversations(res.data);
        } catch (error) {
          console.error("Error refreshing conversations:", error);
        }
      }, 1000);
    } catch (error) {
      console.error("Error handling group creation:", error);
    }
  };

  // Add this before return
  const selectedConversationObj = allConversations.find(
    (c) => c._id === selectedConversation
  );

  console.log(selectedConversationObj);

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
            onCreateGroup={handleCreateGroup} // Pass the actual function instead of just opening modal
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
