import React, { useState } from "react";

const ChatWindow = ({ chat }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: "Malga", text: "Sure", time: "12:57 AM", type: "received" },
    { id: 2, sender: "Malga", text: "I will", time: "12:58 AM", type: "received" },
    { id: 3, sender: "You", text: "Please share your resume.", time: "6:35 AM", type: "sent" },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: "You", text: input, time: "Now", type: "sent" }]);
    setInput("");
  };

  return (
    <div className="w-2/3 bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center">
        <h2 className="text-lg font-semibold flex-1">{chat.name}</h2>
        <span className="text-green-500">{chat.online ? "Online" : "Offline"}</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`mb-2 flex ${msg.type === "sent" ? "justify-end" : "justify-start"}`}>
            <div className={`p-2 rounded-lg ${msg.type === "sent" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
              <p>{msg.text}</p>
              <small className="text-xs text-gray-400">{msg.time}</small>
            </div>
          </div>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-4 border-t flex items-center">
        <button className="mr-2 text-gray-500">📎</button>
        <input
          type="text"
          className="flex-1 border rounded-lg px-4 py-2"
          placeholder="Write a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg">
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
