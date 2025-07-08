import React from "react";

const chatUsers = [
  { id: 1, name: "Malga Chandrashekar", lastMessage: "I will", time: "4 days ago", online: true },
  { id: 2, name: "Vishal Shevale", lastMessage: "Sent an attachment", time: "Jan 30", online: false },
  { id: 3, name: "Aman Purohit", lastMessage: "Ok", time: "Jan 29", online: true },
];

const ChatList = ({ onSelectChat }) => {
  return (
    <div className="w-1/3 bg-white p-4 shadow-md overflow-y-auto">
      <h2 className="text-xl font-semibold mb-4">Messages</h2>
      {chatUsers.map((user) => (
        <div
          key={user.id}
          className="flex items-center p-3 hover:bg-gray-200 cursor-pointer rounded-lg"
          onClick={() => onSelectChat(user)}
        >
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="font-semibold">{user.name}</h3>
            <p className="text-gray-500 text-sm truncate">{user.lastMessage}</p>
          </div>
          <span className="text-gray-400 text-xs">{user.time}</span>
          {user.online && <div className="w-3 h-3 bg-green-500 rounded-full ml-2"></div>}
        </div>
      ))}
    </div>
  );
};

export default ChatList;
