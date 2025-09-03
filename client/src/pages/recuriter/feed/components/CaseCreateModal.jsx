import React, { useState } from "react";
import { X, User, BarChart3, Image } from "lucide-react";
import CaseCategoryModal from "./CaseCategoryModal";
import ShareWithModal from "./ShareWithModal";

const CaseCreateModal = ({
  isOpen,
  onClose,
  userProfile,
  activeTab,
  onTabChange,
  onNewCase,
}) => {
  const [formData, setFormData] = useState({
    heading: "",
    patientAge: "",
    patientGender: "",
    isCritical: false,
    presentation: "",
    keyFindings: "",
    outcome: "",
  });
  const [showPreview, setShowPreview] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedShareWith, setSelectedShareWith] = useState([]);
  const [showShareWithModal, setShowShareWithModal] = useState(false);
  const [introText, setIntroText] = useState("");
  const isFormValid =
    formData.heading.trim() &&
    formData.patientAge.trim() &&
    formData.patientGender.trim() &&
    formData.presentation.trim() &&
    formData.keyFindings.trim() &&
    formData.outcome.trim() &&
    selectedCategories.length > 0;

  // Compute header label for Share With based on selectedShareWith
  const getShareWithLabel = () => {
    if (!selectedShareWith || selectedShareWith.length === 0) return "Everyone";
    if (selectedShareWith.length === 1) {
      const map = {
        everyone: "Everyone",
        connections: "Only Connections",
        dentist: "Dentist",
        gynaecologist: "Gynaecologist",
        ent: "ENT",
      };
      return map[selectedShareWith[0]] || "Selected";
    }
    return `${selectedShareWith.length} Selected`;
  };

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveAndContinue = () => {
    setShowPreview(true);
  };

  const handleCategorySelect = (categories) => {
    setSelectedCategories(categories);
  };

  const handleShareWithSelect = (shareWith) => {
    setSelectedShareWith(shareWith);
  };

  const handlePost = () => {
    // Create case data
    const caseData = {
      ...formData,
      categories: selectedCategories,
      shareWith: selectedShareWith,
      type: "case",
      author: {
        name: userProfile?.orgName || userProfile?.name || "Anonymous",
        username:
          userProfile?.orgHandle || userProfile?.username || "anonymous",
        avatar:
          userProfile?.orgLogo ||
          userProfile?.profilePicture ||
          "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif",
      },
      timeAgo: "Just now",
      likes: 0,
      comments: [],
    };

    // Call the onNewCase function
    onNewCase(caseData);

    // Close modal and reset state
    onClose();
    setFormData({
      heading: "",
      patientAge: "",
      patientGender: "",
      isCritical: false,
      presentation: "",
      keyFindings: "",
      outcome: "",
    });
    setShowPreview(false);
  };

  if (showPreview) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-4xl max-h:[90vh] overflow-hidden shadow-2xl border border-gray-200">
          {/* Share With header (kept in preview) */}
          <div className="flex items-center justify-between p-6 pb-2">
            <div className="flex flex-col ml-3">
              <span className="text-[11px] text-gray-500 leading-none">
                Share With
              </span>
              <button
                onClick={() => setShowShareWithModal(true)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                style={{ color: "#1890FF" }}
              >
                <span className="text-sm font-medium">
                  {getShareWithLabel()}
                </span>
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Preview Content */}
          <div className="p-6">
            {/* Editable intro */}
            <div className="ml-3 mr-3 mb-5">
              <textarea
                placeholder="Present a new Case ....."
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                rows={2}
                className="w-full p-3 h-[50px] border border-transparent rounded-lg outline-none focus:border-blue-300 transition-colors resize-none text-gray-600"
                style={{ fontSize: "16px", lineHeight: "140%" }}
              />
            </div>

            {/* Case Preview Card */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 ml-3 mr-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-blue-700 text-sm">
                  Case Summary :{" "}
                  {formData.heading ||
                    "A typical representation of the Takatsubo Cardiopathy"}
                </h3>
                <button className="text-gray-600 hover:text-gray-800">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex">
                  <span className="font-semibold text-gray-800 w-24 flex-shrink-0">
                    Patient:
                  </span>
                  <span className="text-gray-700">
                    {formData.patientAge} {formData.patientGender}
                  </span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-gray-800 w-24 flex-shrink-0">
                    Presentation:
                  </span>
                  <span className="text-gray-700">{formData.presentation}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-gray-800 w-24 flex-shrink-0">
                    Key Finding:
                  </span>
                  <span className="text-gray-700">{formData.keyFindings}</span>
                </div>
                <div className="flex">
                  <span className="font-semibold text-gray-800 w-24 flex-shrink-0">
                    Outcome:
                  </span>
                  <span className="text-gray-700">{formData.outcome}</span>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-6">
              {/* Left: icons + Cancel */}
              <div className="flex flex-col space-y-4">
                <div className="flex items-center space-x-4">
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <User className="w-5 h-5" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <BarChart3 className="w-5 h-5" />
                  </button>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors">
                    <Image className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-max"
                  style={{ fontSize: "14px", fontWeight: 500 }}
                >
                  Cancel
                </button>
              </div>

              {/* Right: Case toggle + Post */}
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3">
                  <span className="text-gray-700 text-sm">Case</span>
                  <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition-colors duration-200">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform duration-200" />
                  </div>
                </div>
                <button
                  onClick={handlePost}
                  disabled={!isFormValid}
                  className="px-6 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
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
        {/* Share With Modal in preview mode */}
        <ShareWithModal
          isOpen={showShareWithModal}
          onClose={() => setShowShareWithModal(false)}
          onShareWithSelect={handleShareWithSelect}
          selectedShareWith={selectedShareWith}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-[9999] flex items-center justify-center p-4">
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200">
        {/* Content */}
        <div
          className="p-4 overflow-y-auto scrollbar-hide"
          style={{
            maxHeight: "calc(90vh - 32px)",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {/* Share With - header style */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col ml-3">
              <span className="text-[11px] text-gray-500 leading-none">
                Share With
              </span>
              <button
                onClick={() => setShowShareWithModal(true)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                style={{ color: "#1890FF" }}
              >
                <span className="text-sm font-medium">
                  {getShareWithLabel()}
                </span>
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form Fields */}
          <div className="space-y-5 ml-3">
            {/* Heading */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Heading
              </label>
              <input
                type="text"
                placeholder='Eg:"Your Question"'
                value={formData.heading}
                onChange={(e) => handleChange("heading", e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-300 transition-colors"
                style={{ fontSize: "14px" }}
              />
            </div>

            {/* Patient Age and Gender Row with Critical Case Checkbox */}
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  Patient Age
                </label>
                <input
                  type="text"
                  placeholder='Eg:"Your Question"'
                  value={formData.patientAge}
                  onChange={(e) => handleChange("patientAge", e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-300 transition-colors"
                  style={{ fontSize: "14px" }}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-2 text-sm">
                  Patient Gender
                </label>
                <input
                  type="text"
                  placeholder='Eg:"Your Question"'
                  value={formData.patientGender}
                  onChange={(e) =>
                    handleChange("patientGender", e.target.value)
                  }
                  className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-300 transition-colors"
                  style={{ fontSize: "14px" }}
                />
              </div>
              <div className="flex items-start pt-8">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="criticalCase"
                    checked={formData.isCritical}
                    onChange={(e) =>
                      handleChange("isCritical", e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <div>
                    <label
                      htmlFor="criticalCase"
                      className="text-blue-600 font-medium text-sm block"
                      style={{ color: "#1890FF" }}
                    >
                      Is this a critical case?
                    </label>
                    <p className="text-gray-500 text-xs mt-1">
                      If the patient requires high-priority care.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Presentation */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Presentation
              </label>
              <textarea
                placeholder='Eg:"Your Question"'
                value={formData.presentation}
                onChange={(e) => handleChange("presentation", e.target.value)}
                rows={4}
                className="w-full p-3 h-[65px] border border-gray-200 rounded-lg outline-none focus:border-blue-300 transition-colors resize-none"
                style={{ fontSize: "14px" }}
              />
            </div>

            {/* Key Findings */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Key Findings
              </label>
              <textarea
                placeholder='Eg:"Your Question"'
                value={formData.keyFindings}
                onChange={(e) => handleChange("keyFindings", e.target.value)}
                rows={4}
                className="w-full p-3 h-[65px] border border-gray-200 rounded-lg outline-none focus:border-blue-300 transition-colors resize-none"
                style={{ fontSize: "14px" }}
              />
            </div>

            {/* Outcome */}
            <div>
              <label className="block text-gray-700 font-medium mb-2 text-sm">
                Outcome
              </label>
              <textarea
                placeholder='Eg:"Your Question"'
                value={formData.outcome}
                onChange={(e) => handleChange("outcome", e.target.value)}
                rows={4}
                className="w-full p-3 h-[65px] border border-gray-200 rounded-lg outline-none focus:border-blue-300 transition-colors resize-none"
                style={{ fontSize: "14px" }}
              />
            </div>
          </div>

          {/* Case Category Field */}
          <div className="mt-5 ml-3">
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Case Category
            </label>
            <input
              type="text"
              placeholder={'Eg;"Your Question"'}
              onFocus={() => setShowCategoryModal(true)}
              onClick={() => setShowCategoryModal(true)}
              readOnly
              className="w-full p-3 border border-gray-200 rounded-lg outline-none focus:border-blue-300 transition-colors cursor-pointer"
              style={{ fontSize: "14px" }}
            />

            {/* Selected category chips */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {selectedCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center px-3 py-1 rounded-full text-blue-600 bg-blue-50 border border-blue-100 text-xs font-medium"
                  >
                    {cat}
                    <button
                      className="ml-2 text-[#595959] hover:text-blue-600"
                      onClick={() =>
                        setSelectedCategories(
                          selectedCategories.filter((c) => c !== cat)
                        )
                      }
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Section */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100 mt-8">
            {/* Left side: icons and cancel */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center space-x-4">
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <User className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <BarChart3 className="w-5 h-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <Image className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors w-max"
                style={{ fontSize: "14px", fontWeight: 500 }}
              >
                Cancel
              </button>
            </div>

            {/* Right side: toggle and action */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <span className="text-gray-500 text-sm">Case</span>
                <div className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-500 transition-colors duration-200">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform duration-200" />
                </div>
              </div>
              <button
                onClick={handleSaveAndContinue}
                disabled={!isFormValid}
                className="px-6 py-2 rounded-lg text-white transition-colors disabled:opacity-50"
                style={{
                  backgroundColor: "#1890FF",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Case Category Modal */}
      <CaseCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategorySelect={handleCategorySelect}
        selectedCategories={selectedCategories}
      />

      {/* Share With Modal */}
      <ShareWithModal
        isOpen={showShareWithModal}
        onClose={() => setShowShareWithModal(false)}
        onShareWithSelect={handleShareWithSelect}
        selectedShareWith={selectedShareWith}
      />
    </div>
  );
};

export default CaseCreateModal;
