import { ArrowLeft } from "lucide-react";
import PropTypes from "prop-types";
import { useState } from "react";
import Select from "react-select";

const OrganizationInformation = ({
  formData,
  updateFormData,
  nextStep,
  prevStep,
}) => {
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleContinue = () => {
    // All fields are mandatory - check if all are filled
    if (
      !formData.name ||
      !formData.website ||
      !formData.industry ||
      !formData.organizationSize ||
      !formData.organizationType
    ) {
      setError("Please fill all required fields.");
      return;
    }

    // Basic validations
    // Name should not be only numbers
    if (/^\d+$/.test(formData.name.trim())) {
      setError("Organization name cannot contain only numbers.");
      return;
    }

    // Name should be at least 2 characters
    if (formData.name.trim().length < 2) {
      setError("Organization name must be at least 2 characters long.");
      return;
    }

    // Website should be a valid URL format (basic check)
    const websiteRegex =
      /^(https?:\/\/)?([\w\-])+\.{1}([a-zA-Z]{2,63})([\/\w\-._~:?#[\]@!$&'()*+,;=%]*)?$/;
    if (!websiteRegex.test(formData.website.trim())) {
      setError("Please enter a valid website URL (e.g., https://example.com).");
      return;
    }

    setError("");
    nextStep();
  };

  return (
    <div className="flex h-full bg-white">
      {/* Left Side - Form */}
      <div
        className="w-1/2 flex flex-col px-[100px] py-[60px] mt-[-20px]"
        style={{ minWidth: 560 }}
      >
        <button className="mb-8 text-left" onClick={prevStep}>
          <ArrowLeft size={28} className="text-black" />
        </button>
        <h1 className="font-inter font-semibold text-[32px] leading-[130%] tracking-[0px] mb-1">
          Organization Information
        </h1>
        <p className="text-[13px] font-sm text-[#8C8C8C] mb-8">
          Include all of your relevant experience and dates in this section.
        </p>
        {/* Form */}
        <div className="flex-1 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-[15px] text-gray-900 mb-1">
              Name*
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter name of your organization"
              className="block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-[#1890FF] focus:border-[#1890FF] placeholder-gray-400"
              style={{ backgroundColor: "white" }}
            />
          </div>
          {/* Website */}
          <div>
            <label className="block text-[15px] text-gray-900 mb-1">
              Website*
            </label>
            <input
              type="text"
              name="website"
              value={formData.website}
              onChange={handleChange}
              placeholder="Link to your website"
              className="block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-[#1890FF] focus:border-[#1890FF] placeholder-gray-400"
              style={{ backgroundColor: "white" }}
            />
          </div>
          {/* Industry */}
          <div>
            <label className="block text-[15px] text-gray-900 mb-1">
              Industry*
            </label>
            <Select
              name="industry"
              value={
                formData.industry
                  ? { value: formData.industry, label: formData.industry }
                  : null
              }
              onChange={(selectedOption) =>
                updateFormData({ industry: selectedOption?.value || "" })
              }
              options={[
                { value: "technology", label: "Technology" },
                { value: "healthcare", label: "Healthcare" },
                { value: "finance", label: "Finance" },
                { value: "education", label: "Education" },
                { value: "manufacturing", label: "Manufacturing" },
              ]}
              placeholder="Select Industry"
              className="text-[13px]"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "48px",
                  height: "48px",
                  borderColor: "#e5e7eb",
                  borderRadius: "0.75rem",
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
          {/* Organization Size */}
          <div>
            <label className="block text-[15px] text-gray-900 mb-1">
              Organization Size*
            </label>
            <Select
              name="organizationSize"
              value={
                formData.organizationSize
                  ? {
                      value: formData.organizationSize,
                      label: formData.organizationSize,
                    }
                  : null
              }
              onChange={(selectedOption) =>
                updateFormData({
                  organizationSize: selectedOption?.value || "",
                })
              }
              options={[
                { value: "1-10", label: "1-10 employees" },
                { value: "11-50", label: "11-50 employees" },
                { value: "51-200", label: "51-200 employees" },
                { value: "201-500", label: "201-500 employees" },
                { value: "501+", label: "501+ employees" },
              ]}
              placeholder="Select Size"
              className="text-[13px]"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "48px",
                  height: "48px",
                  borderColor: "#e5e7eb",
                  borderRadius: "0.75rem",
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
          {/* Organization Type */}
          <div>
            <label className="block text-[15px] text-gray-900 mb-1">
              Organization Type*
            </label>
            <Select
              name="organizationType"
              value={
                formData.organizationType
                  ? {
                      value: formData.organizationType,
                      label: formData.organizationType,
                    }
                  : null
              }
              onChange={(selectedOption) =>
                updateFormData({
                  organizationType: selectedOption?.value || "",
                })
              }
              options={[
                { value: "private", label: "Private Company" },
                { value: "public", label: "Public Company" },
                { value: "nonprofit", label: "Non-Profit" },
                { value: "government", label: "Government" },
                { value: "startup", label: "Startup" },
              ]}
              placeholder="Select Type"
              className="text-[13px]"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: "48px",
                  height: "48px",
                  borderColor: "#e5e7eb",
                  borderRadius: "0.75rem",
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
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
        {/* Skip & Continue Buttons */}
        <div className="flex justify-between mt-16">
          <button
            type="button"
            onClick={prevStep}
            className="w-[120px] h-[48px] bg-gray-100 text-[#1890FF] text-[15px] font-medium rounded-lg hover:bg-gray-200 transition-all"
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleContinue}
            className="w-[180px] h-[48px] bg-[#1890FF] text-white text-[17px] font-medium rounded-lg hover:bg-blue-600 transition-all shadow-none"
          >
            Continue
          </button>
        </div>
      </div>
      {/* Right Side - Empty Space */}
      <div className="w-1/2 bg-white" />
    </div>
  );
};

OrganizationInformation.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
};

export default OrganizationInformation;
