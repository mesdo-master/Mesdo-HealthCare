import React from "react";
import mesdoLogo from "../assets/mesdo_logo.png";

const Loader = ({ size = "medium", text = "Loading..." }) => {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Animated Logo */}
      <div className="relative">
        <img
          src={mesdoLogo}
          alt="Mesdo"
          className={`${sizeClasses[size]} animate-pulse object-contain`}
        />
        {/* Pulsing ring effect */}
        <div className="absolute inset-0 rounded-full border-2 border-blue-500 animate-ping opacity-20"></div>
        <div
          className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-10"
          style={{ animationDelay: "0.5s" }}
        ></div>
      </div>

      {/* Loading text */}
      {text && (
        <div className="text-center">
          <p className="text-gray-600 font-medium text-sm">{text}</p>
          {/* Animated dots */}
          <div className="flex justify-center space-x-1 mt-2">
            <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
            <div
              className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Loader;
