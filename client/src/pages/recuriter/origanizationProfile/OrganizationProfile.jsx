import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  Bell,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings,
  Briefcase,
  GraduationCap,
  Award,
  BookOpen,
  Globe,
  ChevronRight,
  X,
  ShieldCheck,
  Ellipsis,
  PlusCircle,
  PlusIcon,
  Edit,
  Trash2,
  AwardIcon,
  Link2,
  MapPin,
  ExternalLink,
  Calendar,
  Stethoscope,
  MoreVertical,
  TrendingUp,
} from "lucide-react";
import ProfileSection from "./component/ProfileSection";
import SkillsSpecialization from "../../recuriter/origanizationProfile/component/SkillsSpecialization";
import ProfileCompletionNudge from "../../../components/ProfileCompletionNudge";
import Header from "../../../components/Header";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../../lib/axio";
import { useParams } from "react-router-dom";
import WorkExperienceForm from "../../user/profilePage/components/WorkExperienceForm";
import WorkExperienceSection from "../../user/profilePage/components/WorkExperienceSection";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../../components/Loader";

// Custom JobCard component for Organization Profile with single-line title truncation
const ProfileJobCard = ({ job, onEdit, onDelete }) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    }
    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#F1F1F1] p-4 sm:p-6 lg:p-9 w-full max-w-full sm:max-w-[587px] mx-auto transition hover:shadow-md h-auto min-h-[320px] flex flex-col justify-between">
      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 40 }}
              transition={{ duration: 0.3, type: "spring" }}
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 px-10 py-8 flex flex-col items-center gap-4"
              style={{ minWidth: 340 }}
            >
              <svg
                className="w-12 h-12 text-red-500 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="#fee2e2"
                />
                <path
                  d="M15 9l-6 6M9 9l6 6"
                  stroke="#ef4444"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              <span className="text-xl font-bold text-red-700 text-center">
                Are you sure you want to close this job?
              </span>
              <span className="text-gray-500 text-center">
                This action cannot be undone.
              </span>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-6 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowConfirm(false);
                    await onDelete(job._id);
                  }}
                  className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1 mr-2">
          {/* Status */}
          <div className="relative">
            <button className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold focus:outline-none border border-green-200 min-w-[70px]">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-1 inline-block"></span>
              Active
            </button>
          </div>
          {/* Role */}
          <span className="flex items-center gap-1 text-[13px] text-gray-700 font-medium truncate">
            <Stethoscope size={14} className="text-purple-500 flex-shrink-0" />
            <span className="truncate">Doctor</span>
          </span>
        </div>
        <div className="relative flex-shrink-0">
          <button
            className="text-gray-400 hover:text-gray-600 p-1"
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown((v) => !v);
            }}
          >
            <MoreVertical size={18} />
          </button>
          {openDropdown && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-8 z-30 min-w-[200px] bg-white rounded-xl shadow-xl border border-gray-100 py-2 px-0 flex flex-col gap-1 animate-fade-in"
              style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="flex items-center justify-between w-full px-5 py-2 text-[15px] text-[#595959] hover:bg-gray-50 focus:outline-none"
                onClick={() => {
                  setOpenDropdown(false);
                  onEdit(job._id);
                }}
              >
                <span>Edit</span>
                <Pencil size={18} className="ml-2 text-gray-400" />
              </button>
              <button
                className="flex items-center justify-between w-full px-5 py-2 text-[15px] text-[#595959] hover:bg-gray-50 focus:outline-none"
                onClick={() => {
                  setOpenDropdown(false);
                  setShowConfirm(true);
                }}
              >
                <span>Close</span>
                <Trash2 size={18} className="ml-2 text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Until */}
      <div className="text-[12px] text-gray-500 mb-1 flex items-center gap-1 truncate">
        <Calendar size={12} className="flex-shrink-0" />
        <span className="truncate">
          Active Until -{" "}
          <span className="font-semibold text-gray-900 ml-1">
            {new Date(job?.endDate).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </span>
        </span>
      </div>

      {/* Title - Single line with truncation */}
      <div className="mb-3">
        <div className="text-lg sm:text-xl lg:text-[22px] font-bold text-gray-900 leading-tight overflow-hidden line-clamp-1 min-h-[48px] sm:min-h-[56px] flex items-end">
          {job?.jobTitle}
        </div>
      </div>

      {/* Stats Box */}
      <div className="bg-[#F7F9FB] rounded-xl flex flex-col sm:flex-row items-start sm:items-center px-4 py-4 mb-3 border border-[#E9E9E9] w-full min-w-0 overflow-hidden gap-3 sm:gap-4">
        <div className="flex flex-col sm:flex-row flex-grow min-w-0 items-start sm:items-center w-full gap-3 sm:gap-4">
          <div className="flex flex-col items-start min-w-[90px] flex-shrink-0">
            <div className="flex items-end gap-1">
              <span className="text-xl sm:text-[22px] font-semibold text-gray-900 truncate">
                {job.applied?.length || 0}
              </span>
              <span className="text-xs text-green-600 font-bold align-bottom">
                +25%
              </span>
            </div>
            <span className="text-[12px] text-gray-500 font-medium mt-1 truncate">
              Total Applied
            </span>
          </div>

          <div className="flex flex-col items-start min-w-[90px] flex-shrink-0">
            <span className="text-xl sm:text-[22px] font-semibold text-gray-900 truncate">
              {job?.shortListed?.length || 0}
            </span>
            <span className="text-[12px] text-gray-500 font-medium mt-1 truncate">
              Shortlisted
            </span>
          </div>

          <div className="flex-1 hidden sm:block" />

          <button
            onClick={() => navigate(`${job._id}/applicants`)}
            className="text-[#1890FF] text-[12px] font-medium hover:underline whitespace-nowrap flex-shrink-0 self-start sm:self-center mt-2 sm:mt-0"
          >
            View All Applicants &rarr;
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[12px] text-gray-600 mt-2">
        <div className="flex items-center gap-2 truncate min-w-0">
          <TrendingUp size={16} className="text-[#1890FF] flex-shrink-0" />
          <span className="truncate">2 new message, 3 new applicants</span>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, isLink = false }) => (
  <div className="flex justify-between items-center">
    <span className="text-[14px] text-gray-600">{label}</span>
    {isLink ? (
      <a
        href={`https://${value}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[14px] text-[#1890FF] hover:underline flex items-center"
      >
        {value}
        <ExternalLink className="w-3 h-3 ml-1" />
      </a>
    ) : (
      <span className="text-[14px] text-gray-900">{value}</span>
    )}
  </div>
);

const MoreInformationForm = ({ infoData, onSave, onCancel }) => {
  const [formData, setFormData] = useState(infoData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Website
        </label>
        <input
          type="text"
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Organization Size
        </label>
        <input
          type="text"
          name="organizationSize"
          value={formData.organizationSize}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type
        </label>
        <input
          type="text"
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Founded
        </label>
        <input
          type="text"
          name="founded"
          value={formData.founded}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Industry
        </label>
        <input
          type="text"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Socials
        </label>
        <input
          type="text"
          name="socials"
          value={formData.socials}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
        />
      </div>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(formData)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

const AddressSection = ({ addresses, onEdit }) => {
  const mainBranch = addresses.find((addr) => addr.isMain) || addresses[0];
  const otherBranches = addresses.filter((addr) => !addr.isMain);

  const openGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`,
      "_blank"
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6 border border-[#E4E5E8]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[16px] font-medium text-gray-900">Addresses</h2>
        <button onClick={onEdit} className="text-gray-400 hover:text-gray-600">
          <Edit className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-4">
        {mainBranch && (
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span className="text-[12px] font-medium text-blue-600">
                  Main Branch
                </span>
              </div>
              <button
                onClick={() => openGoogleMaps(mainBranch.address)}
                className="text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[14px] text-gray-700 mt-1">
              {mainBranch.address}
            </p>
          </div>
        )}
        {otherBranches.map((branch, index) => (
          <div key={index} className="border-l-4 border-gray-300 pl-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-[12px] font-medium text-gray-600">
                  Branch {index + 1}
                </span>
              </div>
              <button
                onClick={() => openGoogleMaps(branch.address)}
                className="text-blue-500 hover:text-blue-700"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[14px] text-gray-700 mt-1">{branch.address}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AddressForm = ({ addresses, onSave, onCancel }) => {
  const [formData, setFormData] = useState([...addresses]);

  const handleChange = (index, field, value) => {
    const updatedAddresses = [...formData];
    updatedAddresses[index][field] = value;
    setFormData(updatedAddresses);
  };

  const addNewAddress = () => {
    setFormData([
      ...formData,
      {
        address: "",
        isMain: false,
      },
    ]);
  };

  const removeAddress = (index) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const setAsMain = (index) => {
    const updatedAddresses = formData.map((addr, i) => ({
      ...addr,
      isMain: i === index,
    }));
    setFormData(updatedAddresses);
  };

  return (
    <div className="p-6 space-y-4">
      {formData.map((address, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium">
              {address.isMain ? "Main Branch" : `Branch ${index + 1}`}
            </h4>
            <div className="flex space-x-2">
              {!address.isMain && (
                <button
                  onClick={() => setAsMain(index)}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Set as Main
                </button>
              )}
              {formData.length > 1 && (
                <button
                  onClick={() => removeAddress(index)}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <textarea
            value={address.address}
            onChange={(e) => handleChange(index, "address", e.target.value)}
            placeholder="Enter address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            rows={3}
          />
        </div>
      ))}
      <button
        onClick={addNewAddress}
        className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600"
      >
        + Add New Address
      </button>
      <div className="mt-6 flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(formData)}
          className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

const ModalTabs = [
  "About",
  "Jobs",
  "Specialities",
  "More Information",
  "Addresses",
];

const TabsSection = ({
  activeTab,
  setActiveTab,
  userData,
  isOwnProfile,
  editData,
  setEditData,
  handleChange,
  handleSave,
  userSkills,
  setUserSkills,
  experiences,
  setExperiences,
  editingExperience,
  setEditingExperience,
  handleSaveExperience,
  setIsEditing,
  setActiveModalTab,
  isEditing,
  activeModalTab,
  handleDeleteExperience,
}) => {
  const tabs = ["Overview", "Jobs", "People", "Connection"];
  const navigate = useNavigate(); // <-- Move useNavigate here

  const [aboutData, setAboutData] = useState("");

  useEffect(() => {
    if (userData && userData.about) {
      setAboutData(userData.about);
      setEditData({ description: userData.about });
    } else if (userData && userData.overview) {
      // Use overview field as fallback for about
      setAboutData(userData.overview);
      setEditData({ description: userData.overview });
    }
  }, [userData]);

  const handleSaveAbout = async () => {
    try {
      console.log(" About data :", editData.description);
      const response = await axiosInstance.put(`/recuriter/updateProfile`, {
        about: editData.description,
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error saving about data:", error);
    }
  };

  const [moreInfo, setMoreInfo] = useState({
    website: "",
    organizationSize: "",
    type: "",
    founded: "",
    industry: "",
    socials: "",
  });

  // Update moreInfo when userData changes
  useEffect(() => {
    if (userData) {
      setMoreInfo({
        website: userData.website || "",
        organizationSize: userData.organizationSize || "",
        type: userData.organizationType || "",
        founded: userData.founded || "",
        industry: userData.industry || "",
        socials: userData.socials || "",
      });
    }
  }, [userData]);

  const [addresses, setAddresses] = useState([]);

  // Update addresses when userData changes
  useEffect(() => {
    if (userData) {
      const addressList = [];
      if (userData.locationName || userData.locationAddress) {
        addressList.push({
          address: userData.locationAddress || userData.locationName || "",
          isMain: true,
        });
      }
      setAddresses(addressList);
    }
  }, [userData]);

  const handleSaveMoreInfo = async (updatedInfo) => {
    try {
      const response = await axiosInstance.put(`/recuriter/updateProfile`, {
        website: updatedInfo.website,
        organizationSize: updatedInfo.organizationSize,
        organizationType: updatedInfo.type,
        founded: updatedInfo.founded,
        industry: updatedInfo.industry,
        socials: updatedInfo.socials,
      });

      if (response.data.success) {
        setMoreInfo(updatedInfo);
        setIsEditing(false);
        console.log("More information updated successfully");
      }
    } catch (error) {
      console.error("Error updating more information:", error);
      alert("Error updating organization information. Please try again.");
    }
  };

  const handleSaveAddresses = async (updatedAddresses) => {
    try {
      const mainAddress =
        updatedAddresses.find((addr) => addr.isMain) || updatedAddresses[0];

      const response = await axiosInstance.put(`/recuriter/updateProfile`, {
        locationName: mainAddress?.address?.split(",")[0] || "",
        locationAddress: mainAddress?.address || "",
      });

      if (response.data.success) {
        setAddresses(updatedAddresses);
        setIsEditing(false);
        console.log("Addresses updated successfully");
      }
    } catch (error) {
      console.error("Error updating addresses:", error);
      alert("Error updating addresses. Please try again.");
    }
  };

  return (
    <>
      <div className="mt-6">
        <div className="border border-gray-200 rounded-lg p-2 bg-white">
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-300
                  ${
                    activeTab === tab
                      ? "bg-blue-500 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {activeTab === "Overview" && (
            <div>
              {/* About Section */}
              <div className="bg-white rounded-2xl p-6 border border-[#E4E5E8]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[18px] font-semibold text-gray-900">
                    About
                  </h3>
                  {isOwnProfile && (
                    <button
                      onClick={() => {
                        setActiveModalTab("About");
                        setIsEditing(true);
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {aboutData || "No description available."}
                </p>
              </div>

              {/* Specialities Section */}
              <div className="bg-white rounded-2xl p-6 border border-[#E4E5E8] mt-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[18px] font-semibold text-gray-900">
                    Specialities
                  </h3>
                  {isOwnProfile && (
                    <button
                      onClick={() => {
                        setActiveModalTab("Specialities");
                        setIsEditing(true);
                      }}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 ml-[-10px]">
                  {userSkills.length > 0 ? (
                    userSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm">
                      No specialities added yet
                    </p>
                  )}
                </div>
              </div>

              {/* Jobs Section */}
              <div className="bg-white rounded-2xl p-6 border border-[#E4E5E8] mt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-[18px] font-semibold text-gray-900">
                      Recent Jobs
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Latest job openings from this organization
                    </p>
                  </div>
                  {isOwnProfile && experiences.length > 4 && (
                    <button
                      className="text-[#1890FF] hover:text-[#1570EF] text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200"
                      onClick={() => setActiveTab("Jobs")}
                    >
                      View all jobs
                    </button>
                  )}
                </div>
                {experiences.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-base font-medium">
                      No jobs posted yet
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      This organization hasn't posted any job openings
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {experiences.slice(0, 4).map((job, index) => (
                      <div key={job._id} className="w-full">
                        <ProfileJobCard
                          job={job}
                          onEdit={(jobId) =>
                            navigate(`/recruitment/create?jobId=${jobId}`)
                          }
                          onDelete={async (jobId) => {
                            try {
                              await axiosInstance.delete(`/jobs/${jobId}`);
                              // Refresh the jobs list
                              const updatedExperiences = experiences.filter(
                                (j) => j._id !== jobId
                              );
                              // You might need to update the state here
                            } catch (err) {
                              console.error("Failed to delete job:", err);
                            }
                          }}
                        />
                      </div>
                    ))}
                    {experiences.length > 4 && (
                      <div className="text-center pt-4">
                        <button
                          onClick={() => setActiveTab("Jobs")}
                          className="text-[#1890FF] hover:text-[#1570EF] text-sm font-medium px-6 py-3 rounded-lg border border-[#1890FF] hover:bg-[#1890FF] hover:text-white transition-all duration-200"
                        >
                          View all {experiences.length} jobs
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* People at Apollo Section */}
              <div className="bg-white rounded-2xl p-6 border border-[#E4E5E8] mt-6">
                <h3 className="text-[18px] font-semibold text-gray-900 mb-6">
                  People at Apollo
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      name: "Alena Baptista",
                      role: "Dental Surgeon",
                      company: "Apollo Hospital",
                      image:
                        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
                    },
                    {
                      name: "Mira Curtis",
                      role: "Dental Surgeon",
                      company: "Apollo Hospital",
                      image:
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                    },
                    {
                      name: "Ashlynn Rosser",
                      role: "Dental Surgeon",
                      company: "Apollo Hospital",
                      image:
                        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                    },
                    {
                      name: "Alfonso Siphron",
                      role: "Dental Surgeon",
                      company: "Apollo Hospital",
                      image:
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                    },
                    {
                      name: "Jakob Dias",
                      role: "Dental Surgeon",
                      company: "Apollo Hospital",
                      image:
                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
                    },
                  ].map((person, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <img
                          src={person.image}
                          alt={person.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <h4 className="text-[14px] font-medium text-gray-900">
                            {person.name}
                          </h4>
                          <p className="text-[12px] text-gray-500">
                            {person.role} | {person.company.substring(0, 5)}...
                          </p>
                        </div>
                      </div>
                      <button className="text-[12px] bg-[#1890FF] text-white font-medium px-4 py-1 rounded-lg shadow hover:bg-blue-700 transition-colors">
                        + Follow
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === "Jobs" && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-[#E4E5E8]">
              <h2 className="text-xl font-mb text-gray-900 mb-6 font-sans tracking-wide">
                Available Jobs
              </h2>
              {experiences.length === 0 ? (
                <p className="text-gray-400 text-center py-10 text-base font-sans">
                  No jobs posted yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {experiences.map((job) => (
                    <div key={job._id} className="w-full">
                      <ProfileJobCard
                        job={job}
                        onEdit={(jobId) =>
                          navigate(`/recruitment/create?jobId=${jobId}`)
                        }
                        onDelete={async (jobId) => {
                          try {
                            await axiosInstance.delete(`/jobs/${jobId}`);
                            // Refresh the jobs list
                            const updatedExperiences = experiences.filter(
                              (j) => j._id !== jobId
                            );
                            // You might need to update the state here
                          } catch (err) {
                            console.error("Failed to delete job:", err);
                          }
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === "People" && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-[#E4E5E8]">
              <h2 className="text-xl font-medium text-gray-900 mb-6">
                People at Apollo
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    name: "Alena Baptista",
                    role: "Dental Surgeon",
                    company: "Apollo Hospital",
                    image:
                      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
                  },
                  {
                    name: "Mira Curtis",
                    role: "Dental Surgeon",
                    company: "Apollo Hospital",
                    image:
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                  },
                  {
                    name: "Ashlynn Rosser",
                    role: "Dental Surgeon",
                    company: "Apollo Hospital",
                    image:
                      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                  },
                  {
                    name: "Alfonso Siphron",
                    role: "Dental Surgeon",
                    company: "Apollo Hospital",
                    image:
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                  },
                ].map((person, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg"
                  >
                    <img
                      src={person.image}
                      alt={person.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-[16px] font-medium text-gray-900">
                        {person.name}
                      </h4>
                      <p className="text-[14px] text-gray-500">{person.role}</p>
                      <p className="text-[12px] text-gray-400">
                        {person.company}
                      </p>
                    </div>
                    <button className="text-[14px] text-blue-600 hover:text-blue-700 font-medium px-4 py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                      Connect
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === "Connection" && (
            <div className="bg-white rounded-lg shadow-sm p-6 border border-[#E4E5E8]">
              <h2 className="text-xl font-medium text-gray-900 mb-6">
                Connections
              </h2>
              <p className="text-gray-500 text-center py-8">
                No connections to display.
              </p>
            </div>
          )}
        </div>
      </div>
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-5xl h-[85vh] overflow-hidden relative mt-8">
            {/* Close button in top-right corner */}
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 z-20 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex h-full">
              {/* Sidebar Menu */}
              <div className="w-80 bg-gray-50 border-r border-gray-200 flex-shrink-0">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-medium text-gray-900">
                    Edit Profile
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Update your organization information
                  </p>
                </div>
                <nav className="p-4">
                  <ul className="space-y-1">
                    {ModalTabs.map((item, index) => (
                      <li key={index}>
                        <button
                          className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3
                            ${
                              activeModalTab === item
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-gray-700 hover:bg-white hover:shadow-sm"
                            }`}
                          onClick={() => setActiveModalTab(item)}
                        >
                          {item === "About" && <BookOpen className="w-4 h-4" />}
                          {item === "Jobs" && <Briefcase className="w-4 h-4" />}
                          {item === "Specialities" && (
                            <Award className="w-4 h-4" />
                          )}
                          {item === "More Information" && (
                            <Settings className="w-4 h-4" />
                          )}
                          {item === "Addresses" && (
                            <MapPin className="w-4 h-4" />
                          )}
                          <span>{item}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* Edit Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  {activeModalTab === "About" && (
                    <div className="p-8">
                      <div className="max-w-2xl">
                        <h4 className="text-lg font-medium text-gray-900 mb-6">
                          About Organization
                        </h4>
                        <div className="space-y-6">
                          <div>
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Organization Description
                            </label>
                            <textarea
                              id="description"
                              name="description"
                              rows={8}
                              value={editData.description || ""}
                              onChange={handleChange}
                              placeholder="Tell us about your organization..."
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                          </div>
                          <div className="flex justify-end space-x-3 pt-4">
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSave}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeModalTab === "Specialities" && (
                    <div className="p-8">
                      <div className="max-w-2xl">
                        <h4 className="text-lg font-medium text-gray-900 mb-6">
                          Organization Specialities
                        </h4>
                        <SkillsSpecialization
                          initialSkills={userSkills}
                          onSaveSkills={(updatedSkills) => {
                            setUserSkills(updatedSkills);
                            setIsEditing(false);
                          }}
                          onCancel={() => setIsEditing(false)}
                        />
                      </div>
                    </div>
                  )}
                  {activeModalTab === "Jobs" && (
                    <div className="p-8">
                      <div className="max-w-4xl">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-lg font-medium text-gray-900">
                            Job Openings
                          </h4>
                          {/* No add job button in org profile modal */}
                        </div>
                        <div className="space-y-4">
                          {experiences.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                              <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p>No job openings posted yet</p>
                            </div>
                          ) : (
                            experiences.map((job) => (
                              <div
                                key={job._id}
                                className="border p-4 rounded-lg"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="font-semibold text-lg text-gray-800">
                                      {job.jobTitle}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-1">
                                      {job.location}
                                    </p>
                                    <div className="text-gray-500 text-xs mb-2">
                                      {job.employmentType} | {job.jobCategory}
                                    </div>
                                    <div
                                      className="text-gray-700 text-sm"
                                      dangerouslySetInnerHTML={{
                                        __html:
                                          job.jobDescription ||
                                          job.description ||
                                          "",
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-2 text-xs text-gray-500">
                                  <span>Openings: {job.openings}</span>
                                  {job.salaryRangeFrom && job.salaryRangeTo && (
                                    <span>
                                      Salary: {job.salaryRangeFrom} -{" "}
                                      {job.salaryRangeTo}
                                    </span>
                                  )}
                                  {job.endDate && (
                                    <span>End Date: {job.endDate}</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {activeModalTab === "Add Job" && (
                    <div className="p-8">
                      <div className="max-w-2xl">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-lg font-medium text-gray-900">
                            {editingExperience
                              ? "Edit Job Opening"
                              : "Add Job Opening"}
                          </h4>
                          <button
                            onClick={() => setActiveModalTab("Jobs")}
                            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <WorkExperienceForm
                          experience={editingExperience || {}}
                          onSave={handleSaveExperience}
                          onCancel={() => setActiveModalTab("Jobs")}
                        />
                      </div>
                    </div>
                  )}
                  {activeModalTab === "More Information" && (
                    <div className="p-8">
                      <div className="max-w-2xl">
                        <h4 className="text-lg font-medium text-gray-900 mb-6">
                          Organization Information
                        </h4>
                        <MoreInformationForm
                          infoData={moreInfo}
                          onSave={handleSaveMoreInfo}
                          onCancel={() => setIsEditing(false)}
                        />
                      </div>
                    </div>
                  )}
                  {activeModalTab === "Addresses" && (
                    <div className="p-8">
                      <div className="max-w-2xl">
                        <h4 className="text-lg font-medium text-gray-900 mb-6">
                          Organization Addresses
                        </h4>
                        <AddressForm
                          addresses={addresses}
                          onSave={handleSaveAddresses}
                          onCancel={() => setIsEditing(false)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const OrganizationProfile = () => {
  const [activeTab, setActiveTab] = useState("Overview");
  const [isEditing, setIsEditing] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("");
  const [showProfileNudge, setShowProfileNudge] = useState(true);
  const { businessProfile } = useSelector((state) => state.auth);
  const [orgData, setOrgData] = useState();
  const dispatch = useDispatch();
  const { orgname } = useParams();
  const [editData, setEditData] = useState({ description: "" });
  const [userSkills, setUserSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [editingExperience, setEditingExperience] = useState(null);

  // ✅ Add window size tracking for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [moreInfo, setMoreInfo] = useState({
    website: "",
    organizationSize: "",
    type: "",
    founded: "",
    industry: "",
    socials: "",
  });
  const [addresses, setAddresses] = useState([]);
  const [orgJobs, setOrgJobs] = useState([]); // <-- New state for real jobs

  // ✅ Track window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Hide scrollbar while maintaining scroll functionality
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .profile-scroll-container::-webkit-scrollbar {
        display: none;
      }
      .profile-scroll-container {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Fetch organization data first
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axiosInstance.get("recuriter/fetchOrgData", {
          params: { orgname },
        });
        setOrgData(response.data.recruiter);
      } catch (error) {
        console.error("Error fetching  organisation profile:", error);
      }
    };

    if (orgname) {
      fetchProfile();
    }
  }, [orgname, dispatch]);

  // Fetch jobs for this organization
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axiosInstance.get("/jobs");
        // Optionally filter by org if needed: res.data.jobs.filter(j => j.organization === orgData?._id)
        setOrgJobs(res.data.jobs || []);
      } catch (err) {
        setOrgJobs([]);
        console.error("Failed to fetch jobs", err);
      }
    };
    if (orgData?._id) fetchJobs();
  }, [orgData?._id]);

  // Determine userData after fetching
  const isOwnProfile = businessProfile?._id === orgData?._id;
  const userData = isOwnProfile ? businessProfile : orgData;

  // Initialize skills based on industry and set up about data
  useEffect(() => {
    if (userData) {
      // Set about data
      if (userData.about) {
        setEditData({ description: userData.about });
      } else if (userData.overview) {
        setEditData({ description: userData.overview });
      }

      // Set industry-based skills
      const industrySkills = {
        healthcare: [
          "Patient Care",
          "Medical Knowledge",
          "Emergency Response",
          "Healthcare Compliance",
        ],
        technology: [
          "Software Development",
          "Data Analysis",
          "Cloud Computing",
          "AI/ML",
        ],
        finance: [
          "Financial Analysis",
          "Risk Management",
          "Compliance",
          "Investment Banking",
        ],
        education: [
          "Curriculum Development",
          "Student Assessment",
          "Educational Technology",
          "Academic Research",
        ],
        manufacturing: [
          "Quality Control",
          "Process Optimization",
          "Safety Management",
          "Supply Chain",
        ],
      };

      const skills = industrySkills[userData.industry?.toLowerCase()] || [
        "Industry Expertise",
        "Professional Services",
        "Team Management",
      ];
      setUserSkills(skills);
    }
  }, [userData]);

  // Update moreInfo when userData changes
  useEffect(() => {
    if (userData) {
      setMoreInfo({
        website: userData.website || "",
        organizationSize: userData.organizationSize || "",
        type: userData.organizationType || "",
        founded: userData.founded || "",
        industry: userData.industry || "",
        socials: userData.socials || "",
      });
    }
  }, [userData]);

  // Update addresses when userData changes
  useEffect(() => {
    if (userData) {
      const addressList = [];
      if (userData.locationName || userData.locationAddress) {
        addressList.push({
          address: userData.locationAddress || userData.locationName || "",
          isMain: true,
        });
      }
      setAddresses(addressList);
    }
  }, [userData]);

  // Loader while orgData is being fetched
  if (!orgData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  const SIDEBAR_WIDTH = "80px";

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
        topPadding: "62px", // Same top padding as RecruitmentPage
      };
    } else if (windowWidth <= 1920) {
      // Medium screens
      return {
        marginLeft: "50px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "62px", // Same top padding as RecruitmentPage
      };
    } else {
      // Large screens
      return {
        marginLeft: "50px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "62px", // Same top padding as RecruitmentPage
      };
    }
  };

  const layout = getResponsiveLayout();

  const handleSaveMoreInfo = async (updatedInfo) => {
    try {
      const response = await axiosInstance.put(`/recuriter/updateProfile`, {
        website: updatedInfo.website,
        organizationSize: updatedInfo.organizationSize,
        organizationType: updatedInfo.type,
        founded: updatedInfo.founded,
        industry: updatedInfo.industry,
        socials: updatedInfo.socials,
      });

      if (response.data.success) {
        setMoreInfo(updatedInfo);
        setIsEditing(false);
        console.log("More information updated successfully");
      }
    } catch (error) {
      console.error("Error updating more information:", error);
      alert("Error updating organization information. Please try again.");
    }
  };

  const handleSaveAddresses = async (updatedAddresses) => {
    try {
      const mainAddress =
        updatedAddresses.find((addr) => addr.isMain) || updatedAddresses[0];

      const response = await axiosInstance.put(`/recuriter/updateProfile`, {
        locationName: mainAddress?.address?.split(",")[0] || "",
        locationAddress: mainAddress?.address || "",
      });

      if (response.data.success) {
        setAddresses(updatedAddresses);
        setIsEditing(false);
        console.log("Addresses updated successfully");
      }
    } catch (error) {
      console.error("Error updating addresses:", error);
      alert("Error updating addresses. Please try again.");
    }
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (activeModalTab === "About") {
      await axiosInstance.put(`/recuriter/updateProfile`, {
        about: editData.description,
      });
    }
    setIsEditing(false);
  };

  const handleSaveExperience = (savedExperience) => {
    if (editingExperience) {
      setExperiences(
        experiences.map((exp) =>
          exp.id === savedExperience.id ? savedExperience : exp
        )
      );
    } else {
      setExperiences([
        ...experiences,
        {
          ...savedExperience,
          id: Date.now(),
          title: savedExperience.title || "",
          institution: savedExperience.institution || "",
          type: savedExperience.type || "",
          location: savedExperience.location || "",
          startDate: savedExperience.startDate || "",
          endDate: savedExperience.currentlyWorking
            ? ""
            : savedExperience.endDate || "",
          currentlyWorking: savedExperience.currentlyWorking || false,
          description: savedExperience.description || "",
          tags: savedExperience.tags || [],
        },
      ]);
    }
    setEditingExperience(null);
    setActiveModalTab("Jobs");
  };

  const handleDeleteExperience = (id) => {
    setExperiences(experiences.filter((exp) => exp.id !== id));
  };

  const openModal = (modalType) => {
    setIsEditing(true);
    setActiveModalTab(modalType);
  };

  return (
    <div className="flex flex-col h-screen">
      <div
        className="flex flex-1 overflow-hidden"
        style={{ paddingTop: layout.topPadding }}
      >
        <div
          className="flex flex-1 overflow-y-auto profile-scroll-container"
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
                <Header />
                <div className="flex flex-col mt-6">
                  {/* Profile Section */}
                  <ProfileSection
                    userData={userData}
                    isOwnProfile={isOwnProfile}
                    openModal={openModal}
                  />
                  {/* Tabs and Content */}
                  <div className="flex gap-4 mt-6">
                    <div className="w-2/3">
                      <TabsSection
                        activeTab={activeTab}
                        setActiveTab={setActiveTab}
                        userData={userData}
                        isOwnProfile={isOwnProfile}
                        editData={editData}
                        setEditData={setEditData}
                        handleChange={handleChange}
                        handleSave={handleSave}
                        userSkills={userSkills}
                        setUserSkills={setUserSkills}
                        experiences={orgJobs} // <-- Pass real jobs here
                        setExperiences={setExperiences} // (not used for jobs now)
                        editingExperience={editingExperience}
                        setEditingExperience={setEditingExperience}
                        handleSaveExperience={handleSaveExperience}
                        setIsEditing={setIsEditing}
                        setActiveModalTab={setActiveModalTab}
                        isEditing={isEditing}
                        activeModalTab={activeModalTab}
                        handleDeleteExperience={handleDeleteExperience}
                      />
                    </div>
                    {/* Right Sidebar */}
                    <div className="w-1/3 py-6">
                      {/* More Information */}
                      <div className="bg-white rounded-2xl p-6 border border-[#E4E5E8]">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="text-[16px] font-medium text-gray-900">
                            More Information
                          </h3>
                          {isOwnProfile && (
                            <button
                              onClick={() => {
                                setIsEditing(true);
                                setActiveModalTab("More Information");
                              }}
                              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <InfoItem
                            label="Website"
                            value={moreInfo.website}
                            isLink={true}
                          />
                          <InfoItem
                            label="Organization Size"
                            value={moreInfo.organizationSize}
                          />
                          <InfoItem label="Type" value={moreInfo.type} />
                          <InfoItem label="Founded" value={moreInfo.founded} />
                          <InfoItem
                            label="Industry"
                            value={moreInfo.industry}
                          />
                          <InfoItem label="Socials" value={moreInfo.socials} />
                        </div>
                      </div>

                      {/* Map with realistic location */}
                      <div className="bg-white rounded-2xl p-0 mt-6 overflow-hidden border border-[#E4E5E8]">
                        <div className="h-48 bg-gray-200 relative">
                          <img
                            src="https://maps.googleapis.com/maps/api/staticmap?center=17.4065,78.4772&zoom=13&size=400x200&maptype=roadmap&markers=color:blue%7Clabel:A%7C17.4065,78.4772&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dg0A1c0Xjr0b2Y"
                            alt="Apollo Hospitals Location"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1524661135-423995f22d0b?w=400&h=200&fit=crop&crop=center";
                            }}
                          />
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            <div className="bg-blue-500 w-6 h-6 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs text-gray-600">
                            Hyderabad, India
                          </div>
                        </div>
                      </div>

                      {/* Address Section */}
                      <AddressSection
                        addresses={addresses}
                        onEdit={() => {
                          setIsEditing(true);
                          setActiveModalTab("Addresses");
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-full max-w-5xl h-[85vh] overflow-hidden relative mt-8">
            {/* Close button in top-right corner */}
            <button
              onClick={() => setIsEditing(false)}
              className="absolute top-4 right-4 z-20 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex h-full">
              {/* Sidebar Menu */}
              <div className="w-80 bg-gray-50 border-r border-gray-200 flex-shrink-0">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-medium text-gray-900">
                    Edit Profile
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Update your organization information
                  </p>
                </div>
                <nav className="p-4">
                  <ul className="space-y-1">
                    {ModalTabs.map((item, index) => (
                      <li key={index}>
                        <button
                          className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3
                            ${
                              activeModalTab === item
                                ? "bg-blue-500 text-white shadow-sm"
                                : "text-gray-700 hover:bg-white hover:shadow-sm"
                            }`}
                          onClick={() => setActiveModalTab(item)}
                        >
                          {item === "About" && <BookOpen className="w-4 h-4" />}
                          {item === "Jobs" && <Briefcase className="w-4 h-4" />}
                          {item === "Specialities" && (
                            <Award className="w-4 h-4" />
                          )}
                          {item === "More Information" && (
                            <Settings className="w-4 h-4" />
                          )}
                          {item === "Addresses" && (
                            <MapPin className="w-4 h-4" />
                          )}
                          <span>{item}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* Edit Content */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                  {activeModalTab === "About" && (
                    <div className="p-8">
                      <div className="max-w-2xl">
                        <h4 className="text-lg font-medium text-gray-900 mb-6">
                          About Organization
                        </h4>
                        <div className="space-y-6">
                          <div>
                            <label
                              htmlFor="description"
                              className="block text-sm font-medium text-gray-700 mb-2"
                            >
                              Organization Description
                            </label>
                            <textarea
                              id="description"
                              name="description"
                              rows={8}
                              value={editData.description || ""}
                              onChange={handleChange}
                              placeholder="Tell us about your organization..."
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                            />
                          </div>
                          <div className="flex justify-end space-x-3 pt-4">
                            <button
                              onClick={() => setIsEditing(false)}
                              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSave}
                              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeModalTab === "Specialities" && (
                    <div className="p-8">
                      <div className="max-w-2xl">
                        <h4 className="text-lg font-medium text-gray-900 mb-6">
                          Organization Specialities
                        </h4>
                        <SkillsSpecialization
                          initialSkills={userSkills}
                          onSaveSkills={(updatedSkills) => {
                            setUserSkills(updatedSkills);
                            setIsEditing(false);
                          }}
                          onCancel={() => setIsEditing(false)}
                        />
                      </div>
                    </div>
                  )}
                  {activeModalTab === "Jobs" && (
                    <div className="p-8">
                      <div className="max-w-4xl">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-lg font-medium text-gray-900">
                            Job Openings
                          </h4>
                          {/* No add job button in org profile modal */}
                        </div>
                        <div className="space-y-4">
                          {experiences.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                              <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p>No job openings posted yet</p>
                            </div>
                          ) : (
                            experiences.map((job) => (
                              <div
                                key={job._id}
                                className="border p-4 rounded-lg"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <h3 className="font-semibold text-lg text-gray-800">
                                      {job.jobTitle}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-1">
                                      {job.location}
                                    </p>
                                    <div className="text-gray-500 text-xs mb-2">
                                      {job.employmentType} | {job.jobCategory}
                                    </div>
                                    <div
                                      className="text-gray-700 text-sm"
                                      dangerouslySetInnerHTML={{
                                        __html:
                                          job.jobDescription ||
                                          job.description ||
                                          "",
                                      }}
                                    />
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-2 text-xs text-gray-500">
                                  <span>Openings: {job.openings}</span>
                                  {job.salaryRangeFrom && job.salaryRangeTo && (
                                    <span>
                                      Salary: {job.salaryRangeFrom} -{" "}
                                      {job.salaryRangeTo}
                                    </span>
                                  )}
                                  {job.endDate && (
                                    <span>End Date: {job.endDate}</span>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  {activeModalTab === "Add Job" && (
                    <div className="p-8">
                      <div className="max-w-2xl">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="text-lg font-medium text-gray-900">
                            {editingExperience
                              ? "Edit Job Opening"
                              : "Add Job Opening"}
                          </h4>
                          <button
                            onClick={() => setActiveModalTab("Jobs")}
                            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <WorkExperienceForm
                          experience={editingExperience || {}}
                          onSave={handleSaveExperience}
                          onCancel={() => setActiveModalTab("Jobs")}
                        />
                      </div>
                    </div>
                  )}
                  {activeModalTab === "More Information" && (
                    <div className="p-8">
                      <div className="max-w-2xl">
                        <h4 className="text-lg font-medium text-gray-900 mb-6">
                          Organization Information
                        </h4>
                        <MoreInformationForm
                          infoData={moreInfo}
                          onSave={handleSaveMoreInfo}
                          onCancel={() => setIsEditing(false)}
                        />
                      </div>
                    </div>
                  )}
                  {activeModalTab === "Addresses" && (
                    <div className="p-8">
                      <div className="max-w-2xl">
                        <h4 className="text-lg font-medium text-gray-900 mb-6">
                          Organization Addresses
                        </h4>
                        <AddressForm
                          addresses={addresses}
                          onSave={handleSaveAddresses}
                          onCancel={() => setIsEditing(false)}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Completion Nudge */}
      {showProfileNudge && (
        <ProfileCompletionNudge onClose={() => setShowProfileNudge(false)} />
      )}
    </div>
  );
};

export default OrganizationProfile;
