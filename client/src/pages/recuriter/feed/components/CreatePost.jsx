import React, { useState, useRef } from "react";
import { BarChart3, Image as ImageIcon, MessageSquare } from "lucide-react";
import CreatePostModal from "./CreatePostModal";
import PollModal from "./PollModal";

const CreatePost = ({
  userProfile,
  activeTab,
  onTabChange,
  onNewPost,
  onNewPoll,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const fileInputRef = useRef(null);

  const handleTextareaClick = () => {
    setShowModal(true);
  };

  const handlePollClick = () => {
    setShowPollModal(true);
  };

  const handleFilesSelected = (e) => {
    // Open modal immediately with selected files
    setShowModal(true);
    // Defer attaching files to modal via a small timeout so modal mounts first
    setTimeout(() => {
      const event = new CustomEvent("create-post-preselect-files", {
        detail: { files: Array.from(e.target.files || []) },
      });
      window.dispatchEvent(event);
      // Reset input so same file can be selected again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }, 0);
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start">
          <div className="flex-1">
            <div
              onClick={handleTextareaClick}
              className="w-full mt-2 cursor-pointer"
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

        <div className="flex items-center justify-between mt-8 mb-[-2px]">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center space-x-4">
              <button
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={handlePollClick}
              >
                <BarChart3 className="w-5 h-5" />
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

              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Simple Toggle Switch (indicator only) */}
          <div className="flex items-center space-x-3 select-none">
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
            <div
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                activeTab === "case" ? "bg-blue-400" : "bg-gray-300"
              }`}
              aria-hidden="true"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                  activeTab === "case" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        userProfile={userProfile}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onNewPost={onNewPost}
      />

      {/* Poll Modal */}
      <PollModal
        isOpen={showPollModal}
        onClose={() => setShowPollModal(false)}
        userProfile={userProfile}
        activeTab={activeTab}
        onTabChange={onTabChange}
        onNewPoll={onNewPoll}
      />
    </>
  );
};

export default CreatePost;
