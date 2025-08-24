import { useNavigate, useLocation } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { useState, useRef, useEffect } from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import axiosInstance from "../../../../lib/axio";
import { Check } from "lucide-react";
import Confetti from "react-confetti";
import { motion, AnimatePresence } from "framer-motion";

// A small helper component for label-value rows in the review step
function ReviewRow({ label, value, children }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="text-gray-600 text-sm font-medium">{label}</div>
      <div className="col-span-2 text-gray-800">
        {children || value || "N/A"}
      </div>
    </div>
  );
}

// Utility to strip HTML tags
function stripHtml(html) {
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

export default function CreateJob() {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1); // Step state: 1 = Job Info, 2 = Additional Info, 3 = Review
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Add window size tracking for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [formData, setFormData] = useState({
    jobTitle: "",
    jobCategory: "",
    location: "",
    endDate: "",
    openings: "",
    salaryRangeFrom: "",
    salaryRangeTo: "",
    employmentType: "",
    primaryUser: "",
    email: "",
    phone: "",
    coworker: "",
    branch: "",
    experience: "",
    skillInput: "",
    skills: [],
    qualification: "",
    department: "",
    Shift: "",
    language: "",
    specialization: "",
    jobDescription: description,
  });
  const [showBackModal, setShowBackModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Prefill logic for edit
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const jobId = params.get("jobId");
    if (jobId) {
      setIsEditMode(true);
      (async () => {
        try {
          const res = await axiosInstance.get(`/jobs`, { params: { jobId } });
          let job = null;
          if (Array.isArray(res.data.jobs)) {
            job = res.data.jobs.find((j) => j._id === jobId);
          } else if (res.data.job) {
            job = res.data.job;
          }
          if (job) {
            setFormData({
              ...formData,
              ...job,
              skillInput: "",
              jobDescription: job.jobDescription,
            });
            setDescription(job.jobDescription || "");
          }
        } catch (err) {
          try {
            const res = await axiosInstance.get(`/jobs/${jobId}`);
            const job = res.data.job || res.data;
            setFormData({
              ...formData,
              ...job,
              skillInput: "",
              jobDescription: job.jobDescription,
            });
            setDescription(job.jobDescription || "");
          } catch (err2) {
            console.error("Error fetching job:", err2);
          }
        }
      })();
    }
  }, [location.search]);

  // ✅ Track window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Remove shadows from ReactQuill component
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .ql-toolbar.ql-snow {
        box-shadow: none !important;
        border: 1px solid #e5e7eb !important;
        border-bottom: none !important;
      }
      .ql-container.ql-snow {
        box-shadow: none !important;
        border: 1px solid #e5e7eb !important;
      }
      .ql-editor {
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ✅ Consistent left spacing, adaptive layout
  const getResponsiveLayout = () => {
    if (windowWidth <= 1599) {
      // Small/normal screens - consistent left spacing
      return {
        marginLeft: "150px", // Fixed left spacing for 13" Mac and smaller screens
        paddingLeft: "60px",
        paddingRight: "48px",
        padding: "40px",
        topPadding: "pt-[15vh]", // pt-15vh for small screens
      };
    } else if (windowWidth <= 1920) {
      // Medium screens
      return {
        marginLeft: "100px", // Same left spacing for medium screens
        paddingLeft: "55px",
        paddingRight: "32px",
        padding: "40px",
        topPadding: "pt-[13vh]", // pt-13vh for medium screens
      };
    } else {
      // Large screens
      return {
        marginLeft: "-40px", // Same left spacing for big screens
        paddingLeft: "32px",
        paddingRight: "32px",
        padding: "40px",
        topPadding: "pt-[13vh]", // pt-13vh for large screens
      };
    }
  };

  const layout = getResponsiveLayout();

  // Utility to check if the form is empty
  const isFormEmpty = () => {
    // Check if any field has meaningful content
    const hasContent = Object.values(formData).some((val) => {
      if (typeof val === "string") {
        return val.trim().length > 0;
      } else if (Array.isArray(val)) {
        return val.length > 0;
      } else if (val !== null && val !== undefined && val !== "") {
        return true;
      }
      return false;
    });

    // Also check if description has content
    const hasDescription = description.trim().length > 0;

    return !hasContent && !hasDescription;
  };

  const handleBack = () => {
    if (step === 1) {
      // Only on Step 1, check if we should show draft modal or go back to recruiter page
      if (isFormEmpty()) {
        navigate("/recuritement");
      } else {
        setShowBackModal(true);
      }
    } else {
      // On Step 2 or 3, go back to previous step
      setStep((prev) => Math.max(prev - 1, 1));
    }
  };

  const handleCancelBack = () => setShowBackModal(false);
  const handleSaveDraft = async () => {
    // Save as draft using the /jobs/create endpoint with status: 'Draft'
    try {
      await axiosInstance.post("/jobs/create", {
        formData: { ...formData, status: "Draft" },
        description,
      });
      setShowBackModal(false);
      navigate("/recuritement");
    } catch (error) {
      alert("Failed to save draft. Please try again.");
      setShowBackModal(false);
    }
  };

  const handleNext = () => {
    console.log("FormData:", formData);
    console.log("Description:", description);

    if (step === 1) {
      // Basic validations
      if (
        typeof formData.jobTitle !== "string" ||
        !formData.jobTitle.trim() ||
        typeof description !== "string" ||
        !description.trim() ||
        typeof formData.jobCategory !== "string" ||
        !formData.jobCategory.trim() ||
        typeof formData.location !== "string" ||
        !formData.location.trim() ||
        // !formData.endDate?.trim() ||
        (typeof formData.openings === "string" && !formData.openings.trim()) ||
        (typeof formData.salaryRangeFrom === "string" &&
          !formData.salaryRangeFrom.trim() &&
          formData.salaryRangeFrom !== 0) ||
        (typeof formData.salaryRangeTo === "string" &&
          !formData.salaryRangeTo.trim() &&
          formData.salaryRangeTo !== 0)
      ) {
        alert("Please fill out all required fields.");
        return;
      }
      if (!Number(formData.openings) || Number(formData.openings) <= 0) {
        alert("Openings must be a positive number.");
        return;
      }
    }

    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePrevious = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  // This handles pressing 'Enter' inside the skill input
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission on Enter
      const newSkill = formData.skillInput.trim();
      if (newSkill) {
        setFormData((prev) => ({
          ...prev,
          skills: [...prev.skills, newSkill],
          skillInput: "", // Clear the input
        }));
      }
    }
  };

  // Remove a skill from the array by index
  const removeSkill = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleJobPublish = async () => {
    setLoading(true);
    const params = new URLSearchParams(location.search);
    const jobId = params.get("jobId");
    try {
      if (!formData.jobTitle || formData.jobTitle.trim() === "") {
        alert("Please enter the job title.");
        return;
      }
      // Ensure language is always an array of strings
      const languageArray = Array.isArray(formData.language)
        ? formData.language.filter(Boolean)
        : formData.language
        ? [formData.language]
        : [];
      // Strip HTML tags from description before sending
      const plainDescription = stripHtml(description);
      let response;
      if (isEditMode && jobId) {
        response = await axiosInstance.put(`/jobs/${jobId}`, {
          formData: { ...formData, language: languageArray },
          description: plainDescription,
        });
      } else {
        response = await axiosInstance.post("/jobs/create", {
          formData: { ...formData, language: languageArray },
          description: plainDescription,
        });
      }
      if (response && (response.status === 200 || response.status === 201)) {
        setSuccessMessage(
          isEditMode ? "Job Updated Successfully!" : "Job Created Successfully!"
        );
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigate("/recruitment");
        }, 2500);
        return; // Ensure no further code runs
      } else {
        alert("Unexpected response from the server. Please try again later.");
      }
    } catch (error) {
      if (error.response) {
        console.error("Server Error:", error);
        alert(
          error.response.data.message ||
            "An error occurred while saving the job. Please try again."
        );
      } else if (error.request) {
        console.error("No Response:", error.request);
        alert(
          "No response from the server. Please check your internet connection and try again."
        );
      } else {
        console.error("Error:", error.message);
        alert("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen flex justify-center items-center mt-[-20px] mr-[2px] ml-[-230px]">
      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              numberOfPieces={500}
              gravity={0.3}
              wind={0.01}
              recycle={false}
              colors={[
                "#10b981",
                "#3b82f6",
                "#f59e42",
                "#f43f5e",
                "#6366f1",
                "#fbbf24",
                "#22d3ee",
                "#a21caf",
              ]}
              initialVelocityY={18}
              initialVelocityX={8}
              tweenDuration={900}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="bg-white border border-emerald-200 rounded-2xl px-12 py-10 flex flex-col items-center gap-4"
              style={{ minWidth: 340 }}
            >
              <svg
                className="w-16 h-16 text-emerald-500 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="#d1fae5"
                />
                <path
                  d="M7 13l3 3 7-7"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              <span className="text-2xl font-bold text-emerald-700 text-center">
                {successMessage}
              </span>
              <span className="text-gray-500 text-center">
                Redirecting to Recruitment Dashboard...
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div
        className={`w-[80%] py-[10vh] ${layout.topPadding}`}
        style={{
          marginLeft: layout.marginLeft,
        }}
      >
        <div
          className="max-w-4.6xl mx-auto bg-white rounded-xl p-6 border border-[#DDE4EE] overflow-hidden"
          style={{
            marginLeft: layout.marginLeft,
            paddingLeft: layout.paddingLeft,
            paddingRight: layout.paddingRight,
            padding: layout.padding,
          }}
        >
          {/* Header */}
          <div className="mb-6 flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center text-black font-medium cursor-pointer"
            >
              <ChevronLeftIcon className="w-6 h-6 text-[#1A2248] mr-2" />
              Back
            </button>
            <span className="text-gray-500">/</span>
            <h2 className="text-lg font-semibold text-gray-800">Create Job</h2>
          </div>

          {/* Back Confirmation Modal */}
          {showBackModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-xl p-8 max-w-md w-full mx-auto flex flex-col items-center">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 text-center">
                  Save Your Progress
                </h3>
                <p className="text-gray-500 text-center mb-6">
                  You have unsaved changes. Would you like to save this job as a
                  draft before going back?
                </p>
                <div className="flex w-full gap-3 mt-2">
                  <button
                    onClick={handleCancelBack}
                    className="flex-1 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    className="flex-1 py-2 rounded-lg bg-[#E6F0FF] text-[#1890FF] font-medium hover:bg-[#d0e7ff] transition"
                  >
                    Save as Draft
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Refined Professional Step Markers */}
          <div className="relative flex items-center mb-10">
            {["Job Information", "Additional Information", "Review"].map(
              (label, index) => (
                <div key={index} className="relative flex-1 mt-2">
                  {/* Step Line - Extended to connect with next segment */}
                  {index < 2 && ( // Only for first two steps, not the Review step
                    <div
                      className={`h-px transition-colors duration-300 ${
                        // Step 1 line (index 0): green when step 1 is completed (step > 1)
                        // Step 2 line (index 1): green when we are on step 2 or step 2 is completed (step >= 2)
                        (index === 0 && step > 1) || (index === 1 && step >= 2)
                          ? "bg-[#73D13D]" // Green for completed step 1 or when on/completed step 2
                          : "bg-gray-200" // Default gray
                      } ${
                        index === 0
                          ? "ml-8 w-full" // First step: start from left margin, extend full width to connect
                          : "w-full mr-8" // Second step: full width but end before right margin
                      }`}
                    ></div>
                  )}

                  {/* Line extending from left side of Step 3 (Review) pointer */}
                  {index === 2 && (
                    <div
                      className={`h-px transition-colors duration-300 ml-0 mr-8 ${
                        step >= 3
                          ? "bg-[#73D13D]" // When on step 3, show green connection to step 3
                          : "bg-gray-200" // Default gray
                      }`}
                      style={{ width: "calc(100% - 32px)" }}
                    ></div>
                  )}

                  {/* Step Indicator */}
                  <div
                    className={`absolute -top-3 flex items-center justify-center w-6 h-6 rounded-full border transition-all duration-200 ${
                      index === 0
                        ? "left-8" // Step 1 moved slightly to the right
                        : index === 2
                        ? "right-8" // Step 3 moved slightly to the left
                        : "left-1/2 transform -translate-x-1/2" // Step 2 centered between Step 1 and 3
                    } ${
                      step > index + 1
                        ? "bg-[#73D13D] text-white border-[#73D13D]" // Completed step - green #73D13D
                        : step === index + 1
                        ? "bg-white text-blue-400 border-blue-400" // Active/current step - white fill with light blue border and text
                        : "bg-white text-gray-400 border-gray-200" // Inactive step - white fill with gray text and border
                    }`}
                  >
                    {step > index + 1 ? (
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      <span className="text-xs font-semibold">{index + 1}</span>
                    )}
                  </div>

                  {/* Step Label */}
                  <div
                    className={`mt-3 ${
                      index === 0
                        ? "text-left " // Step 1 label starts before the circle pointer
                        : index === 2
                        ? "text-right mr-4 " // Step 3 label ends before the circle pointer
                        : "text-center" // Step 2 centered
                    }`}
                  >
                    <div
                      className={`text-sm font-medium transition-colors duration-200 ${
                        step > index + 1
                          ? "text-[#73D13D]" // Completed step - green text #73D13D
                          : step === index + 1
                          ? "text-blue-400" // Active step - light blue text to match the border
                          : "text-gray-400" // Inactive step - light gray text
                      }`}
                    >
                      {label}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Step Content */}
          {/* STEP 1 */}
          {step === 1 && (
            <div className="w-full text-sm min-h-[600px]">
              {/* Job Information */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600">
                  Job Title
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleChange}
                  className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  placeholder="Enter job title"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600">
                  Job Description
                </label>
                <ReactQuill
                  value={description}
                  onChange={setDescription}
                  placeholder="Add job description"
                  className="rounded-lg border border-gray-200 mt-1 [&_.ql-container]:rounded-b-lg [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:min-h-[180px] [&_.ql-editor]:text-[14px] [&_.ql-editor]:text-gray-700 [&_.ql-toolbar]:shadow-none [&_.ql-container]:shadow-none [&_.ql-editor]:shadow-none"
                />
              </div>

              {/* Employment Type Field */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600">
                  Employment Type
                </label>
                <div className="flex space-x-4 mt-1">
                  {["fulltime", "parttime", "internship", "contract"].map(
                    (type) => (
                      <label
                        key={type}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="employmentType"
                          value={type}
                          checked={formData.employmentType === type}
                          onChange={handleChange}
                          className="form-radio text-blue-500"
                        />
                        <span className="text-gray-700 capitalize">{type}</span>
                      </label>
                    )
                  )}
                </div>
              </div>

              {/* Experience Required - Full Width */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600">
                  Experience Required
                </label>
                <div className="relative">
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 pr-10 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 appearance-none"
                  >
                    <option value="">Select experience</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                    <option value="10+">10+</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Job Category and Number of Openings - Half and Half */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Job Category
                  </label>
                  <div className="relative">
                    <select
                      name="jobCategory"
                      value={formData.jobCategory}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 pr-10 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 appearance-none"
                    >
                      <option value="">Select job category</option>
                      <option value="Healthcare">Healthcare</option>
                      <option value="Technology">Technology</option>
                      <option value="Finance">Finance</option>
                      <option value="Education">Education</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Number of Openings with Custom Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Number of Openings
                  </label>
                  <div className="relative">
                    <select
                      name="openings"
                      value={formData.openings}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 pr-10 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 appearance-none"
                    >
                      <option value="">Select openings</option>
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                      <option value="custom">Custom</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {formData.openings === "custom" && (
                    <input
                      type="number"
                      name="customOpenings"
                      value={formData.customOpenings || ""}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 mt-2"
                      placeholder="Enter custom number of openings"
                    />
                  )}
                </div>
              </div>

              {/* Location - Full Width */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  placeholder="Search"
                />
              </div>

              {/* Salary Range - Full Width */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600">
                  Salary Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="number"
                      name="salaryRangeFrom"
                      value={formData.salaryRangeFrom}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      name="salaryRangeTo"
                      value={formData.salaryRangeTo}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                      placeholder="10000"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="w-full text-sm min-h-[600px]">
              {/* Skills */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600">
                  Skills
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="skillInput"
                    value={formData.skillInput}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    placeholder="Type a skill and press Enter"
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
                    onClick={handleKeyDown}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                </div>

                {/* Show the small message only if there is some text in the input */}
                {formData.skillInput.trim().length > 0 && (
                  <small className="text-gray-500">
                    Press Enter to add to skills
                  </small>
                )}

                {/* Display the skill chips */}
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.skills.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-md"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        className="ml-2 text-gray-700"
                        onClick={() => removeSkill(index)}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specializations Required - Full Width */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600">
                  Specializations Required
                </label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  placeholder="Search"
                />
              </div>

              {/* Qualification Required & Department - Half and Half */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Qualification Required
                  </label>
                  <input
                    type="text"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleChange}
                    className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    placeholder="Select"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Department
                  </label>
                  <div className="relative">
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 pr-10 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 appearance-none"
                    >
                      <option value="">Select</option>
                      <option value="Human Resources">Human Resources</option>
                      <option value="Finance">Finance</option>
                      <option value="Marketing">Marketing</option>
                      <option value="Sales">Sales</option>
                      <option value="Engineering">Engineering</option>
                      <option value="Design">Design</option>
                      <option value="Operations">Operations</option>
                      <option value="Customer Support">Customer Support</option>
                      <option value="Legal">Legal</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shift & Preferred Language - Half and Half */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Shift
                  </label>
                  <div className="relative">
                    <select
                      name="Shift"
                      value={formData.Shift}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 pr-10 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 appearance-none"
                    >
                      <option value="">Select Shift</option>
                      <option value="Day Shift">Day Shift</option>
                      <option value="Night Shift">Night Shift</option>
                      <option value="Evening Shift">Evening Shift</option>
                      <option value="Morning Shift">Morning Shift</option>
                      <option value="Rotating Shift">Rotating Shift</option>
                      <option value="Flexible">Flexible</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600">
                    Preferred Language
                  </label>
                  <div className="relative">
                    <select
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 pr-10 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 appearance-none"
                    >
                      <option value="">Select</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                      <option value="German">German</option>
                      <option value="Chinese">Chinese</option>
                      <option value="Japanese">Japanese</option>
                      <option value="Arabic">Arabic</option>
                      <option value="Other">Other</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Specialization Required - Full Width */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-600">
                  Specialization Required
                </label>
                <div className="relative">
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleChange}
                    className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 pr-10 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 appearance-none"
                  >
                    <option value="">Select</option>
                    <option value="Software Development">
                      Software Development
                    </option>
                    <option value="Data Science">Data Science</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Product Management">
                      Product Management
                    </option>
                    <option value="Digital Marketing">Digital Marketing</option>
                    <option value="Content Writing">Content Writing</option>
                    <option value="Graphic Design">Graphic Design</option>
                    <option value="Business Analysis">Business Analysis</option>
                    <option value="Other">Other</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="w-full text-sm min-h-[600px]">
              {/* LEFT: Review Information */}
              <div className="w-full">
                <div className="space-y-4">
                  <ReviewRow label="Job Title" value={formData.jobTitle} />
                  <ReviewRow label="Job Description">
                    <div
                      className="text-gray-800"
                      dangerouslySetInnerHTML={{
                        __html: description || "<p>N/A</p>",
                      }}
                    />
                  </ReviewRow>
                  <ReviewRow
                    label="Employment Type"
                    value={formData.employmentType}
                  />
                  <ReviewRow
                    label="Job Category"
                    value={formData.jobCategory}
                  />
                  <ReviewRow
                    label="Number of Openings"
                    value={formData.openings}
                  />
                  <ReviewRow label="Salary Range">
                    {formData.salaryRangeFrom && formData.salaryRangeTo
                      ? `${formData.salaryRangeFrom} - ${formData.salaryRangeTo}`
                      : "N/A"}
                  </ReviewRow>
                  <ReviewRow label="Department" value={formData.department} />
                  <ReviewRow
                    label="Experience Required"
                    value={formData.experience}
                  />
                  <ReviewRow label="Job Location" value={formData.location} />
                  <ReviewRow label="End Date" value={formData.endDate} />
                  <ReviewRow label="Skills" value={formData.skills} />
                  <ReviewRow
                    label="Qualification Required"
                    value={formData.qualification}
                  />
                  <ReviewRow label="Shift" value={formData.Shift} />
                  <ReviewRow
                    label="Preferred Language"
                    value={formData.language}
                  />
                  <ReviewRow
                    label="Specialization Required"
                    value={formData.specialization}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            {step > 1 && (
              <button
                onClick={handlePrevious}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md "
              >
                Previous
              </button>
            )}

            {step < 3 && (
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm ml-auto"
              >
                {step === 1 ? "Additional Information" : "Review"}
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleJobPublish}
                disabled={loading}
                className="px-4 py-2 bg-[#1890FF] text-white rounded-md ml-auto"
              >
                {loading
                  ? isEditMode
                    ? "Saving..."
                    : "Publishing..."
                  : isEditMode
                  ? "Update Job"
                  : "+ Publish Job"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
