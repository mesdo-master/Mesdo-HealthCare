import { useState, useEffect } from "react";

const QualificationForm = ({ qualification, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    qualification: "",
    course: "",
    specialization: "",
    passingYear: "",
    university: "",
    skills: [],
    description: "",
  });
  const [errors, setErrors] = useState({});
  const [skillInput, setSkillInput] = useState("");

  useEffect(() => {
    console.log(
      "QualificationForm: Received qualification prop:",
      qualification
    );
    if (qualification) {
      setFormData({
        qualification: qualification.qualification || "",
        course: qualification.course || "",
        specialization: qualification.specialization || "",
        passingYear: qualification.passingYear || "",
        university: qualification.university || "",
        skills: qualification.skills || [],
        description: qualification.description || "",
      });
    } else {
      setFormData({
        qualification: "",
        course: "",
        specialization: "",
        passingYear: "",
        university: "",
        skills: [],
        description: "",
      });
    }
    setErrors({});
    setSkillInput("");
  }, [qualification]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.qualification)
      newErrors.qualification = "Qualification is required.";
    if (!formData.university) newErrors.university = "University is required.";
    if (!formData.passingYear)
      newErrors.passingYear = "Passing year is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    console.log(`QualificationForm: Handling change for ${id}:`, value);
    setFormData({ ...formData, [id]: value });
    setErrors({ ...errors, [id]: "" });
  };

  const handleSkillInputChange = (e) => {
    setSkillInput(e.target.value);
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim();
      if (!formData.skills.includes(newSkill)) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, newSkill],
        }));
        setSkillInput("");
        console.log("QualificationForm: Added skill:", newSkill);
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
    console.log("QualificationForm: Removed skill:", skillToRemove);
  };

  const handleSave = () => {
    console.log("QualificationForm: Saving formData:", formData);
    if (!validateForm()) {
      console.log("QualificationForm: Validation failed, errors:", errors);
      return;
    }
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="qualification"
            className="block font-medium text-gray-700 mb-1 text-[15px]"
          >
            Qualification*
          </label>
          <select
            id="qualification"
            value={formData.qualification}
            onChange={handleChange}
            className={`w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500 ${
              errors.qualification ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select</option>
            <option value="BSc">BSc</option>
            <option value="MSc">MSc</option>
            <option value="PhD">PhD</option>
            <option value="MBBS">MBBS</option>
            <option value="MD">MD</option>
          </select>
          {errors.qualification && (
            <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>
          )}
        </div>
        <div>
          <label
            htmlFor="course"
            className="block font-medium text-gray-700 mb-1 text-[15px]"
          >
            Course
          </label>
          <select
            id="course"
            value={formData.course}
            onChange={handleChange}
            className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            <option value="Medicine">Medicine</option>
            <option value="Nursing">Nursing</option>
            <option value="Pharmacy">Pharmacy</option>
          </select>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label
            htmlFor="specialization"
            className="block font-medium text-gray-700 mb-1 text-[15px]"
          >
            Specialization
          </label>
          <select
            id="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Pediatrics">Pediatrics</option>
            <option value="Surgery">Surgery</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="passingYear"
            className="block font-medium text-gray-700 mb-1 text-[15px]"
          >
            Passing Year*
          </label>
          <input
            type="date"
            id="passingYear"
            value={formData.passingYear}
            onChange={handleChange}
            className={`w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500 ${
              errors.passingYear ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.passingYear && (
            <p className="text-red-500 text-xs mt-1">{errors.passingYear}</p>
          )}
        </div>
      </div>
      <div>
        <label
          htmlFor="university"
          className="block font-medium text-gray-700 mb-1 text-[15px]"
        >
          University*
        </label>
        <select
          id="university"
          value={formData.university}
          onChange={handleChange}
          className={`w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500 ${
            errors.university ? "border-red-500" : "border-gray-300"
          }`}
        >
          <option value="">Select</option>
          <option value="Harvard">Harvard</option>
          <option value="Stanford">Stanford</option>
          <option value="AIIMS">AIIMS</option>
        </select>
        {errors.university && (
          <p className="text-red-500 text-xs mt-1">{errors.university}</p>
        )}
      </div>
      <div>
        <label
          htmlFor="skillInput"
          className="block font-medium text-gray-700 mb-1 text-[15px]"
        >
          Skills (press Enter to add)
        </label>
        <input
          id="skillInput"
          value={skillInput}
          onChange={handleSkillInputChange}
          onKeyDown={handleSkillInputKeyDown}
          type="text"
          className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500"
          placeholder="Enter skill and press Enter"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {formData.skills.map((skill, index) => (
            <div
              key={index}
              className="flex items-center bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
            >
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <label
          htmlFor="description"
          className="block font-medium text-gray-700 mb-1 text-[15px]"
        >
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={handleChange}
          className="w-full h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-[14px] focus:ring-2 focus:ring-blue-500"
          rows="4"
        />
      </div>
      <div className="flex justify-end space-x-4 mt-4">
        <button
          onClick={onCancel}
          className="h-[44px] rounded-lg text-[15px] px-6 bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="h-[44px] rounded-lg text-[15px] px-6 bg-blue-600 text-white hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default QualificationForm;
