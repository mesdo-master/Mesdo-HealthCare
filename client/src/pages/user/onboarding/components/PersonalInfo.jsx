import { ArrowLeft, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../../../lib/axio";

const PersonalInfo = ({ formData, updateFormData, onNext, onPrevious }) => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Initialize selectedState with existing data when component mounts
  useEffect(() => {
    if (formData && formData.state) {
      setSelectedState(formData.state);
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
    if (selectedState) {
      // Fetch cities when a state is selected
      console.log(selectedState);
      axiosInstance
        .get(`onboarding/${selectedState}/cities`)
        .then((response) => setCities(response.data))
        .catch((error) => console.error("Error fetching cities:", error));
    } else {
      setCities([]);
    }
  }, [selectedState]);

  // ✅ Validation function to check if all required fields are filled
  const isFormComplete = () => {
    return (
      formData.name?.trim() &&
      formData.email?.trim() &&
      formData.phoneNo?.trim() &&
      formData.gender &&
      formData.dob &&
      selectedState &&
      formData.city
    );
  };

  // Handle input changes and update parent state directly
  const handleChange = (e) => {
    const { id, value } = e.target;
    updateFormData({ [id]: value });
  };

  // Handle state selection
  const handleStateChange = (e) => {
    const { value } = e.target;
    setSelectedState(value);
    updateFormData({ state: value, city: "" }); // Reset city when state changes
  };

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
    <div className="flex h-screen bg-white">
      {/* Left Side - Form */}
      <div
        className={`w-1/2 flex flex-col px-[100px] ${getResponsiveTopSpacing()}`}
        style={{ minWidth: 560 }}
      >
        <button className="mb-8 mt-2 text-left" onClick={onPrevious}>
          <ArrowLeft size={28} className="text-black" />
        </button>

        <h1 className="font-inter font-semibold text-[32px] leading-[130%] tracking-[0px]">
          Personal Information
        </h1>
        <p className="text-[13px] font-sm text-[#8C8C8C] mb-8">
          Include all of your relevant experience and dates in this section.
        </p>

        {/* Form */}
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
              className="block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-gray-700 text-[14px] font-sm focus:outline-none focus:ring-2 focus:ring-[#1890FF] placeholder-gray-400"
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
              disabled
              placeholder="akhil.sharma@gmail.com"
              className="block w-full h-[48px] rounded-lg border border-gray-200 bg-gray-50 px-4 text-gray-700 text-[14px] font-normal placeholder-gray-400 cursor-not-allowed"
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
              className="block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-[#1890FF] placeholder-gray-400"
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
              <div className="relative">
                <select
                  id="gender"
                  value={formData.gender || ""}
                  onChange={handleChange}
                  className="appearance-none block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-[#1890FF]"
                >
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                <ChevronDown
                  size={20}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
              </div>
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
                className="block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-[#1890FF]"
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
              <div className="relative">
                <select
                  id="state"
                  value={selectedState}
                  onChange={handleStateChange}
                  className="appearance-none block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-[#1890FF]"
                >
                  <option value="">Select</option>
                  {states.map((state) => (
                    <option key={state.isoCode} value={state.isoCode}>
                      {state.name}
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
              <label
                htmlFor="city"
                className="block text-[15px] text-gray-900 mb-1"
              >
                City*
              </label>
              <div className="relative">
                <select
                  id="city"
                  value={formData.city || ""}
                  onChange={handleChange}
                  disabled={!selectedState}
                  className={`appearance-none block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-[#1890FF] ${
                    !selectedState ? "cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">Select</option>
                  {cities.map((city) => (
                    <option key={city.name} value={city.name}>
                      {city.name}
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

      {/* Right Side - Empty Space */}
      <div className="w-1/2 bg-white" />
    </div>
  );
};

export default PersonalInfo;
