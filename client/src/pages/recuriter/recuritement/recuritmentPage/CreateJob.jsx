import { useNavigate, useLocation } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import { useState, useRef, useEffect } from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/solid";
import axiosInstance from "../../../../lib/axio";
import { Check } from "lucide-react";

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
            // ignore
          }
        }
      })();
    } else {
      setIsEditMode(false);
    }
    // eslint-disable-next-line
  }, [location.search]);

  // Utility to check if the form is empty
  const isFormEmpty =
    !Object.values(formData).some((val) =>
      typeof val === "string"
        ? val.trim()
        : Array.isArray(val)
        ? val.length > 0
        : false
    ) && !description.trim();

  const handleBack = () => {
    if (step === 1) {
      if (isFormEmpty) {
        navigate("/recruitment");
      } else {
        setShowBackModal(true);
      }
    } else {
      navigate("/recruitment");
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
        alert(
          isEditMode ? "Job Updated Successfully" : "Job Created Successfully"
        );
        navigate("/recruitment");
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
    <div className="bg-gray-100 min-h-screen flex justify-center items-center mt-[-20px] mr-[2px] ml-[-230px]">
      <div className="w-[80%] py-[10vh] pt-[15vh]">
        <div
          className="max-w-4.6xl mx-auto bg-white shadow-md rounded-xl p-6 border border-[#DDE4EE] overflow-hidden "
          style={{ marginLeft: "200px" }}
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
              <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-auto flex flex-col items-center">
                <h3 className="text-xl font-semibold mb-2 text-gray-900 text-center">
                  Are you sure you want to go back?
                </h3>
                <p className="text-gray-500 text-center mb-6">
                  Lorem ipsum dLorem ipsum dolor sit amet consectetur.olor sit
                  amet consectetur. Laoreet tristique.
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
                    Save as a draft
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step Markers */}
          <div className="relative flex items-center mb-8">
            {["Job Information", "Additional Information", "Review"].map(
              (label, index) => (
                <div key={index} className="relative flex-1">
                  {/* Step Line */}
                  <div
                    className={`h-[1px] w-full ${
                      step > index + 1
                        ? "bg-green-500" // Completed step
                        : step === index + 1
                        ? "bg-blue-500" // In-progress step
                        : "bg-[#E6E6E6]" // Incomplete step
                    }`}
                  ></div>

                  {/* Step Indicator */}
                  <div
                    className={`absolute -top-3 left-1/2 transform -translate-x-1/2 flex items-center justify-center w-6 h-6 rounded-full border 
            ${
              step > index + 1
                ? "bg-green-500 text-white border-green-500" // Completed step
                : step === index + 1
                ? "bg-white text-blue-500 border-blue-500" // In-progress step
                : "bg-white text-[#E6E6E6] border-[#E6E6E6]" // Incomplete step
            }`}
                  >
                    {index + 1}
                  </div>

                  {/* Step Label */}
                  <div className="text-center text-xs mt-2 text-gray-700">
                    {label}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Step Content */}
          {/* STEP 1 */}
          {step === 1 && (
            <div className="grid grid-cols-3 gap-8 text-sm">
              {/* Job Information */}
              <div className="col-span-2">
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
                    className="rounded-lg border border-gray-200 mt-1 [&_.ql-container]:rounded-b-lg [&_.ql-toolbar]:rounded-t-lg [&_.ql-container]:min-h-[180px] [&_.ql-editor]:text-[14px] [&_.ql-editor]:text-gray-700"
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
                          <span className="text-gray-700 capitalize">
                            {type}
                          </span>
                        </label>
                      )
                    )}
                  </div>
                </div>

                {/* Experience Required as Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-600">
                    Experience Required
                  </label>
                  <select
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                  >
                    <option value="">Select experience</option>
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                    <option value="10+">10+</option>
                  </select>
                </div>

                {/* Job Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Job Category
                    </label>
                    <input
                      type="text"
                      name="jobCategory"
                      value={formData.jobCategory}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                      placeholder="Enter job category"
                    />
                  </div>

                  {/* Number of Openings with Custom Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Number of Openings
                    </label>
                    <select
                      name="openings"
                      value={formData.openings}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    >
                      <option value="">Select openings</option>
                      {[...Array(10)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                      <option value="custom">Custom</option>
                    </select>

                    {formData.openings === "custom" && (
                      <input
                        type="number"
                        name="customOpenings"
                        value={formData.customOpenings || ""}
                        onChange={handleChange}
                        className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        placeholder="Enter custom number of openings"
                      />
                    )}
                  </div>
                </div>

                {/* Location and Salary */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                      placeholder="Enter location"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Salary Range (From)
                      </label>
                      <input
                        type="number"
                        name="salaryRangeFrom"
                        value={formData.salaryRangeFrom}
                        onChange={handleChange}
                        className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        placeholder="Enter minimum salary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600">
                        Salary Range (To)
                      </label>
                      <input
                        type="number"
                        name="salaryRangeTo"
                        value={formData.salaryRangeTo}
                        onChange={handleChange}
                        className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        placeholder="Enter maximum salary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="grid grid-cols-3 gap-8 text-sm">
              <div className="col-span-2">
                {/* Skills */}
                <div className="mb-6 pt-5">
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

                {/* Other Fields */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Qualification required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Qualification required
                    </label>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                      placeholder="Qualifications"
                    />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                      placeholder="Department"
                    />
                  </div>

                  {/* Shift */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Shift
                    </label>
                    <input
                      type="text"
                      name="Shift"
                      value={formData.Shift}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    />
                  </div>

                  {/* Preferred Language */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Preferred Language
                    </label>
                    <input
                      type="text"
                      name="language"
                      value={formData.language}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                      placeholder="Enter Language"
                    />
                  </div>

                  {/* Specialization Required */}
                  <div>
                    <label className="block text-sm font-medium text-gray-600">
                      Specialization Required
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="block w-full h-[48px] rounded-lg border border-gray-200 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                      placeholder="Enter Specialization"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Review */}
          {step === 3 && (
            <div className="grid grid-cols-3 gap-8 text-sm">
              {/* LEFT: Review Information */}
              <div className="col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Review Information
                </h3>

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
                className="px-4 py-2 bg-blue-500  text-white rounded-md text-sm "
              >
                Additional Information
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleJobPublish}
                disabled={loading}
                className="px-4 py-2 bg-[#1890FF] text-white rounded-md "
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
