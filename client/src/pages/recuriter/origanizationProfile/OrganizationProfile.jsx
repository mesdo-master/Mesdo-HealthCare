import { useEffect, useState } from "react";

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
} from "lucide-react";
import ProfileSection from "./component/ProfileSection";
import SkillsSpecialization from "../../recuriter/origanizationProfile/component/SkillsSpecialization";
import ProfileCompletionNudge from "../../../components/ProfileCompletionNudge";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../../../lib/axio";
import { useParams } from "react-router-dom";
import WorkExperienceForm from "../../user/profilePage/components/WorkExperienceForm";
import WorkExperienceSection from "../../user/profilePage/components/WorkExperienceSection";
// import NavItem from "../../../components/profile/NavItem";
// import SkillsSpecialization from "../../../components/profile/SkillsSpecialization";
// import ProfileSection from "../../../components/profile/ProfileSection";
// import WorkExperienceSection from "../../../Components/profile/WorkExperienceSection";
// import WorkExperienceForm from "../../../components/profile/WorkExperienceForm";

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
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
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
              <div className="bg-white rounded-md shadow-sm p-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-lg font-medium text-gray-800">About</h2>
                  {isOwnProfile && (
                    <button
                      onClick={() => {
                        setActiveModalTab("About");
                        setIsEditing(true);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Pencil className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mt-3">
                  {aboutData || "No description provided."}
                </p>
              </div>

              {/* Specialities Section */}
              <div className="bg-white rounded-md shadow-sm p-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-800">
                    Specialities
                  </h2>
                  {isOwnProfile && (
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                      onClick={() => {
                        setActiveModalTab("Specialities");
                        setIsEditing(true);
                      }}
                    >
                      <Pencil className="w-5 h-5 text-gray-700" />
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
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
              <div className="bg-white rounded-md shadow-sm p-6 mt-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium text-gray-900">Jobs</h2>
                  {isOwnProfile && (
                    <button
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                      onClick={() => {
                        setActiveModalTab("Jobs");
                        setIsEditing(true);
                      }}
                    >
                      <Pencil className="w-5 h-5 text-gray-700" />
                    </button>
                  )}
                </div>
                {
                  <WorkExperienceSection
                    experiences={experiences}
                    onEdit={(exp) => {
                      setEditingExperience(exp);
                      setActiveModalTab("Add Job");
                    }}
                    onAddNew={() => {
                      setEditingExperience(null);
                      setActiveModalTab("Add Job");
                    }}
                  />
                }
              </div>

              {/* People at Apollo Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h3 className="text-[16px] font-medium text-gray-900 mb-4">
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
                      <button className="text-[12px] text-blue-600 hover:text-blue-700 font-medium px-3 py-1 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                        + Follow
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === "Jobs" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-medium text-gray-900 mb-6">
                Available Jobs
              </h2>
              <p className="text-gray-500 text-center py-8">
                No jobs posted yet.
              </p>
            </div>
          )}
          {activeTab === "People" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
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
            <div className="bg-white rounded-lg shadow-sm p-6">
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
                          <button
                            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            onClick={() => {
                              setEditingExperience(null);
                              setActiveModalTab("Add Job");
                            }}
                          >
                            <Plus size={16} />
                            Add New Job
                          </button>
                        </div>
                        <div className="space-y-4">
                          {experiences.map((exp) => (
                            <div
                              key={exp.id}
                              className="bg-gray-50 p-6 rounded-lg border border-gray-200"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                  <div className="bg-blue-100 p-2 rounded-lg">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 mb-1">
                                      {exp.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                      {exp.institution}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-1">
                                      {exp.type}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-2">
                                      {exp.startDate} -{" "}
                                      {exp.currentlyWorking
                                        ? "Present"
                                        : exp.endDate}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {exp.location}
                                    </p>
                                    <div
                                      className="text-sm text-gray-600 mb-3"
                                      dangerouslySetInnerHTML={{
                                        __html: exp.description,
                                      }}
                                    />
                                    <div className="flex gap-2">
                                      {exp.tags.map((tag, index) => (
                                        <span
                                          key={index}
                                          className="text-xs bg-white text-gray-600 px-2 py-1 rounded-full border"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditingExperience(exp);
                                      setActiveModalTab("Add Job");
                                    }}
                                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-white rounded-lg transition-colors"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteExperience(exp.id)
                                    }
                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-white rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {experiences.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                              <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p>No job openings posted yet</p>
                              <p className="text-sm">
                                Add your first job opening to get started
                              </p>
                            </div>
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

  // Profile completion nudge state
  const [showProfileNudge, setShowProfileNudge] = useState(true);

  const { businessProfile } = useSelector((state) => state.auth);
  const [orgData, setOrgData] = useState();
  const dispatch = useDispatch();
  const { orgname } = useParams();

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

  // Determine userData after fetching
  const isOwnProfile = businessProfile?._id === orgData?._id;
  const userData = isOwnProfile ? businessProfile : orgData;

  const SIDEBAR_WIDTH = "200px";

  const [editData, setEditData] = useState({ description: "" });
  const [userSkills, setUserSkills] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [editingExperience, setEditingExperience] = useState(null);

  const [moreInfo, setMoreInfo] = useState({
    website: "",
    organizationSize: "",
    type: "",
    founded: "",
    industry: "",
    socials: "",
  });
  const [addresses, setAddresses] = useState([]);

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
    <div className="bg-gray-100 min-h-screen w-screen ml-[-210px] mt-[40px] max-w-[1800px] mx-auto">
      <div
        className="flex pt-16"
        style={{ marginLeft: SIDEBAR_WIDTH, justifyContent: "center" }}
      >
        <div className="max-w-5xl w-full mx-auto">
          {/* Profile Section */}
          <ProfileSection
            userData={userData}
            isOwnProfile={isOwnProfile}
            openModal={openModal}
          />
          {/* Tabs and Content */}
          <div className="flex gap-4">
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
                experiences={experiences}
                setExperiences={setExperiences}
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
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-[16px] font-medium text-gray-900">
                    More Information
                  </h2>
                  {isOwnProfile && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setActiveModalTab("More Information");
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Pencil className="w-4 h-4" />
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
                  <InfoItem label="Industry" value={moreInfo.industry} />
                  <InfoItem label="Socials" value={moreInfo.socials} />
                </div>
              </div>

              {/* Map with realistic location */}
              <div className="bg-white rounded-lg shadow-sm p-0 mt-6 overflow-hidden">
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
                          <button
                            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            onClick={() => {
                              setEditingExperience(null);
                              setActiveModalTab("Add Job");
                            }}
                          >
                            <Plus size={16} />
                            Add New Job
                          </button>
                        </div>
                        <div className="space-y-4">
                          {experiences.map((exp) => (
                            <div
                              key={exp.id}
                              className="bg-gray-50 p-6 rounded-lg border border-gray-200"
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                  <div className="bg-blue-100 p-2 rounded-lg">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="font-medium text-gray-900 mb-1">
                                      {exp.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-1">
                                      {exp.institution}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-1">
                                      {exp.type}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-2">
                                      {exp.startDate} -{" "}
                                      {exp.currentlyWorking
                                        ? "Present"
                                        : exp.endDate}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-2">
                                      {exp.location}
                                    </p>
                                    <div
                                      className="text-sm text-gray-600 mb-3"
                                      dangerouslySetInnerHTML={{
                                        __html: exp.description,
                                      }}
                                    />
                                    <div className="flex gap-2">
                                      {exp.tags.map((tag, index) => (
                                        <span
                                          key={index}
                                          className="text-xs bg-white text-gray-600 px-2 py-1 rounded-full border"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => {
                                      setEditingExperience(exp);
                                      setActiveModalTab("Add Job");
                                    }}
                                    className="text-gray-500 hover:text-gray-700 p-2 hover:bg-white rounded-lg transition-colors"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteExperience(exp.id)
                                    }
                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-white rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                          {experiences.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                              <Briefcase className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <p>No job openings posted yet</p>
                              <p className="text-sm">
                                Add your first job opening to get started
                              </p>
                            </div>
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
