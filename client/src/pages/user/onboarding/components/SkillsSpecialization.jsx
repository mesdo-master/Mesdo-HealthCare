import { useEffect, useState } from "react";
import { ArrowLeft, X, Check } from "lucide-react";
import PropTypes from "prop-types";
import StepProgressCircle from "../../../../components/StepProgressCircle";

const defaultSkillOptions = ["Communication", "Teamwork", "Critical Thinking"];

const SkillsSpecialization = ({ updateFormData, onNext, onPrevious }) => {
  const [formValues, setFormValues] = useState({
    skills: defaultSkillOptions,
  });
  const [skillInput, setSkillInput] = useState("");

  // Only update parent when skills change
  useEffect(() => {
    updateFormData({ skills: formValues.skills });
    // eslint-disable-next-line
  }, [formValues.skills]);

  const handleAddSkill = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const skill = skillInput.trim();
      if (!formValues.skills.includes(skill)) {
        const newSkills = [...formValues.skills, skill];
        setFormValues((prev) => ({ ...prev, skills: newSkills }));
      }
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    const newSkills = formValues.skills.filter(
      (skill) => skill !== skillToRemove
    );
    setFormValues((prev) => ({ ...prev, skills: newSkills }));
  };

  return (
    <div className="flex h-screen">
      {/* Left Form */}
      <div
        className="w-1/2 flex flex-col justify-between px-[100px] bg-white h-screen overflow-y-auto mt-10"
        style={{ minWidth: 560 }}
      >
        <div className="pt-10">
          <button className="mb-6" onClick={onPrevious}>
            <ArrowLeft size={28} className="text-black" />
          </button>

          <div className="flex items-center justify-between mb-1">
            <h1 className="text-[32px] font-semibold leading-[130%] mb-1">
              Skills or Specialization
            </h1>
            <StepProgressCircle currentStep={3} totalSteps={5} />
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
                  onClick={() => {
                    const skill = skillInput.trim();
                    if (skill && !formValues.skills.includes(skill)) {
                      const newSkills = [...formValues.skills, skill];
                      setFormValues((prev) => ({ ...prev, skills: newSkills }));
                    }
                    setSkillInput("");
                  }}
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
                  key={index}
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

        {/* Bottom Buttons */}
        <div className="flex justify-between pt-4 mb-10">
          <button
            type="button"
            onClick={onPrevious}
            className="w-[120px] h-[48px] bg-gray-100 text-[#1890FF] text-[15px] font-medium rounded-lg hover:bg-gray-200 transition-all"
          >
            Skip All
          </button>
          <button
            type="button"
            onClick={onNext}
            className="w-[180px] h-[48px] bg-[#1890FF] text-white text-[17px] font-medium rounded-lg hover:bg-blue-600 transition-all shadow-none"
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
};

export default SkillsSpecialization;
