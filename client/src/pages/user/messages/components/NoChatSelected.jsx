import { MessageSquare } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full min-h-0 flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50">
      <div className="backdrop-blur-md bg-white/70  border-blue-100 rounded-2xl shadow-xl max-w-sm w-full mx-auto flex flex-col items-center py-8 px-4 sm:px-8 space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center mb-1 animate-bounce-slow">
          <div className="w-14 h-14 rounded-xl bg-white border border-blue-100 flex items-center justify-center shadow">
            <MessageSquare className="w-7 h-7 text-blue-300" />
          </div>
        </div>
        {/* Welcome Text */}
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 tracking-tight drop-shadow-sm">
          Welcome to Mesdo
        </h2>
        <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed">
          Select a conversation to start chatting.
          <br />
          Your messages will appear here.
        </p>
      </div>
      <style jsx>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default NoChatSelected;
