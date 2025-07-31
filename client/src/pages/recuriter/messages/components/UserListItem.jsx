import { useNotifications } from "../../../../context/NotificationContextFinal";

const UserListItem = ({ user, selectedId, onClick }) => {
  const { unreadConversations } = useNotifications();
  const conversationId = user._id || user.id;
  const hasUnreadMessages = unreadConversations.has(conversationId);
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
        selectedId === (user._id || user.id) ? "bg-blue-50 border-r-2 border-blue-500" : ""
      } ${hasUnreadMessages ? "bg-blue-50 border-l-4 border-blue-500" : ""}`}
    >
      <div className="relative">
        <img
          src={
            user.otherParticipant?.profilePicture ||
            "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
          }
          alt={user.otherParticipant?.name || "User"}
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <h3 className={`font-semibold ${hasUnreadMessages ? 'text-blue-600' : ''}`}>
            {user.otherParticipant?.name || "Unknown User"}
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
          {user.lastMessage || "No messages yet"}
        </p>
      </div>
    </div>
  );
};

export default UserListItem;
