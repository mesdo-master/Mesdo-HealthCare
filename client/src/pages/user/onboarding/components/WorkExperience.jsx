import { useState } from "react";
import { ArrowLeft, Edit2, Trash2, Plus, Check } from "lucide-react";
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import PropTypes from "prop-types";
import StepProgressCircle from "../../../../components/StepProgressCircle";

const WorkExperience = ({ updateFormData, onNext, onPrevious }) => {
  const [formValues, setFormValues] = useState({
    jobTitle: "",
    hospital: "",
    employmentType: "",
    location: "",
    startDate: "",
    endDate: "",
    currentlyWorking: false,
    skills: [],
    description: "",
  });
  const [expList, setExpList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [error, setError] = useState("");
  const [skillInput, setSkillInput] = useState("");

  // ReactQuill Modules
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["link", "image"],
      ["clean"],
    ],
  };

  const employmentTypeOptions = [
    { value: "", label: "Select" },
    { value: "fullTime", label: "Full-Time" },
    { value: "partTime", label: "Part-Time" },
    { value: "contract", label: "Contract" },
  ];

  const locationOptions = [
    { value: "", label: "Select" },
    { value: "gwalior", label: "Gwalior" },
    { value: "delhi", label: "Delhi" },
    { value: "mumbai", label: "Mumbai" },
    { value: "pune", label: "Pune" },
    { value: "agra", label: "Agra" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValues = {
      ...formValues,
      [name]: type === "checkbox" ? checked : value,
    };
    if (name === "currentlyWorking" && checked) {
      newValues.endDate = "";
    }
    setFormValues(newValues);
    updateFormData(newValues);
  };

  const handleSelectChange = (selectedOption, fieldName) => {
    const newValues = {
      ...formValues,
      [fieldName]: selectedOption.value,
    };
    setFormValues(newValues);
    updateFormData(newValues);
  };

  const handleQuillChange = (value) => {
    const newValues = {
      ...formValues,
      description: value,
    };
    setFormValues(newValues);
    updateFormData(newValues);
  };

  const handleSkillInputChange = (e) => setSkillInput(e.target.value);
  const handleSkillInputKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      addSkill();
    }
  };
  const addSkill = () => {
    if (skillInput.trim() && !formValues.skills.includes(skillInput.trim())) {
      const newSkills = [...formValues.skills, skillInput.trim()];
      setFormValues((prev) => ({ ...prev, skills: newSkills }));
      updateFormData({ ...formValues, skills: newSkills });
      setSkillInput("");
    }
  };
  const handleSkillRemove = (idx) => {
    const newSkills = formValues.skills.filter((_, i) => i !== idx);
    setFormValues((prev) => ({ ...prev, skills: newSkills }));
    updateFormData({ ...formValues, skills: newSkills });
  };

  const handleAddOrUpdate = () => {
    if (!formValues.jobTitle || !formValues.hospital || !formValues.startDate) {
      setError("Please fill all required fields.");
      return;
    }
    setError("");
    let updatedList = [...expList];
    if (editIdx !== null) {
      updatedList[editIdx] = { ...formValues };
    } else {
      updatedList.push({ ...formValues });
    }
    setExpList(updatedList);
    updateFormData({ workExperience: updatedList });
    setShowPreview(true);
    setEditIdx(null);
    setFormValues({
      jobTitle: "",
      hospital: "",
      employmentType: "",
      location: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      skills: [],
      description: "",
    });
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setFormValues({ ...expList[idx] });
    setShowPreview(false);
  };

  const handleDelete = (idx) => {
    const updated = expList.filter((_, i) => i !== idx);
    setExpList(updated);
    updateFormData({ workExperience: updated });
  };

  const handleAddNew = () => {
    setEditIdx(null);
    setFormValues({
      jobTitle: "",
      hospital: "",
      employmentType: "",
      location: "",
      startDate: "",
      endDate: "",
      currentlyWorking: false,
      skills: [],
      description: "",
    });
    setShowPreview(false);
  };

  return (
    <div className="flex h-screen">
      {/* Left (scrollable) */}
      <div
        className="w-1/2 flex flex-col justify-between px-[100px] h-screen overflow-y-auto mt-10"
        style={{ minWidth: 560 }}
      >
        <div>
          <button className="mb-8 mt-2 text-left" onClick={onPrevious}>
            <ArrowLeft size={28} className="text-black" />
          </button>
          <div className="flex items-center justify-between mb-1 mt-[10px] ">
            <h1 className="font-inter font-semibold text-[32px] leading-[130%] tracking-[0px] mb-1">
              Work Experience
            </h1>
            <StepProgressCircle currentStep={2} totalSteps={5} />
          </div>
          <p className="text-[13px] font-sm text-[#8C8C8C] mb-8">
            Include all of your relevant experience and dates in this section.
          </p>
          <div className="flex-1">
            {showPreview ? (
              <>
                {expList.map((exp, idx) => (
                  <div key={idx} className="mb-8 ">
                    <div className="flex items-center justify-between ">
                      <div>
                        <div className="text-[20px] font-semibold text-black leading-tight mb-1">
                          {exp.jobTitle} {exp.hospital && `| ${exp.hospital}`}
                        </div>
                        <div className="text-[15px] text-[#8C8C8C] mb-1">
                          {exp.location}{" "}
                          {exp.employmentType && `| ${exp.employmentType}`}
                        </div>
                        <div className="text-[13px] text-[#8C8C8C] mb-2">
                          {exp.startDate && exp.endDate
                            ? `(${exp.startDate} - ${exp.endDate})`
                            : exp.startDate
                            ? `(Start: ${exp.startDate})`
                            : ""}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-[-70px] ">
                        <button
                          type="button"
                          className="w-9 h-9 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center hover:bg-gray-100"
                          onClick={() => handleEdit(idx)}
                        >
                          <Edit2 size={18} className="text-[#8C8C8C]" />
                        </button>
                        <button
                          type="button"
                          className="w-9 h-9 rounded-full border border-[#E5E5E5] bg-white flex items-center justify-center hover:bg-gray-100"
                          onClick={() => handleDelete(idx)}
                        >
                          <Trash2 size={18} className="text-[#8C8C8C]" />
                        </button>
                      </div>
                    </div>
                    {exp.description && (
                      <ul className="list-disc pl-5 mt-2 text-[15px] text-black">
                        {exp.description
                          .replace(/<(.|\n)*?>/g, "")
                          .split(/\n|•|\r/)
                          .filter((line) => line.trim())
                          .map((line, i) => (
                            <li key={i}>{line.trim()}</li>
                          ))}
                      </ul>
                    )}
                    {exp.skills && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {exp.skills.map((skill, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-1 rounded-md border border-[#DCDCDC] text-[13px] bg-[#F5F5F5]"
                          >
                            {skill}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddNew}
                  className="flex items-center gap-3 mb-8 mt-2"
                >
                  <span className="w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#8C8C8C]">
                    <Plus size={28} className="text-[#23272E]" />
                  </span>
                  <span className="text-[15px] font-medium text-[#23272E]">
                    Add Experience
                  </span>
                </button>
              </>
            ) : (
              <form className="space-y-6">
                {/* Job Title & Hospital/Clinic */}
                <div className="flex gap-6">
                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      Job Title*
                    </label>
                    <input
                      name="jobTitle"
                      value={formValues.jobTitle}
                      onChange={handleChange}
                      type="text"
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter job title"
                    />
                  </div>

                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      Hospital/Clinic*
                    </label>
                    <input
                      name="hospital"
                      value={formValues.hospital}
                      onChange={handleChange}
                      type="text"
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter hospital/clinic"
                    />
                  </div>
                </div>

                {/* Employment Type & Location */}
                <div className="flex gap-6">
                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      Employment Type
                    </label>
                    <Select
                      name="employmentType"
                      options={employmentTypeOptions}
                      value={employmentTypeOptions.find(
                        (option) => option.value === formValues.employmentType
                      )}
                      onChange={(option) =>
                        handleSelectChange(option, "employmentType")
                      }
                      placeholder="Select"
                      className="text-[13px]"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "48px",
                          height: "48px",
                          borderColor: "#e5e7eb",
                          borderRadius: "0.5rem",
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

                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      Location
                    </label>
                    <Select
                      name="location"
                      options={locationOptions}
                      value={locationOptions.find(
                        (option) => option.value === formValues.location
                      )}
                      onChange={(option) =>
                        handleSelectChange(option, "location")
                      }
                      placeholder="Select"
                      className="text-[13px]"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "48px",
                          height: "48px",
                          borderColor: "#e5e7eb",
                          borderRadius: "0.5rem",
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

                {/* Time Period */}
                <div className="flex gap-6">
                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      Time Period*
                    </label>
                    <input
                      name="startDate"
                      type="date"
                      value={formValues.startDate}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {!formValues.currentlyWorking && (
                    <div className="w-1/2">
                      <label className="block text-[15px] text-gray-900 mb-1">
                        End Date
                      </label>
                      <input
                        name="endDate"
                        type="date"
                        value={formValues.endDate}
                        onChange={handleChange}
                        className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}
                </div>

                {/* Currently Working Checkbox */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="currentlyWorking"
                    checked={formValues.currentlyWorking}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-500 rounded"
                  />
                  <label className="text-[15px] text-gray-900">Present</label>
                </div>

                {/* Skills */}
                <div>
                  <label className="block text-[15px] text-gray-900 mb-1">
                    Skills*
                  </label>
                  <div className="relative w-full">
                    <input
                      type="text"
                      name="skills"
                      value={skillInput}
                      onChange={handleSkillInputChange}
                      onKeyDown={handleSkillInputKeyDown}
                      placeholder="Add skill and press enter"
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 pr-10"
                    />
                    {skillInput.trim() && (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-800"
                        onClick={addSkill}
                        tabIndex={-1}
                      >
                        <Check size={20} />
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formValues.skills &&
                      formValues.skills.map((skill, idx) => (
                        <div
                          key={idx}
                          className="px-3 h-[44px] py-1.5 rounded-md border border-[#DCDCDC] flex items-center text-sm"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleSkillRemove(idx)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <span>&times;</span>
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[15px] text-gray-900 mb-1">
                    Description
                  </label>
                  <ReactQuill
                    theme="snow"
                    value={formValues.description}
                    onChange={handleQuillChange}
                    modules={modules}
                    className="[&_.ql-container]:rounded-b-lg [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:h-[200px] [&_.ql-editor]:text-[14px] [&_.ql-editor]:text-gray-700"
                    placeholder="Describe your work experience..."
                  />
                </div>

                {/* Buttons */}
                {error && (
                  <div className="text-red-500 text-sm mb-2">{error}</div>
                )}
              </form>
            )}
          </div>
        </div>
        {/* Bottom Buttons - always at the bottom */}
        <div className="flex justify-between items-center pb-8 pt-4">
          <button
            type="button"
            onClick={onPrevious}
            className="w-[120px] h-[48px] bg-gray-100 text-[#1890FF] text-[15px] font-medium rounded-lg hover:bg-gray-200 transition-all"
          >
            Skip All
          </button>
          {showPreview ? (
            <button
              type="button"
              onClick={onNext}
              className="w-[180px] h-[48px] bg-[#4285F4] text-white text-[17px] font-medium rounded-lg hover:bg-blue-600 transition-all shadow-none"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddOrUpdate}
              className="w-[180px] h-[48px] bg-[#4285F4] text-white text-[17px] font-medium rounded-lg hover:bg-blue-600 transition-all shadow-none"
            >
              Next
            </button>
          )}
        </div>
      </div>
      {/* Right (fixed, never scrolls) */}
      <div className="w-1/2 h-screen bg-[#f8f8f8] flex-shrink-0" />
    </div>
  );
};

WorkExperience.propTypes = {
  updateFormData: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
};

WorkExperience.defaultProps = {
  updateFormData: () => {},
};

export default WorkExperience;
