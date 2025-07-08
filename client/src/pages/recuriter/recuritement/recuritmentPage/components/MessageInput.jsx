import { useState, useRef } from "react";
import { Paperclip, Smile, Send, X } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import axiosInstance from "../../../../../lib/axio";

const MessageInput = ({ selectedUser, setMessages, selectedConveresationId, toggleFetch, selectedConveresation, orgData}) => {

  const [inputMessage, setInputMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

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
    if(!selectedConveresationId || !selectedUser || !orgData) return;

    const messageData = {
      conversationId: selectedConveresationId,
      text: inputMessage,
      receiverId : selectedUser,
      senderId : orgData._id
    };

    const res = await axiosInstance.post('/recuriter/sendMessage', messageData);
    console.log(res)
    setInputMessage("");
    setSelectedFile(null);
  };


  return (
    <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
      {/* File preview */}
      {selectedFile && (
        <div className="mb-2 flex items-center justify-between bg-blue-100 px-3 py-2 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-700 truncate">
            <Paperclip size={16} className="text-blue-600" />
            {selectedFile.name}
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Remove file"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-center gap-2">
        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt"
        />

        {/* File Upload Button */}
        <button
          onClick={() => fileInputRef.current.click()}
          className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          aria-label="Attach file"
        >
          <Paperclip size={20} />
        </button>

        {/* Emoji Picker */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            onClick={() => setShowEmojiPicker((prev) => !prev)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            aria-label="Add emoji"
          >
            <Smile size={20} />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-10 shadow-lg">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                width={300}
                height={400}
                theme="light"
              />
            </div>
          )}
        </div>

        {/* Message Input */}
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 p-3 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!inputMessage.trim() && !selectedFile}
          className={`p-2 rounded-full transition ${inputMessage.trim() || selectedFile
            ? "bg-blue-500 text-white hover:bg-blue-600"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          aria-label="Send message"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
