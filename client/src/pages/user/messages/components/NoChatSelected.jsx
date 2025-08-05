import { MessageSquare } from "lucide-react";
import MesdoLogo from "../../../../assets/mesdo_logo.png";

const NoChatSelected = () => {
  return (
    <div className="w-full min-h-0 flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm">
      <div className="bg-white max-w-md w-full mx-auto flex flex-col items-center py-16 px-8 space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center mb-[-10px]">
          <div className="w-28 h-28 rounded-full bg-gray-50 flex items-center justify-center shadow-sm">
            <img src={MesdoLogo} alt="Mesdo Logo" className="w-24 h-24" />
          </div>
        </div>
        {/* Welcome Text */}
        <h2 className="text-2xl font-semibold text-gray-900 text-center">
          Welcome to Mesdo Messages
        </h2>
        <p className="text-base text-gray-500 text-center leading-relaxed max-w-sm">
          Your chats will appear here. Start a new conversation!
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
