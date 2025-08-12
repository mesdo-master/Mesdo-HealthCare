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
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { uploadProfilePic } from "../../store/features/user/profileSlice";
import { logoutUser } from "../../store/features/authSlice";
import axiosInstance from "../../lib/axio";
import { setCurrentUser } from "../../store/features/authSlice";
import { MdCancel, MdOutlineCancel } from "react-icons/md";

// CSS for hiding scrollbar
const scrollbarStyles = `
  .settings-scroll-container::-webkit-scrollbar {
    display: none;
  }
  
  .settings-scroll-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = scrollbarStyles;
  document.head.appendChild(styleSheet);
}

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
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Account");

  // ✅ Add window size tracking for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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

  // ✅ Add state to track original form data for change detection
  const [originalFormData, setOriginalFormData] = useState({
    username: "",
    phoneNo: "",
    countryCode: "+91",
    profilePic: "",
    bio: "",
    city: "",
    country: "",
  });

  // ✅ Track if form has unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // ✅ Track window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Consistent left spacing, adaptive layout
  const getResponsiveLayout = () => {
    if (windowWidth <= 1599) {
      // Small/normal screens - consistent left spacing
      return {
        marginLeft: "340px", // Fixed left spacing - same on all screens
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
      };
    } else if (windowWidth <= 1920) {
      // Medium screens
      return {
        marginLeft: "340px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
      };
    } else {
      // Large screens
      return {
        marginLeft: "20px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
      };
    }
  };

  const layout = getResponsiveLayout();

  useEffect(() => {
    if (!currentUser) return;

    const newFormData = {
      username: currentUser.username,
      phoneNo: currentUser.phoneNo,
      profilePic: currentUser.profilePicture,
      bio: currentUser.about,
      email: currentUser.email,
      city: currentUser.location?.city || "",
      country: currentUser.location?.country || "",
    };

    setFormData(newFormData);
    // ✅ Set original form data for change detection
    setOriginalFormData(newFormData);
  }, [currentUser]);

  // ✅ Function to check if form has unsaved changes
  const checkForChanges = (currentData) => {
    const hasChanges =
      currentData.username !== originalFormData.username ||
      currentData.phoneNo !== originalFormData.phoneNo ||
      currentData.countryCode !== originalFormData.countryCode ||
      currentData.bio !== originalFormData.bio ||
      currentData.city !== originalFormData.city ||
      currentData.country !== originalFormData.country;

    setHasUnsavedChanges(hasChanges);
  };

  // ✅ Update change detection whenever formData changes
  useEffect(() => {
    checkForChanges(formData);
  }, [formData, originalFormData]);

  // ✅ Monitor currentUser changes to debug onboarding redirects
  useEffect(() => {
    if (currentUser) {
      console.log("👤 Current user state:", {
        id: currentUser._id,
        username: currentUser.username,
        isOnboarded: currentUser.isOnboarded,
        onboardingCompleted: currentUser.onboardingCompleted,
        profileComplete: currentUser.profileComplete,
        needsOnboarding: currentUser.needsOnboarding,
      });
    }
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
          "Leipzig",
          "Dortmund",
          "Essen",
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
          "Jaipur",
          "Surat",
        ],
        Japan: [
          "Tokyo",
          "Yokohama",
          "Osaka",
          "Nagoya",
          "Sapporo",
          "Fukuoka",
          "Kobe",
          "Kyoto",
          "Kawasaki",
          "Saitama",
        ],
        China: [
          "Shanghai",
          "Beijing",
          "Guangzhou",
          "Shenzhen",
          "Chengdu",
          "Tianjin",
          "Chongqing",
          "Nanjing",
          "Wuhan",
          "Xi'an",
        ],
        Brazil: [
          "São Paulo",
          "Rio de Janeiro",
          "Brasília",
          "Salvador",
          "Fortaleza",
          "Belo Horizonte",
          "Manaus",
          "Curitiba",
          "Recife",
          "Porto Alegre",
        ],
      };

      if (commonCities[country]) {
        setLocationData((prev) => ({
          ...prev,
          cities: commonCities[country],
          loading: false,
        }));
      } else {
        // Generic fallback for other countries
        setLocationData((prev) => ({
          ...prev,
          cities: [
            "Capital City",
            "Major City 1",
            "Major City 2",
            "Major City 3",
            "Major City 4",
            "Major City 5",
          ],
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Error fetching cities:", error);
      setLocationData((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCountryChange = (selectedCountry) => {
    setFormData((prev) => ({ ...prev, country: selectedCountry, city: "" }));
    if (selectedCountry) {
      fetchCities(selectedCountry);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePhoneChange = (phone, country) => {
    setFormData((prev) => ({
      ...prev,
      phoneNo: phone,
      countryCode: `+${country.dialCode}`,
    }));
  };

  const handleSave = async () => {
    if (!currentUser) return;

    // ✅ Prevent saving if there are no actual changes
    if (!hasUnsavedChanges) {
      console.log("ℹ️ No changes to save");
      return;
    }

    setIsSaving(true);
    try {
      console.log("🔄 Saving settings with data:", {
        phoneNo: formData.phoneNo,
        bio: formData.bio,
        city: formData.city,
        country: formData.country,
      });

      const response = await updateAccountSettings({
        phoneNo: formData.phoneNo,
        about: formData.bio,
        location: {
          city: formData.city,
          country: formData.country,
        },
      });

      console.log("📡 Save response:", response);

      if (response.success) {
        toast.success("Settings updated successfully!");

        // ✅ Update the current user in Redux without triggering onboarding
        // Only update the specific fields that were changed, preserve all other user data
        const updatedUser = {
          ...currentUser,
          phoneNo: formData.phoneNo || currentUser.phoneNo,
          about: formData.bio || currentUser.about,
          location: {
            ...currentUser.location,
            city: formData.city || currentUser.location?.city,
            country: formData.country || currentUser.location?.country,
          },
          // ✅ Preserve critical onboarding-related fields
          isOnboarded: currentUser.isOnboarded,
          onboardingCompleted: currentUser.onboardingCompleted,
          profileComplete: currentUser.profileComplete,
        };

        console.log("✅ Updating Redux user state:", updatedUser);
        dispatch(setCurrentUser(updatedUser));

        // ✅ Update original form data after successful save
        setOriginalFormData(formData);
        setHasUnsavedChanges(false);

        // ✅ Ensure we stay on the settings page
        console.log("✅ Settings saved successfully, staying on settings page");
      } else {
        console.error("❌ Save failed:", response.message);
        toast.error(response.message || "Failed to update settings");
      }
    } catch (error) {
      console.error("❌ Error saving settings:", error);
      toast.error("Failed to update settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ Function to handle cancel - reset form to original values
  const handleCancel = () => {
    setFormData(originalFormData);
    setHasUnsavedChanges(false);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsSaving(true);
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await uploadProfilePic(formData);
      if (response.success) {
        toast.success("Profile picture updated successfully!");
        dispatch(setCurrentUser(response.user));
        // ✅ Update form data to trigger change detection
        setFormData((prev) => ({
          ...prev,
          profilePic: response.user.profilePicture,
        }));
        // ✅ Update original form data after successful save
        setOriginalFormData((prev) => ({
          ...prev,
          profilePic: response.user.profilePicture,
        }));
      } else {
        toast.error(response.message || "Failed to update profile picture");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture");
    } finally {
      setIsSaving(false);
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

  const handleDeleteAccount = async () => {
    if (!confirmDelete) return;

    try {
      // Call API to delete the account from database
      console.log("Deleting account...");
      const response = await axiosInstance.delete("/deleteAccount");

      if (response.status === 200) {
        toast.success("Account deleted successfully");
        setShowDeleteModal(false);
        setConfirmDelete(false);

        // Clear auth state and redirect to login
        dispatch(logoutUser());
        localStorage.removeItem("jwt-mesdo-token");
        localStorage.clear();

        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error(error.response?.data?.message || "Failed to delete account");
    }
  };

  const tabs = [
    "Account",
    "Privacy",
    "Notifications",
    "Preferences",
    "Appearance",
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const fileInputRef = useRef(null);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex flex-1 overflow-hidden pt-[85px]">
          <div
            className="flex flex-1 overflow-y-auto settings-scroll-container"
            style={{
              marginLeft: layout.marginLeft,
              paddingLeft: layout.paddingLeft,
              paddingRight: layout.paddingRight,
              scrollbarWidth: "none" /* Firefox */,
              msOverflowStyle: "none" /* Internet Explorer 10+ */,
            }}
          >
            <div className="mx-auto w-full max-w-[80rem]">
              <div className="bg-[#E4E5E8] rounded-lg w-full">
                <div
                  className="bg-[#F5F7FA] rounded-lg"
                  style={{ padding: layout.padding }}
                >
                  <div className="max-w-3xl mx-auto">
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                      <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden pt-[85px]">
        <div
          className="flex flex-1 overflow-y-auto settings-scroll-container"
          style={{
            marginLeft: layout.marginLeft,
            paddingLeft: layout.paddingLeft,
            paddingRight: layout.paddingRight,
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* Internet Explorer 10+ */,
          }}
        >
          <div className="mx-auto w-full max-w-[80rem]">
            <div className="bg-[#E4E5E8] rounded-lg w-full">
              <div
                className="bg-[#F5F7FA] rounded-lg"
                style={{ padding: layout.padding }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-xl font-semibold text-gray-900">
                    Settings
                  </h1>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search settings..."
                      className="pl-4 pr-9 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent w-64"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#434343] h-4 w-4" />
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 w-full pt-[10px]">
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
                          {/* ✅ Only show Save/Cancel buttons when there are unsaved changes */}
                          {hasUnsavedChanges && (
                            <div className="flex items-center gap-3">
                              <button
                                onClick={handleCancel}
                                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
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
                          )}
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
                                        handleInputChange(
                                          "city",
                                          e.target.value
                                        )
                                      }
                                      className="w-full md:w-[500px] h-10 rounded-full border border-gray-200 px-3 text-gray-700 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                                      list="cities-list"
                                    />
                                    <datalist id="cities-list">
                                      {locationData.cities.map(
                                        (city, index) => (
                                          <option key={index} value={city} />
                                        )
                                      )}
                                    </datalist>
                                  </div>
                                  <div className="relative">
                                    <select
                                      value={formData.country}
                                      onChange={(e) =>
                                        handleCountryChange(e.target.value)
                                      }
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
                                      onClick={() =>
                                        fileInputRef.current?.click()
                                      }
                                      onDragOver={handleDragOver}
                                      onDrop={handleDrop}
                                    >
                                      <FileDown
                                        className="w-8 h-8 mb-2 bg-gray-200 rounded-full p-1"
                                        style={{
                                          color: "rgba(24, 144, 255, 1)",
                                        }}
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
                                        Supported Format: SVG, JPG, PNG (10MB
                                        each)
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
                                    handleInputChange("bio", e.target.value)
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
                                    Permanently delete the account, all your
                                    saved data, preferences, and activity
                                    history will be lost.
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
                    {activeTab === "Notifications" && <Notification />}
                    {activeTab === "Preferences" && <Preferences />}
                    {activeTab === "Appearance" && <Appearance />}
                  </div>
                </div>
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
