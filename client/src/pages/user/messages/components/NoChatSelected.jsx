import { MessageSquare } from "lucide-react";
import MesdoLogo from "../../../../assets/mesdo_logo.png";

const NoChatSelected = () => {
  return (
    <div className="w-full min-h-0 flex-1 flex items-center justify-center bg-white">
      <div className="bg-white max-w-sm w-full mx-auto flex flex-col items-center py-12 px-6 space-y-4">
        {/* Icon Display */}
        <div className="flex justify-center mb-[-10px]">
          <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center">
            <img src={MesdoLogo} alt="Mesdo Logo" className="w-22 h-22" />
          </div>
        </div>
        {/* Welcome Text */}
        <h2 className="text-xl font-semibold text-gray-900 text-center">
          Welcome to Mesdo Messages
        </h2>
        <p className="text-sm text-gray-500 text-center leading-relaxed max-w-xs">
          Your chats will appear here. Start a new conversation!
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
