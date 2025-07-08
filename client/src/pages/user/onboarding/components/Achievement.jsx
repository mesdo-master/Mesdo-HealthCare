import { useState } from "react";
import {
  ArrowLeft,
  PlusCircle,
  ChevronDown,
  Edit2,
  Trash2,
} from "lucide-react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import PropTypes from "prop-types";
import StepProgressCircle from "../../../../components/StepProgressCircle";

const Achievement = ({ updateFormData, onNext, onPrevious }) => {
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
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState("");

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
    updateFormData({ achievements: updatedAchievements });
  };

  const addAchievement = () => {
    const newId = Date.now();
    setAchievements([
      ...achievements,
      {
        id: newId,
        award: "",
        issuer: "",
        year: "",
        description: "",
      },
    ]);
    setEditId(newId);
    setShowPreview(false);
  };

  const handleContinue = () => {
    // Validate all achievements
    for (const a of achievements) {
      if (!a.award || !a.issuer || !a.year) {
        setError("Please fill all required fields for each achievement.");
        return;
      }
    }
    setError("");
    setShowPreview(true);
  };

  const handleEdit = (id) => {
    setEditId(id);
    setShowPreview(false);
  };

  const handleDelete = (id) => {
    const updated = achievements.filter((a) => a.id !== id);
    setAchievements(updated);
    updateFormData({ achievements: updated });
  };

  // If editing, only show the form for the selected achievement
  const editingAchievement =
    achievements.find((a) => a.id === editId) ||
    achievements[achievements.length - 1];

  return (
    <div className="flex h-screen">
      <div
        className="w-1/2 flex flex-col justify-between px-[100px] mt-10"
        style={{ minWidth: 560 }}
      >
        <div>
          <button className="mb-8" onClick={onPrevious}>
            <ArrowLeft size={28} className="text-black" />
          </button>
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-inter font-semibold text-[32px] leading-[130%] tracking-[0px] mb-1">
              Awards & Achievements
            </h1>
            <StepProgressCircle currentStep={4} totalSteps={5} />
          </div>
          <p className="text-[13px] font-sm text-[#8C8C8C] mb-8">
            Include all of your relevant experience and dates in this section.
          </p>
          <div className="flex-1">
            {showPreview ? (
              <>
                {achievements.map((achievement) => (
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
                          <Trash2 size={18} className="text-[#8C8C8C]" />
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
                ))}
                <button
                  type="button"
                  onClick={addAchievement}
                  className="flex items-center gap-3 mb-8 mt-2"
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#8C8C8C]">
                    <PlusCircle size={28} className="text-[#23272E]" />
                  </span>
                  <span className="text-[15px] font-medium text-[#23272E]">
                    Add Experience
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
                        <div className="relative">
                          <select
                            value={editingAchievement.year}
                            onChange={(e) =>
                              handleChange(
                                editingAchievement.id,
                                "year",
                                e.target.value
                              )
                            }
                            className="appearance-none block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select</option>
                            {Array.from({ length: 10 }, (_, i) => (
                              <option key={i} value={2025 - i}>
                                {2025 - i}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            size={20}
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                          />
                        </div>
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
        {/* Bottom Buttons - always at the bottom */}
        <div className="flex justify-between items-center pb-8 pt-4">
          <button
            onClick={onPrevious}
            className="w-[120px] h-[48px] bg-gray-100 text-[#1890FF] text-[15px] font-medium rounded-lg hover:bg-gray-200 transition-all"
          >
            Skip All
          </button>
          {showPreview ? (
            <button
              onClick={onNext}
              className="w-[180px] h-[48px] bg-[#4285F4] text-white text-[17px] font-medium rounded-lg hover:bg-blue-600 transition-all shadow-none"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleContinue}
              className="w-[180px] h-[48px] bg-[#4285F4] text-white text-[17px] font-medium rounded-lg hover:bg-blue-600 transition-all shadow-none"
            >
              Next
            </button>
          )}
        </div>
      </div>
      <div className="w-1/2 bg-[#f8f8f8]" />
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
