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
    if (!selectedId) return;

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
    if (!socket || !selectedId) return;

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
      socket.emit("leave-conversation", { conversationId: selectedId });
    };
  }, [socket, selectedId]);

  // ✅ Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (!selectedId) {
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

  return (
    <div className="flex-1 flex flex-col bg-white">
      <ChatHeader
        selectedUser={otherUsers[0]}
        onProfileClick={() => {}}
        conversation={conversation}
        isGroup={conversation?.isGroup}
        participants={otherUsers}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
            <div key={dateLabel}>
              <div className="flex justify-center mb-4">
                <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {dateLabel}
                </span>
              </div>
              {msgs.map((msg, index) => {
                const isOwnMessage =
                  msg.sender?.user?._id === currentUser?._id ||
                  msg.sender?.user === currentUser?._id ||
                  msg.sender === currentUser?._id;

                return (
                  <div
                    key={msg._id || index}
                    className={`flex mb-4 ${
                      isOwnMessage ? "justify-end" : "justify-start"
                    }`}
                  >
                    {!isOwnMessage && (
                      <img
                        src={
                          msg.sender?.user?.profilePicture ||
                          otherUsers[0]?.profilePicture ||
                          piimage
                        }
                        alt="Profile"
                        className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
                      />
                    )}
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwnMessage
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-800"
                      }`}
                    >
                      <p className="text-sm">{msg.message || msg.text}</p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {isOwnMessage && (
                      <img
                        src={currentUser?.profilePicture || piimage}
                        alt="Profile"
                        className="w-8 h-8 rounded-full ml-2 flex-shrink-0"
                      />
                    )}
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
