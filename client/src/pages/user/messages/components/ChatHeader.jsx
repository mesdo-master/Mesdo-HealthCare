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
  otherUserProfile,
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
  // Debug logs
  console.log("🔍 ChatHeader Debug:", {
    selectedUser,
    otherUserProfile,
    conversation,
    isGroupChat: conversation?.isGroup,
    conversationOtherParticipant: conversation?.otherParticipant,
    profilePicture:
      otherUserProfile?.profilePicture ||
      otherUserProfile?.profilePic ||
      conversation?.otherParticipant?.profilePicture ||
      conversation?.otherParticipant?.profilePic ||
      selectedUser?.profilePicture ||
      selectedUser?.profilePic,
    userName:
      otherUserProfile?.name ||
      conversation?.otherParticipant?.name ||
      selectedUser?.name,
    piimage,
    // Additional debug for the user console data
    rawConversationData: conversation,
    allAvailableProfilePicFields: {
      'otherUserProfile?.profilePicture': otherUserProfile?.profilePicture,
      'otherUserProfile?.profilePic': otherUserProfile?.profilePic,
      'conversation?.otherParticipant?.profilePicture': conversation?.otherParticipant?.profilePicture,
      'conversation?.otherParticipant?.profilePic': conversation?.otherParticipant?.profilePic,
      'conversation?.otherParticipant?.piimage': conversation?.otherParticipant?.piimage,
      'selectedUser?.profilePicture': selectedUser?.profilePicture,
      'selectedUser?.profilePic': selectedUser?.profilePic,
      'selectedUser?.piimage': selectedUser?.piimage,
      'conversation?.conversationOtherParticipant?.profilePicture': conversation?.conversationOtherParticipant?.profilePicture,
      'conversation?.piimage': conversation?.piimage,
      'selectedUser as whole': selectedUser,
      'conversation?.otherParticipant as whole': conversation?.otherParticipant,
    }
  });

  // Additional debug for image source
  const isGroupChat = conversation?.isGroup;
  // Get the actual profile picture URL with comprehensive fallback chain
  const getProfilePictureUrl = () => {
    if (isGroupChat) {
      return conversation?.avatar || piimage;
    }
    
    // Try all possible sources for the other user's profile picture
    // Based on the user's console log data structure
    return (
      // From fetched other user profile
      otherUserProfile?.profilePicture ||
      otherUserProfile?.profilePic ||
      // From conversation other participant
      conversation?.otherParticipant?.profilePicture ||
      conversation?.otherParticipant?.profilePic ||
      conversation?.otherParticipant?.piimage ||
      // From conversation level (based on user's data structure)
      conversation?.piimage ||
      conversation?.conversationOtherParticipant?.profilePicture ||
      conversation?.conversationOtherParticipant?.piimage ||
      // From selected user (if available)
      selectedUser?.profilePicture ||
      selectedUser?.profilePic ||
      selectedUser?.piimage ||
      // Fallback to default
      piimage
    );
  };
  
  const imageSource = getProfilePictureUrl();

  console.log("🔍 Image source debug:", {
    isGroupChat,
    finalImageSource: imageSource,
    otherUserProfilePicture: otherUserProfile?.profilePicture,
    otherUserProfilePic: otherUserProfile?.profilePic,
    conversationOtherParticipantPicture:
      conversation?.otherParticipant?.profilePicture,
    conversationOtherParticipantPic: conversation?.otherParticipant?.profilePic,
    conversationOtherParticipantPiimage: conversation?.otherParticipant?.piimage,
    selectedUserPicture: selectedUser?.profilePicture,
    selectedUserPic: selectedUser?.profilePic,
    selectedUserPiimage: selectedUser?.piimage,
    fallbackImage: piimage,
  });

  // console.log(conversation)

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
              src={imageSource}
              alt={
                isGroupChat
                  ? conversation?.name
                  : otherUserProfile?.name ||
                    conversation?.otherParticipant?.name ||
                    selectedUser?.name ||
                    "other user profile pic"
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
                  : otherUserProfile?.name ||
                    conversation?.otherParticipant?.name ||
                    selectedUser?.name ||
                    "Unknown User"}
              </h2>
              {isPinned && (
                <Pin className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              )}
              {isMuted && <BellOff className="w-4 h-4 text-gray-500" />}
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
                {isPinned ? "Unpin" : "Pin to top"} <Pin className="w-5 h-5" />
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
                {isMuted ? "Unmute" : "Mute"} <BellOff className="w-5 h-5" />
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
