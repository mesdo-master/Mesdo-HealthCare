import { AiOutlineSend } from "react-icons/ai";
import MessageSkeleton from "../../../user/messages/MessageSkeleton";
import { useEffect, useRef, useState } from "react";
import { getMessageDateLabel } from "../../../../lib/utils";
import { useSelector } from "react-redux";
import { useSocket } from "../../../../context/SocketProvider";
import axiosInstance from "../../../../lib/axio";
import { useParams } from "react-router-dom";
import MessageInput from "./components/MessageInput";

export default function MessagesView({ applicant }) {
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [conversation, setConversation] = useState([]);
  const [otherUser, setOtherUser] = useState('');
  const [messages, setMessages] = useState([]);
  const { currentUser, businessProfile } = useSelector((state) => state.auth);
  const [conversationId, setConversationId] = useState();

  const socket = useSocket();
  const { jobId } = useParams();

  useEffect(() => {
    const initaiteMessages = async () => {
      try {
        const res = await axiosInstance.post("/recuriter/initiate", { jobId, orgId: businessProfile._id, receiverId: applicant._id });
        // console.log(res)
        setConversationId(res.data.conversationId);
      } catch (error) {
        console.error("Error initiating chat:", error);
      }
    }
    initaiteMessages();
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    const getMessages = async () => {
      setIsMessageLoading(true);
      try {
        const response = await axiosInstance.get(`/recuriter/getMessages/${conversationId}`, {
          params: { orgId: businessProfile._id }
        });

        console.log(response.data)
        const { messages, otherUser } = response.data;
        setMessages(messages);
        setOtherUser(otherUser);
      } catch (error) {
        console.error("Error fetching messages:", error);

      } finally {
        setIsMessageLoading(false);
      }
    };

    getMessages();
  }, [conversationId]);



  useEffect(() => {
    if (!socket || !otherUser || !currentUser) return;

    const handleNewMessage = (newMessage) => {
      // Check if the sender is either the current user or the otherUser
      console.log("new message",newMessage)
      if (
        (newMessage.sender === otherUser &&
        newMessage.receiver === businessProfile._id) ||
       ( newMessage.receiver === otherUser &&
        newMessage.sender === businessProfile._id)
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, currentUser, otherUser]);


  const emptyMessagesText = [
    "No messages yet. Looks like a clean slate 🧼",
    "Still waiting for the first word... 🐣",
    "Nobody's home... yet! 👻",
    "Start the conversation before it becomes a staring contest 👀",
    "This space is emptier than your fridge at midnight 🍽️"
  ];

  // Mock similar jobs data (you might want to fetch this from API)
  const piimage =
    "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif";


  const getRandomEmptyText = () =>
    emptyMessagesText[Math.floor(Math.random() * emptyMessagesText.length)];

  const groupedMessages = messages.reduce((acc, msg) => {
    const label = getMessageDateLabel(msg.createdAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(msg);
    return acc;
  }, {});


  const messageEndRef = useRef(null);
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col w-[1150px] h-[600px] mx-auto bg-white shadow-md rounded-2xl">
      <div className="h-full w-full">
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 h-[90%]">
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
                  const isCurrentUser = message.sender === businessProfile._id;
                  const senderUser = message.sender;

                  return (
                    <div
                      key={message._id}
                      className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`flex items-end gap-2 ${isCurrentUser ? "flex-row-reverse" : ""} max-w-[75%]`}>
                        {/* <img
                          src={senderUser?.profilePicture || piimage}
                          alt="User avatar"
                          className="w-8 h-8 rounded-full border"
                        /> */}
                        <div className="text-left">
                          {conversation?.category === "group" && !isCurrentUser && (
                            <p className="text-xs text-gray-500 mb-1 font-medium">{senderUser?.name}</p>
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
                              className={`px-4 py-2 rounded-lg text-sm whitespace-pre-line ${isCurrentUser
                                ? "bg-blue-500 text-white"
                                : "bg-gray-200 text-gray-900"
                                }`}
                            >
                              {message.message}
                            </div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            {new Date(message.createdAt).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                              timeZone: "Asia/Kolkata",
                            })}
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
          selectedUser={otherUser}
          setMessages={setMessages}
          selectedConveresationId={conversationId}
          selectedConveresation={conversation}
          orgData={businessProfile}
        // toggleFetch={toggleFetch}
        />
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ text, position = "left" }) {
  return (
    <div
      className={`max-w-[350px] p-4 text-gray-700 text-sm rounded-2xl ${position === "left"
        ? "bg-gray-100 rounded-tr-lg rounded-bl-lg rounded-br-lg"
        : "bg-blue-100 rounded-tl-lg rounded-bl-lg rounded-br-lg"
        }`}
      style={{
        fontFamily: "Inter, sans-serif",
        fontSize: "14px",
        lineHeight: "26.6px",
      }}
    >
      {text}
    </div>
  );
}