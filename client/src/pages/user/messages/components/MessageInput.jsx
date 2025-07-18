import { useState, useRef } from "react";
import { Paperclip, Smile, Send, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import axiosInstance from "../../../../lib/axio";
import { useSocket } from "../../../../context/SocketProvider";

const MessageInput = ({
  selectedUser,
  setMessages,
  selectedConveresationId,
  toggleFetch,
  selectedConveresation,
  activeTab,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const socket = useSocket();

  const handleEmojiClick = (emojiData) => {
    setInputMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleJobSend = async () => {
    if (!inputMessage.trim() && !selectedFile) return;
    if (isLoading) return;

    const messageText = inputMessage.trim();
    setIsLoading(true);

    try {
      const messageData = {
        conversationId: selectedConveresationId,
        text: messageText,
        receiverId: selectedUser?._id || selectedUser?.id,
      };

      console.log("Sending job message:", messageData);

      const res = await axiosInstance.post("/jobs/sendMessage", messageData);
      console.log("Job message sent:", res.data);

      // Clear input immediately for better UX
      setInputMessage("");
      setSelectedFile(null);

      // Emit socket event for real-time update
      if (socket) {
        socket.emit("send-message", {
          conversationId: selectedConveresationId,
          message: messageText,
          messageType: "text",
          category: "Recruitment",
        });
      }

      // Trigger refresh if needed
      if (toggleFetch) {
        toggleFetch();
      }
    } catch (error) {
      console.error("Error sending job message:", error);
      // Restore input on error
      setInputMessage(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputMessage.trim() && !selectedFile) return;
    if (isLoading) return;

    const messageText = inputMessage.trim();
    setIsLoading(true);

    try {
      const messageData = {
        conversationId: selectedConveresationId,
        text: messageText,
      };

      // Only include receiverId if it's an individual chat
      if (!selectedConveresation?.isGroup && selectedUser) {
        messageData.receiverId = selectedUser._id || selectedUser.id;
      }

      console.log("Sending message:", messageData);

      const res = await axiosInstance.post("/chats/sendMessage", messageData);
      console.log("Message sent:", res.data);

      // Clear input immediately for better UX
      setInputMessage("");
      setSelectedFile(null);

      // Emit socket event for real-time update
      if (socket) {
        socket.emit("send-message", {
          conversationId: selectedConveresationId,
          message: messageText,
          messageType: "text",
          category: selectedConveresation?.category || "Personal",
        });
      }

      // Trigger refresh if needed
      if (toggleFetch) {
        toggleFetch();
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore input on error
      setInputMessage(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (selectedConveresation?.category === "Recruitment") {
        handleJobSend();
      } else {
        handleSend();
      }
    }
  };

  const handleSendClick = () => {
    if (selectedConveresation?.category === "Recruitment") {
      handleJobSend();
    } else {
      handleSend();
    }
  };

  console.log("MessageInput - conversation:", selectedConveresation);
  console.log("MessageInput - selectedUser:", selectedUser);

  return (
    <div className="border-t bg-white p-4">
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Paperclip size={16} className="text-gray-500" />
            <span className="text-sm text-gray-700">{selectedFile.name}</span>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-20 left-4 z-10">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            ref={emojiPickerRef}
            width={300}
            height={400}
          />
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center gap-2">
        {/* File Upload */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
          aria-label="Attach file"
        >
          <Paperclip size={20} />
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
        />

        {/* Emoji Button */}
        <button
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
          aria-label="Add emoji"
        >
          <Smile size={20} />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          className="flex-1 p-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          disabled={isLoading}
        />

        {/* Send Button */}
        <button
          onClick={handleSendClick}
          disabled={(!inputMessage.trim() && !selectedFile) || isLoading}
          className={`p-2 rounded-full transition ${
            (inputMessage.trim() || selectedFile) && !isLoading
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          aria-label="Send message"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
