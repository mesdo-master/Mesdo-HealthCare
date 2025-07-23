import { useNavigate } from "react-router-dom";
import { useSocket } from "../../../../context/SocketProvider";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import axiosInstance from "../../../../lib/axio";
import { getMessageDateLabel } from "../../../../lib/utils";
import MessageSkeleton from "../../../user/messages/MessageSkeleton";
import MessageInput from "./MessageInput";
import ChatHeader from "./ChatHeader";

const ChatContainer = ({ selectedId, toggleFetch, conversation }) => {
  const navigate = useNavigate();

  // ✅ Use socket utilities from context
  const { joinConversation, leaveConversation, on, off, isConnected } =
    useSocket();

  const piimage =
    "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif";

  const [messages, setMessages] = useState([]);
  const [otherUsers, setOtherUsers] = useState([]);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const messageEndRef = useRef(null);
  const { currentUser, businessProfile } = useSelector((state) => state.auth);

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

        const { messages, otherUser } = response.data;
        setMessages(messages || []);
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
      console.log(
        "New message received in recruiter ChatContainer:",
        newMessage
      );

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
            currentMessagesCount: prevMessages.length
          });
          
          const messageExists = prevMessages.some(
            (msg, index) => {
              // Check by _id (most reliable)
              if (msg._id === (newMessage._id || newMessage.id)) {
                console.log("🔍 SOCKET: Duplicate found by ID at index", index, ":", msg._id);
                return true;
              }
              
              // Special check for immediate messages
              if (msg._isImmediate && 
                  msg.message === newMessage.message &&
                  Math.abs(new Date(msg.createdAt) - new Date(newMessage.createdAt)) < 5000) {
                console.log("🔍 SOCKET: Found matching immediate message, skipping socket add");
                return true;
              }
              
              // Check by content and timestamp (for immediate vs socket messages)
              const timeDiff = Math.abs(new Date(msg.createdAt) - new Date(newMessage.createdAt));
              if (msg.message === newMessage.message && 
                  (msg.conversationId === newMessage.conversationId ||
                   msg.conversationId === selectedId) &&
                  timeDiff < 10000) { // 10 second window for socket messages
                console.log("🔍 SOCKET: Duplicate found by content/time at index", index, ":", {
                  messageText: msg.message,
                  timeDiff: timeDiff
                });
                return true;
              }
              
              return false;
            }
          );
          
          console.log("🔍 RECRUITER SOCKET: Duplicate exists?", messageExists);

          if (!messageExists) {
            return [...prevMessages, newMessage];
          }
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
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

  // ✅ Safe message grouping
  const groupedMessages = Array.isArray(messages)
    ? messages.reduce((acc, msg) => {
        const label = getMessageDateLabel(msg.createdAt);
        if (!acc[label]) acc[label] = [];
        acc[label].push(msg);
        return acc;
      }, {})
    : {};

  const getUserById = (id) => {
    if (id === businessProfile._id) return businessProfile;
    return otherUsers.find((user) => user._id === id) || {};
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      <ChatHeader
        selectedUser={otherUsers[0]}
        piimage={piimage}
        conversation={conversation}
        isGroup={conversation?.isGroup}
        participants={otherUsers}
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
                // ✅ Fixed sender comparison for recruiter messages
                const isCurrentUser =
                  message.sender === businessProfile._id ||
                  message.sender?._id === businessProfile._id ||
                  message.sender?.user === businessProfile._id ||
                  message.sender?.user?._id === businessProfile._id;
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
                        <img
                          src={senderUser?.profilePicture || piimage}
                          alt="User avatar"
                          className="w-8 h-8 rounded-full border-2 border-white shadow-sm object-cover"
                        />
                      </div>
                      
                      <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                        {/* Sender name for group chats */}
                        {conversation?.isGroup && !isCurrentUser && index === 0 && (
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
        selectedUser={otherUsers[0]}
        setMessages={setMessages}
        selectedConveresationId={selectedId}
        toggleFetch={toggleFetch}
        selectedConveresation={conversation}
      />
    </div>
  );
};

export default ChatContainer;
