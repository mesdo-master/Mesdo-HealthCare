import React, { useState, useRef, useEffect } from "react";
import {
  BarChart3,
  Image as ImageIcon,
  MessageSquare,
  User,
  ChevronDown,
} from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import CaseCreateModal from "./CaseCreateModal";

const CaseCreatePost = ({
  userProfile,
  activeTab,
  onTabChange,
  onNewPost,
  onNewCase,
  resultsCount = 1202, // Add prop for results count
  sortBy = "Recommended", // Add prop for sort option
  onSortChange, // Add prop for sort change handler
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleTextareaClick = () => {
    setShowModal(true);
  };

  const handleNewCaseLocal = (caseData) => {
    if (onNewCase) {
      onNewCase(caseData);
    }
  };

  const handleFilesSelected = (e) => {
    setShowModal(true);
    setTimeout(() => {
      const event = new CustomEvent("create-post-preselect-files", {
        detail: { files: Array.from(e.target.files || []) },
      });
      window.dispatchEvent(event);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 0);
  };

  const sortOptions = [
    "Recommended",
    "Most Recent",
    "Most Popular",
    "Most Discussed",
  ];

  const handleSortSelect = (option) => {
    if (onSortChange) {
      onSortChange(option);
    }
    setShowSortDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    };

    if (showSortDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showSortDropdown]);

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start space-x-4">
          <img
            src={
              userProfile?.orgLogo ||
              userProfile?.profilePicture ||
              "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
            }
            alt="Profile"
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1">
            <div
              onClick={handleTextareaClick}
              className="w-full mt-4 cursor-pointer"
            >
              <span
                className="text-gray-400"
                style={{
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: "14px",
                  lineHeight: "100%",
                  letterSpacing: "0px",
                }}
              >
                Share your knowledge .....
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowCaseModal(true)}
            >
              <User className="w-5 h-5" />
            </button>

            {/* Gallery Upload */}
            <label className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <ImageIcon className="w-5 h-5" />
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFilesSelected}
                accept="image/*,application/pdf,.doc,.docx"
              />
            </label>
          </div>

          {/* Case Toggle - Clickable to switch back to Feed */}
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
              onClick={() => onTabChange("feed")}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition-colors duration-200 hover:bg-blue-600"
            >
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>

      {/* Results Count and Sort By Section */}
      <div className="flex items-center justify-between mb-6">
        <span
          className="text-gray-600"
          style={{
            fontFamily:
              'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: 400,
            fontSize: "14px",
            lineHeight: "100%",
            letterSpacing: "0px",
          }}
        >
          Showing {resultsCount} results
        </span>

        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center space-x-2">
            <span
              className="text-gray-600"
              style={{
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: "100%",
                letterSpacing: "0px",
              }}
            >
              Sort by:
            </span>
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors"
              style={{
                fontFamily:
                  'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                fontWeight: 500,
                fontSize: "14px",
                lineHeight: "100%",
                letterSpacing: "0px",
              }}
            >
              <span>{sortBy}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Dropdown Menu */}
          {showSortDropdown && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg border border-gray-200 shadow-lg z-10">
              <div className="py-1">
                {sortOptions.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleSortSelect(option)}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                      option === sortBy
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    style={{
                      fontFamily:
                        'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      fontWeight: option === sortBy ? 500 : 400,
                      fontSize: "14px",
                      lineHeight: "100%",
                      letterSpacing: "0px",
                    }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Post Modal (regular feed post creation) */}
      <CreatePostModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userProfile={userProfile}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onNewPost={onNewPost}
        onNewCase={handleNewCaseLocal}
      />

      {/* Case Create Modal (for structured case posts) */}
      <CaseCreateModal
        isOpen={showCaseModal}
        onClose={() => setShowCaseModal(false)}
        userProfile={userProfile}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onNewCase={handleNewCaseLocal}
      />
    </>
  );
};

export default CaseCreatePost;
