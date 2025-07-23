import { useState, useRef, useEffect } from "react";
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

  // ✅ Use socket utilities from context
  const { sendMessage: socketSendMessage, isConnected } = useSocket();
  const { businessProfile } = useSelector((state) => state.auth);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker]);

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
    if (isLoading) return;

    // ✅ Enhanced validation
    if (!selectedConveresationId || selectedConveresationId === "undefined") {
      console.error("Cannot send message: Invalid conversation ID");
      return;
    }

    if (!businessProfile) {
      console.error("Cannot send message: No business profile");
      return;
    }

    const messageText = inputMessage.trim();
    setIsLoading(true);

    try {
      const messageData = {
        conversationId: selectedConveresationId,
        text: messageText,
        receiverId: selectedUser?._id || selectedUser?.id || selectedUser,
        senderId: businessProfile._id,
      };

      console.log("Sending recruiter message:", messageData);

      const res = await axiosInstance.post(
        "/recuriter/sendMessage",
        messageData
      );
      console.log("Recruiter message sent:", res.data);

      // ✅ Add sent message immediately for instant feedback
      if (res.data?.message && setMessages) {
        const messageToAdd = res.data.message;
        console.log("✅ RECRUITER: Adding sent message immediately:", {
          messageId: messageToAdd._id,
          messageText: messageToAdd.message,
          conversationId: messageToAdd.conversationId
        });
        setMessages((prevMessages) => {
          // Enhanced duplicate checking for immediate message addition
          const messageExists = prevMessages.some(
            (msg) => {
              // Check by _id (most reliable)
              if (msg._id === messageToAdd._id) return true;
              
              // Check by content, timestamp, and conversation (fallback)
              const timeDiff = Math.abs(new Date(msg.createdAt) - new Date(messageToAdd.createdAt));
              if (msg.message === messageToAdd.message && 
                  (msg.conversationId === messageToAdd.conversationId || 
                   msg.conversationId === selectedConveresationId) &&
                  timeDiff < 2000) { // 2 second window for immediate additions
                return true;
              }
              
              return false;
            }
          );
          
          if (!messageExists) {
            console.log("✅ RECRUITER: Adding new message immediately");
            // Add a temporary flag to identify immediate messages
            const messageWithFlag = { ...messageToAdd, _isImmediate: true };
            return [...prevMessages, messageWithFlag];
          }
          console.log("⚠️ RECRUITER: Duplicate message detected, skipping immediate add");
          return prevMessages;
        });
      } else {
        console.warn("📨 RECRUITER: No message data received or setMessages not available:", {
          messageExists: !!res.data?.message,
          setMessagesExists: !!setMessages,
          responseData: res.data
        });
      }

      // Clear input immediately for better UX
      setInputMessage("");
      setSelectedFile(null);

      // ✅ Socket emission is handled by server, no need for client-side emission
      console.log("✅ CLIENT: Recruiter message sent, server will handle socket broadcasting");

      // ✅ No need to trigger fetch since we're adding message immediately to local state
      // toggleFetch() was causing unwanted reloads - removed for better UX
    } catch (error) {
      console.error("Error sending recruiter message:", error);
      console.error("Error response:", error.response?.data);
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
  const isInputDisabled =
    isLoading ||
    !selectedConveresationId ||
    selectedConveresationId === "undefined" ||
    !businessProfile;

  const isSendDisabled =
    (!inputMessage.trim() && !selectedFile) ||
    isLoading ||
    !selectedConveresationId ||
    selectedConveresationId === "undefined" ||
    !businessProfile;

  console.log("Recruiter MessageInput - conversation:", selectedConveresation);
  console.log("Recruiter MessageInput - selectedUser:", selectedUser);
  console.log(
    "Recruiter MessageInput - conversationId:",
    selectedConveresationId
  );
  console.log("Recruiter MessageInput - businessProfile:", businessProfile);
  console.log("Recruiter MessageInput - isConnected:", isConnected);
  console.log("Recruiter MessageInput - isInputDisabled:", isInputDisabled);
  console.log("Recruiter MessageInput - isSendDisabled:", isSendDisabled);
  console.log("Recruiter MessageInput - inputMessage:", inputMessage);
  console.log("Recruiter MessageInput - isLoading:", isLoading);
  console.log("Recruiter MessageInput - setMessages function:", typeof setMessages);

  return (
    <div className="relative border-t bg-white p-4">
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
        <div ref={emojiPickerRef} className="absolute bottom-20 left-4 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
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
          disabled={isInputDisabled}
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
          disabled={isInputDisabled}
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
          disabled={isInputDisabled}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={isSendDisabled}
          className={`p-2 rounded-full transition ${
            !isSendDisabled
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
