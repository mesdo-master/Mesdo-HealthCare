import React, { useEffect, useRef, useState } from "react";
import { updateAccountSettings } from "./components/settingsService";
import { toast } from "react-hot-toast";
import {
  Info,
  Search,
  Check,
  ArrowRight,
  Cross,
  X,
  FileDown,
} from "lucide-react";
import Privacy from "./components/Privacy";
import Notification from "./components/Notification";
import Preferences from "./components/Preferences";
import Appearance from "./components/Appearance";
import { useDispatch, useSelector } from "react-redux";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { uploadProfilePic } from "../../store/features/user/profileSlice";
import { setCurrentUser } from "../../store/features/authSlice";
import { MdCancel, MdOutlineCancel } from "react-icons/md";

const Tab = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 mr-2
      ${
        isActive
          ? "text-[#434343] border-b-2 border-[#434343]"
          : "text-gray-600 hover:text-gray-900"
      }
    `}
  >
    {label}
  </button>
);

const Settings = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch(); // Add dispatch
  const [activeTab, setActiveTab] = useState("Account");

  const [formData, setFormData] = useState({
    username: "",
    phoneNo: "",
    countryCode: "+91",
    profilePic: "",
    bio: "",
    city: "",
    country: "",
  });

  const [locationData, setLocationData] = useState({
    cities: [],
    countries: [],
    loading: false,
  });

  useEffect(() => {
    if (!currentUser) return;

    setFormData((prev) => {
      const newFormData = {
        ...prev,
        username: currentUser.username,
        phoneNo: currentUser.phoneNo,
        profilePic: currentUser.profilePicture,
        bio: currentUser.about,
        email: currentUser.email,
        city: currentUser.location?.city || "",
        country: currentUser.location?.country || "",
      };
      return newFormData;
    });
  }, [currentUser]);

  // Fetch countries and cities data
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLocationData((prev) => ({ ...prev, loading: true }));
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name"
        );
        const countries = await response.json();
        setLocationData((prev) => ({
          ...prev,
          countries: countries.map((country) => country.name.common).sort(),
          loading: false,
        }));
      } catch (error) {
        console.error("Error fetching countries:", error);
        setLocationData((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchCountries();
  }, []);

  const fetchCities = async (country) => {
    try {
      setLocationData((prev) => ({ ...prev, loading: true }));

      // Try the first API
      try {
        const response = await fetch(
          `https://api.api-ninjas.com/v1/city?country=${country}&limit=50`
        );
        const cities = await response.json();

        // Check if cities is an array before mapping
        if (Array.isArray(cities)) {
          setLocationData((prev) => ({
            ...prev,
            cities: cities.map((city) => city.name).sort(),
            loading: false,
          }));
          return;
        }
      } catch (error) {
        console.log("First cities API failed, trying fallback...");
      }

      // Fallback: Use a simpler approach with common cities
      const commonCities = {
        "United States": [
          "New York",
          "Los Angeles",
          "Chicago",
          "Houston",
          "Phoenix",
          "Philadelphia",
          "San Antonio",
          "San Diego",
          "Dallas",
          "San Jose",
        ],
        "United Kingdom": [
          "London",
          "Birmingham",
          "Leeds",
          "Glasgow",
          "Sheffield",
          "Bradford",
          "Edinburgh",
          "Liverpool",
          "Manchester",
          "Bristol",
        ],
        Canada: [
          "Toronto",
          "Montreal",
          "Vancouver",
          "Calgary",
          "Edmonton",
          "Ottawa",
          "Winnipeg",
          "Quebec City",
          "Hamilton",
          "Kitchener",
        ],
        Australia: [
          "Sydney",
          "Melbourne",
          "Brisbane",
          "Perth",
          "Adelaide",
          "Gold Coast",
          "Newcastle",
          "Canberra",
          "Sunshine Coast",
          "Wollongong",
        ],
        Germany: [
          "Berlin",
          "Hamburg",
          "Munich",
          "Cologne",
          "Frankfurt",
          "Stuttgart",
          "Düsseldorf",
          "Dortmund",
          "Essen",
          "Leipzig",
        ],
        France: [
          "Paris",
          "Marseille",
          "Lyon",
          "Toulouse",
          "Nice",
          "Nantes",
          "Strasbourg",
          "Montpellier",
          "Bordeaux",
          "Lille",
        ],
        India: [
          "Mumbai",
          "Delhi",
          "Bangalore",
          "Hyderabad",
          "Chennai",
          "Kolkata",
          "Pune",
          "Ahmedabad",
          "Surat",
          "Jaipur",
        ],
        China: [
          "Shanghai",
          "Beijing",
          "Guangzhou",
          "Shenzhen",
          "Chengdu",
          "Tianjin",
          "Xi'an",
          "Hangzhou",
          "Nanjing",
          "Wuhan",
        ],
      };

      const fallbackCities = commonCities[country] || [];
      setLocationData((prev) => ({
        ...prev,
        cities: fallbackCities,
        loading: false,
      }));
    } catch (error) {
      console.error("Error fetching cities:", error);
      setLocationData((prev) => ({
        ...prev,
        cities: [],
        loading: false,
      }));
    }
  };

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef(null);

  const handlePhoneChange = (value, data) => {
    const dialCode = data.dialCode;
    const countryCode = `+${dialCode}`;
    const nationalNumber = value.slice(dialCode.length);

    setFormData((prev) => ({
      ...prev,
      phoneNo: nationalNumber,
      countryCode: countryCode,
    }));
  };

  const tabs = [
    "Account",
    "Privacy",
    "Notification",
    "Preferences",
    "Appearance",
  ];

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log("Saving settings with data:", {
        phoneNo: formData.phoneNo,
        about: formData.bio,
        location: {
          city: formData.city,
          country: formData.country,
        },
      });

      const response = await updateAccountSettings({
        phoneNo: formData.phoneNo,
        about: formData.bio,
        location: {
          city: formData.city,
          country: formData.country,
        },
      });

      console.log("Save response:", response);

      // Update Redux store with the new user data
      const updatedUser = {
        ...currentUser,
        phoneNo: formData.phoneNo,
        about: formData.bio,
        location: {
          ...currentUser.location,
          city: formData.city,
          country: formData.country,
        },
      };
      dispatch(setCurrentUser(updatedUser));

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) return;

    try {
      // Here you would typically call an API to delete the account
      console.log("Deleting account...");
      toast.success("Account deleted successfully");
      setShowDeleteModal(false);
      setConfirmDelete(false);
      // Redirect to logout or homepage after deletion
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file) {
      try {
        setIsLoading(true);
        const response = await dispatch(uploadProfilePic(file));
        const newProfilePicUrl = response.payload;

        setFormData((prevData) => ({
          ...prevData,
          profilePic: newProfilePicUrl,
        }));

        // Update Redux store with the new profile picture
        const updatedUser = {
          ...currentUser,
          profilePicture: newProfilePicUrl,
        };
        dispatch(setCurrentUser(updatedUser));

        toast.success("Profile image updated successfully");
      } catch (error) {
        console.error("Error uploading profile image:", error);
        toast.error("Failed to update profile image");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleImageUpload = async (e) => {
    const image = e.target.files[0];

    if (!image) {
      alert("Please select an image to upload.");
      return;
    }

    const response = await dispatch(uploadProfilePic(image));
    const newProfilePicUrl = response.payload;

    setFormData((prevData) => ({
      ...prevData,
      profilePic: newProfilePicUrl,
    }));

    // Update Redux store with the new profile picture
    const updatedUser = {
      ...currentUser,
      profilePicture: newProfilePicUrl,
    };
    dispatch(setCurrentUser(updatedUser));

    toast.success("Profile image updated");
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex flex-1 overflow-hidden pt-16">
          <div className="flex-1 ml-[300px] overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden pt-[110px]">
        <div className="flex-1 ml-[300px] overflow-y-auto px-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6 ">
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
              <div className="relative mr-[-40px]">
                <input
                  type="text"
                  placeholder="Search settings..."
                  className="pl-4 pr-9 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent w-64"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#434343] h-4 w-4" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-[1064px] pt-[10px]">
              <div className="border-b border-gray-200">
                <nav className="flex px-6">
                  {tabs.map((tab) => (
                    <Tab
                      key={tab}
                      label={tab}
                      isActive={activeTab === tab}
                      onClick={() => setActiveTab(tab)}
                    />
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === "Account" && (
                  <div className="ml-[67px] mr-[67px] mt-[35px]">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-1">
                          Your Profile
                        </h2>
                        <p className="text-sm text-gray-500 mb-6">
                          Please update your profile settings here
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          disabled={isSaving}
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                        >
                          Cancel
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-3 py-1.5 text-sm font-medium text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
                          style={{
                            background:
                              "linear-gradient(90deg, rgba(24,144,255,1) 0%, rgba(0,106,204,1) 100%)",
                          }}
                        >
                          {isSaving ? "Saving..." : "Save"}
                          <Check className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                          <label className="w-full md:w-56 text-[#434343] font-bold text-sm">
                            Full Name
                          </label>
                          <div className="flex-1">
                            <input
                              type="text"
                              value={formData.username}
                              disabled
                              className="w-full md:w-[500px] h-10 rounded-full border border-gray-200 px-3 text-gray-700 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                          <label className="w-full md:w-56 text-[#434343] font-bold text-sm pt-2">
                            Location
                          </label>
                          <div className="flex-1">
                            <div className="space-y-3">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="City"
                                  value={formData.city}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      city: e.target.value,
                                    })
                                  }
                                  className="w-full md:w-[500px] h-10 rounded-full border border-gray-200 px-3 text-gray-700 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                  list="cities-list"
                                />
                                <datalist id="cities-list">
                                  {locationData.cities.map((city, index) => (
                                    <option key={index} value={city} />
                                  ))}
                                </datalist>
                              </div>
                              <div className="relative">
                                <select
                                  value={formData.country}
                                  onChange={(e) => {
                                    setFormData({
                                      ...formData,
                                      country: e.target.value,
                                    });
                                    if (e.target.value) {
                                      fetchCities(e.target.value);
                                    }
                                  }}
                                  className="w-full md:w-[500px] h-10 rounded-full border border-gray-200 px-3 text-gray-700 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-500 appearance-none"
                                >
                                  <option value="">Country</option>
                                  {locationData.countries.map(
                                    (country, index) => (
                                      <option key={index} value={country}>
                                        {country}
                                      </option>
                                    )
                                  )}
                                </select>
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
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
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                          <label className="w-full md:w-56 text-[#434343] font-bold text-sm">
                            Email
                          </label>
                          <div className="flex-1">
                            <input
                              type="email"
                              value={formData.email}
                              disabled
                              className="w-full md:w-[500px] h-10 rounded-full border border-gray-200 px-3 text-gray-700 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                          <label className="w-full md:w-56 text-[#434343] font-bold text-sm">
                            Phone Number
                          </label>
                          <div className="flex-1">
                            <div className="w-full md:w-[500px]">
                              <PhoneInput
                                country={"gb"}
                                enableAreaCodes={true}
                                enableSearch={true}
                                value={`${formData.countryCode}${formData.phoneNo}`}
                                onChange={handlePhoneChange}
                                inputClass="!w-full !h-10 !rounded-full !border !border-gray-200 !pl-14 !pr-3 !text-gray-700 !text-sm !font-normal !focus:outline-none !focus:ring-1 !focus:ring-primary-500"
                                buttonClass="!border-gray-200 !bg-white !h-10 !w-12"
                                dropdownClass="!shadow-md !border-gray-200"
                                searchClass="!bg-white !text-sm !border-gray-200"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                          <label className="w-full md:w-56 text-[#434343] font-bold text-sm pt-2">
                            Profile Picture
                          </label>
                          <div className="flex-1">
                            <div className="flex items-start gap-4">
                              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                                <img
                                  src={formData.profilePic}
                                  alt="Profile"
                                  className="h-full w-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <div
                                  className="border border-dashed border-gray-300 rounded-xl h-[150px] w-full md:w-[430px] p-4 flex flex-col items-center justify-center text-center hover:border-primary-500 transition-colors cursor-pointer bg-white"
                                  onClick={() => fileInputRef.current?.click()}
                                  onDragOver={handleDragOver}
                                  onDrop={handleDrop}
                                >
                                  <FileDown
                                    className="w-8 h-8 mb-2 bg-gray-200 rounded-full p-1"
                                    style={{ color: "rgba(24, 144, 255, 1)" }}
                                  />
                                  <div className="flex flex-row items-center">
                                    <span className="text-[#1890FF] text-sm font-medium inline">
                                      Click here
                                    </span>
                                    <span className="text-gray-500 text-xs ml-1 inline">
                                      to upload your file or drag.
                                    </span>
                                  </div>
                                  <span className="text-gray-500 text-xs mt-0.5">
                                    Supported Format: SVG, JPG, PNG (10MB each)
                                  </span>
                                  <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageUpload}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                          <label className="flex items-center w-full md:w-56 text-[#434343] font-bold text-sm pt-2">
                            Biography
                            <Info className="ml-1.5 h-3.5 w-3.5 text-gray-400" />
                          </label>
                          <div className="flex-1">
                            <textarea
                              value={formData.bio}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  bio: e.target.value,
                                })
                              }
                              rows={4}
                              className="w-full md:w-[500px] rounded-lg h-[150px] border border-gray-200 px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 bg-white"
                              placeholder="Hi there! 👋 I'm X-AE-A-19, an AI enthusiast and fitness aficionado."
                            />
                          </div>
                        </div>

                        {/* Delete Account Section */}
                        <div className="mt-10 pt-6 border-t border-gray-200">
                          <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                            <label className="w-full md:w-56 text-red-600 font-bold text-sm">
                              Delete Account
                            </label>
                            <div className="flex-1">
                              <p className="text-sm text-gray-500 mb-4">
                                Permanently delete the account, all your saved
                                data, preferences, and activity history will be
                                lost.
                              </p>
                              <button
                                onClick={() => setShowDeleteModal(true)}
                                className="px-6 py-2 rounded-full bg-white border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                              >
                                Delete Account
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === "Privacy" && <Privacy />}
                {activeTab === "Notification" && <Notification />}
                {activeTab === "Preferences" && <Preferences />}
                {activeTab === "Appearance" && <Appearance />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl w-[600px] h-[268px] p-[40px] flex flex-col justify-between">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[#CF1322]">
                Delete Account
              </h2>
              <p className="text-gray-700">
                This action is permanent and cannot be undone. All your saved
                data, preferences, and activity history will be lost.
              </p>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="confirmDelete"
                  checked={confirmDelete}
                  onChange={(e) => setConfirmDelete(e.target.checked)}
                  className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="confirmDelete"
                  className="text-sm text-gray-700"
                >
                  I understand this action is permanent and cannot be undone.
                </label>
              </div>
            </div>
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setConfirmDelete(false);
                }}
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={!confirmDelete}
                className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
                  confirmDelete
                    ? "bg-[#CF1322] hover:bg-[#CF1322]"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
