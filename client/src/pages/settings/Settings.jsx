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
          ? "text-blue-600 border-b-2 border-blue-600"
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
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      username: currentUser.username,
      phoneNo: currentUser.phoneNo,
      profilePic: currentUser.profilePicture,
      bio: currentUser.about,
    }));
  }, [currentUser]);

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
      const response = await updateAccountSettings({
        phoneNo: formData.phoneNo,
        about: formData.bio,
      });

      // Update Redux store with the new user data
      const updatedUser = {
        ...currentUser,
        phoneNo: formData.phoneNo,
        about: formData.bio,
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
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex flex-1 overflow-hidden pt-16">
        <div className="flex-1 ml-[300px] overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search settings..."
                  className="pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
                  <div>
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                      <div>
                        <h2 className="text-lg font-medium text-gray-900">
                          Your Profile
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Please update your profile settings here
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          disabled={isSaving}
                          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                        >
                          Cancel
                          <X className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleSave}
                          disabled={isSaving}
                          className="px-3 py-1.5 text-sm font-medium text-white rounded-full disabled:opacity-50 flex items-center gap-2"
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

                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-8 items-center border-b border-gray-100 pb-6">
                        <label className="text-sm font-medium text-black">
                          Username
                        </label>
                        <div className="col-span-2">
                          <input
                            type="text"
                            value={formData.username}
                            disabled
                            className="w-[500px] mt-1 h-10 rounded-full border border-gray-200 px-3 text-gray-700 text-sm bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-8 items-center border-b border-gray-100 pb-6">
                        <label className="text-sm font-medium text-black">
                          Phone Number
                        </label>
                        <div className="col-span-2">
                          <PhoneInput
                            country={"gb"}
                            enableAreaCodes={true}
                            enableSearch={true}
                            value={`${formData.countryCode}${formData.phoneNo}`}
                            onChange={handlePhoneChange}
                            inputClass="!w-[500px] !h-10 !rounded-full !border !border-gray-200 !pl-14 !pr-3 !text-gray-700 !text-sm !font-normal !focus:outline-none !focus:ring-1 !focus:ring-blue-500"
                            buttonClass="!border-gray-200 !bg-white !h-10 !w-12"
                            dropdownClass="!shadow-md !border-gray-200"
                            searchClass="!bg-white !text-sm !border-gray-200"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-8 items-start border-b border-gray-100 pb-6">
                        <label className="text-sm font-medium text-black pt-2">
                          Profile Picture
                        </label>
                        <div className="col-span-2">
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
                                className="border border-dashed border-gray-300 rounded-xl h-[150px] w-[430px] p-4 flex flex-col items-center justify-center text-center hover:border-blue-500 transition-colors cursor-pointer bg-white"
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

                      <div className="grid grid-cols-3 gap-8 items-start">
                        <label className="flex items-center text-sm font-medium text-black pt-2">
                          Biography
                          <Info className="ml-1.5 h-3.5 w-3.5 text-gray-400" />
                        </label>
                        <div className="col-span-2">
                          <textarea
                            value={formData.bio}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                bio: e.target.value,
                              })
                            }
                            rows={4}
                            className="w-[500px] rounded-lg h-[150px] border border-gray-200 px-3 py-2 text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                            placeholder="Hi there! 👋 I'm X-AE-A-19, an AI enthusiast and fitness aficionado."
                          />
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
  );
};

export default Settings;
