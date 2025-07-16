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
  const [courses, setCourses] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customUniversity, setCustomUniversity] = useState("");
  const [loading, setLoading] = useState({
    universities: false,
    qualifications: false,
    courses: false,
    specializations: false,
  });
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

  // Cache for universities to avoid repeated API calls
  const [universitiesCache, setUniversitiesCache] = useState(null);

  // Initialize qualifications with existing data when component mounts
  useEffect(() => {
    if (
      formData &&
      formData.qualifications &&
      formData.qualifications.length > 0
    ) {
      setQualList(formData.qualifications);
      setShowPreview(true);
    }
  }, [formData]);

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

  // Fetch Universities from APIs with caching
  const fetchUniversities = async () => {
    // Return cached data if available
    if (universitiesCache) {
      setUniversities(universitiesCache);
      return;
    }

    setLoading((prev) => ({ ...prev, universities: true }));
    try {
      // Fallback data for major universities - prioritize this for speed
      const fallbackUniversities = [
        // Indian Universities
        {
          value: "Indian Institute of Technology Delhi",
          label: "Indian Institute of Technology Delhi - Delhi, India",
          country: "India",
        },
        {
          value: "Indian Institute of Technology Bombay",
          label: "Indian Institute of Technology Bombay - Mumbai, India",
          country: "India",
        },
        {
          value: "Indian Institute of Technology Madras",
          label: "Indian Institute of Technology Madras - Chennai, India",
          country: "India",
        },
        {
          value: "Indian Institute of Technology Kanpur",
          label: "Indian Institute of Technology Kanpur - Kanpur, India",
          country: "India",
        },
        {
          value: "Indian Institute of Technology Kharagpur",
          label: "Indian Institute of Technology Kharagpur - Kharagpur, India",
          country: "India",
        },
        {
          value: "Indian Institute of Science",
          label: "Indian Institute of Science - Bangalore, India",
          country: "India",
        },
        {
          value: "University of Delhi",
          label: "University of Delhi - Delhi, India",
          country: "India",
        },
        {
          value: "Jawaharlal Nehru University",
          label: "Jawaharlal Nehru University - Delhi, India",
          country: "India",
        },
        {
          value: "University of Mumbai",
          label: "University of Mumbai - Mumbai, India",
          country: "India",
        },
        {
          value: "University of Calcutta",
          label: "University of Calcutta - Kolkata, India",
          country: "India",
        },
        {
          value: "Anna University",
          label: "Anna University - Chennai, India",
          country: "India",
        },
        {
          value: "Banaras Hindu University",
          label: "Banaras Hindu University - Varanasi, India",
          country: "India",
        },
        {
          value: "Aligarh Muslim University",
          label: "Aligarh Muslim University - Aligarh, India",
          country: "India",
        },
        {
          value: "Jamia Millia Islamia",
          label: "Jamia Millia Islamia - Delhi, India",
          country: "India",
        },
        // International Universities
        {
          value: "Harvard University",
          label: "Harvard University - Cambridge, USA",
          country: "USA",
        },
        {
          value: "Stanford University",
          label: "Stanford University - Stanford, USA",
          country: "USA",
        },
        {
          value: "Massachusetts Institute of Technology",
          label: "Massachusetts Institute of Technology - Cambridge, USA",
          country: "USA",
        },
        {
          value: "University of Cambridge",
          label: "University of Cambridge - Cambridge, UK",
          country: "UK",
        },
        {
          value: "University of Oxford",
          label: "University of Oxford - Oxford, UK",
          country: "UK",
        },
        {
          value: "University of Toronto",
          label: "University of Toronto - Toronto, Canada",
          country: "Canada",
        },
        {
          value: "University of Melbourne",
          label: "University of Melbourne - Melbourne, Australia",
          country: "Australia",
        },
        {
          value: "National University of Singapore",
          label: "National University of Singapore - Singapore",
          country: "Singapore",
        },
        {
          value: "University of Tokyo",
          label: "University of Tokyo - Tokyo, Japan",
          country: "Japan",
        },
        {
          value: "ETH Zurich",
          label: "ETH Zurich - Zurich, Switzerland",
          country: "Switzerland",
        },
      ];

      // Set fallback data immediately for better UX
      const fallbackWithOther = [
        ...fallbackUniversities,
        {
          value: "other",
          label: "Other (Please specify)",
          country: "Other",
        },
      ];

      setUniversities(fallbackWithOther);
      setUniversitiesCache(fallbackWithOther);

      // Optionally fetch more universities in background (removed for performance)
      // Users can use "Other" option if their university is not listed
    } catch (error) {
      console.error("Error setting up universities:", error);
      // Fallback to basic options if everything fails
      const basicOptions = [
        { value: "other", label: "Other (Please specify)", country: "Other" },
      ];
      setUniversities(basicOptions);
      setUniversitiesCache(basicOptions);
    } finally {
      setLoading((prev) => ({ ...prev, universities: false }));
    }
  };

  // Fetch Qualifications
  const fetchQualifications = async () => {
    setLoading((prev) => ({ ...prev, qualifications: true }));
    try {
      // Comprehensive qualification levels
      const qualificationLevels = [
        { value: "high_school", label: "High School/Secondary Education" },
        { value: "diploma", label: "Diploma" },
        { value: "bachelor", label: "Bachelor's Degree" },
        { value: "master", label: "Master's Degree" },
        { value: "phd", label: "PhD/Doctorate" },
        { value: "certificate", label: "Professional Certificate" },
        { value: "associate", label: "Associate Degree" },
        { value: "postgraduate_diploma", label: "Postgraduate Diploma" },
        {
          value: "professional_degree",
          label: "Professional Degree (Law, Medicine, etc.)",
        },
        { value: "other", label: "Other" },
      ];

      setQualifications(qualificationLevels);
    } catch (error) {
      console.error("Error setting qualifications:", error);
    } finally {
      setLoading((prev) => ({ ...prev, qualifications: false }));
    }
  };

  // Fetch Courses
  const fetchCourses = async () => {
    setLoading((prev) => ({ ...prev, courses: true }));
    try {
      // Comprehensive course list organized by category
      const courseCategories = [
        // Engineering & Technology
        { value: "computer_science", label: "Computer Science & Engineering" },
        { value: "information_technology", label: "Information Technology" },
        { value: "mechanical_engineering", label: "Mechanical Engineering" },
        { value: "electrical_engineering", label: "Electrical Engineering" },
        { value: "civil_engineering", label: "Civil Engineering" },
        { value: "chemical_engineering", label: "Chemical Engineering" },
        {
          value: "electronics_communication",
          label: "Electronics & Communication Engineering",
        },
        { value: "aerospace_engineering", label: "Aerospace Engineering" },
        { value: "biotechnology", label: "Biotechnology" },

        // Business & Management
        {
          value: "business_administration",
          label: "Business Administration (BBA/MBA)",
        },
        { value: "management", label: "Management" },
        { value: "marketing", label: "Marketing" },
        { value: "finance", label: "Finance" },
        { value: "human_resources", label: "Human Resources" },
        { value: "operations_management", label: "Operations Management" },
        { value: "international_business", label: "International Business" },

        // Arts & Humanities
        { value: "english_literature", label: "English Literature" },
        { value: "history", label: "History" },
        { value: "philosophy", label: "Philosophy" },
        { value: "psychology", label: "Psychology" },
        { value: "sociology", label: "Sociology" },
        { value: "political_science", label: "Political Science" },
        { value: "journalism", label: "Journalism & Mass Communication" },

        // Science
        { value: "physics", label: "Physics" },
        { value: "chemistry", label: "Chemistry" },
        { value: "biology", label: "Biology" },
        { value: "mathematics", label: "Mathematics" },
        { value: "statistics", label: "Statistics" },
        { value: "environmental_science", label: "Environmental Science" },

        // Medical & Health Sciences
        { value: "medicine", label: "Medicine (MBBS)" },
        { value: "nursing", label: "Nursing" },
        { value: "pharmacy", label: "Pharmacy" },
        { value: "dentistry", label: "Dentistry" },
        { value: "physiotherapy", label: "Physiotherapy" },
        { value: "public_health", label: "Public Health" },

        // Law
        { value: "law", label: "Law (LLB/LLM)" },
        { value: "corporate_law", label: "Corporate Law" },
        { value: "criminal_law", label: "Criminal Law" },

        // Education
        { value: "education", label: "Education (B.Ed/M.Ed)" },
        { value: "early_childhood", label: "Early Childhood Education" },

        // Commerce & Economics
        { value: "commerce", label: "Commerce" },
        { value: "economics", label: "Economics" },
        { value: "accounting", label: "Accounting" },
        { value: "banking", label: "Banking & Finance" },

        // Arts & Design
        { value: "fine_arts", label: "Fine Arts" },
        { value: "graphic_design", label: "Graphic Design" },
        { value: "fashion_design", label: "Fashion Design" },
        { value: "interior_design", label: "Interior Design" },

        // Agriculture & Food Sciences
        { value: "agriculture", label: "Agriculture" },
        { value: "food_technology", label: "Food Technology" },
        { value: "veterinary", label: "Veterinary Science" },

        // Other
        { value: "other", label: "Other (Please specify)" },
      ];

      setCourses(courseCategories);
    } catch (error) {
      console.error("Error setting courses:", error);
    } finally {
      setLoading((prev) => ({ ...prev, courses: false }));
    }
  };

  // Fetch Specializations based on selected course
  const fetchSpecializations = async (courseValue) => {
    setLoading((prev) => ({ ...prev, specializations: true }));
    try {
      let specializationOptions = [];

      // Define specializations based on course
      const specializationMap = {
        computer_science: [
          {
            value: "artificial_intelligence",
            label: "Artificial Intelligence",
          },
          { value: "machine_learning", label: "Machine Learning" },
          { value: "data_science", label: "Data Science" },
          { value: "cybersecurity", label: "Cybersecurity" },
          { value: "software_engineering", label: "Software Engineering" },
          { value: "web_development", label: "Web Development" },
          { value: "mobile_development", label: "Mobile Development" },
          { value: "cloud_computing", label: "Cloud Computing" },
          { value: "blockchain", label: "Blockchain Technology" },
          { value: "computer_networks", label: "Computer Networks" },
          { value: "database_systems", label: "Database Systems" },
          {
            value: "human_computer_interaction",
            label: "Human-Computer Interaction",
          },
        ],
        business_administration: [
          { value: "strategic_management", label: "Strategic Management" },
          { value: "entrepreneurship", label: "Entrepreneurship" },
          { value: "digital_marketing", label: "Digital Marketing" },
          { value: "financial_management", label: "Financial Management" },
          { value: "supply_chain", label: "Supply Chain Management" },
          { value: "project_management", label: "Project Management" },
          { value: "business_analytics", label: "Business Analytics" },
          { value: "international_business", label: "International Business" },
        ],
        medicine: [
          { value: "cardiology", label: "Cardiology" },
          { value: "neurology", label: "Neurology" },
          { value: "pediatrics", label: "Pediatrics" },
          { value: "surgery", label: "Surgery" },
          { value: "internal_medicine", label: "Internal Medicine" },
          { value: "orthopedics", label: "Orthopedics" },
          { value: "radiology", label: "Radiology" },
          { value: "emergency_medicine", label: "Emergency Medicine" },
        ],
        mechanical_engineering: [
          { value: "automotive", label: "Automotive Engineering" },
          { value: "aerospace", label: "Aerospace Engineering" },
          { value: "thermal", label: "Thermal Engineering" },
          { value: "manufacturing", label: "Manufacturing Engineering" },
          { value: "robotics", label: "Robotics" },
          { value: "fluid_mechanics", label: "Fluid Mechanics" },
          { value: "materials", label: "Materials Engineering" },
        ],
        // Add more specializations for other courses as needed
        default: [
          { value: "general", label: "General" },
          { value: "research", label: "Research" },
          { value: "applied", label: "Applied" },
          { value: "theoretical", label: "Theoretical" },
        ],
      };

      specializationOptions =
        specializationMap[courseValue] || specializationMap.default;
      specializationOptions.push({
        value: "other",
        label: "Other (Please specify)",
      });

      setSpecializations(specializationOptions);
    } catch (error) {
      console.error("Error setting specializations:", error);
    } finally {
      setLoading((prev) => ({ ...prev, specializations: false }));
    }
  };

  useEffect(() => {
    fetchUniversities();
    fetchQualifications();
    fetchCourses();
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

  const handleCourseChange = (e) => {
    const { value } = e.target;
    setFormValues((prev) => ({ ...prev, course: value, specialization: "" }));
    updateFormData({ course: value, specialization: "" });

    // Fetch specializations for the selected course
    if (value) {
      fetchSpecializations(value);
    }
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

    // Update parent form data with the new qualifications list
    updateFormData({ qualifications: updatedList });

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
    const qualItem = qualList[idx];

    // Properly handle skills field
    const skillsArray = Array.isArray(qualItem.skills)
      ? qualItem.skills
      : typeof qualItem.skills === "string"
      ? qualItem.skills
          .split(",")
          .map((s) => s.trim())
          .filter((s) => s)
      : [];

    setFormValues({
      ...qualItem,
      skills: skillsArray.join(", "), // Convert back to string for form display
    });
    setSkills(skillsArray);
    setShowPreview(false);
  };

  const handleDelete = (idx) => {
    const updated = qualList.filter((_, i) => i !== idx);
    setQualList(updated);

    // Update parent form data with the updated qualifications list
    updateFormData({ qualifications: updated });

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
    setSkills([]); // Reset skills array
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
                      placeholder={
                        loading.qualifications
                          ? "Loading qualifications..."
                          : "Select"
                      }
                      isLoading={loading.qualifications}
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
                      options={universities}
                      value={universities.find(
                        (uni) => uni.value === formValues.university
                      )}
                      onChange={handleUniversityChange}
                      placeholder={
                        loading.universities
                          ? "Loading universities..."
                          : "Select"
                      }
                      isLoading={loading.universities}
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
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
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
                        onChange={handleCourseChange}
                        disabled={loading.courses}
                        className="appearance-none block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">
                          {loading.courses ? "Loading courses..." : "Select"}
                        </option>
                        {courses.map((course) => (
                          <option key={course.value} value={course.value}>
                            {course.label}
                          </option>
                        ))}
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
                        {Array.from({ length: 50 }, (_, i) => {
                          const year = new Date().getFullYear() - i;
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
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
                        disabled={loading.specializations || !formValues.course}
                        className="appearance-none block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                      >
                        <option value="">
                          {loading.specializations
                            ? "Loading specializations..."
                            : !formValues.course
                            ? "Select course first"
                            : "Select"}
                        </option>
                        {specializations.map((spec) => (
                          <option key={spec.value} value={spec.value}>
                            {spec.label}
                          </option>
                        ))}
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
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="distance">Distance Learning</option>
                        <option value="online">Online</option>
                        <option value="correspondence">Correspondence</option>
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
