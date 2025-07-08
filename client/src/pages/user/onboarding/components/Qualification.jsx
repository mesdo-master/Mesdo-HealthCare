import {
  ArrowLeft,
  ChevronDown,
  Edit2,
  Trash2,
  Plus,
  Check,
} from "lucide-react";
import { useState, useEffect } from "react";
import Select from "react-select";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import StepProgressCircle from "../../../../components/StepProgressCircle";
import axios from "axios";

const Qualification = ({
  formData = {},
  updateFormData,
  onNext,
  onPrevious,
}) => {
  const [universities, setUniversities] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customUniversity, setCustomUniversity] = useState("");
  const [formValues, setFormValues] = useState({
    qualification: "",
    university: "",
    course: "",
    passingYear: "",
    specialization: "",
    courseType: "",
    skills: "",
    description: "",
  });
  const [qualList, setQualList] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [editIdx, setEditIdx] = useState(null);
  const [error, setError] = useState("");
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulated data - replace with your actual API calls
        setUniversities([
          { value: "university1", label: "University 1" },
          { value: "university2", label: "University 2" },
        ]);
        setQualifications([
          { value: "qualification1", label: "Qualification 1" },
          { value: "qualification2", label: "Qualification 2" },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.qualifications && Array.isArray(formData.qualifications)) {
      setQualList(formData.qualifications);
    }
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    updateFormData({ qualifications: qualList });
    // eslint-disable-next-line
  }, [qualList]);

  useEffect(() => {
    updateFormData({ ...formValues, skills });
  }, [formValues, skills]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    updateFormData({ [name]: value });
  };

  const handleUniversityChange = (selectedOption) => {
    if (selectedOption.value === "other") {
      setIsOtherSelected(true);
      setFormValues((prev) => ({ ...prev, university: "" }));
    } else {
      setIsOtherSelected(false);
      setFormValues((prev) => ({ ...prev, university: selectedOption.value }));
      updateFormData({ university: selectedOption.value });
    }
  };

  const handleSkillInputChange = (e) => setSkillInput(e.target.value);
  const handleSkillInputKeyDown = (e) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      addSkill();
    }
  };
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };
  const handleSkillRemove = (idx) => {
    setSkills(skills.filter((_, i) => i !== idx));
  };

  const handleAddOtherUniversity = async () => {
    if (customUniversity.trim()) {
      try {
        // Replace with your actual API endpoint
        await axios.post("/api/universities", { name: customUniversity });
        setUniversities([
          ...universities,
          { value: customUniversity, label: customUniversity },
        ]);
        setFormValues((prev) => ({ ...prev, university: customUniversity }));
        setIsOtherSelected(false);
        setCustomUniversity("");
      } catch (err) {
        setError("Failed to add university");
      }
    }
  };

  const handleAddOrUpdate = () => {
    if (
      !formValues.qualification ||
      !formValues.university ||
      !formValues.course ||
      !formValues.passingYear ||
      !formValues.specialization ||
      !formValues.courseType
    ) {
      setError("Please fill all required fields.");
      return;
    }
    setError("");
    let updatedList = [...qualList];
    const newEntry = { ...formValues, skills };
    if (editIdx !== null) {
      updatedList[editIdx] = newEntry;
    } else {
      updatedList.push(newEntry);
    }
    setQualList(updatedList);
    setShowPreview(true);
    setEditIdx(null);
    setFormValues({
      qualification: "",
      university: "",
      course: "",
      passingYear: "",
      specialization: "",
      courseType: "",
      skills: "",
      description: "",
    });
    setSkills([]);
  };

  const handleEdit = (idx) => {
    setEditIdx(idx);
    setFormValues({ ...qualList[idx], skills: undefined });
    setSkills(Array.isArray(qualList[idx].skills) ? qualList[idx].skills : []);
    setShowPreview(false);
  };

  const handleDelete = (idx) => {
    const updated = qualList.filter((_, i) => i !== idx);
    setQualList(updated);
    setShowPreview(true);
  };

  const handleAddNew = () => {
    setEditIdx(null);
    setFormValues({
      qualification: "",
      university: "",
      course: "",
      passingYear: "",
      specialization: "",
      courseType: "",
      skills: "",
      description: "",
    });
    setShowPreview(false);
  };

  return (
    <div className="flex h-screen">
      <div
        className="w-1/2 flex flex-col justify-between px-[100px] mt-10"
        style={{ minWidth: 560 }}
      >
        <div>
          <button className="mb-8 mt-2 text-left" onClick={onPrevious}>
            <ArrowLeft size={28} className="text-black" />
          </button>
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-inter font-semibold text-[32px] leading-[130%] tracking-[0px] mb-1">
              Qualifications
            </h1>
            <StepProgressCircle currentStep={1} totalSteps={5} />
          </div>
          <p className="text-[13px] font-sm text-[#8C8C8C] mb-8">
            Include all of your qualification in this section.
          </p>
          <div className="flex-1">
            {showPreview ? (
              <>
                {qualList.map((q, idx) => (
                  <div key={idx} className="mb-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-[20px] font-semibold text-black leading-tight mb-1">
                          {q.qualification} {q.course && `| ${q.course}`}
                        </div>
                        <div className="text-[15px] text-[#8C8C8C] mb-1">
                          {q.university}{" "}
                          {q.specialization && `| ${q.specialization}`}{" "}
                          {q.courseType && `| ${q.courseType}`}
                        </div>
                        <div className="text-[13px] text-[#8C8C8C] mb-2">
                          {q.passingYear}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-[-45px]">
                        <button
                          type="button"
                          className="w-9 h-9 rounded-full border border-[#E5E5E5] bg-white  flex items-center justify-center hover:bg-gray-100"
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
                    {q.description && (
                      <ul className="list-disc pl-5 mt-2 text-[15px] text-black">
                        {q.description
                          .replace(/<(.|\n)*?>/g, "")
                          .split(/\n|•|\r/)
                          .filter((line) => line.trim())
                          .map((line, i) => (
                            <li key={i}>{line.trim()}</li>
                          ))}
                      </ul>
                    )}
                    {q.skills &&
                      Array.isArray(q.skills) &&
                      q.skills.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {q.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-md border border-[#DCDCDC] text-[13px] bg-[#F5F5F5]"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    {q.skills &&
                      typeof q.skills === "string" &&
                      q.skills.trim() && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {q.skills.split(",").map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1 rounded-md border border-[#DCDCDC] text-[13px] bg-[#F5F5F5]"
                            >
                              {skill.trim()}
                            </span>
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
                    Add Qualification
                  </span>
                </button>
              </>
            ) : (
              <form className="space-y-6">
                {/* Qualification & University */}
                <div className="flex gap-6">
                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      Qualification*
                    </label>
                    <Select
                      name="qualification"
                      value={qualifications.find(
                        (q) => q.value === formValues.qualification
                      )}
                      onChange={(option) => {
                        setFormValues((prev) => ({
                          ...prev,
                          qualification: option.value,
                        }));
                        updateFormData({ qualification: option.value });
                      }}
                      options={qualifications}
                      placeholder="Select"
                      className="text-[13px]"
                      styles={{
                        control: (base) => ({
                          ...base,
                          minHeight: "48px",
                          height: "48px",
                          borderColor: "#e5e7eb",
                          borderRadius: "0.5rem",
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
                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      University*
                    </label>
                    <Select
                      options={[
                        ...universities,
                        { value: "other", label: "Other" },
                      ]}
                      value={universities.find(
                        (uni) => uni.value === formValues.university
                      )}
                      onChange={handleUniversityChange}
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
                    {isOtherSelected && (
                      <div className="flex gap-2 mt-2">
                        <input
                          type="text"
                          placeholder="Enter university name"
                          value={customUniversity}
                          onChange={(e) => setCustomUniversity(e.target.value)}
                          className="block w-full h-[48px] rounded-lg border border-gray-200 bg-gray-50 px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddOtherUniversity}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                        >
                          Add
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Course & Passing Year */}
                <div className="flex gap-6">
                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      Course*
                    </label>
                    <div className="relative">
                      <select
                        name="course"
                        value={formValues.course}
                        onChange={handleChange}
                        className="appearance-none block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="btech">B.Tech</option>
                        <option value="mtech">M.Tech</option>
                        <option value="bca">BCA</option>
                        <option value="mca">MCA</option>
                      </select>
                      <ChevronDown
                        size={20}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>
                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      Passing Year*
                    </label>
                    <div className="relative">
                      <select
                        name="passingYear"
                        value={formValues.passingYear}
                        onChange={handleChange}
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

                {/* Specialization & Course Type */}
                <div className="flex gap-6">
                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      Specialization*
                    </label>
                    <div className="relative">
                      <select
                        name="specialization"
                        value={formValues.specialization}
                        onChange={handleChange}
                        className="appearance-none block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="cs">Computer Science</option>
                        <option value="me">Mechanical Engineering</option>
                        <option value="ee">Electrical Engineering</option>
                      </select>
                      <ChevronDown
                        size={20}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>
                  <div className="w-1/2">
                    <label className="block text-[15px] text-gray-900 mb-1">
                      Course Type*
                    </label>
                    <div className="relative">
                      <select
                        name="courseType"
                        value={formValues.courseType}
                        onChange={handleChange}
                        className="appearance-none block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select</option>
                        <option value="fulltime">Full Time</option>
                        <option value="parttime">Part Time</option>
                      </select>
                      <ChevronDown
                        size={20}
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                    </div>
                  </div>
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
                    {skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded flex items-center"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleSkillRemove(idx)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
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
                    onChange={(value) => {
                      setFormValues((prev) => ({
                        ...prev,
                        description: value,
                      }));
                      updateFormData({ description: value });
                    }}
                    modules={modules}
                    className="[&_.ql-container]:rounded-b-lg [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:h-[200px] [&_.ql-editor]:text-[14px] [&_.ql-editor]:text-gray-700"
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
      <div className="w-1/2 bg-[#f8f8f8]" />
    </div>
  );
};

export default Qualification;
