import React, { useState } from "react";
import {
  X,
  BarChart3,
  FileText,
  MessageSquare,
  User,
  ChevronDown,
} from "lucide-react";
import CaseCreateModal from "./CaseCreateModal";
import ShareWithModal from "./ShareWithModal";

const CreatePostModal = ({
  isOpen,
  onClose,
  userProfile,
  activeTab,
  onTabChange,
  onNewPost,
  onNewCase,
}) => {
  const [postContent, setPostContent] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [selectedShareWith, setSelectedShareWith] = useState([]);
  const [showShareWithModal, setShowShareWithModal] = useState(false);

  React.useEffect(() => {
    const listener = (e) => {
      if (Array.isArray(e.detail?.files)) {
        setSelectedFiles((prev) => [...prev, ...e.detail.files]);
      }
    };
    window.addEventListener("create-post-preselect-files", listener);
    return () => window.removeEventListener("create-post-files", listener);
  }, []);

  if (!isOpen) return null;

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles([...selectedFiles, ...files]);
  };

  const handleShareWithSelect = (shareWith) => {
    setSelectedShareWith(shareWith);
  };

  const handlePost = () => {
    if (!postContent.trim()) return;

    // Extract hashtags from content
    const hashtags = postContent.match(/#\w+/g) || [];

    // Create post data
    const postData = {
      content: postContent,
      images: selectedFiles.map((file) => URL.createObjectURL(file)), // Create preview URLs
      hashtags: hashtags,
      shareWith: selectedShareWith,
      type: "text",
    };

    // Call the onNewPost function
    onNewPost(postData);

    // Close modal and reset state
    onClose();
    setPostContent("");
    setSelectedFiles([]);
  };

  const removeFile = (index) => {
    setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
  };

  const getShareWithLabel = () => {
    if (!selectedShareWith || selectedShareWith.length === 0) return "Everyone";
    if (selectedShareWith.length === 1)
      return selectedShareWith[0].replace(/^[a-z]/, (m) => m.toUpperCase());
    return `${selectedShareWith.length} Selected`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex flex-col">
            <span className="text-[11px] text-gray-500 leading-none">
              Share With
            </span>
            <button
              onClick={() => setShowShareWithModal(true)}
              className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
              style={{ color: "#1890FF" }}
            >
              <span className="text-sm font-medium">{getShareWithLabel()}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
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
              <textarea
                placeholder="Share your knowledge ....."
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full resize-none border-none outline-none text-gray-600 placeholder-gray-400 bg-transparent min-h-[200px]"
                style={{
                  fontFamily:
                    'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  fontWeight: 400,
                  fontSize: "16px",
                  lineHeight: "140%",
                  letterSpacing: "0px",
                }}
              />
            </div>
          </div>

          {/* File Preview */}
          {selectedFiles.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs text-gray-600 text-center px-2">
                          {file.name}
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Section */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              {/* Only show User icon in Case mode */}
              {activeTab === "case" && (
                <button
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowCaseModal(true)}
                >
                  <User className="w-5 h-5" />
                </button>
              )}

              <label className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
                <FileText className="w-5 h-5" />
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,application/pdf,.doc,.docx"
                />
              </label>
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
                  }}
                >
                  Case
                </span>
                <button
                  onClick={() =>
                    onTabChange(activeTab === "case" ? "feed" : "case")
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    activeTab === "case" ? "bg-blue-500" : "bg-gray-300"
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
                  style={{ fontWeight: 500, fontSize: "14px" }}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePost}
                  disabled={!postContent.trim()}
                  className="px-6 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: "#1890FF",
                    fontWeight: 500,
                    fontSize: "14px",
                  }}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Case Create Modal */}
        <CaseCreateModal
          isOpen={showCaseModal}
          onClose={() => setShowCaseModal(false)}
          userProfile={userProfile}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onNewCase={onNewCase}
        />

        {/* Share With Modal */}
        <ShareWithModal
          isOpen={showShareWithModal}
          onClose={() => setShowShareWithModal(false)}
          onShareWithSelect={handleShareWithSelect}
          selectedShareWith={selectedShareWith}
        />
      </div>
    </div>
  );
};

export default CreatePostModal;
