import { MoreVertical } from "lucide-react";

const ChatHeader = ({
  selectedUser,
  onProfileClick,
  piimage,
  conversation,
}) => {
  console.log(conversation,selectedUser)
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
              alt={isGroupChat ? conversation?.name : selectedUser?.name || "other user profile pic"}
              className="w-12 h-12 rounded-full object-cover"
            />
            {!isGroupChat && selectedUser?.online && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div className="ml-3">
            <h2 className="font-semibold text-base">
              {isGroupChat
                ? conversation?.name || "Unnamed Group"
                : conversation?.otherParticipant?.name }
            </h2>
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
        <MoreVertical className="w-6 h-6 text-gray-600 cursor-pointer" />
      </div>
    </div>
  );
};

export default ChatHeader;
