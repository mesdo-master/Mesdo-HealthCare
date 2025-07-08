import { ArrowLeft } from "lucide-react";
import PropTypes from "prop-types";
import { useState } from "react";
import "react-quill/dist/quill.snow.css";
import ReactQuill from "react-quill";
import StepProgressCircle from "../../../../components/StepProgressCircle";

const ProfessionalSummary = ({ updateFormData, onPrevious, onNext }) => {
  const [formValues, setFormValues] = useState({
    tagline: "",
    aboutYou: "",
  });

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
    setFormValues((prev) => ({ ...prev, tagline: value }));
    updateFormData({ tagline: value });
  };

  const handleAboutYouChange = (value) => {
    setFormValues((prev) => ({ ...prev, aboutYou: value }));
    updateFormData({ aboutYou: value });
  };

  return (
    <div className="flex h-screen ">
      {/* Left Side - Form */}
      <div
        className="w-1/2 flex flex-col justify-center px-[100px] "
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
          <StepProgressCircle currentStep={0} totalSteps={5} />
        </div>

        <p className="text-[13px] font-sm text-[#8C8C8C] mb-8">
          Include all of your relevant experience and dates in this section.
        </p>

        {/* Form */}
        <form className="space-y-6">
          {/* Tagline */}
          <div>
            <label className="block text-[15px] text-gray-900 mb-1">
              Tagline
            </label>
            <input
              type="text"
              value={formValues.tagline}
              onChange={handleTaglineChange}
              placeholder="Enter Tagline"
              className="block w-full h-[48px] rounded-lg border border-gray-200 bg-gray-50 px-4 text-gray-700 text-[14px] font-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
            />
          </div>

          {/* About You */}
          <div>
            <label className="block text-[15px] text-gray-900 mb-1">
              About You
            </label>
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <ReactQuill
                theme="snow"
                value={formValues.aboutYou}
                onChange={handleAboutYouChange}
                modules={modules}
                placeholder="About You"
                className="h-[200px] text-[14px] font-sm border-none"
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
              onClick={onPrevious}
              className="w-[120px] h-[48px] bg-gray-100 text-[#1890FF] text-[16px] font-medium rounded-lg hover:bg-gray-200 transition-all"
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
        </form>
      </div>

      {/* Right Side - Empty Space */}
      <div className="w-1/2 bg-[#f8f8f8]" />
    </div>
  );
};

ProfessionalSummary.propTypes = {
  updateFormData: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired,
};

export default ProfessionalSummary;
