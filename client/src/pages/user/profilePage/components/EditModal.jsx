import { useState, useEffect } from "react";
import {
  X,
  ChevronDown,
  Save,
  Plus,
  Trash2,
  Pencil,
  Briefcase,
  AwardIcon,
  ArrowLeft,
} from "lucide-react";
import axiosInstance from "../../../../lib/axio";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentUser } from "../../../../store/features/authSlice";
import WorkExperienceForm from "./WorkExperienceForm";
import QualificationForm from "./QualificationForm";
import QualificationsPreview from "./QualificationsPreview";
import CertificateList from "./CertificateList";
import SkillsSpecialization from "./SkillsSpecialization";
import AchievementPreview from "./AchievementPreview";
import AwardForm from "./AwardForm";
import ExtraInformation from "./ExtraInformation";

const EditModal = ({
  isEditing,
  setIsEditing,
  activeModalTab,
  setActiveModalTab,
  userData,
  onDataUpdate,
  // Props from ProfilePage for state management
  editingQualification,
  setEditingQualification,
  activeQualificationTab,
  setActiveQualificationTab,
  editingExperienceId,
  setEditingExperienceId,
  editingExperienceData,
  setEditingExperienceData,
  editingAchievement,
  setEditingAchievement,
  activeAchievementTab,
  setActiveAchievementTab,
}) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);

  const [aboutData, setAboutData] = useState("");
  const [basicInformation, setBasicInformation] = useState({
    name: "",
    state: "",
    city: "",
    phoneNo: "",
    pronouns: "",
    headline: "",
  });
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedState, setSelectedState] = useState("");

  // Additional state for the other components
  const [userSkills, setUserSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [publications, setPublications] = useState([]);

  // Work Experience state
  const [experiences, setExperiences] = useState([]);

  // Qualification state
  const [qualifications, setQualifications] = useState([]);

  const ModalTabs = [
    "Basic Information",
    "About",
    "Work Experience",
    "Qualification",
    "Certifications",
    "Skills",
    "Awards & Achievements",
    "Extra Information",
  ];

  useEffect(() => {
    if (userData) {
      setAboutData(userData.about || "");
      setBasicInformation({
        name: userData?.name || "",
        state: userData?.location?.state || "",
        city: userData?.location?.city || "",
        phoneNo: userData?.phoneNo || "",
        pronouns: userData?.pronouns || "",
        headline: userData?.headline || "",
      });
      setUserSkills(userData?.skills || []);
      setCertificates(userData?.certifications || []);
      setAchievements(userData?.achievements || []);
      setLanguages(userData?.languages || []);
      setPublications(userData?.publications || []);
    }
  }, [userData]);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await axiosInstance.get(`/users/fetchExperiences`);
        const fetchedExperiences = response.data.experiences.map((exp) => ({
          ...exp,
          id: exp._id,
        }));
        setExperiences(fetchedExperiences);
      } catch (error) {
        console.log(error);
      }
    };
    fetchExperiences();
  }, []);

  useEffect(() => {
    fetchQualifications();
  }, []);

  const fetchQualifications = async () => {
    try {
      const response = await axiosInstance.get("/users/fetchQualifications");
      if (response.data.success) {
        const { educations } = response.data;
        const fetchedQualifications = educations.map((edu) => ({
          ...edu,
          id: edu._id,
        }));
        setQualifications(fetchedQualifications);
      } else {
        throw new Error(
          response.data.message || "Failed to fetch qualifications."
        );
      }
    } catch (error) {
      console.error("Error fetching qualifications:", error);
    }
  };

  useEffect(() => {
    // Fetch states on component mount
    axiosInstance
      .get("onboarding/states")
      .then((response) => {
        const allStates = response.data;
        setStates(allStates);

        // Try to match currentUser.location.state with name in states data
        const matchedState = allStates.find(
          (state) =>
            state.name.toLowerCase() ===
            userData?.location?.state?.toLowerCase()
        );

        if (matchedState) {
          setSelectedState(matchedState.isoCode);
        }
      })
      .catch((error) => console.error("Error fetching states:", error));
  }, [userData]);

  useEffect(() => {
    const fetchCities = async () => {
      if (!selectedState) {
        setCities([]);
        return;
      }

      try {
        const response = await axiosInstance.get(
          `onboarding/${selectedState}/cities`
        );
        setCities(response.data);
      } catch (error) {
        console.error("Error fetching cities:", error);
      }
    };

    fetchCities();
  }, [selectedState]);

  const handleSaveAbout = async () => {
    try {
      const response = await axiosInstance.put(`/users/updateProfile`, {
        about: aboutData,
      });

      // Update Redux store with the new about information
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          about: aboutData,
        };
        dispatch(setCurrentUser(updatedUser));
      }

      setIsEditing(false);
      onDataUpdate();
    } catch (error) {
      console.error("Error saving about data:", error);
    }
  };

  const changeBasicInformation = (e) => {
    setBasicInformation({
      ...basicInformation,
      [e.target.name]: e.target.value,
    });
  };

  const submitBasicInformation = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.put(
        `/users/updateProfile`,
        basicInformation
      );

      // Update Redux store with the new basic information
      if (currentUser) {
        const updatedUser = {
          ...currentUser,
          name: basicInformation.name,
          location: {
            ...currentUser.location,
            state: basicInformation.state,
            city: basicInformation.city,
          },
          phoneNo: basicInformation.phoneNo,
          pronouns: basicInformation.pronouns,
          headline: basicInformation.headline,
        };
        dispatch(setCurrentUser(updatedUser));
      }

      setIsEditing(false);
      onDataUpdate();
    } catch (error) {
      console.log(error);
    }
  };

  // Work Experience handlers
  const handleEditExperience = (exp) => {
    setEditingExperienceId(exp.id);
    setEditingExperienceData({ ...exp });
    setActiveModalTab("Add Work Experience");
  };

  const handleSaveExperience = async (newExperience) => {
    try {
      if (
        !newExperience.title ||
        !newExperience.institution ||
        !newExperience.startDate
      ) {
        throw new Error("Title, institution, and start date are required.");
      }
      if (
        newExperience.endDate &&
        new Date(newExperience.endDate) < new Date(newExperience.startDate)
      ) {
        throw new Error("End date must be after start date.");
      }
      let updatedExperienceArray;
      if (editingExperienceId) {
        updatedExperienceArray = experiences.map((exp) =>
          exp.id === editingExperienceId
            ? { ...newExperience, id: editingExperienceId }
            : exp
        );
      } else {
        updatedExperienceArray = [
          ...experiences,
          { ...newExperience, id: Date.now() },
        ];
      }
      const payload = {
        experience: updatedExperienceArray.map(({ id, ...rest }) => rest),
      };
      const response = await axiosInstance.put(`/users/updateProfile`, payload);
      if (response.data.success) {
        const updatedUser = response.data.updatedUser;
        const syncedExperiences = updatedUser.experience.map((exp) => ({
          ...exp,
          id: exp._id,
        }));
        setExperiences(syncedExperiences);
        setActiveModalTab("Work Experience");
        setEditingExperienceId(null);
        setEditingExperienceData(null);
        onDataUpdate();
      } else {
        throw new Error(response.data.message || "Failed to save experience.");
      }
    } catch (error) {
      alert(error.message || "An error occurred while saving the experience.");
    }
  };

  const handleDeleteExperience = async (id) => {
    const originalExperiences = [...experiences];
    try {
      const filteredExperiences = experiences.filter((exp) => exp.id !== id);
      setExperiences(filteredExperiences);
      const payload = {
        experience: filteredExperiences.map(({ id, ...rest }) => rest),
      };
      const response = await axiosInstance.put("/users/updateProfile", payload);
      if (!response.data.success) {
        setExperiences(originalExperiences);
        throw new Error(
          response.data.message || "Failed to delete experience."
        );
      }
      const syncedExperiences = response.data.updatedUser.experience.map(
        (exp) => ({ ...exp, id: exp._id })
      );
      setExperiences(syncedExperiences);
      onDataUpdate();
    } catch (error) {
      setExperiences(originalExperiences);
      alert(
        error.message || "An error occurred while deleting the experience."
      );
    }
  };

  // Qualification handlers
  const handleSaveQualification = async (savedQualification) => {
    try {
      if (
        !savedQualification.qualification ||
        !savedQualification.university ||
        !savedQualification.passingYear
      ) {
        throw new Error(
          "Qualification, university, and passing year are required."
        );
      }

      const formattedQualification = {
        qualification: savedQualification.qualification,
        course: savedQualification.course,
        specialization: savedQualification.specialization,
        passingYear: savedQualification.passingYear,
        university: savedQualification.university,
        skills: savedQualification.skills,
        description: savedQualification.description,
      };

      let updatedQualifications;
      if (editingQualification) {
        updatedQualifications = qualifications.map((qual) =>
          qual.id === savedQualification.id
            ? { ...formattedQualification, id: qual.id }
            : qual
        );
      } else {
        updatedQualifications = [
          ...qualifications,
          { ...formattedQualification, id: Date.now() },
        ];
      }

      const payload = {
        education: updatedQualifications.map(({ id, ...rest }) => rest),
      };

      const response = await axiosInstance.put("/users/updateProfile", payload);

      if (response.data.success) {
        const updatedUser = response.data.updatedUser;
        const syncedQualifications = updatedUser.education.map((edu) => ({
          ...edu,
          id: edu._id,
        }));

        setQualifications(syncedQualifications);
        setEditingQualification(null);
        setActiveQualificationTab("Preview");
        onDataUpdate();
      } else {
        throw new Error(
          response.data.message || "Failed to save qualification."
        );
      }
    } catch (error) {
      console.error("Error saving qualification:", error);
      alert(
        error.message || "An error occurred while saving the qualification."
      );
    }
  };

  const handleEditQualification = (qualification) => {
    setEditingQualification(qualification);
    setActiveQualificationTab("Edit");
  };

  const handleDeleteQualification = (id) => {
    const updatedQualifications = qualifications.filter(
      (qualification) => qualification.id !== id
    );
    const payload = {
      education: updatedQualifications.map(({ id, ...rest }) => rest),
    };

    axiosInstance
      .put("/users/updateProfile", payload)
      .then((response) => {
        if (response.data.success) {
          setQualifications(updatedQualifications);
          onDataUpdate();
        } else {
          throw new Error(
            response.data.message || "Failed to delete qualification."
          );
        }
      })
      .catch((error) => {
        console.error("Error deleting qualification:", error);
        alert(
          error.message || "An error occurred while deleting the qualification."
        );
      });
  };

  // Achievement handlers
  const handleSaveAchievement = async (newAchievement) => {
    if (editingAchievement) {
      setAchievements(
        achievements.map((achievement) =>
          achievement.id === editingAchievement.id
            ? { ...newAchievement, id: editingAchievement.id }
            : achievement
        )
      );
    } else {
      setAchievements([...achievements, { ...newAchievement, id: Date.now() }]);
    }
    const response = await axiosInstance.put("/users/updateProfile", {
      achievements: [...achievements, newAchievement],
    });
    setEditingAchievement(null);
    setActiveAchievementTab("Preview");
    onDataUpdate();
  };

  const handleEditAchievement = (achievement) => {
    setEditingAchievement(achievement);
    setActiveAchievementTab("Edit");
  };

  const handleDeleteAchievement = (id) => {
    const updatedAchievements = achievements.filter(
      (achievement) => achievement.id !== id
    );
    setAchievements(updatedAchievements);
  };

  const handleAward = () => {
    setEditingAchievement(null);
    setActiveAchievementTab("Preview");
  };

  // Skills handlers
  const handleSaveSkills = async (skills) => {
    try {
      await axiosInstance.put(`/users/updateProfile`, { skills });
      setUserSkills(skills);
      setIsEditing(false);
      onDataUpdate();
    } catch (error) {
      console.error("Error saving skills:", error);
    }
  };

  // Certificates handlers
  const handleSaveCertificates = async (certificates) => {
    try {
      await axiosInstance.put(`/users/updateProfile`, {
        certifications: certificates,
      });
      setCertificates(certificates);
      onDataUpdate();
    } catch (error) {
      console.error("Error saving certificates:", error);
    }
  };

  // Extra Information handlers
  const handleSaveExtraInfo = async (data) => {
    try {
      const response = await axiosInstance.put(`/users/updateProfile`, {
        languages: data.languages,
        publications: data.publications,
      });
      setLanguages(data.languages);
      setPublications(data.publications);
      setIsEditing(false);
      onDataUpdate();
    } catch (error) {
      console.error("Error saving extra information:", error);
    }
  };

  if (!isEditing) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4 font-inter mt-20">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={() => setIsEditing(false)}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-all duration-200"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar Menu */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 flex-shrink-0 flex flex-col">
            <div className="p-6 flex-shrink-0">
              <h3 className="text-xl font-medium text-gray-900 mb-6">
                Overview
              </h3>
            </div>
            <nav className="flex-1 px-6 pb-6 overflow-y-auto">
              <div className="space-y-2">
                {ModalTabs.map((item, index) => (
                  <button
                    key={index}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeModalTab === item
                        ? "bg-[#1890FF] text-white shadow-lg"
                        : "text-gray-700 hover:bg-white hover:shadow-md border border-transparent hover:border-gray-200"
                    }`}
                    onClick={() => setActiveModalTab(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            <div className="flex-1 overflow-y-auto">
              {activeModalTab === "Basic Information" && (
                <div className="p-8">
                  <div className="max-w-4xl">
                    <div className="mb-8">
                      <h2 className="text-2xl font-medium text-gray-900 mb-2">
                        Basic Information
                      </h2>
                      <p className="text-gray-600">
                        Update your personal details and contact information
                      </p>
                    </div>

                    <form
                      onSubmit={submitBasicInformation}
                      className="space-y-8"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="name"
                            value={basicInformation.name.split(" ")[0] || ""}
                            onChange={(e) => {
                              const lastName = basicInformation.name
                                .split(" ")
                                .slice(1)
                                .join(" ");
                              setBasicInformation({
                                ...basicInformation,
                                name: lastName
                                  ? `${e.target.value} ${lastName}`
                                  : e.target.value,
                              });
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-[#1890FF] transition-all duration-200"
                            placeholder="Enter First Name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            value={
                              basicInformation.name
                                .split(" ")
                                .slice(1)
                                .join(" ") || ""
                            }
                            onChange={(e) => {
                              const firstName =
                                basicInformation.name.split(" ")[0] || "";
                              setBasicInformation({
                                ...basicInformation,
                                name: `${firstName} ${e.target.value}`.trim(),
                              });
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-[#1890FF] transition-all duration-200"
                            placeholder="Enter Last Name"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">
                            Country
                          </label>
                          <div className="relative">
                            <select
                              name="state"
                              value={selectedState}
                              onChange={(e) => {
                                const isoCode = e.target.value;
                                const stateName =
                                  states.find(
                                    (state) => state.isoCode === isoCode
                                  )?.name || "";
                                setSelectedState(isoCode);
                                setBasicInformation({
                                  ...basicInformation,
                                  state: stateName,
                                });
                              }}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-[#1890FF] appearance-none transition-all duration-200"
                            >
                              <option value="">Select Country</option>
                              {states.map((state) => (
                                <option
                                  key={state.isoCode}
                                  value={state.isoCode}
                                >
                                  {state.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">
                            City
                          </label>
                          <div className="relative">
                            <select
                              name="city"
                              value={basicInformation.city}
                              onChange={changeBasicInformation}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-[#1890FF] appearance-none transition-all duration-200"
                            >
                              <option value="">Select City</option>
                              {cities?.map((city) => (
                                <option key={city.name} value={city.name}>
                                  {city.name}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            name="phoneNo"
                            value={basicInformation?.phoneNo}
                            onChange={changeBasicInformation}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-[#1890FF] transition-all duration-200"
                            placeholder="Enter phone number"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">
                            Email Address
                          </label>
                          <input
                            type="email"
                            name="email"
                            value={userData?.email}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                            placeholder="Email address"
                            disabled
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">
                            Website
                          </label>
                          <input
                            type="url"
                            name="website"
                            value={basicInformation?.website || ""}
                            onChange={changeBasicInformation}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-[#1890FF] transition-all duration-200"
                            placeholder="Enter website URL"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-900">
                            Pronouns
                          </label>
                          <div className="relative">
                            <select
                              id="pronouns"
                              name="pronouns"
                              value={basicInformation.pronouns}
                              onChange={changeBasicInformation}
                              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-[#1890FF] appearance-none transition-all duration-200"
                            >
                              <option value="">Select pronouns</option>
                              <option value="he/him">He/Him</option>
                              <option value="she/her">She/Her</option>
                              <option value="they/them">They/Them</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">
                          Professional Headline
                        </label>
                        <input
                          type="text"
                          name="headline"
                          value={basicInformation.headline}
                          onChange={changeBasicInformation}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#1890FF] focus:border-[#1890FF] transition-all duration-200"
                          placeholder="Enter your professional headline"
                        />
                      </div>

                      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => setIsEditing(false)}
                          type="button"
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-[#1890FF] text-white rounded-xl hover:bg-blue-700 font-medium transition-all duration-200 shadow-lg"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeModalTab === "About" && (
                <div className="p-8">
                  <div className="max-w-4xl">
                    <div className="mb-8">
                      <h2 className="text-2xl font-medium text-gray-900 mb-2">
                        About
                      </h2>
                      <p className="text-gray-600">
                        Write a compelling summary about yourself and your
                        professional background
                      </p>
                    </div>

                    <form onSubmit={handleSaveAbout} className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900">
                          Description
                        </label>
                        <div className="border border-gray-300 rounded-xl overflow-hidden">
                          {/* Rich Text Editor Toolbar */}
                          <div className="bg-gray-50 border-b border-gray-300 p-3 flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              className="p-2 hover:bg-gray-200 rounded text-gray-600 font-bold"
                            >
                              B
                            </button>
                            <button
                              type="button"
                              className="p-2 hover:bg-gray-200 rounded text-gray-600 italic"
                            >
                              I
                            </button>
                            <button
                              type="button"
                              className="p-2 hover:bg-gray-200 rounded text-gray-600 underline"
                            >
                              U
                            </button>
                            <button
                              type="button"
                              className="p-2 hover:bg-gray-200 rounded text-gray-600"
                            >
                              S
                            </button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button
                              type="button"
                              className="p-2 hover:bg-gray-200 rounded text-gray-600"
                            >
                              🔗
                            </button>
                            <button
                              type="button"
                              className="p-2 hover:bg-gray-200 rounded text-gray-600"
                            >
                              ""
                            </button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button
                              type="button"
                              className="p-2 hover:bg-gray-200 rounded text-gray-600"
                            >
                              •
                            </button>
                            <button
                              type="button"
                              className="p-2 hover:bg-gray-200 rounded text-gray-600"
                            >
                              1.
                            </button>
                            <button
                              type="button"
                              className="p-2 hover:bg-gray-200 rounded text-gray-600"
                            >
                              ⬅
                            </button>
                            <button
                              type="button"
                              className="p-2 hover:bg-gray-200 rounded text-gray-600"
                            >
                              ➡
                            </button>
                            <div className="w-px h-6 bg-gray-300 mx-1"></div>
                            <button
                              type="button"
                              className="p-2 hover:bg-gray-200 rounded text-gray-600"
                            >
                              A
                            </button>
                            <button
                              type="button"
                              className="p-2 hover:bg-gray-200 rounded text-gray-600"
                            >
                              ↶
                            </button>
                            <button
                              type="button"
                              className="p-2 hover:bg-gray-200 rounded text-gray-600"
                            >
                              ↷
                            </button>
                          </div>
                          <textarea
                            value={aboutData}
                            onChange={(e) => setAboutData(e.target.value)}
                            rows={8}
                            className="w-full px-4 py-3 border-0 focus:ring-0 focus:outline-none resize-none"
                            placeholder="Lorem ipsum dolor sit amet consectetur. Duis rutrum eu vitae sed consequat at elit sit. Aenean tellus hac eu accumsan non. Sagittis etiam odio viverra in sit. Lobortis ac et platea sed. Leo interdum cum augue tellus vitae. Lacus neque sodales duis tortor pharetra et. Nibh molestie in sed id faucibus amet. Pellentesque aenean consectetur proin faucibus purus blandit. Rutrum nullam lacinia bibendum sed varius. Mauris quis sit ultrices diam. Commodo etiam rhoncus cras imperdiet consectetur ac. In scelerisque amet eget cras et."
                          />
                        </div>
                      </div>

                      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => setIsEditing(false)}
                          type="button"
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-[#1890FF] text-white rounded-xl hover:bg-blue-700 font-medium transition-all duration-200 shadow-lg"
                        >
                          Save Changes
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {activeModalTab === "Work Experience" && (
                <div className="p-8">
                  <div className="max-w-4xl">
                    <div className="flex justify-between items-center mb-8">
                      <div>
                        <h2 className="text-2xl font-medium text-gray-900 mb-2">
                          Work Experience
                        </h2>
                        <p className="text-gray-600">
                          Showcase your professional journey and achievements
                        </p>
                      </div>
                      <button
                        className="flex items-center gap-2 bg-[#1890FF] hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 shadow-lg"
                        onClick={() => {
                          setEditingExperienceId(null);
                          setEditingExperienceData(null);
                          setActiveModalTab("Add Work Experience");
                        }}
                      >
                        <Plus size={16} />
                        Add Experience
                      </button>
                    </div>

                    <div className="space-y-6">
                      {experiences.map((exp) => (
                        <div
                          key={exp.id}
                          className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4 flex-1">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-14 h-14 flex justify-center items-center rounded-xl flex-shrink-0">
                                <Briefcase className="text-[#1890FF] w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3 mb-3">
                                  <h3 className="font-medium text-lg text-gray-900">
                                    {exp.title}
                                  </h3>
                                  {exp.type && (
                                    <span className="text-xs text-[#1890FF] bg-blue-50 px-3 py-1 rounded-full font-medium">
                                      {exp.type}
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap gap-2 text-sm text-gray-600 mb-3">
                                  {exp.institution && (
                                    <span className="font-medium text-gray-800">
                                      {exp.institution}
                                    </span>
                                  )}
                                  {exp.institution && exp.location && (
                                    <span className="text-gray-400">•</span>
                                  )}
                                  {exp.location && <span>{exp.location}</span>}
                                  {(exp.startDate || exp.endDate) && (
                                    <>
                                      <span className="text-gray-400">•</span>
                                      <span>
                                        {exp.startDate ? exp.startDate : ""}
                                        {exp.startDate && exp.endDate
                                          ? " - "
                                          : ""}
                                        {exp.currentlyWorking
                                          ? "Present"
                                          : exp.endDate}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {exp.description && (
                                  <div className="text-sm text-gray-700 leading-relaxed mb-4">
                                    {exp.description
                                      .split("\n")
                                      .map((line, i) => {
                                        const cleanLine = line
                                          .replace(/<[^>]*>/g, "")
                                          .trim();
                                        return cleanLine ? (
                                          <p key={i} className="mb-1">
                                            {cleanLine}
                                          </p>
                                        ) : null;
                                      })}
                                  </div>
                                )}
                                {exp.tags && exp.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {exp.tags.map((tag, i) => (
                                      <span
                                        key={i}
                                        className="bg-gray-100 text-gray-700 rounded-lg px-3 py-1 text-xs font-medium"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <button
                                onClick={() => handleEditExperience(exp)}
                                className="text-gray-400 hover:text-[#1890FF] p-2 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                aria-label="Edit experience"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteExperience(exp.id)}
                                className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                                aria-label="Delete experience"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {experiences.length === 0 && (
                        <div className="text-center py-16 bg-gray-50 rounded-xl">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-16 h-16 flex justify-center items-center rounded-xl mx-auto mb-4">
                            <Briefcase className="w-8 h-8 text-[#1890FF]" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No work experience added yet
                          </h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Add your professional experience to showcase your
                            career journey and achievements to potential
                            employers
                          </p>
                          <button
                            onClick={() => {
                              setEditingExperienceId(null);
                              setEditingExperienceData(null);
                              setActiveModalTab("Add Work Experience");
                            }}
                            className="bg-[#1890FF] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg"
                          >
                            Add Your First Experience
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeModalTab === "Add Work Experience" && (
                <div className="p-8">
                  <div className="max-w-4xl">
                    <div className="flex items-center gap-4 mb-8">
                      <button
                        onClick={() => {
                          setActiveModalTab("Work Experience");
                          setEditingExperienceId(null);
                          setEditingExperienceData(null);
                        }}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
                      >
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <div>
                        <h2 className="text-2xl font-medium text-gray-900">
                          {editingExperienceId
                            ? "Edit Work Experience"
                            : "Add Work Experience"}
                        </h2>
                        <p className="text-gray-600">
                          {editingExperienceId
                            ? "Update your work experience details"
                            : "Share details about your professional role"}
                        </p>
                      </div>
                    </div>
                    <WorkExperienceForm
                      experience={editingExperienceData}
                      onSave={handleSaveExperience}
                      onCancel={() => {
                        setActiveModalTab("Work Experience");
                        setEditingExperienceId(null);
                        setEditingExperienceData(null);
                      }}
                    />
                  </div>
                </div>
              )}

              {activeModalTab === "Qualification" && (
                <div className="p-8">
                  <div className="max-w-4xl">
                    <div className="mb-8">
                      <h2 className="text-2xl font-medium text-gray-900 mb-2">
                        Education & Qualifications
                      </h2>
                      <p className="text-gray-600">
                        Add your educational background and academic
                        achievements
                      </p>
                    </div>
                    {activeQualificationTab === "Edit" ? (
                      <QualificationForm
                        qualification={editingQualification}
                        onSave={handleSaveQualification}
                        onCancel={() => setActiveQualificationTab("Preview")}
                      />
                    ) : (
                      <QualificationsPreview
                        qualifications={qualifications}
                        onEdit={handleEditQualification}
                        onDelete={handleDeleteQualification}
                      />
                    )}
                  </div>
                </div>
              )}

              {activeModalTab === "Certifications" && (
                <div className="p-8">
                  <div className="max-w-4xl">
                    <div className="mb-8">
                      <h2 className="text-2xl font-medium text-gray-900 mb-2">
                        Certifications & Licenses
                      </h2>
                      <p className="text-gray-600">
                        Showcase your professional certifications and licenses
                      </p>
                    </div>
                    <CertificateList
                      certificates={certificates}
                      onSave={handleSaveCertificates}
                      onCancel={() => setIsEditing(false)}
                    />
                  </div>
                </div>
              )}

              {activeModalTab === "Skills" && (
                <div className="p-8">
                  <div className="max-w-4xl">
                    <div className="mb-8">
                      <h2 className="text-2xl font-medium text-gray-900 mb-2">
                        Skills & Expertise
                      </h2>
                      <p className="text-gray-600">
                        Add your technical and professional skills
                      </p>
                    </div>
                    <SkillsSpecialization
                      initialSkills={userSkills}
                      onSaveSkills={handleSaveSkills}
                      onCancel={() => setIsEditing(false)}
                    />
                  </div>
                </div>
              )}

              {activeModalTab === "Awards & Achievements" && (
                <div className="p-8">
                  <div className="max-w-4xl">
                    <div className="mb-8">
                      <h2 className="text-2xl font-medium text-gray-900 mb-2">
                        Awards & Achievements
                      </h2>
                      <p className="text-gray-600">
                        Highlight your accomplishments and recognition
                      </p>
                    </div>
                    {activeAchievementTab === "Edit" ? (
                      <AwardForm
                        achievement={editingAchievement}
                        onSave={handleSaveAchievement}
                        onCancel={handleAward}
                      />
                    ) : (
                      <AchievementPreview
                        achievements={achievements}
                        onEdit={handleEditAchievement}
                        onDelete={handleDeleteAchievement}
                        onAdd={() => setActiveAchievementTab("Edit")}
                      />
                    )}
                  </div>
                </div>
              )}

              {activeModalTab === "Extra Information" && (
                <div className="p-8">
                  <div className="max-w-4xl">
                    <div className="mb-8">
                      <h2 className="text-2xl font-medium text-gray-900 mb-2">
                        Additional Information
                      </h2>
                      <p className="text-gray-600">
                        Add languages, publications, and other relevant
                        information
                      </p>
                    </div>
                    <ExtraInformation
                      initialLanguages={languages}
                      initialPublications={publications}
                      onSave={handleSaveExtraInfo}
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
  );
};

export default EditModal;
