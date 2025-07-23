import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "../MessageSkeleton";
import axiosInstance from "../../../../lib/axio";
import { useSelector } from "react-redux";
import { useSocket, useOnlineUsers } from "../../../../context/SocketProvider";
import { getMessageDateLabel } from "../../../../lib/utils";
import { useNavigate } from "react-router-dom";

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

  const piimage =
    "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif";

  const [messages, setMessages] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const messageEndRef = useRef(null);
  const { currentUser } = useSelector((state) => state.auth);

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
          const response = await axiosInstance.get(`/chats/${selectedId}`);
          console.log("Chat messages response:", response.data);

          const { messages, otherUser, otherUsers } = response.data;
          setMessages(messages || []);

          // Handle both single otherUser and multiple otherUsers
          if (otherUsers) {
            setOtherUsers(
              Array.isArray(otherUsers) ? otherUsers : [otherUsers]
            );
          } else if (otherUser) {
            setOtherUsers(Array.isArray(otherUser) ? otherUser : [otherUser]);
          } else {
            setOtherUsers([]);
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

  // ✅ Enhanced socket integration for real-time messages
  useEffect(() => {
    // ✅ Enhanced validation for socket operations
    if (!isConnected || !selectedId || selectedId === "undefined") {
      console.log(
        "Socket not connected or selectedId not available, skipping socket setup"
      );
      return;
    }

    console.log("Setting up socket for conversation:", selectedId);

    // ✅ Join the conversation room using socket utility
    const joinResult = joinConversation(selectedId);
    if (!joinResult) {
      console.warn("Failed to join conversation room");
    }

    const handleNewMessage = (newMessage) => {
      console.log("New message received in ChatContainer:", newMessage);

      // Check if the message belongs to this conversation
      const messageConversationId =
        newMessage.conversationId || newMessage.conversation;
      if (messageConversationId === selectedId) {
        setMessages((prevMessages) => {
          // ✅ Enhanced duplicate checking
          const messageExists = prevMessages.some(
            (msg) => {
              // Check by _id
              if (msg._id === (newMessage._id || newMessage.id)) return true;
              
              // Check by content and timestamp (for immediate vs socket messages)
              if (msg.message === newMessage.message && 
                  msg.conversationId === newMessage.conversationId &&
                  Math.abs(new Date(msg.createdAt) - new Date(newMessage.createdAt)) < 5000) {
                return true;
              }
              
              return false;
            }
          );

          if (!messageExists) {
            console.log("Adding new message to user chat:", newMessage);
            return [...prevMessages, newMessage];
          }
          console.log("Duplicate message detected, skipping:", newMessage);
          return prevMessages;
        });
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
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ✅ Early return with proper validation
  if (!selectedId || selectedId === "undefined") {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Select a conversation to start chatting.
      </div>
    );
  }

  // ✅ Safe message grouping
  const groupedMessages = Array.isArray(messages)
    ? messages.reduce((acc, msg) => {
        const label = getMessageDateLabel(msg.createdAt);
        if (!acc[label]) acc[label] = [];
        acc[label].push(msg);
        return acc;
      }, {})
    : {};

  const getUserById = (senderInfo) => {
    // ✅ Handle different sender structures
    let senderId;
    if (typeof senderInfo === 'string') {
      senderId = senderInfo;
    } else if (senderInfo?.user) {
      senderId = senderInfo.user._id || senderInfo.user;
    } else if (senderInfo?._id) {
      senderId = senderInfo._id;
    } else {
      senderId = senderInfo;
    }

    if (senderId === currentUser._id) return currentUser;
    return otherUsers.find((user) => user._id === senderId) || {};
  };

  // Check if user is online
  const isUserOnline = (userId) => {
    if (!userId) return false;
    const user = onlineUsers.get(userId);
    return user && user.status === 'online';
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white shadow-md rounded-lg">
      <ChatHeader
        selectedUser={
          conversation?.category === "group" ? otherUsers : otherUsers[0]
        }
        piimage={piimage}
        conversation={conversation}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-gray-50">
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
                <span className="bg-white text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm border">
                  {dateLabel}
                </span>
              </div>
              {msgs.map((message, index) => {
                // ✅ Enhanced sender comparison to handle different message structures
                const isCurrentUser = 
                  message.sender === currentUser._id ||
                  message.sender?._id === currentUser._id ||
                  message.sender?.user === currentUser._id ||
                  message.sender?.user?._id === currentUser._id;
                const senderUser = getUserById(message.sender);
                
                // Check if next message is from same sender for grouping
                const nextMessage = msgs[index + 1];
                const isNextMessageFromSameSender = nextMessage && (
                  (nextMessage.sender === message.sender) ||
                  (nextMessage.sender?._id === message.sender?._id) ||
                  (nextMessage.sender?.user === message.sender?.user) ||
                  (nextMessage.sender?.user?._id === message.sender?.user?._id)
                );

                return (
                  <div
                    key={message._id}
                    className={`flex mb-1 ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-end gap-2 ${
                        isCurrentUser ? "flex-row-reverse" : ""
                      } max-w-[80%] group`}
                    >
                      {/* Avatar - only show for last message in group */}
                      <div className={`w-8 h-8 ${!isNextMessageFromSameSender ? '' : 'invisible'}`}>
                        <div className="relative">
                          <img
                            src={senderUser?.profilePicture || piimage}
                            alt="User avatar"
                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover"
                          />
                          {/* Online status indicator */}
                          {!isCurrentUser && isUserOnline(senderUser?._id) && (
                            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                      </div>
                      
                      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                        {/* Sender name for group chats */}
                        {conversation?.category === "group" && !isCurrentUser && index === 0 && (
                          <p className="text-xs text-gray-500 mb-1 font-medium px-2">
                            {senderUser?.name}
                          </p>
                        )}
                        
                        {/* Image attachment */}
                        {message.image && (
                          <div className="mb-2">
                            <img
                              src={message.image}
                              alt="Attachment"
                              className="max-w-[250px] rounded-lg shadow-md border"
                            />
                          </div>
                        )}
                        
                        {/* Message bubble */}
                        {message.message && (
                          <div
                            className={`px-4 py-2 text-sm whitespace-pre-line shadow-sm max-w-full break-words ${
                              isCurrentUser
                                ? "bg-blue-500 text-white rounded-[18px] rounded-br-[4px]"
                                : "bg-white text-gray-900 rounded-[18px] rounded-bl-[4px] border"
                            }`}
                          >
                            {message.message}
                          </div>
                        )}
                        
                        {/* Timestamp - only show for last message in group */}
                        {!isNextMessageFromSameSender && (
                          <div className={`text-xs text-gray-400 mt-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                            isCurrentUser ? 'text-right' : 'text-left'
                          }`}>
                            {new Date(message.createdAt).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                                timeZone: "Asia/Kolkata",
                              }
                            )}
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
      </div>

      <MessageInput
        selectedUser={otherUsers[0] || conversation?.otherParticipant}
        setMessages={setMessages}
        selectedConveresationId={selectedId}
        toggleFetch={toggleFetch}
        selectedConveresation={conversation}
        activeTab={activeTab}
      />
    </div>
  );
};

export default ChatContainer;
