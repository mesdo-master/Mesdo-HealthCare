import { useState, useRef, useEffect } from "react";
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

  // ✅ Use socket utilities from context
  const {
    sendMessage: socketSendMessage,
    isConnected,
    joinConversation,
  } = useSocket();

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
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

  const handleJobSend = async () => {
    if (!inputMessage.trim() && !selectedFile) return;
    if (isLoading) return;

    // ✅ Enhanced validation
    if (!selectedConveresationId || selectedConveresationId === "undefined") {
      console.error("Cannot send message: Invalid conversation ID");
      return;
    }

    const messageText = inputMessage.trim();
    setIsLoading(true);

    try {
      const messageData = {
        conversationId: selectedConveresationId,
        text: messageText,
        receiverId: selectedUser?._id || selectedUser?.id,
      };

      console.log("Sending job message:", messageData);

      const res = await axiosInstance.post("/chats/sendMessage", messageData);
      console.log("Job message sent:", res.data);

      // ✅ Immediately add the sent message to local state for instant feedback
      if (res.data?.message && setMessages) {
        const messageToAdd = res.data.message;
        console.log(
          "📨 USER JOB: Adding sent message to local state:",
          messageToAdd
        );
        setMessages((prevMessages) => {
          // Avoid duplicate messages using the correct message object
          const messageExists = prevMessages.some(
            (msg) => msg._id === messageToAdd._id
          );
          if (!messageExists) {
            console.log("✅ USER JOB: Adding new sent message locally");
            return [...prevMessages, messageToAdd];
          }
          console.log("⚠️ USER JOB: Sent message already exists, skipping");
          return prevMessages;
        });
      } else {
        console.warn(
          "❌ USER JOB: No message in response data or setMessages function missing"
        );
      }

      // Clear input immediately for better UX
      setInputMessage("");
      setSelectedFile(null);

      // ✅ Socket emission is handled by server, no need for client-side emission
      console.log(
        "✅ CLIENT: Job message sent, server will handle socket broadcasting"
      );

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

    // ✅ Enhanced validation
    if (!selectedConveresationId || selectedConveresationId === "undefined") {
      console.error("Cannot send message: Invalid conversation ID");
      return;
    }

    const messageText = inputMessage.trim();
    setIsLoading(true);

    try {
      // ✅ Enhanced message data structure
      const messageData = {
        conversationId: selectedConveresationId,
        text: messageText,
      };

      // ✅ Enhanced receiverId logic - handle different conversation structures
      if (!selectedConveresation?.isGroup) {
        if (selectedUser) {
          messageData.receiverId = selectedUser._id || selectedUser.id;
        } else if (selectedConveresation?.otherParticipant) {
          messageData.receiverId =
            selectedConveresation.otherParticipant._id ||
            selectedConveresation.otherParticipant.id;
        }
      }

      console.log("📨 CLIENT: Sending message with data:", messageData);
      console.log("📨 CLIENT: API endpoint:", "/chats/sendMessage");
      console.log(
        "📨 CLIENT: Authorization header:",
        axiosInstance.defaults.headers.Authorization ? "Present" : "Missing"
      );

      // ✅ Send via API first
      const res = await axiosInstance.post("/chats/sendMessage", messageData);
      console.log("✅ CLIENT: Message sent via API successfully:", res.data);

      // ✅ Immediately add the sent message to local state for instant feedback
      if (res.data?.message && setMessages) {
        const messageToAdd = res.data.message;
        console.log(
          "📨 USER: Adding sent message to local state:",
          messageToAdd
        );
        setMessages((prevMessages) => {
          // Avoid duplicate messages using the correct message object
          const messageExists = prevMessages.some(
            (msg) => msg._id === messageToAdd._id
          );
          console.log("📨 USER: Message exists check:", messageExists);
          if (!messageExists) {
            console.log("✅ USER: Adding new sent message locally");
            return [...prevMessages, messageToAdd];
          }
          console.log("⚠️ USER: Sent message already exists, skipping");
          return prevMessages;
        });
      } else {
        console.warn(
          "❌ USER: No message in response data or setMessages function missing:",
          {
            hasResponseData: !!res.data,
            hasMessage: !!res.data?.message,
            hasSetMessages: !!setMessages,
            responseData: res.data,
          }
        );
      }

      // Clear input immediately for better UX
      setInputMessage("");
      setSelectedFile(null);

      // ✅ Socket emission is handled by server, no need for client-side emission
      // The server will broadcast the message to all participants after saving
      console.log(
        "✅ CLIENT: Message sent, server will handle socket broadcasting"
      );

      // Trigger refresh if needed
      if (toggleFetch) {
        toggleFetch();
      }
    } catch (error) {
      console.error("❌ CLIENT: Error sending message:", error);
      console.error("❌ CLIENT: Error response data:", error.response?.data);
      console.error("❌ CLIENT: Error status:", error.response?.status);
      console.error("❌ CLIENT: Error headers:", error.response?.headers);

      // Show user-friendly error message
      if (error.response?.status === 500) {
        console.error(
          "❌ CLIENT: Server error - check server logs for details"
        );
        alert(
          "Server error occurred. Please try again or check your connection."
        );
      } else if (error.response?.status === 401) {
        console.error("❌ CLIENT: Authentication error");
        alert("Authentication error. Please log in again.");
      } else if (error.response?.status === 404) {
        console.error("❌ CLIENT: Conversation not found");
        alert("Conversation not found. Please refresh the page.");
      } else {
        alert("Failed to send message. Please try again.");
      }

      // Restore input on error
      setInputMessage(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (
        activeTab === "Jobs" ||
        selectedConveresation?.category === "Recruitment"
      ) {
        handleJobSend();
      } else {
        handleSend();
      }
    }
  };

  const handleSendClick = () => {
    if (
      activeTab === "Jobs" ||
      selectedConveresation?.category === "Recruitment"
    ) {
      handleJobSend();
    } else {
      handleSend();
    }
  };

  // ✅ Fixed validation for disabled state
  const isDisabled =
    (!inputMessage.trim() && !selectedFile) ||
    isLoading ||
    !selectedConveresationId ||
    selectedConveresationId === "undefined";

  // ✅ Test function for debugging
  const testSendMessage = async () => {
    console.log("Testing message send...");
    console.log("selectedConveresationId:", selectedConveresationId);
    console.log("selectedUser:", selectedUser);
    console.log("selectedConveresation:", selectedConveresation);
    console.log("isConnected:", isConnected);

    if (!selectedConveresationId || selectedConveresationId === "undefined") {
      console.error("Cannot test: Invalid conversation ID");
      return;
    }

    try {
      const testData = {
        conversationId: selectedConveresationId,
        text: "Test message",
      };

      if (selectedUser) {
        testData.receiverId = selectedUser._id || selectedUser.id;
      } else if (selectedConveresation?.otherParticipant) {
        testData.receiverId =
          selectedConveresation.otherParticipant._id ||
          selectedConveresation.otherParticipant.id;
      }

      console.log("Test data:", testData);
      const res = await axiosInstance.post("/chats/sendMessage", testData);
      console.log("Test response:", res.data);

      // Test socket sending
      if (isConnected) {
        const receiverType =
          selectedUser?.role === "recruiter" ? "BusinessProfile" : "User";
        socketSendMessage({
          conversationId: selectedConveresationId,
          message: "Test socket message",
          messageType: "text",
          category: selectedConveresation?.category || "Personal",
          receiverId: testData.receiverId,
          receiverType: receiverType,
        });
        console.log("Socket message sent");
      } else {
        console.warn("Socket not connected");
      }
    } catch (error) {
      console.error("Test error:", error);
      console.error("Error response:", error.response?.data);
    }
  };

  console.log("MessageInput - conversation:", selectedConveresation);
  console.log("MessageInput - selectedUser:", selectedUser);
  console.log("MessageInput - conversationId:", selectedConveresationId);
  console.log("MessageInput - activeTab:", activeTab);
  console.log("MessageInput - isDisabled:", isDisabled);
  console.log("MessageInput - inputMessage:", inputMessage);
  console.log("MessageInput - isConnected:", isConnected);

  return (
    <div className="relative bg-white px-4 py-3 border border-[#E4E5E8] rounded-lg mb-4 mx-4">
      {/* File Preview */}
      {selectedFile && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between w-full">
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

      {/* Text Input - Positioned higher up */}
      <div className="mb-3">
        <textarea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            !selectedConveresationId || selectedConveresationId === "undefined"
              ? "Select a conversation to start messaging..."
              : "Type a message..."
          }
          className="w-full bg-transparent border-none outline-none resize-none text-sm placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed min-h-[20px] max-h-[100px]"
          disabled={
            isLoading ||
            !selectedConveresationId ||
            selectedConveresationId === "undefined"
          }
          rows={1}
        />
      </div>

      {/* Bottom row with icons and send button */}
      <div className="flex items-center justify-between">
        {/* Left-aligned Icons at bottom */}
        <div className="flex items-center gap-3">
          {/* File Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Attach file"
            disabled={isLoading}
          >
            <Paperclip size={18} />
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
            className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label="Add emoji"
            disabled={
              isLoading ||
              !selectedConveresationId ||
              selectedConveresationId === "undefined"
            }
          >
            <Smile size={18} />
          </button>
        </div>

        {/* Send Button - Blue background, white text */}
        <button
          onClick={handleSendClick}
          disabled={isDisabled}
          className={`px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2 ${
            !isDisabled
              ? "bg-[#1890FF] text-white hover:bg-[#006ACC]"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
          aria-label="Send message"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <span>Send</span>
              <Send size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
