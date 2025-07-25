import { useState, useEffect, useRef } from "react";
import {
  MoreVertical,
  X,
  Pin,
  User,
  BellOff,
  Trash2,
  Eraser,
} from "lucide-react";

const ChatHeader = ({
  selectedUser,
  onProfileClick,
  piimage,
  conversation,
  onCloseChat,
  onPinConversation,
  onMuteConversation,
  onClearMessages,
  onDeleteConversation,
  isPinned = false,
  isMuted = false,
}) => {
  // console.log(conversation)
  const isGroupChat = conversation?.isGroup;

  const formatLastMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "";

    const now = new Date();
    const dateStr = date.toLocaleDateString();
    const nowStr = now.toLocaleDateString();

    if (dateStr === nowStr) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yestStr = yesterday.toLocaleDateString();

    if (dateStr === yestStr) {
      return "Yesterday";
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClick);
    } else {
      document.removeEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center cursor-pointer"
          onClick={onProfileClick}
        >
          <div className="relative">
            <img
              src={
                isGroupChat
                  ? conversation?.avatar || piimage
                  : conversation?.otherParticipant?.profilePicture || piimage
              }
              alt={
                isGroupChat
                  ? conversation?.name
                  : selectedUser?.name || "other user profile pic"
              }
              className="w-12 h-12 rounded-full object-cover"
            />
            {!isGroupChat && selectedUser?.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="ml-3">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-base">
                {isGroupChat
                  ? conversation?.name || "Unnamed Group"
                  : conversation?.otherParticipant?.name}
              </h2>
              {isPinned && (
                <Pin className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              )}
              {isMuted && (
                <BellOff className="w-4 h-4 text-gray-500" />
              )}
            </div>
            <p className="text-sm text-gray-500">
              {isGroupChat
                ? `${conversation?.participants?.length || 0} members`
                : conversation?.lastMessageTime
                ? `Last seen ${formatLastMessageTime(
                    conversation.lastMessageTime
                  )}`
                : "Last seen today"}
            </p>
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            className="p-1.5 rounded-full bg-white/80 hover:bg-gray-100 border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreVertical className="w-5 h-5 text-gray-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in-0 zoom-in-95">
              <button 
                onClick={() => {
                  onCloseChat && onCloseChat();
                  setMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 font-normal"
              >
                Close Chat <X className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  onPinConversation && onPinConversation(conversation);
                  setMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 font-normal"
              >
                {isPinned ? 'Unpin' : 'Pin to top'} <Pin className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  onProfileClick && onProfileClick();
                  setMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 font-normal"
              >
                View Profile <User className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  onMuteConversation && onMuteConversation(conversation);
                  setMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 font-normal"
              >
                {isMuted ? 'Unmute' : 'Mute'} <BellOff className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  onClearMessages && onClearMessages(conversation);
                  setMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-2 text-[15px] text-gray-700 hover:bg-gray-50 font-normal"
              >
                Clear Messages <Eraser className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  onDeleteConversation && onDeleteConversation(conversation);
                  setMenuOpen(false);
                }}
                className="flex items-center justify-between w-full px-4 py-2 text-[15px] text-red-600 hover:bg-red-50 font-normal"
              >
                Delete <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
