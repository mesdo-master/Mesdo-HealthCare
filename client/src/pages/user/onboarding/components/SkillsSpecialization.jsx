import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, X, Check } from "lucide-react";
import PropTypes from "prop-types";
import StepProgressCircle from "../../../../components/StepProgressCircle";

const defaultSkillOptions = ["Communication", "Teamwork", "Critical Thinking"];

const SkillsSpecialization = ({
  formData,
  updateFormData,
  onNext,
  onPrevious,
  onSkipAll, // ✅ Add onSkipAll prop
}) => {
  const [formValues, setFormValues] = useState({
    skills: defaultSkillOptions,
  });
  const [skillInput, setSkillInput] = useState("");

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

  // ✅ Validation logic: check if form has any content
  const hasFormContent = () => {
    return formValues.skills.length > 0;
  };

  // ✅ Handle skip all - goes directly to Interest page
  const handleSkipAll = () => {
    if (hasFormContent()) {
      // If form has content, ask user if they want to save or clear
      if (
        window.confirm(
          "You have selected some skills. Do you want to save them before skipping?"
        )
      ) {
        // Save current data and proceed to Interest page
        onSkipAll();
      }
      // If they click cancel, stay on the page
    } else {
      // If form is empty, allow skip to Interest page
      onSkipAll();
    }
  };

  // Initialize form values with existing data when component mounts
  useEffect(() => {
    if (formData && formData.Skills) {
      setFormValues({
        skills:
          formData.Skills.length > 0 ? formData.Skills : defaultSkillOptions,
      });
    }
  }, [formData]);

  // Only update parent when skills change - with debouncing to prevent glitching
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFormData({ Skills: formValues.skills });
    }, 100); // Small delay to prevent rapid updates

    return () => clearTimeout(timeoutId);
  }, [formValues.skills, updateFormData]);

  const handleAddSkill = useCallback(
    (e) => {
      if (e.key === "Enter" && skillInput.trim()) {
        e.preventDefault();
        const skill = skillInput.trim();
        if (!formValues.skills.includes(skill)) {
          const newSkills = [...formValues.skills, skill];
          setFormValues((prev) => ({ ...prev, skills: newSkills }));
          setSkillInput("");
        }
      }
    },
    [skillInput, formValues.skills]
  );

  const handleRemoveSkill = useCallback(
    (skillToRemove) => {
      const newSkills = formValues.skills.filter(
        (skill) => skill !== skillToRemove
      );
      setFormValues((prev) => ({ ...prev, skills: newSkills }));
    },
    [formValues.skills]
  );

  // Optimized click handler for adding skills
  const handleAddSkillClick = useCallback(() => {
    const skill = skillInput.trim();
    if (skill && !formValues.skills.includes(skill)) {
      const newSkills = [...formValues.skills, skill];
      setFormValues((prev) => ({ ...prev, skills: newSkills }));
      setSkillInput("");
    }
  }, [skillInput, formValues.skills]);

  return (
    <div className="flex h-screen">
      {/* Left Form */}
      <div
        className={`w-1/2 flex flex-col px-[100px] ${getResponsiveTopSpacing()}`}
        style={{ minWidth: 560 }}
      >
        <div className="flex-1">
          <button className="mb-6" onClick={onPrevious}>
            <ArrowLeft size={28} className="text-black" />
          </button>

          <div className="flex items-center justify-between mb-1">
            <h1 className="text-[32px] font-semibold leading-[130%] mb-1">
              Skills or Specialization
            </h1>
            <StepProgressCircle currentStep={6} totalSteps={7} />
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Include all of your relevant experience and dates in this section.
          </p>

          {/* Input Field */}
          <div>
            <label
              className="block font-sm mb-1"
              style={{ fontSize: "1.1rem" }}
            >
              Skills
            </label>

            <div className="relative w-full">
              <input
                type="text"
                placeholder="Select"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
                className="w-full h-[50px] border border-gray-200 rounded-lg px-4 text-sm placeholder-gray-400 focus:outline-none pr-10"
              />
              {skillInput.trim() && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-800"
                  onClick={handleAddSkillClick}
                  tabIndex={-1}
                >
                  <Check size={20} />
                </button>
              )}
            </div>

            {/* Skill Chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {formValues.skills.map((skill, index) => (
                <div
                  key={`${skill}-${index}`}
                  className="px-3 h-[44px] py-1.5 rounded-md border border-[#DCDCDC] flex items-center text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Buttons - positioned at bottom */}
        <div className="flex justify-between items-center pb-8 pt-4 mt-auto">
          <button
            type="button"
            onClick={handleSkipAll}
            className="w-[120px] h-[48px] bg-gray-100 text-[#1890FF] text-[15px] font-medium rounded-lg hover:bg-gray-200 transition-all"
          >
            Skip All
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!hasFormContent()}
            className={`w-[180px] h-[48px] text-[15px] font-medium rounded-lg transition-all shadow-none ${
              hasFormContent()
                ? "bg-[#1890FF] text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Right - Empty Side */}
      <div className="w-1/2 bg-[#f8f8f8] h-screen flex-shrink-0" />
    </div>
  );
};

SkillsSpecialization.defaultProps = {
  updateFormData: () => {},
  onNext: () => {},
  onPrevious: () => {},
  onSkipAll: () => {}, // ✅ Add onSkipAll default prop
};

SkillsSpecialization.propTypes = {
  updateFormData: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onSkipAll: PropTypes.func.isRequired,
};

export default SkillsSpecialization;
