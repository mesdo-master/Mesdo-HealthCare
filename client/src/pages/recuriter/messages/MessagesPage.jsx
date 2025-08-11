import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
} from "lucide-react";
import axiosInstance from "../../../lib/axio";
import MessageList from "./components/MessageList";
import ChatContainer from "./components/ChatContainer";
import MessageInput from "./components/MessageInput";
import Loader from "../../../components/Loader";
import NoChatSelected from "../../user/messages/components/NoChatSelected";
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

  // ✅ Add window size tracking for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    setSelectedConversation(conversationId);
    // Mark conversation as read when opened
    if (conversationId) {
      markConversationAsRead(conversationId);
    }
  }, [conversationId, markConversationAsRead]);

  // ✅ Track window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // ✅ Consistent left spacing, adaptive message section width
  const getResponsiveLayout = () => {
    if (windowWidth <= 1599) {
      // Small/normal screens - smaller MessageList, consistent left spacing
      return {
        marginLeft: "100px", // Fixed left spacing - same on all screens
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        messageListWidth: "300px", // Smaller MessageList on small screens
      };
    } else if (windowWidth <= 1920) {
      // Medium screens - slightly bigger MessageList
      return {
        marginLeft: "50px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        messageListWidth: "320px", // Slightly bigger
      };
    } else {
      // Large screens - normal MessageList size
      return {
        marginLeft: "50px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        messageListWidth: "350px", // Normal size on big screens
      };
    }
  };

  const layout = getResponsiveLayout();

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
    <div className="flex flex-col h-screen">
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
        <div className="flex justify-center items-center h-64">
          <Loader />
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden pt-[48px]">
          <div
            className="flex flex-1 overflow-y-auto"
            style={{
              marginLeft: layout.marginLeft,
              paddingLeft: layout.paddingLeft,
              paddingRight: layout.paddingRight,
            }}
          >
            <div className="mx-auto w-full max-w-[80rem]">
              <div className="bg-[#E4E5E8] rounded-lg w-full">
                <div
                  className="flex bg-[#F5F7FA]"
                  style={{
                    height: "calc(100vh - 100px)",
                    gap: layout.gap,
                    padding: layout.padding,
                  }}
                >
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesRecuriter;
