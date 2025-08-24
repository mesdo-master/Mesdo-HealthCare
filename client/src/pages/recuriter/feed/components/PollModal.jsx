import React, { useState } from "react";
import {
  X,
  BarChart3,
  FileText,
  MessageSquare,
  ChevronDown,
} from "lucide-react";

const PollModal = ({
  isOpen,
  onClose,
  userProfile,
  activeTab,
  onTabChange,
  onNewPoll,
}) => {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [duration, setDuration] = useState("1 week");
  const [showPreview, setShowPreview] = useState(false);

  if (!isOpen) return null;

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleSaveAndContinue = () => {
    setShowPreview(true);
  };

  const handlePost = () => {
    // Create poll data
    const pollData = {
      question,
      options: options.filter((opt) => opt.trim()),
      duration,
    };

    // Call the onNewPoll function
    onNewPoll(pollData);

    // Close modal and reset state
    onClose();
    setQuestion("");
    setOptions(["", ""]);
    setDuration("1 week");
    setShowPreview(false);
  };

  if (showPreview) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          {/* Preview Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2
              className="text-blue-600"
              style={{
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 400,
                fontSize: "18px",
                lineHeight: "100%",
                letterSpacing: "0px",
                color: "#1890FF",
              }}
            >
              Share With...
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Preview Content */}
          <div className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              <img
                src={
                  userProfile?.profilePicture ||
                  "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
                }
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div className="flex-1">
                <p
                  className="text-gray-600 mb-4"
                  style={{ fontSize: "16px", lineHeight: "140%" }}
                >
                  Share your knowledge .....
                </p>

                {/* Poll Preview */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Poll Title
                  </h3>
                  <div className="space-y-3">
                    {options
                      .filter((opt) => opt.trim())
                      .map((option, index) => (
                        <div
                          key={index}
                          className="border border-blue-300 rounded-lg p-3 text-center"
                          style={{ color: "#1890FF" }}
                        >
                          {option || `Option ${index + 1}`}
                        </div>
                      ))}
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <button
                      className="text-blue-600"
                      style={{ color: "#1890FF", fontSize: "14px" }}
                    >
                      View Results
                    </button>
                    <span className="text-gray-400 text-sm">
                      {duration} left
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center space-x-4">
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <FileText className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center space-x-4">
                {/* Case Toggle */}
                <div className="flex items-center space-x-3">
                  <span
                    className="text-gray-700"
                    style={{ fontSize: "14px", fontWeight: 500 }}
                  >
                    Case
                  </span>
                  <button
                    onClick={() =>
                      onTabChange(activeTab === "case" ? "feed" : "case")
                    }
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                      activeTab === "case" ? "bg-gray-400" : "bg-gray-300"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                        activeTab === "case" ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    style={{ fontSize: "14px", fontWeight: 500 }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePost}
                    className="px-6 py-2 rounded-lg text-white transition-colors"
                    style={{
                      backgroundColor: "#1890FF",
                      fontSize: "14px",
                      fontWeight: 500,
                    }}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2
            className="text-blue-600"
            style={{
              fontFamily:
                'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              fontWeight: 400,
              fontSize: "18px",
              lineHeight: "100%",
              letterSpacing: "0px",
              color: "#1890FF",
            }}
          >
            Share With...
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Question Input */}
          <div className="mb-6">
            <label
              className="block text-gray-700 font-medium mb-3"
              style={{ fontSize: "14px" }}
            >
              Your Question
            </label>
            <input
              type="text"
              placeholder='Eg: "Your Question"'
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-300 transition-colors"
              style={{
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontSize: "14px",
              }}
            />
          </div>

          {/* Options */}
          <div className="mb-6">
            {options.map((option, index) => (
              <div key={index} className="mb-4">
                <label
                  className="block text-gray-700 font-medium mb-2"
                  style={{ fontSize: "14px" }}
                >
                  Option {index + 1}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder='Eg: "Your Question"'
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="flex-1 p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-300 transition-colors"
                    style={{ fontSize: "14px" }}
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => removeOption(index)}
                      className="text-red-500 hover:text-red-700 px-2"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={addOption}
              className="text-blue-600 hover:text-blue-700 font-medium"
              style={{ color: "#1890FF", fontSize: "14px" }}
            >
              Add Option
            </button>
          </div>

          {/* Duration */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label
                className="block text-gray-700 font-medium"
                style={{ fontSize: "14px" }}
              >
                Poll Duration
              </label>
              <button
                className="text-blue-600 hover:text-blue-700 font-medium"
                style={{ color: "#1890FF", fontSize: "14px" }}
              >
                Add Duration
              </button>
            </div>
            <div className="relative">
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-300 transition-colors appearance-none bg-white"
                style={{ fontSize: "14px" }}
              >
                <option value="1 day">1 day</option>
                <option value="3 days">3 days</option>
                <option value="1 week">1 week</option>
                <option value="2 weeks">2 weeks</option>
                <option value="1 month">1 month</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <BarChart3 className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <FileText className="w-5 h-5" />
              </button>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Case Toggle */}
              <div className="flex items-center space-x-3">
                <span
                  className="text-gray-700"
                  style={{
                    fontFamily:
                      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: "100%",
                    letterSpacing: "0px",
                  }}
                >
                  Case
                </span>
                <button
                  onClick={() =>
                    onTabChange(activeTab === "case" ? "feed" : "case")
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    activeTab === "case" ? "bg-gray-400" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      activeTab === "case" ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  style={{
                    fontFamily:
                      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAndContinue}
                  disabled={
                    !question.trim() ||
                    options.filter((opt) => opt.trim()).length < 2
                  }
                  className="px-6 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: "#1890FF",
                    fontFamily:
                      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  Save & Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollModal;
