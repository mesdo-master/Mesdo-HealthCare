import { ArrowLeft } from "lucide-react";
import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import StepProgressCircle from "../../../../components/StepProgressCircle";

const ProfessionalSummary = ({
  formData,
  updateFormData,
  onPrevious,
  onNext,
  onSkipAll, // ✅ Add onSkipAll prop
}) => {
  const [formValues, setFormValues] = useState({
    tagline: "",
    aboutYou: "",
  });

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
      // Small/normal screens - use padding top instead of justify-center
      return "pt-10";
    } else if (windowWidth <= 1920) {
      // Medium screens - slightly reduced top spacing
      return "pt-20";
    } else {
      // Large screens - significantly reduced top spacing to fix extra space
      return "pt-10";
    }
  };

  // Initialize form values with existing data when component mounts
  useEffect(() => {
    if (formData) {
      setFormValues({
        tagline: formData.tagline || "",
        aboutYou: formData.aboutYou || "",
      });

      // ✅ Debug: Log formData to see what's pre-filled
      console.log("🔍 ProfessionalSummary formData:", formData);
    }
  }, [formData]);

  // ✅ Debug: Log validation results whenever formValues changes
  useEffect(() => {
    console.log("🔍 Validation results:", {
      hasFormContent: hasFormContent(),
      isFormComplete: isFormComplete(),
      formValues: formValues,
    });
  }, [formValues]);

  // ReactQuill Modules
  const modules = {
    toolbar: [
      ["bold", "italic", "underline", "strike"],
      ["blockquote", "code-block"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link"],
      ["clean"],
      [{ align: [] }],
      ["undo", "redo"],
    ],
  };

  const handleTaglineChange = (e) => {
    const { value } = e.target;
    console.log("🔍 Tagline change:", {
      value,
      length: value.length,
      isEmpty: value.trim().length === 0,
    });
    setFormValues((prev) => ({ ...prev, tagline: value }));
    updateFormData({ tagline: value });
  };

  const handleAboutYouChange = (value) => {
    console.log("🔍 About You change:", {
      value,
      length: value.length,
      isEmpty: value.trim().length === 0,
    });
    setFormValues((prev) => ({ ...prev, aboutYou: value }));
    updateFormData({ aboutYou: value });
  };

  // ✅ Validation logic: check if form has any content (Tagline is mandatory)
  const hasFormContent = () => {
    const taglineContent = formValues.tagline?.trim() || "";
    // For ReactQuill, we need to check if it's just empty HTML tags or actual content
    const aboutYouContent =
      formValues.aboutYou?.replace(/<[^>]*>/g, "").trim() || "";
    // Form has content if Tagline is filled (About You is optional)
    return taglineContent.length > 0;
  };

  // ✅ Check if form is complete (Tagline is mandatory, About You is optional)
  const isFormComplete = () => {
    const taglineContent = formValues.tagline?.trim() || "";
    // For ReactQuill, we need to check if it's just empty HTML tags or actual content
    const aboutYouContent =
      formValues.aboutYou?.replace(/<[^>]*>/g, "").trim() || "";

    console.log("🔍 isFormComplete called with:", {
      tagline: `"${formValues.tagline}"`,
      aboutYou: `"${formValues.aboutYou}"`,
      taglineTrimmed: `"${taglineContent}"`,
      aboutYouTrimmed: `"${aboutYouContent}"`,
      taglineLength: taglineContent.length,
      aboutYouLength: aboutYouContent.length,
    });

    // Tagline is mandatory - must be filled
    if (!taglineContent) {
      console.log("❌ Tagline is empty - cannot proceed");
      return false;
    }

    // If Tagline is filled, form is complete (About You is optional)
    console.log("✅ Tagline is filled - can proceed (About You is optional)");
    return true;
  };

  // ✅ Handle skip all - goes directly to Interest page
  const handleSkipAll = () => {
    if (hasFormContent()) {
      // If form has content, ask user if they want to save or clear
      if (
        window.confirm(
          "You have entered some information. Do you want to save it before skipping?"
        )
      ) {
        // Save current data and proceed to Interest page
        onSkipAll();
      } else {
        // Clear the form and proceed
        setFormValues({ tagline: "", aboutYou: "" });
        updateFormData({ tagline: "", aboutYou: "" });
        onSkipAll();
      }
    } else {
      // If form is empty, allow skip to Interest page
      onSkipAll();
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Left Side - Form */}
      <div
        className={`w-1/2 flex flex-col px-[100px] ${getResponsiveTopSpacing()}`}
        style={{ minWidth: 560 }}
      >
        <button className="mb-8 mt-2 text-left" onClick={onPrevious}>
          <ArrowLeft size={28} className="text-black" />
        </button>

        <div className="flex items-center justify-between mb-1">
          <h1 className="font-inter font-semibold text-[32px] leading-[130%] tracking-[0px]">
            Professional Summary
          </h1>
          {/* Progress Circle */}
          <StepProgressCircle currentStep={3} totalSteps={8} />
        </div>

        <p className="text-[13px] font-sm text-[#8C8C8C] mb-8">
          Include all of your relevant experience and dates in this section.
        </p>

        {/* Form */}
        <form className="space-y-6">
          {/* Tagline */}
          <div>
            <label className="block text-[15px] text-gray-900 mb-1">
              Tagline *
            </label>
            <input
              type="text"
              value={formValues.tagline}
              onChange={handleTaglineChange}
              placeholder="Enter Tagline"
              className="block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-gray-700 text-[14px] font-sm focus:outline-none focus:ring-2 focus:ring-[#1890FF] placeholder-gray-400"
            />
          </div>

          {/* About You */}
          <div>
            <label className="block text-[15px] text-gray-900 mb-1">
              About You
            </label>
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-[#1890FF]">
              <ReactQuill
                theme="snow"
                value={formValues.aboutYou}
                onChange={handleAboutYouChange}
                modules={modules}
                placeholder="About You"
                className="h-[200px] text-[14px] font-sm border-none focus:outline-none"
                style={{
                  border: "none",
                  minHeight: 308,
                  fontFamily: "Inter, sans-serif",
                }}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-between pt-8 mt-8">
            <button
              type="button"
              onClick={handleSkipAll}
              className="w-[120px] h-[48px] bg-gray-100 text-[#1890FF] text-[16px] font-medium rounded-lg hover:bg-gray-200 transition-all"
            >
              Skip All
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!isFormComplete()}
              className={`w-[180px] h-[48px] text-[17px] font-medium rounded-lg transition-all shadow-none ${
                isFormComplete()
                  ? "bg-[#1890FF] text-white hover:bg-[#0D6EFD]"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </form>
      </div>

      {/* Right Side - Empty Space */}
      <div className="w-1/2 bg-white" />
    </div>
  );
};

ProfessionalSummary.propTypes = {
  updateFormData: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
  onSkipAll: PropTypes.func.isRequired, // ✅ Add onSkipAll prop to propTypes
};

export default ProfessionalSummary;
