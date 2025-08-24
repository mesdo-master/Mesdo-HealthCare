import { useState, useEffect } from "react";
import { ArrowLeft, PlusCircle, Edit2, Trash2, Plus } from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import PropTypes from "prop-types";
import StepProgressCircle from "../../../../components/StepProgressCircle";
import Select from "react-select";

const Achievement = ({ formData, updateFormData, onNext, onPrevious }) => {
  const [achievements, setAchievements] = useState([
    {
      id: 1,
      award: "",
      issuer: "",
      year: "",
      description: "",
    },
  ]);
  const [showPreview, setShowPreview] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

  // ✅ Add window size tracking for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // ✅ Track window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Responsive top spacing for different screen sizes
  const getResponsiveTopSpacing = () => {
    if (windowWidth <= 1599) {
      // Small/normal screens - use padding top instead of justify-between
      return "pt-10";
    } else if (windowWidth <= 1920) {
      // Medium screens - slightly reduced top spacing
      return "pt-20";
    } else {
      // Large screens - significantly reduced top spacing to fix extra space
      return "pt-10";
    }
  };

  // Initialize achievements with existing data when component mounts
  useEffect(() => {
    // Set initialization state immediately
    if (!isInitialized) {
      console.log("🔄 Loading formData:", formData);
      if (
        formData &&
        formData.achievements &&
        formData.achievements.length > 0
      ) {
        console.log("📥 Found saved achievements:", formData.achievements);
        const formattedAchievements = formData.achievements.map(
          (ach, index) => ({
            id: index + 1,
            award: ach.award || "",
            issuer: ach.issuer || "",
            year: ach.year || "",
            description: ach.description || "",
          })
        );
        setAchievements(formattedAchievements);
        setShowPreview(true);
      } else if (
        formData &&
        formData.Achievements &&
        formData.Achievements.length > 0
      ) {
        // Handle legacy data format (capital A)
        console.log("📥 Found legacy Achievements:", formData.Achievements);
        const formattedAchievements = formData.Achievements.map(
          (ach, index) => ({
            id: index + 1,
            award: ach.award || "",
            issuer: ach.issuer || "",
            year: ach.year || "",
            description: ach.description || "",
          })
        );
        setAchievements(formattedAchievements);
        setShowPreview(true);
      } else {
        console.log("📭 No saved achievements found, using default");
        setShowPreview(false);
        // Don't change state if no data - keep existing state
      }
      setIsInitialized(true);
    }
  }, [formData, isInitialized]);

  // ReactQuill Modules & Formats
  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
      [{ align: [] }],
    ],
  };

  // Form Handlers
  const handleChange = (id, field, value) => {
    const updatedAchievements = achievements.map((achievement) =>
      achievement.id === id ? { ...achievement, [field]: value } : achievement
    );
    setAchievements(updatedAchievements);

    // ✅ Only update parent form data when moving to preview or next
    // Don't update on every keystroke to prevent blinking
  };

  const addAchievement = () => {
    const newId = Date.now();
    const newAchievement = {
      id: newId,
      award: "",
      issuer: "",
      year: "",
      description: "",
    };

    setAchievements((prev) => [...prev, newAchievement]);
    setEditId(newId);
    setShowPreview(false);

    // ✅ Don't update parent form data here - wait for user to complete the form
  };

  const handleContinue = () => {
    // Check if any achievement has any field filled
    const hasAnyContent = achievements.some(
      (a) => a.award || a.issuer || a.year || a.description
    );

    // If any achievement has content, validate that all required fields are filled
    if (hasAnyContent) {
      for (const a of achievements) {
        // If this achievement has any content, all required fields must be filled
        const hasAnyField = a.award || a.issuer || a.year || a.description;
        if (hasAnyField && (!a.award || !a.issuer || !a.year)) {
          setError(
            "Please fill all required fields for each achievement or leave all fields empty to skip."
          );
          return;
        }
      }
    }

    setError("");

    // Only save achievements that have content
    const achievementsWithContent = achievements.filter(
      (a) => a.award || a.issuer || a.year || a.description
    );

    // ✅ Save data before showing preview
    console.log(
      "💾 Saving achievements before preview:",
      achievementsWithContent
    );
    updateFormData({ achievements: achievementsWithContent });

    setShowPreview(true);
  };

  const handleEdit = (id) => {
    setEditId(id);
    setShowPreview(false);
  };

  const handleDelete = (id) => {
    const updated = achievements.filter((a) => a.id !== id);
    setAchievements(updated);

    // ✅ Update parent form data immediately when deleting
    const achievementsWithContent = updated.filter(
      (a) => a.award || a.issuer || a.year || a.description
    );

    console.log(
      "🗑️ Deleting achievement, updated list:",
      achievementsWithContent
    );
    updateFormData({ achievements: achievementsWithContent });

    // ✅ If no achievements left with content, stay in preview but show empty state
    // ✅ If achievements remain, stay in preview mode
    setShowPreview(true);
  };

  // If editing, only show the form for the selected achievement
  const editingAchievement =
    achievements.find((a) => a.id === editId) ||
    achievements[achievements.length - 1];

  const isFormComplete = () => {
    // Check if any achievement has any content
    const hasAnyContent = achievements.some(
      (a) => a.award || a.issuer || a.year || a.description
    );

    // If no content, form is complete (can skip)
    if (!hasAnyContent) {
      return true;
    }

    // If there's content, check that all filled achievements have required fields
    return achievements.every((achievement) => {
      const hasAnyField =
        achievement.award ||
        achievement.issuer ||
        achievement.year ||
        achievement.description;
      // If achievement has any content, all required fields must be filled
      return (
        !hasAnyField ||
        (achievement.award && achievement.issuer && achievement.year)
      );
    });
  };

  const handleSkipAll = () => {
    // Optionally, you can update the formData with empty achievements
    // updateFormData({ achievements: [] });
    onNext();
  };

  return (
    <div className="flex h-screen bg-white">
      {!isInitialized ? (
        // Show loading or blank state until initialized
        <div className="w-full h-full bg-white" />
      ) : (
        <>
          {/* Left - Content */}
          <div
            className={`w-1/2 flex flex-col px-[100px] mt-2 ${getResponsiveTopSpacing()}`}
            style={{ minWidth: 560 }}
          >
            <div className="flex-1">
              <button className="mb-8" onClick={onPrevious}>
                <ArrowLeft size={28} className="text-black" />
              </button>
              <div className="flex items-center justify-between mb-1">
                <h1 className="font-inter font-semibold text-[32px] leading-[130%] tracking-[0px] mb-1">
                  Awards & Achievements
                </h1>
                <StepProgressCircle currentStep={7} totalSteps={8} />
              </div>
              <p className="text-[13px] font-sm text-[#8C8C8C] mb-8">
                Include all of your relevant experience and dates in this
                section.
              </p>
              <div className="flex-1">
                {showPreview ? (
                  <>
                    {achievements.filter(
                      (a) => a.award || a.issuer || a.year || a.description
                    ).length > 0 ? (
                      achievements
                        .filter(
                          (a) => a.award || a.issuer || a.year || a.description
                        )
                        .map((achievement) => (
                          <div key={achievement.id} className="mb-8">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="text-[20px] font-semibold text-black leading-tight mb-1">
                                  {achievement.award}
                                  {achievement.issuer && (
                                    <span className="font-normal text-black">
                                      {" "}
                                      | {achievement.issuer}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[15px] text-[#8C8C8C] mb-2">
                                  {achievement.year}
                                </div>
                              </div>
                              <div className="flex gap-2 mt-[-35px] ">
                                <button
                                  type="button"
                                  className="w-9 h-9 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center hover:bg-gray-100"
                                  onClick={() => handleEdit(achievement.id)}
                                >
                                  <Edit2 size={18} className="text-[#8C8C8C]" />
                                </button>
                                <button
                                  type="button"
                                  className="w-9 h-9 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center hover:bg-gray-100"
                                  onClick={() => handleDelete(achievement.id)}
                                >
                                  <Trash2
                                    size={18}
                                    className="text-[#8C8C8C]"
                                  />
                                </button>
                              </div>
                            </div>
                            {/* Description as bullet points */}
                            {achievement.description && (
                              <ul className="list-disc pl-5 mt-2 text-[15px] text-black">
                                {achievement.description
                                  .replace(/<(.|\n)*?>/g, "")
                                  .split(/\n|•|\r/)
                                  .filter((line) => line.trim())
                                  .map((line, idx) => (
                                    <li key={idx}>{line.trim()}</li>
                                  ))}
                              </ul>
                            )}
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-[#8C8C8C] mb-4">
                          No achievements added yet.
                        </p>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={addAchievement}
                      className="flex items-center gap-3 mb-8 mt-2"
                    >
                      <span className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#8C8C8C]">
                        <Plus size={28} className="text-[#23272E]" />
                      </span>
                      <span className="text-[15px] font-medium text-[#23272E]">
                        Add Achievement
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Form for editing/adding */}
                    <div className="mb-8">
                      <div className="space-y-6">
                        {/* Award */}
                        <div>
                          <label className="block text-[15px] text-gray-900 mb-1">
                            Award*
                          </label>
                          <input
                            type="text"
                            value={editingAchievement.award}
                            onChange={(e) =>
                              handleChange(
                                editingAchievement.id,
                                "award",
                                e.target.value
                              )
                            }
                            placeholder="Award Name"
                            className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                          />
                        </div>
                        {/* Issuer & Year */}
                        <div className="flex gap-6">
                          <div className="w-1/2">
                            <label className="block text-[15px] text-gray-900 mb-1">
                              Issuer*
                            </label>
                            <input
                              type="text"
                              value={editingAchievement.issuer}
                              onChange={(e) =>
                                handleChange(
                                  editingAchievement.id,
                                  "issuer",
                                  e.target.value
                                )
                              }
                              placeholder="Issuer Name"
                              className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                            />
                          </div>
                          <div className="w-1/2">
                            <label className="block text-[15px] text-gray-900 mb-1">
                              Year*
                            </label>
                            <Select
                              name="year"
                              value={
                                editingAchievement.year
                                  ? {
                                      value: editingAchievement.year,
                                      label: editingAchievement.year,
                                    }
                                  : null
                              }
                              onChange={(option) =>
                                handleChange(
                                  editingAchievement.id,
                                  "year",
                                  option.value
                                )
                              }
                              options={Array.from({ length: 50 }, (_, i) => {
                                const year = new Date().getFullYear() - i;
                                return { value: year, label: year };
                              })}
                              placeholder="Select"
                              className="text-[13px]"
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  minHeight: "48px",
                                  height: "48px",
                                  borderColor: "#e5e7eb",
                                  borderRadius: "0.75rem",
                                  backgroundColor: "",
                                  "&:hover": {
                                    borderColor: "#e5e7eb",
                                  },
                                }),
                                valueContainer: (base) => ({
                                  ...base,
                                  padding: "0 16px",
                                }),
                                input: (base) => ({
                                  ...base,
                                  margin: 0,
                                  padding: 0,
                                }),
                              }}
                            />
                          </div>
                        </div>
                        {/* Description */}
                        <div>
                          <label className="block text-[15px] text-gray-900 mb-1">
                            Description
                          </label>
                          <ReactQuill
                            theme="snow"
                            value={editingAchievement.description}
                            onChange={(content) =>
                              handleChange(
                                editingAchievement.id,
                                "description",
                                content
                              )
                            }
                            modules={modules}
                            placeholder="Write about your achievement..."
                            className="[&_.ql-container]:rounded-b-lg [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:h-[200px] [&_.ql-editor]:text-[14px] [&_.ql-editor]:text-gray-700"
                          />
                        </div>
                      </div>
                    </div>
                    {error && (
                      <div className="text-red-500 text-sm mb-2">{error}</div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Bottom Buttons - positioned at bottom */}
            <div className="flex justify-between items-center pb-8 pt-4 mt-auto">
              <button
                onClick={handleSkipAll}
                className="w-[120px] h-[48px] bg-gray-100 text-[#1890FF] text-[15px] font-medium rounded-lg hover:bg-gray-200 transition-all"
              >
                Skip All
              </button>
              {showPreview ? (
                <button
                  onClick={() => {
                    console.log("🎯 Next button clicked in preview mode");
                    console.log("📋 Current achievements:", achievements);
                    console.log("🔗 onNext function:", onNext);
                    onNext();
                  }}
                  className="w-[180px] h-[48px] bg-[#4285F4] text-white text-[17px] font-medium rounded-lg hover:bg-blue-600 transition-all shadow-none"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleContinue}
                  disabled={!isFormComplete()}
                  className={`w-[180px] h-[48px] text-[17px] font-medium rounded-lg transition-all shadow-none ${
                    isFormComplete()
                      ? "bg-[#4285F4] text-white hover:bg-blue-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  Next
                </button>
              )}
            </div>
          </div>
          {/* Right - Background */}
          <div className="w-1/2 bg-white" />
        </>
      )}
    </div>
  );
};

Achievement.propTypes = {
  updateFormData: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
};

Achievement.defaultProps = {
  updateFormData: () => {},
};

export default Achievement;
