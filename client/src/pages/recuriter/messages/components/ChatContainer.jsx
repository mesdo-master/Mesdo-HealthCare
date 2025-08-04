import { useNavigate } from "react-router-dom";
import { useSocket } from "../../../../context/SocketProvider";
import { useNotifications } from "../../../../context/NotificationContextFinal";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../../lib/axio";
import { getMessageDateLabel } from "../../../../lib/utils";
import MessageSkeleton from "../../../user/messages/MessageSkeleton";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";
import {
  MoreVertical,
  CornerUpLeft,
  Copy,
  Pin,
  Trash2,
  Pencil,
} from "lucide-react";

const ChatContainer = ({ selectedId, toggleFetch, conversation }) => {
  const navigate = useNavigate();

  // ✅ Use socket utilities from context
  const { joinConversation, leaveConversation, on, off, isConnected } =
    useSocket();
  const { markConversationAsRead } = useNotifications();

  const piimage =
    "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif";

  const [messages, setMessages] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const messageEndRef = useRef(null);
  const { currentUser, businessProfile } = useSelector((state) => state.auth);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [pinnedConversations, setPinnedConversations] = useState(new Set());
  const [mutedConversations, setMutedConversations] = useState(new Set());

  // Debug business profile
  const authState = useSelector((state) => state.auth);
  console.log("🏢 RECRUITER CHATCONTAINER: BusinessProfile debug:", {
    businessProfile,
    businessProfileId: businessProfile?._id,
    businessProfileIdType: typeof businessProfile?._id,
    hasBusinessProfile: !!businessProfile,
    currentUser,
    currentUserId: currentUser?._id,
    authStateKeys: Object.keys(authState),
    fullAuthState: authState,
  });

  const emptyMessagesText = [
    "No messages yet. Looks like a clean slate 🧼",
    "Still waiting for the first word... 🐣",
    "Nobody's home... yet! 👻",
    "Start the conversation before it becomes a staring contest 👀",
    "This space is emptier than your fridge at midnight 🍽️",
  ];

  const getRandomEmptyText = () =>
    emptyMessagesText[Math.floor(Math.random() * emptyMessagesText.length)];

  // ✅ Fetch messages when selectedId changes
  useEffect(() => {
    // ✅ Validate selectedId before making API calls
    if (!selectedId || selectedId === "undefined") {
      console.log("No valid selectedId, skipping message fetch");
      setMessages([]);
      setOtherUsers([]);
      return;
    }

    const getMessages = async () => {
      setIsMessageLoading(true);
      try {
        const response = await axiosInstance.get(
          `/recuriter/getMessages/${selectedId}`,
          {
            params: { orgId: businessProfile._id },
          }
        );
        console.log("Recruiter messages response:", response.data);
        console.log("🔍 RECRUITER API DEBUG: Detailed response analysis:", {
          selectedId,
          orgId: businessProfile._id,
          responseData: response.data,
          otherUser: response.data.otherUser,
          conversation: response.data.conversation,
        });

        const { messages, otherUser } = response.data;
        setMessages(messages || []);
        console.log(
          "📝 RECRUITER: Setting otherUsers from API response:",
          otherUser
        );
        setOtherUsers(
          Array.isArray(otherUser) ? otherUser : [otherUser].filter(Boolean)
        );
      } catch (error) {
        console.error("Error fetching recruiter messages:", error);
        setMessages([]);
        setOtherUsers([]);

        if (error.response?.status === 403) {
          navigate("/messages", { replace: true });
        }
      } finally {
        setIsMessageLoading(false);
      }
    };

    getMessages();
  }, [selectedId, businessProfile._id, navigate]);

  // ✅ Mark conversation as read when opened
  useEffect(() => {
    if (selectedId && selectedId !== "undefined") {
      console.log("📜 RECRUITER: Marking conversation as read:", selectedId);
      markConversationAsRead(selectedId);
    }
  }, [selectedId, markConversationAsRead]);

  // ✅ Enhanced socket integration for real-time messages
  useEffect(() => {
    // ✅ Enhanced validation for socket operations
    if (!isConnected || !selectedId || selectedId === "undefined") {
      console.log(
        "Socket not connected or selectedId not available, skipping socket setup"
      );
      return;
    }

    console.log("Setting up socket for recruiter conversation:", selectedId);

    // ✅ Join the conversation room using socket utility
    const joinResult = joinConversation(selectedId);
    if (!joinResult) {
      console.warn("Failed to join conversation room");
    }

    const handleNewMessage = (newMessage) => {
      console.log("🔥 RECRUITER CHATCONTAINER: newMessage handler called!");
      console.log("🔥 RECRUITER CHATCONTAINER: Message data:", newMessage);
      console.log("📦 FULL SOCKET MESSAGE:");
      console.log(JSON.stringify(newMessage, null, 2));
      console.log("🎯 Message sender:", newMessage.sender);
      console.log("💬 Message text:", newMessage.message);
      console.log("🏢 My business ID:", businessProfile?._id);
      console.log("=".repeat(80));

      // Check if the message belongs to this conversation
      const messageConversationId =
        newMessage.conversationId || newMessage.conversation;
      if (messageConversationId === selectedId) {
        setMessages((prevMessages) => {
          // ✅ Enhanced duplicate checking with debugging
          console.log("🔍 RECRUITER SOCKET: Checking duplicate for:", {
            messageId: newMessage._id || newMessage.id,
            messageText: newMessage.message,
            conversationId: newMessage.conversationId,
            currentMessagesCount: prevMessages.length,
          });

          const messageExists = prevMessages.some((msg, index) => {
            // Check by _id (most reliable)
            if (msg._id === (newMessage._id || newMessage.id)) {
              console.log(
                "🔍 SOCKET: Duplicate found by ID at index",
                index,
                ":",
                msg._id
              );
              return true;
            }

            // Special check for immediate messages
            if (
              msg._isImmediate &&
              msg.message === newMessage.message &&
              Math.abs(
                new Date(msg.createdAt) - new Date(newMessage.createdAt)
              ) < 5000
            ) {
              console.log(
                "🔍 SOCKET: Found matching immediate message, skipping socket add"
              );
              return true;
            }

            // Check by content and timestamp (for immediate vs socket messages)
            const timeDiff = Math.abs(
              new Date(msg.createdAt) - new Date(newMessage.createdAt)
            );
            if (
              msg.message === newMessage.message &&
              (msg.conversationId === newMessage.conversationId ||
                msg.conversationId === selectedId) &&
              timeDiff < 10000
            ) {
              // 10 second window for socket messages
              console.log(
                "🔍 SOCKET: Duplicate found by content/time at index",
                index,
                ":",
                {
                  messageText: msg.message,
                  timeDiff: timeDiff,
                }
              );
              return true;
            }

            return false;
          });

          console.log("🔍 RECRUITER SOCKET: Duplicate exists?", messageExists);

          if (!messageExists) {
            console.log("✅ RECRUITER SOCKET: Adding new message from socket");
            return [...prevMessages, newMessage];
          }
          console.log("⚠️ RECRUITER SOCKET: Skipping duplicate message");
          return prevMessages;
        });
      }
    };

    const handleMessageSent = (data) => {
      console.log("Recruiter message sent confirmation:", data);
    };

    const handleTyping = (typingData) => {
      console.log("User typing:", typingData);
      // Handle typing indicators here if needed
    };

    const handleStoppedTyping = (typingData) => {
      console.log("User stopped typing:", typingData);
      // Handle stopped typing indicators here if needed
    };

    const handleConversationJoined = (data) => {
      console.log("Recruiter successfully joined conversation:", data);
    };

    // ✅ Listen for socket events using socket utilities
    on("newMessage", handleNewMessage);
    on("message-sent", handleMessageSent);
    on("typing", handleTyping);
    on("stopped-typing", handleStoppedTyping);
    on("conversation-joined", handleConversationJoined);

    // Cleanup
    return () => {
      off("newMessage", handleNewMessage);
      off("message-sent", handleMessageSent);
      off("typing", handleTyping);
      off("stopped-typing", handleStoppedTyping);
      off("conversation-joined", handleConversationJoined);

      // ✅ Leave the conversation room using socket utility
      if (selectedId && selectedId !== "undefined") {
        leaveConversation(selectedId);
      }
    };
  }, [isConnected, selectedId, joinConversation, leaveConversation, on, off]);

  // ✅ Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    console.log(
      "📊 RECRUITER CHATCONTAINER: Messages changed, count:",
      messages.length
    );
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      console.log("📊 RECRUITER: Last message:", {
        id: lastMessage._id,
        sender: lastMessage.sender,
        message: lastMessage.message?.substring(0, 30),
        isImmediate: lastMessage._isImmediate,
      });
    }

    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Close menu on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest(".message-menu")) {
        setOpenMenuId(null);
      }
    };
    if (openMenuId) {
      document.addEventListener("click", handleClick);
    } else {
      document.removeEventListener("click", handleClick);
    }
    return () => document.removeEventListener("click", handleClick);
  }, [openMenuId]);

  // Message actions
  const handleReply = (message) => {
    setReplyingTo(message);
    setOpenMenuId(null);
  };

  const handleCopy = async (message) => {
    try {
      await navigator.clipboard.writeText(message.message);
      console.log("Message copied to clipboard");
    } catch (err) {
      console.error("Failed to copy message:", err);
    }
    setOpenMenuId(null);
  };

  const handlePin = (message) => {
    setPinnedMessages((prev) => {
      const isAlreadyPinned = prev.some((p) => p._id === message._id);
      if (isAlreadyPinned) {
        return prev.filter((p) => p._id !== message._id);
      } else {
        return [...prev, message];
      }
    });
    setOpenMenuId(null);
  };

  const handleDelete = async (message) => {
    try {
      const response = await axiosInstance.delete(
        `/recuriter/deleteMessage/${message._id}`,
        {
          params: { orgId: businessProfile._id },
        }
      );
      if (response.status === 200) {
        setMessages((prev) => prev.filter((m) => m._id !== message._id));
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
    setOpenMenuId(null);
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setOpenMenuId(null);
  };

  const isPinned = (messageId) => {
    return pinnedMessages.some((p) => p._id === messageId);
  };

  const handleCloseChat = () => {
    navigate("/messages");
  };

  const handlePinConversation = (conversation) => {
    const conversationId = selectedId || conversation?.id;
    setPinnedConversations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
    console.log("Conversation pinned/unpinned:", conversationId);
  };

  const handleViewProfile = () => {
    console.log("🔍 RECRUITER DEBUG: View Profile Data:", {
      conversation,
      otherUsers,
      selectedId,
      businessProfile: businessProfile?._id,
      "otherUsers[0]": otherUsers[0],
    });

    // Try multiple ways to get the other user ID
    let otherUserId = null;

    // Method 1: From otherUsers array
    if (otherUsers && otherUsers.length > 0 && otherUsers[0]?._id) {
      otherUserId = otherUsers[0]._id;
      console.log("✅ RECRUITER: Using otherUsers[0]._id:", otherUserId);
    }
    // Method 2: From conversation participants (exclude business profile)
    else if (conversation?.participants) {
      const otherParticipant = conversation.participants.find(
        (p) =>
          p.user?._id !== businessProfile?._id && p._id !== businessProfile?._id
      );
      if (otherParticipant) {
        otherUserId = otherParticipant.user?._id || otherParticipant._id;
        console.log(
          "✅ RECRUITER: Using conversation.participants:",
          otherUserId
        );
      }
    }

    if (otherUserId && otherUserId !== businessProfile?._id) {
      console.log("🎯 RECRUITER: Profile viewing temporarily unavailable");

      // Show a more professional modal-style alert
      const createModal = () => {
        const modal = document.createElement("div");
        modal.className =
          "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";
        modal.innerHTML = `
          <div class="bg-white rounded-xl shadow-lg p-8 text-center max-w-md mx-4">
            <div class="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 mb-3">Profile Unavailable</h2>
            <p class="text-gray-600 mb-6 leading-relaxed">This profile is currently unavailable. The feature is being deployed to production.</p>
            <button class="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors" onclick="this.closest('.fixed').remove()">
              OK
            </button>
            <div class="mt-4 pt-4 border-t border-gray-100">
              <p class="text-xs text-gray-500">We're working to make this feature available soon.</p>
            </div>
          </div>
        `;
        document.body.appendChild(modal);

        // Close on background click
        modal.addEventListener("click", (e) => {
          if (e.target === modal) modal.remove();
        });
      };

      createModal();
    } else {
      console.error(
        "❌ RECRUITER: No valid other user ID found or it matches business profile"
      );
      console.error("Available data:", {
        otherUserId,
        businessProfileId: businessProfile?._id,
      });
      alert("Unable to view profile. User information not available.");
    }
  };

  const handleMuteConversation = (conversation) => {
    const conversationId = selectedId || conversation?.id;
    setMutedConversations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(conversationId)) {
        newSet.delete(conversationId);
      } else {
        newSet.add(conversationId);
      }
      return newSet;
    });
    console.log("Conversation muted/unmuted:", conversationId);
  };

  const handleClearMessages = async (conversation) => {
    if (
      window.confirm(
        "Are you sure you want to clear all messages in this conversation? This action cannot be undone."
      )
    ) {
      try {
        await axiosInstance.delete(`/recuriter/clearMessages/${selectedId}`, {
          params: { orgId: businessProfile._id },
        });
        setMessages([]);
        console.log("Messages cleared for conversation:", conversation.id);
      } catch (error) {
        console.error("Error clearing messages:", error);
        alert("Failed to clear messages. Please try again.");
      }
    }
  };

  const handleDeleteConversation = async (conversation) => {
    if (
      window.confirm(
        "Are you sure you want to delete this conversation? This action cannot be undone."
      )
    ) {
      try {
        await axiosInstance.delete(
          `/recuriter/deleteConversation/${selectedId}`,
          {
            params: { orgId: businessProfile._id },
          }
        );
        navigate("/messages");
        console.log("Conversation deleted:", conversation.id);
      } catch (error) {
        console.error("Error deleting conversation:", error);
        alert("Failed to delete conversation. Please try again.");
      }
    }
  };

  // ✅ Early return with proper validation
  if (!selectedId || selectedId === "undefined") {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
          <p className="text-gray-400">
            Choose a conversation to start chatting
          </p>
        </div>
      </div>
    );
  }

  // ✅ Safe message grouping with date validation
  const groupedMessages = Array.isArray(messages)
    ? messages.reduce((acc, msg) => {
        // Skip messages without valid createdAt
        if (!msg || !msg.createdAt) {
          console.warn("Message missing createdAt:", msg);
          return acc;
        }

        const label = getMessageDateLabel(msg.createdAt);
        if (!acc[label]) acc[label] = [];
        acc[label].push(msg);
        return acc;
      }, {})
    : {};

  const getUserById = (message) => {
    // ✅ FIXED: Use the normalized message structure
    const senderId = message.sender || message; // For backward compatibility
    const senderData = message.senderData; // Populated user data from server

    console.log("🔍 RECRUITER getUserById:", {
      senderId,
      senderData,
      businessProfileId: businessProfile?._id,
      isBusinessProfile: String(senderId) === String(businessProfile?._id),
    });

    // If the sender ID matches the business profile, return business profile info
    if (String(senderId) === String(businessProfile?._id)) {
      console.log("✅ RECRUITER getUserById: Returning business profile");

      // Use senderData if available, otherwise fallback to businessProfile
      if (senderData && typeof senderData === "object") {
        return {
          _id: businessProfile._id,
          name:
            senderData.name ||
            senderData.companyName ||
            businessProfile.name ||
            "Recruiter",
          username:
            senderData.username ||
            senderData.name ||
            businessProfile.name ||
            "Recruiter",
          profilePicture:
            senderData.profilePicture ||
            senderData.logo ||
            businessProfile.logo,
        };
      }

      return {
        _id: businessProfile._id,
        name:
          businessProfile.name || businessProfile.companyName || "Recruiter",
        username:
          businessProfile.name || businessProfile.companyName || "Recruiter",
        profilePicture: businessProfile.logo || businessProfile.profilePicture,
      };
    }

    // Otherwise, find from other users or use senderData
    if (senderData && typeof senderData === "object") {
      return senderData;
    }

    const foundUser = otherUsers.find((user) => user._id === senderId);
    console.log(
      "🔍 RECRUITER getUserById: Found other user:",
      foundUser ? "Yes" : "No"
    );
    return foundUser || {};
  };

  const isUserOnline = (userId) => {
    // This is a placeholder. In a real application, you'd have a WebSocket
    // connection to track online status or fetch it from a user status API.
    // For now, we'll assume a simple check based on the current user's ID.
    // If the other user's ID matches the current user's ID, they are online.
    return userId === currentUser?._id;
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <ChatHeader
        selectedUser={otherUsers[0]}
        piimage={piimage}
        conversation={conversation}
        isGroup={conversation?.isGroup}
        participants={otherUsers}
        onProfileClick={handleViewProfile}
        onCloseChat={handleCloseChat}
        onPinConversation={handlePinConversation}
        onMuteConversation={handleMuteConversation}
        onClearMessages={handleClearMessages}
        onDeleteConversation={handleDeleteConversation}
        isPinned={pinnedConversations.has(selectedId)}
        isMuted={mutedConversations.has(selectedId)}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-white">
        {isMessageLoading ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm text-center max-w-md">
              {getRandomEmptyText()}
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
            <div key={dateLabel} className="space-y-1">
              <div className="flex justify-center my-6">
                <span className="bg-blue-500 text-white text-xs px-4 py-2 rounded-full shadow-lg border border-blue-400">
                  {dateLabel}
                </span>
              </div>
              {msgs.map((message, index) => {
                // ✅ SIMPLIFIED: Check if this message is from the current business profile
                const isCurrentUser = (() => {
                  console.log("🔍 RECRUITER ALIGNMENT: Message", message._id);
                  console.log(
                    "📝 Message text:",
                    message.message?.substring(0, 30)
                  );

                  if (!businessProfile?._id) {
                    console.error("🚨 CRITICAL: No business profile available");
                    return false;
                  }

                  // ✅ PRIORITY: Use direct senderId field (standardized server response)
                  let actualSenderId = message.senderId;

                  // Fallback: Extract from sender structure if senderId not available
                  if (!actualSenderId) {
                    if (typeof message.sender === "string") {
                      actualSenderId = message.sender;
                    } else if (message.sender?.user?._id) {
                      actualSenderId = message.sender.user._id;
                    } else if (message.sender?.user) {
                      actualSenderId = message.sender.user;
                    } else if (message.sender?._id) {
                      actualSenderId = message.sender._id;
                    }
                  }

                  if (!actualSenderId) {
                    console.error(
                      "🚨 Could not extract sender ID from:",
                      message.sender
                    );
                    return false;
                  }

                  const isMatch =
                    String(actualSenderId) === String(businessProfile._id);
                  console.log(
                    `🔄 Alignment: ${actualSenderId} === ${
                      businessProfile._id
                    } → ${isMatch ? "RIGHT" : "LEFT"}`
                  );

                  return isMatch;
                })();
                const senderUser = getUserById(message);

                // Check if next message is from same sender for grouping
                const nextMessage = msgs[index + 1];
                const isNextMessageFromSameSender =
                  nextMessage &&
                  (nextMessage.sender === message.sender ||
                    nextMessage.sender?._id === message.sender?._id ||
                    nextMessage.sender?.user === message.sender?.user ||
                    nextMessage.sender?.user?._id ===
                      message.sender?.user?._id);

                return (
                  <div
                    key={message._id}
                    className={`flex mb-4 ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-end gap-3 ${
                        isCurrentUser ? "flex-row-reverse" : ""
                      } max-w-[70%] group`}
                    >
                      {/* Avatar - only show for last message in group */}
                      <div
                        className={`w-10 h-10 ${
                          !isNextMessageFromSameSender ? "" : "invisible"
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={
                              senderUser?.profilePicture ||
                              senderUser?.profilePic ||
                              senderUser?.piimage ||
                              piimage
                            }
                            alt="User avatar"
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover"
                          />
                          {/* Online status indicator */}
                          {isUserOnline(senderUser?._id) && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                      </div>

                      <div
                        className={`flex flex-col ${
                          isCurrentUser ? "items-end" : "items-start"
                        }`}
                      >
                        {/* Sender name and timestamp */}
                        {!isNextMessageFromSameSender && (
                          <div
                            className={`text-xs text-gray-500 mb-1 ${
                              isCurrentUser ? "text-right" : "text-left"
                            }`}
                          >
                            <span className="font-medium">
                              {isCurrentUser ? "You" : senderUser?.name}
                            </span>
                            <span className="ml-2">
                              {(() => {
                                try {
                                  const date = new Date(message.createdAt);
                                  if (isNaN(date.getTime())) {
                                    return "Invalid time";
                                  }
                                  return date.toLocaleTimeString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  });
                                } catch (error) {
                                  return "Invalid time";
                                }
                              })()}
                            </span>
                          </div>
                        )}

                        {/* Message bubble */}
                        {message.message && (
                          <div className="relative group">
                            {/* Three dot menu button */}
                            <div
                              className={`absolute message-menu transition-opacity duration-200 z-10 top-1/2 transform -translate-y-1/2 ${
                                isCurrentUser ? "-left-9" : "-right-9"
                              }`}
                            >
                              <div className="relative">
                                <button
                                  className="bg-white/90 hover:bg-white shadow-sm border border-gray-200 p-1.5 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(
                                      openMenuId === message._id
                                        ? null
                                        : message._id
                                    );
                                  }}
                                >
                                  <MoreVertical className="w-4 h-4 text-gray-600" />
                                </button>
                                {/* Dropdown menu */}
                                {openMenuId === message._id && (
                                  <div
                                    className={`absolute top-6 ${
                                      isCurrentUser ? "left-0" : "right-0"
                                    } min-w-[140px] bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50`}
                                  >
                                    <button
                                      onClick={() => handleReply(message)}
                                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors gap-2"
                                    >
                                      <CornerUpLeft className="w-4 h-4" /> Reply
                                    </button>
                                    <button
                                      onClick={() => handleCopy(message)}
                                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors gap-2"
                                    >
                                      <Copy className="w-4 h-4" /> Copy
                                    </button>
                                    <button
                                      onClick={() => handlePin(message)}
                                      className={`flex items-center w-full px-3 py-2 text-sm transition-colors gap-2 ${
                                        isPinned(message._id)
                                          ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                          : "text-gray-700 hover:bg-gray-50"
                                      }`}
                                    >
                                      <Pin className="w-4 h-4" />{" "}
                                      {isPinned(message._id) ? "Unpin" : "Pin"}
                                    </button>
                                    <button
                                      onClick={() => handleDelete(message)}
                                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                    {isCurrentUser && (
                                      <button
                                        onClick={() => handleEdit(message)}
                                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors gap-2"
                                      >
                                        <Pencil className="w-4 h-4" /> Edit
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div
                              className={`px-4 py-3 text-sm whitespace-pre-wrap break-words overflow-hidden ${
                                isCurrentUser
                                  ? "text-white rounded-2xl rounded-br-md"
                                  : "bg-white text-gray-900 rounded-2xl rounded-bl-md border border-gray-200"
                              }`}
                              style={
                                isCurrentUser
                                  ? {
                                      background:
                                        "linear-gradient(94.84deg, #1890FF 0.34%, #006ACC 100%)",
                                    }
                                  : {}
                              }
                            >
                              {message.message}
                              {message.editedAt && (
                                <span className="text-xs opacity-60 italic ml-2">
                                  (edited)
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        {/* Typing indicator */}
        {otherUsers.some((u) => u.isTyping) && (
          <div className="flex items-center gap-2 mt-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="5" cy="12" r="2" fill="#bdbdbd">
                  <animate
                    attributeName="opacity"
                    values="1;0.3;1"
                    dur="1s"
                    repeatCount="indefinite"
                    begin="0s"
                  />
                </circle>
                <circle cx="12" cy="12" r="2" fill="#bdbdbd">
                  <animate
                    attributeName="opacity"
                    values="1;0.3;1"
                    dur="1s"
                    repeatCount="indefinite"
                    begin="0.2s"
                  />
                </circle>
                <circle cx="19" cy="12" r="2" fill="#bdbdbd">
                  <animate
                    attributeName="opacity"
                    values="1;0.3;1"
                    dur="1s"
                    repeatCount="indefinite"
                    begin="0.4s"
                  />
                </circle>
              </svg>
            </div>
            <span className="text-gray-500 text-sm">Typing...</span>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      <MessageInput
        selectedUser={otherUsers[0]}
        setMessages={setMessages}
        selectedConveresationId={selectedId}
        toggleFetch={toggleFetch}
        selectedConveresation={conversation}
        replyingTo={replyingTo}
        setReplyingTo={setReplyingTo}
      />
    </div>
  );
};

export default ChatContainer;
