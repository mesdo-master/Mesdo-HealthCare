import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "../MessageSkeleton";
import axiosInstance from "../../../../lib/axio";
import { useSelector } from "react-redux";
import { useSocket, useOnlineUsers } from "../../../../context/SocketProvider";
import { useNotifications } from "../../../../context/NotificationContextFinal";
import { getMessageDateLabel } from "../../../../lib/utils";
import { useNavigate } from "react-router-dom";
import {
  MoreVertical,
  CornerUpLeft,
  Copy,
  Pin,
  Trash2,
  Pencil,
  X,
} from "lucide-react";

const ChatContainer = ({
  selectedId,
  toggleFetch,
  conversation,
  activeTab,
}) => {
  const navigate = useNavigate();
  // ✅ Use socket utilities from context
  const { joinConversation, leaveConversation, on, off, isConnected } =
    useSocket();
  const onlineUsers = useOnlineUsers();
  const { markConversationAsRead } = useNotifications();

  const piimage =
    "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif";

  const [messages, setMessages] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const messageEndRef = useRef(null);
  const { currentUser } = useSelector((state) => state.auth);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [pinnedConversations, setPinnedConversations] = useState(new Set());
  const [mutedConversations, setMutedConversations] = useState(new Set());
  const [pinnedMessages, setPinnedMessages] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [otherUserProfile, setOtherUserProfile] = useState(null);

  // Function to fetch other user's profile data
  const fetchOtherUserProfile = async (userId) => {
    if (!userId) {
      console.log("❌ No userId provided for profile fetch");
      return;
    }

    try {
      console.log("🔍 Fetching user profile for:", userId);
      const response = await axiosInstance.get(`/users/profile/${userId}`);
      console.log("✅ User profile fetched:", response.data);
      console.log("🔍 Profile data details:", {
        hasUser: !!response.data.user,
        userName: response.data.user?.name,
        profilePicture: response.data.user?.profilePicture,
        profilePic: response.data.user?.profilePic,
        allFields: Object.keys(response.data.user || {}),
      });
      setOtherUserProfile(response.data.user);
    } catch (error) {
      console.error("❌ Error fetching user profile:", error);
      console.error("❌ Error response:", error.response?.data);
      setOtherUserProfile(null);
    }
  };

  // 🔍 DEBUG: Log current user and conversation at component level
  console.log("🔍 USER CHATCONTAINER - CURRENT USER DEBUG:", {
    currentUser,
    currentUserId: currentUser?._id,
    currentUserType: typeof currentUser?._id,
    selectedId,
    messagesCount: messages.length,
    conversationCategory: conversation?.category,
    otherParticipant: conversation?.otherParticipant,
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
    // ✅ Enhanced debugging for selectedId
    console.log("🔍 FETCH MESSAGES DEBUG:", {
      selectedId,
      selectedIdType: typeof selectedId,
      selectedIdValid: !!(selectedId && selectedId !== "undefined"),
      conversationProp: conversation,
      conversationId: conversation?._id || conversation?.id,
      activeTab,
      timestamp: new Date().toISOString(),
    });

    // ✅ Validate selectedId before making API calls
    if (!selectedId || selectedId === "undefined") {
      console.log("❌ No valid selectedId, skipping message fetch");
      setMessages([]);
      setOtherUsers([]);
      return;
    }

    if (activeTab === "Jobs") {
      const getMessages = async () => {
        setIsMessageLoading(true);
        try {
          const response = await axiosInstance.get(
            `/jobs/getMessages/${selectedId}`
          );
          console.log("Jobs messages response:", response.data);

          const { messages, otherUser } = response.data;
          setMessages(messages || []);
          setOtherUsers(
            Array.isArray(otherUser) ? otherUser : [otherUser].filter(Boolean)
          );
        } catch (error) {
          console.error("Error fetching job messages:", error);
          setMessages([]);
          setOtherUsers([]);
        } finally {
          setIsMessageLoading(false);
        }
      };

      getMessages();
    } else {
      const getMessages = async () => {
        setIsMessageLoading(true);
        try {
          console.log("🚀 Making API call to fetch messages:", {
            endpoint: `/chats/${selectedId}`,
            selectedId,
            timestamp: new Date().toISOString(),
          });

          const response = await axiosInstance.get(`/chats/${selectedId}`);
          console.log("✅ Chat messages response:", {
            endpoint: `/chats/${selectedId}`,
            selectedId,
            messagesCount: response.data.messages?.length || 0,
            responseData: response.data,
            timestamp: new Date().toISOString(),
          });
          console.log("🔍 USER API DEBUG: Detailed response analysis:", {
            selectedId,
            responseData: response.data,
            otherUser: response.data.otherUser,
            otherUsers: response.data.otherUsers,
            conversation: response.data.conversation,
          });

          const { messages, otherUser, otherUsers } = response.data;
          setMessages(messages || []);

          console.log("🔍 API Response Analysis:", {
            hasOtherUsers: !!otherUsers,
            hasOtherUser: !!otherUser,
            otherUsersType: typeof otherUsers,
            otherUserType: typeof otherUser,
            otherUsersIsArray: Array.isArray(otherUsers),
            otherUserIsArray: Array.isArray(otherUser),
            otherUsersLength: otherUsers?.length,
            otherUserLength: otherUser?.length,
            otherUsersFirst: otherUsers?.[0],
            otherUserFirst: otherUser?.[0],
          });

          // Handle both single otherUser and multiple otherUsers
          if (otherUsers) {
            console.log(
              "📝 USER: Setting otherUsers from otherUsers field:",
              otherUsers
            );
            console.log(
              "🔍 USER: Raw conversation data:",
              response.data.conversation
            );
            console.log("🔍 USER: Current user from Redux:", currentUser);
            setOtherUsers(
              Array.isArray(otherUsers) ? otherUsers : [otherUsers]
            );

            // Fetch other user's profile data
            if (Array.isArray(otherUsers) && otherUsers.length > 0) {
              const otherUserId = otherUsers[0]._id || otherUsers[0].user;
              console.log("🔍 Extracting user ID from otherUsers[0]:", {
                otherUsersFirst: otherUsers[0],
                extractedId: otherUserId,
                currentUserId: currentUser?._id,
              });
              if (otherUserId && otherUserId !== currentUser?._id) {
                console.log(
                  "✅ Calling fetchOtherUserProfile with:",
                  otherUserId
                );
                fetchOtherUserProfile(otherUserId);
              } else {
                console.log("❌ Skipping profile fetch - same user or no ID");
              }
            } else if (otherUsers._id || otherUsers.user) {
              const otherUserId = otherUsers._id || otherUsers.user;
              console.log("🔍 Extracting user ID from otherUsers object:", {
                otherUsers,
                extractedId: otherUserId,
                currentUserId: currentUser?._id,
              });
              if (otherUserId && otherUserId !== currentUser?._id) {
                console.log(
                  "✅ Calling fetchOtherUserProfile with:",
                  otherUserId
                );
                fetchOtherUserProfile(otherUserId);
              } else {
                console.log("❌ Skipping profile fetch - same user or no ID");
              }
            } else {
              console.log("❌ No valid user ID found in otherUsers");
            }
          } else if (otherUser) {
            console.log(
              "📝 USER: Setting otherUsers from otherUser field:",
              otherUser
            );
            console.log(
              "🔍 USER: Raw conversation data:",
              response.data.conversation
            );
            console.log("🔍 USER: Current user from Redux:", currentUser);
            setOtherUsers(Array.isArray(otherUser) ? otherUser : [otherUser]);

            // Fetch other user's profile data
            if (Array.isArray(otherUser) && otherUser.length > 0) {
              const otherUserId = otherUser[0]._id || otherUser[0].user;
              console.log("🔍 Extracting user ID from otherUser[0]:", {
                otherUserFirst: otherUser[0],
                extractedId: otherUserId,
                currentUserId: currentUser?._id,
              });
              if (otherUserId && otherUserId !== currentUser?._id) {
                console.log(
                  "✅ Calling fetchOtherUserProfile with:",
                  otherUserId
                );
                fetchOtherUserProfile(otherUserId);
              } else {
                console.log("❌ Skipping profile fetch - same user or no ID");
              }
            } else if (otherUser._id || otherUser.user) {
              const otherUserId = otherUser._id || otherUser.user;
              console.log("🔍 Extracting user ID from otherUser object:", {
                otherUser,
                extractedId: otherUserId,
                currentUserId: currentUser?._id,
              });
              if (otherUserId && otherUserId !== currentUser?._id) {
                console.log(
                  "✅ Calling fetchOtherUserProfile with:",
                  otherUserId
                );
                fetchOtherUserProfile(otherUserId);
              } else {
                console.log("❌ Skipping profile fetch - same user or no ID");
              }
            } else {
              console.log("❌ No valid user ID found in otherUser");
            }
          } else {
            console.log(
              "⚠️ USER: No otherUser or otherUsers found in response"
            );
            setOtherUsers([]);
          }

          // Fallback: Try to get user ID from conversationOtherParticipant
          if (!otherUserProfile && conversation?.otherParticipant?._id) {
            const fallbackUserId = conversation.otherParticipant._id;
            console.log(
              "🔄 Fallback: Using conversationOtherParticipant ID:",
              fallbackUserId
            );
            if (fallbackUserId && fallbackUserId !== currentUser?._id) {
              console.log(
                "✅ Calling fetchOtherUserProfile with fallback ID:",
                fallbackUserId
              );
              fetchOtherUserProfile(fallbackUserId);
            }
          }
        } catch (error) {
          console.error("Error fetching chat messages:", error);
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
    }
  }, [selectedId, activeTab, navigate]);

  // ✅ Mark conversation as read when opened
  useEffect(() => {
    if (selectedId && selectedId !== "undefined") {
      console.log("📜 USER: Marking conversation as read:", selectedId);
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

    console.log("🔌 USER: Setting up socket for conversation:", selectedId);
    console.log("🔌 USER: Socket connected:", isConnected);
    console.log("🔌 USER: Socket functions available:", {
      joinConversation: typeof joinConversation,
      on: typeof on,
      off: typeof off,
    });

    // ✅ Join the conversation room using socket utility
    const joinResult = joinConversation(selectedId);
    console.log("🔌 USER: Join conversation result:", joinResult);
    if (!joinResult) {
      console.warn("❌ USER: Failed to join conversation room");
    } else {
      console.log("✅ USER: Successfully joined conversation room");
    }

    const handleNewMessage = (newMessage) => {
      console.log("🔥 USER CHATCONTAINER: newMessage handler called!");
      console.log("🔥 USER CHATCONTAINER: Message data:", newMessage);
      console.log("🔔 USER: Current selectedId:", selectedId);
      console.log("🔔 USER: Current messages count:", messages.length);

      // Check if the message belongs to this conversation
      const messageConversationId =
        newMessage.conversationId || newMessage.conversation;

      console.log("🔔 USER: Message conversation ID:", messageConversationId);
      console.log("🔔 USER: Selected conversation ID:", selectedId);
      console.log("🔔 USER: IDs match:", messageConversationId === selectedId);
      console.log("🔔 USER: ID types:", {
        messageConversationIdType: typeof messageConversationId,
        selectedIdType: typeof selectedId,
        stringComparison: String(messageConversationId) === String(selectedId),
      });

      if (messageConversationId === selectedId) {
        console.log(
          "✅ USER: Message belongs to current conversation, processing..."
        );
        setMessages((prevMessages) => {
          console.log(
            "🔔 USER: Current messages before update:",
            prevMessages.length
          );

          // ✅ Enhanced duplicate checking
          const messageExists = prevMessages.some((msg) => {
            // Check by _id
            if (msg._id === (newMessage._id || newMessage.id)) {
              console.log("🔔 USER: Duplicate found by ID:", msg._id);
              return true;
            }

            // Check by content and timestamp (for immediate vs socket messages)
            if (
              msg.message === newMessage.message &&
              msg.conversationId === newMessage.conversationId &&
              Math.abs(
                new Date(msg.createdAt) - new Date(newMessage.createdAt)
              ) < 5000
            ) {
              console.log("🔔 USER: Duplicate found by content/time");
              return true;
            }

            return false;
          });

          if (!messageExists) {
            console.log(
              "✅ USER: Adding new message to chat:",
              newMessage.message
            );
            const updatedMessages = [...prevMessages, newMessage];
            console.log(
              "✅ USER: Updated messages count:",
              updatedMessages.length
            );
            return updatedMessages;
          }
          console.log(
            "⚠️ USER: Duplicate message detected, skipping:",
            newMessage.message
          );
          return prevMessages;
        });
      } else {
        console.log("❌ USER: Message not for current conversation, ignoring");
      }
    };

    const handleMessageSent = (data) => {
      console.log("Message sent confirmation:", data);
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
      console.log("Successfully joined conversation:", data);
    };

    // Test socket connectivity
    const handleTestEvent = (data) => {
      console.log("🧪 USER: Test socket event received:", data);
    };

    const handleMessageDeleted = (data) => {
      console.log("🗑️ USER: Message deleted:", data);
      if (data.conversationId === selectedId) {
        setMessages((prev) => prev.filter((msg) => msg._id !== data.messageId));
      }
    };

    const handleMessageEdited = (data) => {
      console.log("✏️ USER: Message edited:", data);
      if (data.conversationId === selectedId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === data.messageId
              ? { ...msg, message: data.newMessage, editedAt: data.editedAt }
              : msg
          )
        );
      }
    };

    // ✅ Listen for socket events using socket utilities
    console.log("🔌 USER: Setting up socket event listeners...");
    on("newMessage", handleNewMessage);
    on("message-sent", handleMessageSent);
    on("typing", handleTyping);
    on("stopped-typing", handleStoppedTyping);
    on("conversation-joined", handleConversationJoined);
    on("test-event", handleTestEvent);
    on("messageDeleted", handleMessageDeleted);
    on("messageEdited", handleMessageEdited);
    console.log("✅ USER: Socket event listeners set up successfully");

    // Cleanup
    return () => {
      off("newMessage", handleNewMessage);
      off("message-sent", handleMessageSent);
      off("typing", handleTyping);
      off("stopped-typing", handleStoppedTyping);
      off("conversation-joined", handleConversationJoined);
      off("messageDeleted", handleMessageDeleted);
      off("messageEdited", handleMessageEdited);

      // ✅ Leave the conversation room using socket utility
      if (selectedId && selectedId !== "undefined") {
        leaveConversation(selectedId);
      }
    };
  }, [isConnected, selectedId, joinConversation, leaveConversation, on, off]);

  // ✅ Auto-scroll to bottom when new messages arrive
  useEffect(() => {
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

  // ✅ Fetch other user's profile when conversation loads
  useEffect(() => {
    if (conversation?.otherParticipant?._id && !otherUserProfile) {
      const otherUserId = conversation.otherParticipant._id;
      console.log(
        "🔄 useEffect: Fetching profile for conversation participant:",
        otherUserId
      );
      if (otherUserId !== currentUser?._id) {
        fetchOtherUserProfile(otherUserId);
      }
    }
  }, [conversation, otherUserProfile, currentUser?._id]);

  // ✅ Early return with proper validation
  if (!selectedId || selectedId === "undefined") {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a conversation to start chatting.
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
    // ✅ Universal sender lookup - handles socket vs API message structures
    let senderId = null;
    let senderData = null;

    // Check for senderData field first (socket messages)
    if (message.senderData && message.senderData._id) {
      return message.senderData;
    }

    const senderInfo = message.sender;

    // Structure 1: Socket message - sender is direct ID string
    if (typeof senderInfo === "string") {
      senderId = senderInfo;
    }
    // Structure 2: Database/API message - sender.user.id + populated user data
    else if (senderInfo?.user) {
      if (typeof senderInfo.user === "string") {
        senderId = senderInfo.user;
      } else if (senderInfo.user._id) {
        senderId = senderInfo.user._id;
        senderData = senderInfo.user; // Use populated user data
      }
    }
    // Structure 3: Direct sender object with _id
    else if (senderInfo?._id) {
      senderId = senderInfo._id;
      senderData = senderInfo;
    }

    // Return current user if it's me
    if (senderId === currentUser._id) {
      return currentUser;
    }

    // Return populated sender data if available
    if (senderData && senderData._id) {
      return senderData;
    }

    // Find in other users list
    const foundUser = otherUsers.find((user) => user._id === senderId);
    if (foundUser) {
      return foundUser;
    }

    // Fallback - return empty object with senderId for display
    return { _id: senderId, name: "Unknown User", username: "unknown" };
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    if (!userId) return false;
    const user = onlineUsers.get(userId);
    return user && user.status === "online";
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
    console.log("🔍=== VIEW PROFILE DEBUG START ===");
    console.log("🔍 DEBUG: View Profile Data:", {
      conversation,
      otherUsers,
      selectedId,
      currentUser: currentUser?._id,
      "conversation.otherParticipant": conversation?.otherParticipant,
      "otherUsers[0]": otherUsers[0],
    });

    // FORCE: Extract other user ID with extensive debugging
    let otherUserId = null;
    let method = "";

    // Method 1: From otherUsers array (most reliable)
    if (otherUsers && otherUsers.length > 0) {
      const firstOtherUser = otherUsers[0];
      console.log("🔍 Method 1 - First other user:", firstOtherUser);

      if (firstOtherUser?._id && firstOtherUser._id !== currentUser?._id) {
        otherUserId = firstOtherUser._id;
        method = "otherUsers[0]._id";
        console.log("✅ Method 1 SUCCESS:", otherUserId);
      } else {
        console.log("⚠️ Method 1 FAILED: Invalid or matching current user");
      }
    }

    // Method 2: From conversation.otherParticipant
    if (!otherUserId && conversation?.otherParticipant?._id) {
      if (conversation.otherParticipant._id !== currentUser?._id) {
        otherUserId = conversation.otherParticipant._id;
        method = "conversation.otherParticipant._id";
        console.log("✅ Method 2 SUCCESS:", otherUserId);
      } else {
        console.log("⚠️ Method 2 FAILED: Matches current user");
      }
    }

    // Method 3: From conversation participants (manual search)
    if (
      !otherUserId &&
      conversation?.participants &&
      Array.isArray(conversation.participants)
    ) {
      console.log(
        "🔍 Method 3 - Searching participants:",
        conversation.participants
      );

      for (const participant of conversation.participants) {
        console.log("🔍 Checking participant:", participant);

        let participantId = null;
        if (participant.user?._id) {
          participantId = participant.user._id;
        } else if (participant._id) {
          participantId = participant._id;
        }

        console.log(
          "🔍 Participant ID:",
          participantId,
          "Current User ID:",
          currentUser?._id
        );

        if (
          participantId &&
          String(participantId) !== String(currentUser?._id)
        ) {
          otherUserId = participantId;
          method = "conversation.participants manual search";
          console.log("✅ Method 3 SUCCESS:", otherUserId);
          break;
        }
      }

      if (!otherUserId) {
        console.log("⚠️ Method 3 FAILED: No valid other participant found");
      }
    }

    // Method 4: FORCE - Use a hardcoded different ID if we're still getting the same user
    if (!otherUserId && currentUser?._id === "683e8ab57761da530587c477") {
      // This is a temporary debugging measure
      console.log("🚑 EMERGENCY: Using fallback user ID for debugging");
      console.log("🚑 If this works, it means the data structure is wrong");
      otherUserId = "000000000000000000000000"; // Temporary fallback
      method = "emergency fallback";
    }

    console.log("🔍 FINAL RESULT:", {
      otherUserId,
      method,
      currentUserId: currentUser?._id,
      willNavigate: otherUserId && otherUserId !== currentUser?._id,
    });

    if (otherUserId && String(otherUserId) !== String(currentUser?._id)) {
      console.log("🎯 SUCCESS: Navigating to profile:", otherUserId);
      console.log("🔍=== VIEW PROFILE DEBUG END ===");
      navigate(`/profile/${otherUserId}`);
    } else {
      console.error("❌ FAILED: No valid other user ID found");
      console.error(
        "🚑 This suggests the conversation data structure is not as expected"
      );
      console.error("Debug data dump:", {
        otherUserId,
        currentUserId: currentUser?._id,
        conversation,
        otherUsers,
        selectedId,
      });
      console.log("🔍=== VIEW PROFILE DEBUG END ===");

      // Show a professional modal instead of basic alert
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
        const conversationId = selectedId || conversation?.id;
        await axiosInstance.delete(`/chats/clear/${conversationId}`);
        setMessages([]);
        console.log("Messages cleared for conversation:", conversationId);
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
        const conversationId = selectedId || conversation?.id;
        await axiosInstance.delete(`/chats/${conversationId}`);
        navigate("/messages");
        console.log("Conversation deleted:", conversationId);
      } catch (error) {
        console.error("Error deleting conversation:", error);
        alert("Failed to delete conversation. Please try again.");
      }
    }
  };

  // Message menu handlers
  const handleReplyMessage = (message) => {
    setReplyingTo(message);
    setOpenMenuId(null);
    console.log("Replying to message:", message.message);
  };

  const handleCopyMessage = (message) => {
    navigator.clipboard
      .writeText(message.message)
      .then(() => {
        console.log("Message copied to clipboard");
        // You could add a toast notification here
      })
      .catch((err) => {
        console.error("Failed to copy message:", err);
      });
    setOpenMenuId(null);
  };

  const handlePinMessage = (message) => {
    setPinnedMessages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(message._id)) {
        newSet.delete(message._id);
        console.log("Message unpinned:", message._id);
      } else {
        newSet.add(message._id);
        console.log("Message pinned:", message._id);
      }
      return newSet;
    });
    setOpenMenuId(null);
  };

  const handleDeleteMessage = async (message) => {
    if (
      window.confirm(
        "Are you sure you want to delete this message? This action cannot be undone."
      )
    ) {
      try {
        // Call API to delete message
        await axiosInstance.delete(`/chats/messages/${message._id}`);

        // Remove message from local state
        setMessages((prev) => prev.filter((msg) => msg._id !== message._id));
        console.log("Message deleted:", message._id);
      } catch (error) {
        console.error("Error deleting message:", error);
        alert("Failed to delete message. Please try again.");
      }
    }
    setOpenMenuId(null);
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setOpenMenuId(null);
    console.log("Editing message:", message.message);
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white rounded-xl shadow-sm">
      {/* Debug logs */}
      {(() => {
        console.log("🔍 ChatContainer Debug:", {
          selectedId,
          conversation,
          otherUsers,
          otherUsersDetails: otherUsers.map((user) => ({
            _id: user._id,
            name: user.name,
            profilePicture: user.profilePicture,
            profilePic: user.profilePic,
            piimage: user.piimage,
            userType: user.userType,
          })),
          selectedUser:
            conversation?.category === "group" ? otherUsers : otherUsers[0],
          conversationOtherParticipant: conversation?.otherParticipant,
          otherUserProfile,
          currentUser: currentUser?._id,
          // Additional debug for profile picture fields
          allProfilePictureFields: {
            "conversation?.piimage": conversation?.piimage,
            "conversation?.otherParticipant?.profilePicture":
              conversation?.otherParticipant?.profilePicture,
            "conversation?.otherParticipant?.piimage":
              conversation?.otherParticipant?.piimage,
            "conversation?.conversationOtherParticipant?.piimage":
              conversation?.conversationOtherParticipant?.piimage,
            "otherUserProfile?.profilePicture":
              otherUserProfile?.profilePicture,
            "otherUserProfile?.piimage": otherUserProfile?.piimage,
            "otherUsers[0]?.profilePicture": otherUsers[0]?.profilePicture,
            "otherUsers[0]?.piimage": otherUsers[0]?.piimage,
          },
        });
        return null;
      })()}

      <ChatHeader
        selectedUser={
          conversation?.category === "group" ? otherUsers : otherUsers[0]
        }
        otherUserProfile={otherUserProfile}
        piimage={piimage}
        conversation={conversation}
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
            <div key={dateLabel} className="space-y-4">
              <div className="flex justify-center my-6">
                <span className="bg-blue-500 text-white text-xs px-4 py-2 rounded-full shadow-lg border border-blue-400">
                  {dateLabel}
                </span>
              </div>
              {msgs.map((message, index) => {
                const isCurrentUser = (() => {
                  let actualSenderId = null;

                  if (typeof message.sender === "string") {
                    actualSenderId = message.sender;
                  } else if (message.sender?.user) {
                    if (typeof message.sender.user === "string") {
                      actualSenderId = message.sender.user;
                    } else if (message.sender.user._id) {
                      actualSenderId = message.sender.user._id;
                    }
                  } else if (message.sender?._id) {
                    actualSenderId = message.sender._id;
                  }

                  const senderIdStr = String(actualSenderId);
                  const currentUserIdStr = String(currentUser?._id);
                  return senderIdStr === currentUserIdStr;
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
                              otherUserProfile?.profilePicture ||
                              otherUserProfile?.profilePic ||
                              otherUserProfile?.piimage ||
                              conversation?.otherParticipant?.profilePicture ||
                              conversation?.otherParticipant?.profilePic ||
                              conversation?.otherParticipant?.piimage ||
                              conversation?.piimage ||
                              conversation?.conversationOtherParticipant
                                ?.profilePicture ||
                              conversation?.conversationOtherParticipant
                                ?.piimage ||
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
                                      onClick={() =>
                                        handleReplyMessage(message)
                                      }
                                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors gap-2"
                                    >
                                      <CornerUpLeft className="w-4 h-4" /> Reply
                                    </button>
                                    <button
                                      onClick={() => handleCopyMessage(message)}
                                      className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors gap-2"
                                    >
                                      <Copy className="w-4 h-4" /> Copy
                                    </button>
                                    <button
                                      onClick={() => handlePinMessage(message)}
                                      className={`flex items-center w-full px-3 py-2 text-sm transition-colors gap-2 ${
                                        pinnedMessages.has(message._id)
                                          ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
                                          : "text-gray-700 hover:bg-gray-50"
                                      }`}
                                    >
                                      <Pin className="w-4 h-4" />{" "}
                                      {pinnedMessages.has(message._id)
                                        ? "Unpin"
                                        : "Pin"}
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteMessage(message)
                                      }
                                      className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors gap-2"
                                    >
                                      <Trash2 className="w-4 h-4" /> Delete
                                    </button>
                                    {isCurrentUser && (
                                      <button
                                        onClick={() =>
                                          handleEditMessage(message)
                                        }
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
                              className={`px-4 py-3 text-sm whitespace-pre-line max-w-full break-words ${
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
        <div ref={messageEndRef} />
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
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="bg-gray-50 border-t border-gray-200 px-4 py-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CornerUpLeft className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Replying to {getUserById(replyingTo)?.name || "Unknown User"}
                </span>
              </div>
              <div className="text-sm text-gray-600 bg-white rounded px-3 py-2 border-l-4 border-blue-500">
                {replyingTo.message?.length > 100
                  ? replyingTo.message.substring(0, 100) + "..."
                  : replyingTo.message}
              </div>
            </div>
            <button
              onClick={cancelReply}
              className="ml-3 p-1 hover:bg-gray-200 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      <MessageInput
        selectedUser={otherUsers[0] || conversation?.otherParticipant}
        setMessages={setMessages}
        selectedConveresationId={selectedId}
        toggleFetch={toggleFetch}
        selectedConveresation={conversation}
        activeTab={activeTab}
        replyingTo={replyingTo}
        onCancelReply={cancelReply}
        editingMessage={editingMessage}
        onCancelEdit={cancelEdit}
        onMessageSent={() => {
          setReplyingTo(null);
          setEditingMessage(null);
        }}
      />
    </div>
  );
};

export default ChatContainer;
