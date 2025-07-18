import { useState, useRef } from "react";
import { Paperclip, Smile, Send, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import axiosInstance from "../../../../lib/axio";
import { useSocket } from "../../../../context/SocketProvider";
import { useSelector } from "react-redux";

const MessageInput = ({
  selectedUser,
  setMessages,
  selectedConveresationId,
  toggleFetch,
  selectedConveresation,
}) => {
  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const socket = useSocket();
  const { businessProfile } = useSelector((state) => state.auth);

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

  const handleSend = async () => {
    if (!inputMessage.trim() && !selectedFile) return;
    if (!selectedConveresationId || !selectedUser || !businessProfile) return;
    if (isLoading) return;

    // ✅ Enhanced validation
    if (selectedConveresationId === "undefined") {
      console.error("Cannot send message: Invalid conversation ID");
      return;
    }

    const messageText = inputMessage.trim();
    setIsLoading(true);

    try {
      const messageData = {
        conversationId: selectedConveresationId,
        text: messageText,
        receiverId: selectedUser._id || selectedUser.id || selectedUser,
        senderId: businessProfile._id,
      };

      console.log("Sending recruiter message:", messageData);

      const res = await axiosInstance.post(
        "/recuriter/sendMessage",
        messageData
      );
      console.log("Recruiter message sent:", res.data);

      // Clear input immediately for better UX
      setInputMessage("");
      setSelectedFile(null);

      // Emit socket event for real-time update
      if (
        socket &&
        selectedConveresationId &&
        selectedConveresationId !== "undefined"
      ) {
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
      console.error("Error sending recruiter message:", error);
      // Restore input on error
      setInputMessage(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ✅ Enhanced validation for disabled state
  const isDisabled =
    (!inputMessage.trim() && !selectedFile) ||
    isLoading ||
    !selectedConveresationId ||
    selectedConveresationId === "undefined" ||
    !selectedUser ||
    !businessProfile;

  console.log("Recruiter MessageInput - conversation:", selectedConveresation);
  console.log("Recruiter MessageInput - selectedUser:", selectedUser);
  console.log("Recruiter MessageInput - businessProfile:", businessProfile);
  console.log(
    "Recruiter MessageInput - conversationId:",
    selectedConveresationId
  );

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
          disabled={isLoading}
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
          disabled={isLoading}
        >
          <Smile size={20} />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            !selectedConveresationId || selectedConveresationId === "undefined"
              ? "Select a conversation to start messaging..."
              : "Type a message..."
          }
          className="flex-1 p-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isDisabled}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isDisabled}
          className={`p-2 rounded-full transition ${
            !isDisabled
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
