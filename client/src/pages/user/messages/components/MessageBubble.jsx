import { MoreVertical } from "lucide-react";

const MessageBubble = ({ message, selectedUser }) => {
  return (
    <div
      className={`flex items-start gap-3 ${
        message.type === "sent" ? "flex-row-reverse" : ""
      }`}
    >
      <div className="relative">
        <img
          src={
            message.type === "sent"
              ? "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150"
              : selectedUser.image
          }
          alt={message.sender}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
      </div>
      <div
        className={`flex flex-col ${
          message.type === "sent" ? "items-end" : ""
        } gap-1`}
      >
        <div className="flex items-center gap-2">
          {message.type === "sent" ? (
            <>
              <span className="text-sm text-gray-500">{message.time}</span>
              <span className="font-semibold">{message.sender}</span>
            </>
          ) : (
            <>
              <span className="font-semibold">{message.sender}</span>
              <span className="text-sm text-gray-500">{message.time}</span>
              <MoreVertical className="w-5 h-5 text-gray-400 cursor-pointer" />
            </>
          )}
        </div>
        <div
          className={`${
            message.type === "sent" ? "bg-blue-500 text-white" : "bg-gray-100"
          } rounded-lg p-3 max-w-[600px]`}
        >
          <p>{message.text}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;