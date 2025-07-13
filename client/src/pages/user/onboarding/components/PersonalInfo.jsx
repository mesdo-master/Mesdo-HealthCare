import { ArrowLeft, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import axiosInstance from "../../../../lib/axio";

const PersonalInfo = ({ formData, updateFormData, onNext, onPrevious }) => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");

  // Initialize selectedState with existing data when component mounts
  useEffect(() => {
    if (formData && formData.state) {
      setSelectedState(formData.state);
    }
  }, [formData]);

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

  // Handle input changes and update parent state directly
  const handleChange = (e) => {
    const { id, value } = e.target;
    updateFormData({ [id]: value });
  };

  // Handle state selection
  const handleStateChange = (e) => {
    const { value } = e.target;
    setSelectedState(value);
    updateFormData({ state: value });
  };

  return (
    <div className="flex h-screen">
      {/* Left Side - Form */}
      <div
        className="w-1/2 flex flex-col justify-center px-[100px]"
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
              value={formData.name}
              onChange={handleChange}
              placeholder="Akhil Sharma"
              className="block w-full h-[48px] rounded-lg border border-gray-200 bg-gray-50 px-4 text-gray-700 text-[14px] font-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
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
              value={formData.email}
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
              value={formData.phoneNo}
              onChange={handleChange}
              placeholder="921XXXX123"
              className="block w-full h-[48px] rounded-lg border border-gray-200 bg-gray-50 px-4 text-gray-700 text-[14px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
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
                  value={formData.gender}
                  onChange={handleChange}
                  className="appearance-none block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                value={formData.dob}
                onChange={handleChange}
                className="block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                State
              </label>
              <div className="relative">
                <select
                  id="state"
                  value={selectedState}
                  onChange={handleStateChange}
                  className="appearance-none block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                City
              </label>
              <div className="relative">
                <select
                  id="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!selectedState}
                  className={`appearance-none block w-full h-[48px] rounded-lg border border-gray-200 bg-white px-4 text-[#8C8C8C] text-[13px] font-normal focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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

          {/* Next Button */}
          <div className="flex justify-end pt-4">
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

export default PersonalInfo;
