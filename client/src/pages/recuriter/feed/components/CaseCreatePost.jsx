import React, { useState, useRef } from "react";
import {
  BarChart3,
  Image as ImageIcon,
  MessageSquare,
  User,
} from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import CaseCreateModal from "./CaseCreateModal";

const CaseCreatePost = ({
  userProfile,
  activeTab,
  onTabChange,
  onNewPost,
  onNewCase,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showCaseModal, setShowCaseModal] = useState(false);
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
