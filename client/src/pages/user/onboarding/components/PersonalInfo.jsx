import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import Select from "react-select";
import axiosInstance from "../../../../lib/axio";

const PersonalInfo = ({ formData, updateFormData, onNext, onPrevious }) => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // ✅ Add custom CSS for dropdown styling
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      /* Cross-browser compatible form styling */
      .PersonalInfo input[type="text"],
      .PersonalInfo input[type="email"],
      .PersonalInfo input[type="tel"],
      .PersonalInfo input[type="date"] {
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        appearance: none !important;
        background: white !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 8px !important;
        outline: none !important;
        box-sizing: border-box !important;
        /* Keep text visible for regular inputs */
        color: #374151 !important;
        caret-color: auto !important;
      }
      
      /* Force override browser defaults for select elements */
      .PersonalInfo select {
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        appearance: none !important;
        background: white !important;
        background-image: none !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 8px !important;
        outline: none !important;
        box-sizing: border-box !important;
        cursor: pointer !important;
      }
      
      /* Remove default dropdown arrow in all browsers */
      .PersonalInfo select::-ms-expand {
        display: none !important;
      }
      
      .PersonalInfo select::-webkit-select-placeholder {
        color: #9ca3af !important;
      }
      
      /* Style dropdown options consistently across browsers */
      .PersonalInfo select option {
        background-color: white !important;
        color: #8C8C8C !important;
        padding: 12px 16px !important;
        border-radius: 8px !important;
        margin: 4px !important;
        font-size: 13px !important;
        border: none !important;
        outline: none !important;
        -webkit-appearance: none !important;
        -moz-appearance: none !important;
        appearance: none !important;
      }
      
      /* Hover state for options */
      .PersonalInfo select option:hover,
      .PersonalInfo select option:focus {
        background-color: #f3f4f6 !important;
        color: #1890FF !important;
      }
      
      /* Selected/checked state */
      .PersonalInfo select option:checked {
        background-color: #1890FF !important;
        color: white !important;
        font-weight: 500 !important;
      }
      
      /* Focus state for all form elements */
      .PersonalInfo input:focus,
      .PersonalInfo select:focus {
        border-color: #1890FF !important;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2) !important;
        outline: none !important;
      }
      
      /* Custom scrollbar for all browsers */
      .PersonalInfo select::-webkit-scrollbar {
        width: 8px !important;
      }
      
      .PersonalInfo select::-webkit-scrollbar-track {
        background: #f9fafb !important;
        border-radius: 4px !important;
      }
      
      .PersonalInfo select::-webkit-scrollbar-thumb {
        background: #d1d5db !important;
        border-radius: 4px !important;
      }
      
      .PersonalInfo select::-webkit-scrollbar-thumb:hover {
        background: #9ca3af !important;
      }
      
      /* TARGET ONLY REACT-SELECT ELEMENTS - Don't affect regular inputs */
      /* React-select specific targeting */
      .PersonalInfo [class*="react-select"] input,
      .PersonalInfo [class*="react-select"] * input {
        caret-color: transparent !important;
        color: transparent !important;
        background: transparent !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      
      /* Target react-select dropdowns specifically */
      .PersonalInfo div[class*="react-select"] input,
      .PersonalInfo span[class*="react-select"] input,
      .PersonalInfo div[class*="react-select"] * input,
      .PersonalInfo span[class*="react-select"] * input {
        caret-color: transparent !important;
        color: transparent !important;
        background: transparent !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      
      /* Target the specific input containers that react-select creates */
      .PersonalInfo div[role="combobox"] input,
      .PersonalInfo div[role="listbox"] input {
        caret-color: transparent !important;
        color: transparent !important;
        background: transparent !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      
      /* Additional react-select specific targeting */
      .PersonalInfo [class*="__input"] input,
      .PersonalInfo [class*="__input-container"] input,
      .PersonalInfo [class*="__control"] input {
        caret-color: transparent !important;
        color: transparent !important;
        background: transparent !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      
      /* EXTRA AGGRESSIVE TARGETING FOR PLACEHOLDER STATE */
      /* Target any element that might contain a cursor in react-select */
      .PersonalInfo [class*="react-select"] *,
      .PersonalInfo [class*="react-select"] * * {
        caret-color: transparent !important;
      }
      
      /* Target placeholder text specifically */
      .PersonalInfo [class*="react-select"] [class*="placeholder"],
      .PersonalInfo [class*="react-select"] [class*="__placeholder"] {
        color: #9ca3af !important;
      }
      
      /* Target any input element that might be created by react-select */
      .PersonalInfo [class*="react-select"] input,
      .PersonalInfo [class*="react-select"] textarea,
      .PersonalInfo [class*="react-select"] [contenteditable="true"] {
        caret-color: transparent !important;
        color: transparent !important;
        background: transparent !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        resize: none !important;
      }
      
      /* Target the value container to ensure no cursor appears */
      .PersonalInfo [class*="react-select"] [class*="value-container"],
      .PersonalInfo [class*="react-select"] [class*="__value-container"] {
        caret-color: transparent !important;
      }
      
      /* Force hide cursor on any element within react-select */
      .PersonalInfo [class*="react-select"] * {
        caret-color: transparent !important;
      }
      
      /* GLOBAL FIX - Target ONLY react-select elements anywhere in the document */
      [class*="react-select"] input,
      [class*="react-select"] * input,
      div[class*="react-select"] input,
      span[class*="react-select"] input,
      div[class*="react-select"] * input,
      span[class*="react-select"] * input {
        caret-color: transparent !important;
        color: transparent !important;
        background: transparent !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      
      /* Target any input that might be created by react-select */
      input[class*="react-select"],
      input[class*="__input"],
      input[class*="__input-container"] {
        caret-color: transparent !important;
        color: transparent !important;
        background: transparent !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      
      /* Force hide cursor globally for any react-select related elements */
      [class*="react-select"] * {
        caret-color: transparent !important;
      }
      
      /* EXTRA GLOBAL TARGETING FOR PLACEHOLDER STATE */
      [class*="react-select"] *,
      [class*="react-select"] * * {
        caret-color: transparent !important;
      }
      
      /* Target any contenteditable elements that react-select might create */
      [class*="react-select"] [contenteditable="true"],
      [class*="react-select"] [contenteditable="true"] * {
        caret-color: transparent !important;
        color: transparent !important;
        background: transparent !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
      }
      
      /* NUCLEAR OPTION - Hide cursor on ANY element that might be created by react-select */
      [class*="react-select"] *,
      [class*="react-select"] * *,
      [class*="react-select"] * * * {
        caret-color: transparent !important;
      }
      
      /* Target the specific DOM structure that react-select creates */
      [class*="react-select"] div[class*="__input"],
      [class*="react-select"] div[class*="__input-container"],
      [class*="react-select"] div[class*="__control"],
      [class*="react-select"] div[class*="__value-container"] {
        caret-color: transparent !important;
      }
      
      /* Force hide cursor on any element that might contain text input */
      [class*="react-select"] div[class*="__input"] *,
      [class*="react-select"] div[class*="__input-container"] *,
      [class*="react-select"] div[class*="__control"] *,
      [class*="react-select"] div[class*="__value-container"] * {
        caret-color: transparent !important;
      }
      
      /* Target any element that might be focusable */
      [class*="react-select"] [tabindex],
      [class*="react-select"] [tabindex] * {
        caret-color: transparent !important;
      }
      
      /* COMPLETE ELIMINATION OF REACT-SELECT INPUT ELEMENTS */
      [class*="react-select"] input,
      [class*="react-select"] textarea,
      [class*="react-select"] [contenteditable="true"] {
        display: none !important;
        width: 0px !important;
        height: 0px !important;
        opacity: 0 !important;
        position: absolute !important;
        pointer-events: none !important;
        caret-color: transparent !important;
        color: transparent !important;
        background: transparent !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        resize: none !important;
        overflow: hidden !important;
        visibility: hidden !important;
        z-index: -9999 !important;
      }
      
      /* Force hide any remaining input elements */
      [class*="react-select"] * input,
      [class*="react-select"] * textarea,
      [class*="react-select"] * [contenteditable="true"] {
        display: none !important;
        width: 0px !important;
        height: 0px !important;
        opacity: 0 !important;
        position: absolute !important;
        pointer-events: none !important;
        caret-color: transparent !important;
        color: transparent !important;
        background: transparent !important;
        border: none !important;
        outline: none !important;
        box-shadow: none !important;
        resize: none !important;
        overflow: hidden !important;
        visibility: hidden !important;
        z-index: -9999 !important;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Initialize selectedState with existing data when component mounts
  useEffect(() => {
    if (formData && formData.state) {
      // setSelectedState(formData.state); // This line is removed
    }
  }, [formData]);

  // ✅ Auto-fill name from email when component mounts
  useEffect(() => {
    if (formData && formData.email && !formData.name) {
      const emailName = formData.email.split("@")[0];
      const formattedName = emailName
        .split(/[._-]/)
        .map(
          (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
      updateFormData({ name: formattedName });
    }
  }, [formData.email, formData.name, updateFormData]);

  useEffect(() => {
    const getStateFunc = async () => {
      // Fetch states on component mount
      await axiosInstance
        .get("onboarding/states")
        .then((response) => {
          setStates(response.data);
          console.log(response);
        })
        .catch((error) => console.error("Error fetching states:", error));
    };
    getStateFunc();
  }, []);

  useEffect(() => {
    if (formData.state) {
      // Fetch cities when a state is selected
      console.log(formData.state);
      axiosInstance
        .get(`onboarding/${formData.state}/cities`)
        .then((response) => setCities(response.data))
        .catch((error) => console.error("Error fetching cities:", error));
    } else {
      setCities([]);
    }
  }, [formData.state]);

  // ✅ Validation function to check if all required fields are filled
  const isFormComplete = () => {
    return (
      formData.name?.trim() &&
      formData.email?.trim() &&
      formData.phoneNo?.trim() &&
      formData.gender &&
      formData.dob &&
      formData.state &&
      formData.city
    );
  };

  // Handle input changes and update parent state directly
  const handleChange = (e) => {
    const { id, value } = e.target;
    updateFormData({ [id]: value });
  };

  // Handle state selection
  // const handleStateChange = (e) => { // This function is removed
  //   const { value } = e.target;
  //   setSelectedState(value);
  //   updateFormData({ state: value, city: "" }); // Reset city when state changes
  // };

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

  return (
    <div className="flex h-screen bg-white PersonalInfo">
      <div
        className={`w-1/2 flex flex-col px-[100px] ${getResponsiveTopSpacing()}`}
        style={{ minWidth: 560 }}
      >
        <div>
          <button className="mb-8 mt-2 text-left" onClick={onPrevious}>
            <ArrowLeft size={28} className="text-black" />
          </button>
          <div className="flex items-center justify-between mb-1">
            <h1 className="font-inter font-semibold text-[32px] leading-[130%] tracking-[0px] mb-1">
              Personal Information
            </h1>
          </div>
          <p className="text-[13px] font-sm text-[#8C8C8C] mb-8">
            Please provide your personal information to continue.
          </p>
          <form className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-[15px] text-gray-900 mb-1"
              >
                Name*
              </label>
              <input
                type="text"
                id="name"
                value={formData.name || ""}
                onChange={handleChange}
                placeholder="Akhil Sharma"
                className="block w-full h-[48px] rounded-xl border border-gray-200 bg-white px-4 text-gray-700 text-[14px] font-sm focus:outline-none focus:ring-2 focus:ring-[#1890FF] placeholder-gray-400"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-[15px] text-gray-900 mb-1"
              >
                Email*
              </label>
              <input
                type="email"
                id="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="akhil.sharma@gmail.com"
                className="block w-full h-[48px] rounded-xl border border-gray-200 bg-white px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-[#1890FF] placeholder-gray-400"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNo"
                className="block text-[15px] text-gray-900 mb-1"
              >
                Phone Number*
              </label>
              <input
                type="text"
                id="phoneNo"
                value={formData.phoneNo || ""}
                onChange={handleChange}
                placeholder="921XXXX123"
                className="block w-full h-[48px] rounded-xl border border-gray-200 bg-white px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-[#1890FF] placeholder-gray-400"
              />
            </div>

            {/* Gender & DOB */}
            <div className="flex gap-6">
              <div className="w-1/2">
                <label
                  htmlFor="gender"
                  className="block text-[15px] text-gray-900 mb-1"
                >
                  Gender*
                </label>
                <Select
                  name="gender"
                  value={
                    formData.gender
                      ? { value: formData.gender, label: formData.gender }
                      : null
                  }
                  onChange={(option) => {
                    updateFormData({ gender: option.value });
                  }}
                  options={[
                    { value: "Male", label: "Male" },
                    { value: "Female", label: "Female" },
                    { value: "Other", label: "Other" },
                  ]}
                  placeholder="Select"
                  isSearchable={false}
                  className="text-[13px]"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "48px",
                      height: "48px",
                      borderColor: "#e5e7eb",
                      borderRadius: "0.75rem",
                      backgroundColor: "white",
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
                      caretColor: "transparent",
                      color: "transparent",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                      display: "none",
                      width: "0px",
                      height: "0px",
                      opacity: 0,
                      position: "absolute",
                      pointerEvents: "none",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#9ca3af",
                    }),
                  }}
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="dob"
                  className="block text-[15px] text-gray-900 mb-1"
                >
                  DOB*
                </label>
                <input
                  type="date"
                  id="dob"
                  value={formData.dob || ""}
                  onChange={handleChange}
                  className="block w-full h-[48px] rounded-xl border border-gray-200 bg-white px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-[#1890FF]"
                />
              </div>
            </div>

            {/* State & City */}
            <div className="flex gap-6">
              <div className="w-1/2">
                <label
                  htmlFor="state"
                  className="block text-[15px] text-gray-900 mb-1"
                >
                  State*
                </label>
                <Select
                  name="state"
                  value={
                    formData.state
                      ? {
                          value: formData.state,
                          label:
                            states.find((s) => s.isoCode === formData.state)
                              ?.name || formData.state,
                        }
                      : null
                  }
                  onChange={(option) => {
                    updateFormData({ state: option.value, city: "" }); // Reset city when state changes
                  }}
                  options={states.map((state) => ({
                    value: state.isoCode,
                    label: state.name,
                  }))}
                  placeholder="Select"
                  isSearchable={false}
                  className="text-[13px]"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "48px",
                      height: "48px",
                      borderColor: "#e5e7eb",
                      borderRadius: "0.75rem",
                      backgroundColor: "white",
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
                      caretColor: "transparent",
                      color: "transparent",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                      display: "none",
                      width: "0px",
                      height: "0px",
                      opacity: 0,
                      position: "absolute",
                      pointerEvents: "none",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#9ca3af",
                    }),
                  }}
                />
              </div>
              <div className="w-1/2">
                <label
                  htmlFor="city"
                  className="block text-[15px] text-gray-900 mb-1"
                >
                  City*
                </label>
                <Select
                  name="city"
                  value={
                    formData.city
                      ? { value: formData.city, label: formData.city }
                      : null
                  }
                  onChange={(option) => {
                    updateFormData({ city: option.value });
                  }}
                  options={cities.map((city) => ({
                    value: city.name,
                    label: city.name,
                  }))}
                  placeholder="Select"
                  isDisabled={!formData.state}
                  isSearchable={false}
                  className="text-[13px]"
                  styles={{
                    control: (base) => ({
                      ...base,
                      minHeight: "48px",
                      height: "48px",
                      borderColor: "#e5e7eb",
                      borderRadius: "0.75rem",
                      backgroundColor: "white",
                      "&:hover": {
                        borderColor: "#e5e7eb",
                      },
                      opacity: !formData.state ? 0.5 : 1,
                    }),
                    valueContainer: (base) => ({
                      ...base,
                      padding: "0 16px",
                    }),
                    input: (base) => ({
                      ...base,
                      margin: 0,
                      padding: 0,
                      caretColor: "transparent",
                      color: "transparent",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                      display: "none",
                      width: "0px",
                      height: "0px",
                      opacity: 0,
                      position: "absolute",
                      pointerEvents: "none",
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: "#9ca3af",
                    }),
                  }}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-between pt-4">
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
      </div>

      {/* Right Side - Empty Space */}
      <div className="w-1/2 bg-white" />
    </div>
  );
};

export default PersonalInfo;
