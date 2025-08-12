import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Info, Search, Check, X, FileDown } from "lucide-react";
import Privacy from "./settings/components/Privacy";
import Notification from "./settings/components/Notification";
import Preferences from "./settings/components/Preferences";
import Appearance from "./settings/components/Appearance";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { uploadRecuriterProfilePic } from "../../store/features/user/profileSlice";
import { setBusinessProfile, logoutUser } from "../../store/features/authSlice";
import axiosInstance from "../../lib/axio";
import Loader from "../../components/Loader";

// CSS for hiding scrollbar
const scrollbarStyles = `
  .recruiter-settings-scroll-container::-webkit-scrollbar {
    display: none;
  }
  
  .recruiter-settings-scroll-container {
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

const RecruiterSettings = () => {
  const { businessProfile } = useSelector((state) => state.auth);
  const { currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Account");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ✅ Add window size tracking for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    state: "",
    orgLogo: "",
    about: "",
  });

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
        marginLeft: "100px", // Fixed left spacing - same on all screens
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "80px", // Same top padding as OrganizationProfile
      };
    } else if (windowWidth <= 1920) {
      // Medium screens
      return {
        marginLeft: "50px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "80px", // Same top padding as OrganizationProfile
      };
    } else {
      // Large screens
      return {
        marginLeft: "50px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "80px", // Same top padding as OrganizationProfile
      };
    }
  };

  const layout = getResponsiveLayout();

  useEffect(() => {
    console.log("businessProfile in Settings:", businessProfile);
    console.log("currentUser in Settings:", currentUser);
    setFormData((prev) => ({
      ...prev,
      name: businessProfile?.name || "",
      email:
        businessProfile?.orgEmail ||
        businessProfile?.email ||
        currentUser?.email ||
        "",
      city: businessProfile?.locationName || businessProfile?.city || "",
      state: businessProfile?.locationAddress || businessProfile?.state || "",
      orgLogo: businessProfile?.orgLogo || "",
      about: businessProfile?.about || "",
    }));
  }, [businessProfile, currentUser]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
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
      // TODO: Call recruiter update API here
      // await updateRecruiterSettings({
      //   name: formData.name,
      //   locationName: formData.city,
      //   locationAddress: formData.state,
      //   about: formData.about
      // });
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
      // Call API to delete the recruiter account from database
      console.log("Deleting recruiter account...");
      const response = await axiosInstance.delete("/recuriter/deleteAccount");

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
        setIsImageUploading(true);
        const response = await dispatch(uploadRecuriterProfilePic(file));
        const newProfilePicUrl = response.payload;
        setFormData((prevData) => ({ ...prevData, orgLogo: newProfilePicUrl }));

        // Update Redux state to reflect in Profile section
        dispatch(
          setBusinessProfile({
            ...businessProfile,
            orgLogo: newProfilePicUrl,
          })
        );

        toast.success("Profile image updated successfully");
      } catch (error) {
        console.error("Error uploading profile image:", error);
        toast.error("Failed to update profile image");
      } finally {
        setIsImageUploading(false);
      }
    }
  };

  const handleImageUpload = async (e) => {
    const image = e.target.files[0];
    if (!image) {
      alert("Please select an image to upload.");
      return;
    }
    try {
      setIsImageUploading(true);
      const response = await dispatch(uploadRecuriterProfilePic(image));
      const newProfilePicUrl = response.payload;
      setFormData((prevData) => ({ ...prevData, orgLogo: newProfilePicUrl }));

      // Update Redux state to reflect in Profile section
      dispatch(
        setBusinessProfile({
          ...businessProfile,
          orgLogo: newProfilePicUrl,
        })
      );

      toast.success("Profile image updated");
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast.error("Failed to update profile image");
    } finally {
      setIsImageUploading(false);
    }
  };

  // ✅ Hide scrollbar while maintaining scroll functionality
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .recruiter-settings-scroll-container::-webkit-scrollbar {
        display: none;
      }
      .recruiter-settings-scroll-container {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <div
          className="flex flex-1 overflow-hidden"
          style={{ paddingTop: layout.topPadding }}
        >
          <div
            className="flex flex-1 overflow-y-auto recruiter-settings-scroll-container"
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
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div
        className="flex flex-1 overflow-hidden"
        style={{ paddingTop: layout.topPadding }}
      >
        <div
          className="flex flex-1 overflow-y-auto recruiter-settings-scroll-container"
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
                      className="pl-4 pr-9 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1890FF] focus:border-transparent w-64"
                    />
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#434343] h-4 w-4" />
                  </div>
                </div>

                {/* ✅ REMOVED shadow-sm - using clean border only for cross-platform consistency */}
                <div className="bg-white rounded-lg border border-gray-200 w-full pt-[10px]">
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
                              className="px-3 py-1.5 text-sm font-medium text-white rounded-lg disabled:opacity-50 flex items-center gap-2 bg-[#1890FF] hover:bg-[#1570EF]"
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
                                Organisation Name
                              </label>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={formData.name}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      name: e.target.value,
                                    })
                                  }
                                  className="w-full md:w-[500px] h-10 rounded-full border border-gray-200 px-3 text-gray-700 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#1890FF] focus:border-[#1890FF]"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                              <label className="w-full md:w-56 text-[#434343] font-bold text-sm">
                                Organisation Email
                              </label>
                              <div className="flex-1">
                                <input
                                  type="email"
                                  value={formData.email}
                                  disabled
                                  className="w-full md:w-[500px] h-10 rounded-full border border-gray-200 px-3 text-gray-700 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#1890FF] focus:border-[#1890FF]"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                              <label className="w-full md:w-56 text-[#434343] font-bold text-sm">
                                City
                              </label>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={formData.city}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      city: e.target.value,
                                    })
                                  }
                                  className="w-full md:w-[500px] h-10 rounded-full border border-gray-200 px-3 text-gray-700 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#1890FF] focus:border-[#1890FF]"
                                  placeholder="Enter city"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
                              <label className="w-full md:w-56 text-[#434343] font-bold text-sm">
                                Country
                              </label>
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={formData.state}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      state: e.target.value,
                                    })
                                  }
                                  className="w-full md:w-[500px] h-10 rounded-full border border-gray-200 px-3 text-gray-700 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#1890FF] focus:border-[#1890FF]"
                                  placeholder="Enter country"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                              <label className="w-full md:w-56 text-[#434343] font-bold text-sm">
                                Organisation Logo
                              </label>
                              <div className="flex-1">
                                <div className="flex items-center gap-4">
                                  <div className="relative">
                                    <div
                                      className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
                                      onDragOver={handleDragOver}
                                      onDrop={handleDrop}
                                      onClick={() =>
                                        fileInputRef.current?.click()
                                      }
                                    >
                                      {formData.orgLogo ? (
                                        <img
                                          src={formData.orgLogo}
                                          alt="Profile"
                                          className="w-full h-full rounded-full object-cover"
                                        />
                                      ) : (
                                        <div className="text-center">
                                          <div className="w-8 h-8 mx-auto mb-1">
                                            <FileDown className="w-8 h-8 text-gray-400" />
                                          </div>
                                          <span className="text-xs text-gray-500">
                                            Upload
                                          </span>
                                        </div>
                                      )}
                                    </div>
                                    {isImageUploading && (
                                      <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1890FF]"></div>
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600 mb-2">
                                      Upload your organisation logo
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      JPG, PNG or GIF. Max size 2MB.
                                    </p>
                                  </div>
                                </div>
                                <input
                                  ref={fileInputRef}
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
                              <label className="w-full md:w-56 text-[#434343] font-bold text-sm">
                                About
                              </label>
                              <div className="flex-1">
                                <textarea
                                  value={formData.about}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      about: e.target.value,
                                    })
                                  }
                                  rows={4}
                                  className="w-full md:w-[500px] rounded-lg h-[150px] border border-gray-200 px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-[#1890FF] focus:border-[#1890FF] bg-white"
                                  placeholder="Tell us about your organization."
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  {500 - (formData.about?.length || 0)}{" "}
                                  characters remaining
                                </div>
                              </div>
                            </div>
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
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg border border-gray-200 w-[600px] h-[268px] p-[40px] flex flex-col justify-between">
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

export default RecruiterSettings;
