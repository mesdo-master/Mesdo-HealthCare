import { useState, useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "../MessageSkeleton";
import axiosInstance from "../../../../lib/axio";
import { useSelector } from "react-redux";
import { useSocket } from "../../../../context/SocketProvider";
import { getMessageDateLabel } from "../../../../lib/utils";
import { useNavigate } from "react-router-dom";

const ChatContainer = ({
  selectedId,
  toggleFetch,
  conversation,
  activeTab,
}) => {
  const navigate = useNavigate();
  const socket = useSocket();
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

  // ✅ Socket integration for real-time messages
  useEffect(() => {
    // ✅ Enhanced validation for socket operations
    if (!socket || !selectedId || selectedId === "undefined") {
      console.log("Socket or selectedId not available, skipping socket setup");
      return;
    }

    console.log("Setting up socket for conversation:", selectedId);

    // Join the conversation room
    socket.emit("join-conversation", { conversationId: selectedId });

    const handleNewMessage = (newMessage) => {
      console.log("New message received in ChatContainer:", newMessage);

      // Check if the message belongs to this conversation
      const messageConversationId =
        newMessage.conversationId || newMessage.conversation;
      if (messageConversationId === selectedId) {
        setMessages((prevMessages) => {
          // Avoid duplicate messages
          const messageExists = prevMessages.some(
            (msg) => msg._id === newMessage.id || msg._id === newMessage._id
          );

          if (!messageExists) {
            return [...prevMessages, newMessage];
          }
          return prevMessages;
        });
      }
    };

    const handleTyping = (typingData) => {
      console.log("User typing:", typingData);
      // Handle typing indicators here if needed
    };

    const handleStoppedTyping = (typingData) => {
      console.log("User stopped typing:", typingData);
      // Handle stopped typing indicators here if needed
    };

    // Listen for socket events
    socket.on("newMessage", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopped-typing", handleStoppedTyping);

    // Cleanup
    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopped-typing", handleStoppedTyping);

      // Leave the conversation room
      if (selectedId && selectedId !== "undefined") {
        socket.emit("leave-conversation", { conversationId: selectedId });
      }
    };
  }, [socket, selectedId]);

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

  const getUserById = (id) => {
    if (id === currentUser._id) return currentUser;
    return otherUsers.find((user) => user._id === id) || {};
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {isMessageLoading ? (
          <MessageSkeleton />
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <p className="text-lg font-medium">No messages here yet.</p>
            <p className="text-sm">{getRandomEmptyText()}</p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([dateLabel, msgs]) => (
            <div key={dateLabel}>
              <div className="flex justify-center my-6">
                <span className="bg-gray-300 text-xs px-4 py-1 rounded-full text-gray-700 shadow-sm">
                  {dateLabel}
                </span>
              </div>
              {msgs.map((message) => {
                const isCurrentUser = message.sender === currentUser._id;
                const senderUser = getUserById(message.sender);

                return (
                  <div
                    key={message._id}
                    className={`flex ${
                      isCurrentUser ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`flex items-end gap-2 ${
                        isCurrentUser ? "flex-row-reverse" : ""
                      } max-w-[75%]`}
                    >
                      <img
                        src={senderUser?.profilePicture || piimage}
                        alt="User avatar"
                        className="w-8 h-8 rounded-full border"
                      />
                      <div className="text-left">
                        {conversation?.category === "group" &&
                          !isCurrentUser && (
                            <p className="text-xs text-gray-500 mb-1 font-medium">
                              {senderUser?.name}
                            </p>
                          )}
                        {message.image && (
                          <img
                            src={message.image}
                            alt="Attachment"
                            className="sm:max-w-[200px] rounded-md mb-1"
                          />
                        )}
                        {message.message && (
                          <div
                            className={`px-4 py-2 rounded-lg text-sm whitespace-pre-line ${
                              isCurrentUser
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-900"
                            }`}
                          >
                            {message.message}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-1">
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
        activeTab={activeTab}
      />
    </div>
  );
};

export default ChatContainer;
