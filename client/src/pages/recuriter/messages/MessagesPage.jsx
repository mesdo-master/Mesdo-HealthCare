import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MessageList from "./components/MessageList";
import NoChatSelected from "../../user/messages/components/NoChatSelected";
import ChatContainer from "./components/ChatContainer";
import axiosInstance from "../../../lib/axio";
import { useSocket } from "../../../context/SocketProvider";
import { useNotifications } from "../../../context/NotificationContextFinal";

function MessagesRecuriter() {
  const { conversationId } = useParams();
  // ✅ Get socket connection status
  const { isConnected, connectionError, reconnect } = useSocket();
  const { markConversationAsRead } = useNotifications();

  console.log(conversationId);
  const [selectedConversation, setSelectedConversation] =
    useState(conversationId);

  useEffect(() => {
    setSelectedConversation(conversationId);
    // Mark conversation as read when opened
    if (conversationId) {
      markConversationAsRead(conversationId);
    }
  }, [conversationId, markConversationAsRead]);

  const [activeTab, setActiveTab] = useState("Recruitment");
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

        const endpoint = "/recuriter/allConversations";
        console.log(`Fetching recruiter conversations from: ${endpoint}`);

        const res = await axiosInstance.get(endpoint);
        console.log("Recruiter conversations response:", res.data);

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

        // ✅ Remove duplicate conversations based on otherParticipant ID
        const uniqueConversations = conversations.reduce((acc, conv) => {
          if (!conv.otherParticipant) return acc;

          const participantId =
            conv.otherParticipant.id || conv.otherParticipant._id;
          const existingIndex = acc.findIndex((existing) => {
            const existingParticipantId =
              existing.otherParticipant?.id || existing.otherParticipant?._id;
            return (
              existingParticipantId === participantId &&
              existing.category === conv.category
            );
          });

          if (existingIndex === -1) {
            // No duplicate found, add the conversation
            acc.push(conv);
          } else {
            // Keep the conversation with the most recent message
            const existing = acc[existingIndex];
            const convTime = new Date(conv.lastMessageTime || 0);
            const existingTime = new Date(existing.lastMessageTime || 0);

            if (convTime > existingTime) {
              acc[existingIndex] = conv;
            }
          }

          return acc;
        }, []);

        console.log("Processed recruiter conversations:", conversations);
        console.log(
          "Unique conversations after deduplication:",
          uniqueConversations
        );
        setAllConversations(uniqueConversations);
      } catch (err) {
        console.error("Error fetching recruiter conversations:", err);
        setFetchError("Failed to load conversations.");
        setAllConversations([]);
      } finally {
        setLoadingConversations(false);
      }
    };

    fetchConversations();
  }, [fetchConvo]); // ✅ Added fetchConvo dependency

  // ✅ Socket integration for real-time updates
  useEffect(() => {
    if (!isConnected) return;

    const handleNewMessage = (messageData) => {
      console.log("New message received:", messageData);

      // Refresh conversations list to update last message
      const refreshConversations = async () => {
        try {
          const res = await axiosInstance.get("/recuriter/allConversations");
          let conversations = [];
          if (res.data.success && res.data.conversations) {
            conversations = res.data.conversations;
          } else if (Array.isArray(res.data)) {
            conversations = res.data;
          } else if (res.data.conversations) {
            conversations = res.data.conversations;
          }

          // ✅ Apply same deduplication logic
          const uniqueConversations = conversations.reduce((acc, conv) => {
            if (!conv.otherParticipant) return acc;

            const participantId =
              conv.otherParticipant.id || conv.otherParticipant._id;
            const existingIndex = acc.findIndex((existing) => {
              const existingParticipantId =
                existing.otherParticipant?.id || existing.otherParticipant?._id;
              return (
                existingParticipantId === participantId &&
                existing.category === conv.category
              );
            });

            if (existingIndex === -1) {
              acc.push(conv);
            } else {
              const existing = acc[existingIndex];
              const convTime = new Date(conv.lastMessageTime || 0);
              const existingTime = new Date(existing.lastMessageTime || 0);

              if (convTime > existingTime) {
                acc[existingIndex] = conv;
              }
            }

            return acc;
          }, []);

          setAllConversations(uniqueConversations);
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

    // Listen for socket events - handled by socket context
  }, [isConnected]);

  const handleProfileClick = (user) => {
    if (user.isGroup) {
      setSelectedGroup(user);
      setShowGroupProfileModal(true);
    } else {
      setProfileUser(user);
      setShowProfileModal(true);
    }
  };

  const handleCreateGroup = (newGroup) => {
    const completeGroup = {
      ...newGroup,
      id: `group-${Date.now()}`,
      lastMessage: "Group created",
      time: "Just now",
      image: "/group-default.png",
      isGroup: true,
      messages: [],
      online: false,
    };

    setGroups([...groups, completeGroup]);
    setActiveTab("Groups");
    setShowGroupModal(false);
    setGroupName("");
    setGroupDescription("");
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
  console.log("Recruiter socket connected:", isConnected);

  return (
    <div className="flex flex-col h-screen ml-[9px]">
      {/* ✅ Connection Status Bar */}
      {!isConnected && (
        <div className="bg-red-500 text-white px-4 py-2 text-sm flex items-center justify-between">
          <span>
            {connectionError
              ? `Connection error: ${connectionError}`
              : "Disconnected from server. Messages may not be delivered in real-time."}
          </span>
          <button
            onClick={reconnect}
            className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs"
          >
            Reconnect
          </button>
        </div>
      )}

      {loadingConversations ? (
        <div className="flex-1 flex items-center justify-center bg-white">
          <div className="flex flex-col items-center bg-white rounded-xl shadow-lg px-8 py-10">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1890FF] rounded-full animate-spin mb-6"></div>
            <div className="text-lg font-semibold text-[#1890FF]">
              Loading your messages...
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Please wait while we fetch your conversations.
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden pt-9 mb-7 mr-20 ml-18">
          <div className="flex flex-1 ml-[100px] mt-1 mb-5">
            <MessageList
              users={allConversations}
              selectedId={selectedConversation}
              setSelectedId={setSelectedConversation}
              setSelectedUser={setSelectedUser}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onCreateGroup={() => {
                setShowGroupModal(true);
                setGroupName("");
                setGroupDescription("");
              }}
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
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesRecuriter;
