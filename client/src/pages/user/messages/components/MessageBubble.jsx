import { MoreVertical } from "lucide-react";

const MessageBubble = ({ message, selectedUser }) => {
  return (
    <div
      className={`flex items-start gap-3 mb-3 ${
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
          className="w-10 h-10 rounded-full object-cover shadow-md border border-gray-200"
        />
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white"></div>
      </div>
      <div
        className={`flex flex-col ${
          message.type === "sent" ? "items-end" : ""
        } gap-1`}
      >
        <div className="flex items-center gap-2">
          {message.type === "sent" ? (
            <>
              <span className="text-xs text-gray-400">{message.time}</span>
              <span className="font-semibold text-gray-700">
                {message.sender}
              </span>
            </>
          ) : (
            <>
              <span className="font-semibold text-gray-700">
                {message.sender}
              </span>
              <span className="text-xs text-gray-400">{message.time}</span>
              <MoreVertical className="w-5 h-5 text-gray-300 cursor-pointer" />
            </>
          )}
        </div>
        <div
          className={`${
            message.type === "sent"
              ? "bg-blue-100 text-gray-900 rounded-xl shadow-md"
              : "bg-gray-100 text-gray-900 rounded-xl shadow"
          } px-4 py-2 max-w-[70vw] min-w-[60px]`}
        >
          <p className="break-words whitespace-pre-line">{message.text}</p>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
