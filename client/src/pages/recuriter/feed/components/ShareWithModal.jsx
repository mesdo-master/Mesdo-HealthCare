import React, { useState } from "react";
import { X, Check, Users, UserCheck, Heart } from "lucide-react";

const ShareWithModal = ({
  isOpen,
  onClose,
  onShareWithSelect,
  selectedShareWith = [],
}) => {
  if (!isOpen) return null;

  const shareOptions = [
    {
      id: "everyone",
      name: "Everyone",
      icon: Users,
      description: "Public post visible to all",
    },
    {
      id: "connections",
      name: "Only Connections",
      icon: UserCheck,
      description: "Only your connections can see this",
    },
  ];

  const followedGroups = [
    {
      id: "dentist",
      name: "Dentist",
      icon: Heart,
      color: "text-purple-500",
    },
    {
      id: "gynaecologist",
      name: "Gynaecologist",
      icon: Heart,
      color: "text-pink-500",
    },
    {
      id: "ent",
      name: "ENT",
      icon: Heart,
      color: "text-green-500",
    },
  ];

  const handleOptionClick = (optionId) => {
    let updatedOptions;
    if (selectedShareWith.includes(optionId)) {
      // Remove option if already selected
      updatedOptions = selectedShareWith.filter(
        (option) => option !== optionId
      );
    } else {
      // Add option if not selected
      updatedOptions = [...selectedShareWith, optionId];
    }
    onShareWithSelect(updatedOptions);
  };

  const getSelectedText = () => {
    const count = selectedShareWith.length;
    if (count === 0) return "Everyone & 2 Groups";
    if (count === 1) {
      const selected = [...shareOptions, ...followedGroups].find(
        (option) => option.id === selectedShareWith[0]
      );
      return selected ? selected.name : "Selected";
    }
    return `${count} Selected`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[10000] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">
              Share with audience
            </h3>
            <p className="text-xs text-gray-500 mt-1">Selected</p>
            <p className="text-xs text-gray-600 font-medium">
              {getSelectedText()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Options */}
        <div className="p-4">
          <div className="space-y-1">
            {shareOptions.map((option) => {
              const IconComponent = option.icon;
              return (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.id)}
                  className="w-full flex items-center justify-between px-3 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700 text-sm font-medium">
                      {option.name}
                    </span>
                  </div>
                  {selectedShareWith.includes(option.id) && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}

            {/* Followed Groups Section */}
            <div className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Followed Groups
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Note: This post/case will be visible to everyone in the group.
              </p>

              {followedGroups.map((group) => {
                const IconComponent = group.icon;
                return (
                  <button
                    key={group.id}
                    onClick={() => handleOptionClick(group.id)}
                    className="w-full flex items-center justify-between px-3 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className={`w-5 h-5 ${group.color}`} />
                      <span className="text-gray-700 text-sm font-medium">
                        {group.name}
                      </span>
                    </div>
                    {selectedShareWith.includes(group.id) && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareWithModal;
