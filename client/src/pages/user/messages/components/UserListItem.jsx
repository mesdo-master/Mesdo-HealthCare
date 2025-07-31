import { Users } from "lucide-react";
import { useNotifications } from "../../../../context/NotificationContextFinal";

const UserListItem = ({ user, selectedUser, onClick }) => {
  const { unreadConversations } = useNotifications();
  const isGroup = user?.isGroup;
  const conversationId = user._id || user.id;
  const hasUnreadMessages = unreadConversations.has(conversationId);

  const truncateMessage = (message) => {
    if (!message) return "No messages yet";
    const words = message.split(" ");
    return words.length <= 4 ? message : words.slice(0, 4).join(" ") + "...";
  };

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
    <div
      onClick={onClick}
      className={`flex items-center py-3 px-4 cursor-pointer hover:bg-gray-50 ${
        selectedUser?.id === user.id ? "bg-gray-50" : ""
      } ${hasUnreadMessages ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
    >
      <div className="relative">
        <img
          src={
            isGroup
              ? user.avatar ||
                "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
              : user.otherParticipant?.profilePicture || user.otherParticipant?.orgLogo ||
                "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
          }
          alt={isGroup ? user.name : user.otherParticipant?.name}
          className="w-12 h-12 rounded-full object-cover"
        />

        {!isGroup && user.otherParticipant?.online && (
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        )}

        {isGroup && (
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
            <Users size={12} className="text-white" />
          </div>
        )}
      </div>

      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold text-base ${hasUnreadMessages ? 'text-blue-600' : ''}`}>
            {isGroup ? user.name : user.otherParticipant?.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {formatLastMessageTime(user.lastMessageTime)}
            </span>
            {hasUnreadMessages && (
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
        <p className={`text-sm truncate ${hasUnreadMessages ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
          {truncateMessage(user.lastMessage)}
        </p>
      </div>
    </div>
  );
};

export default UserListItem;
