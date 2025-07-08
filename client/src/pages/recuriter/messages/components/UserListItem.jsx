
const UserListItem = ({ user, selectedUser, onClick }) => {
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
      className={`flex items-center py-3 px-4 cursor-pointer hover:bg-gray-50 ${selectedUser?.id === user.id ? "bg-gray-50" : ""
        }`}
    >
      <div className="relative">
        <img
          src={user.otherParticipant.profilePicture}
          alt={user.otherParticipant.name}
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">{user.otherParticipant.name}</h3>
          <span className="text-sm text-gray-500">{formatLastMessageTime(user.lastMessageTime)}</span>
        </div>
        <p className="text-gray-500 text-sm truncate">{user.lastMessage}</p>
      </div>
    </div>
  );
};
export default UserListItem;