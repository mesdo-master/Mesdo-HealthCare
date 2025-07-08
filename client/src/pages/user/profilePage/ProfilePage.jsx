import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../../lib/axio";
import ProfileHeader from "./components/ProfileHeader";
import OverviewTab from "./components/OverviewTab";
import EditModal from "./components/EditModal";

const ProfilePage = () => {
  const { userId } = useParams();
  const [userData, setUserData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("Basic Information");

  // Additional state for qualification and experience management
  const [editingQualification, setEditingQualification] = useState(null);
  const [activeQualificationTab, setActiveQualificationTab] =
    useState("Preview");
  const [editingExperienceId, setEditingExperienceId] = useState(null);
  const [editingExperienceData, setEditingExperienceData] = useState(null);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [activeAchievementTab, setActiveAchievementTab] = useState("Preview");

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        let response;

        if (userId) {
          // TODO: Fix this endpoint for getting user by ID
          setError("Getting user by ID not implemented yet");
          return;
        } else {
          response = await axiosInstance.get("/me");
          setIsOwnProfile(true);
        }

        if (response.data.success) {
          setUserData(response.data.user);
        } else {
          setError(response.data.message || "Failed to fetch user data");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const openModal = (tab) => {
    setActiveModalTab(tab);
    setIsEditing(true);
  };

  const handleDataUpdate = () => {
    // Add a small delay to ensure backend has saved the data
    setTimeout(() => {
      // Refetch user data after updates
      const fetchUserData = async () => {
        try {
          let response;

          if (userId) {
            // TODO: Fix this endpoint for getting user by ID
            return;
          } else {
            response = await axiosInstance.get("/me");
          }

          if (response.data.success) {
            // Create a new object reference to ensure React re-renders
            setUserData({ ...response.data.user });
          }
        } catch (err) {
          console.error("Error refetching user data:", err);
        }
      };

      fetchUserData();
    }, 500); // 500ms delay
  };

  const SIDEBAR_WIDTH = "200px";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen w-screen ml-[-210px] mt-[40px] max-w-[1800px] mx-auto">
      <div
        className="flex pt-16"
        style={{ marginLeft: SIDEBAR_WIDTH, justifyContent: "center" }}
      >
        <div className="max-w-5xl w-full mx-auto">
          {/* Profile Section */}
          <ProfileHeader
            userData={userData}
            isOwnProfile={isOwnProfile}
            openModal={openModal}
            onDataUpdate={handleDataUpdate}
          />

          {/* Tabs and Content */}
          <div className="flex gap-4">
            <div className="w-2/3">
              <OverviewTab
                userData={userData}
                isOwnProfile={isOwnProfile}
                openModal={openModal}
                setActiveModalTab={setActiveModalTab}
                setEditingExperienceId={setEditingExperienceId}
                setEditingExperienceData={setEditingExperienceData}
                setIsEditing={setIsEditing}
                setActiveQualificationTab={setActiveQualificationTab}
                setEditingQualification={setEditingQualification}
                setEditingAchievement={setEditingAchievement}
                setActiveAchievementTab={setActiveAchievementTab}
              />
            </div>

            {/* Right Sidebar */}
            <div className="w-1/3 py-6">
              {/* Profile Completion */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-[16px] font-medium text-gray-900 mb-4">
                  Profile Completion
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-lg p-2 mt-1">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[14px] font-medium text-gray-900">
                        {userData?.experience?.length > 0
                          ? `${userData.experience.length} years of Experience`
                          : "Add Experience"}
                      </h4>
                      <p className="text-[12px] text-gray-500 mt-1">
                        {userData?.experience?.length > 0
                          ? "Great! You've added your professional experience"
                          : "Add your work experience to showcase your expertise"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-lg p-2 mt-1">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[14px] font-medium text-gray-900">
                        {userData?.education?.length > 0
                          ? userData.education[0]?.qualification ||
                            "Education Added"
                          : "Add Education"}
                      </h4>
                      <p className="text-[12px] text-gray-500 mt-1">
                        {userData?.education?.length > 0
                          ? "Your educational background is complete"
                          : "Add your educational qualifications and degrees"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* About the User */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h3 className="text-[16px] font-medium text-gray-900 mb-4">
                  About {userData?.name?.split(" ")[0] || "the User"}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-lg p-2 mt-1">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[14px] font-medium text-gray-900">
                        {userData?.experience?.length > 0
                          ? `${userData.experience.length} years of Experience`
                          : "Building Experience"}
                      </h4>
                      <p className="text-[12px] text-gray-500 mt-1">
                        {userData?.experience?.length > 0 &&
                        userData.experience[0]?.description
                          ? userData.experience[0].description
                              .replace(/<[^>]*>/g, "")
                              .substring(0, 60) + "..."
                          : "Professional experience in various roles and industries"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="bg-blue-100 rounded-lg p-2 mt-1">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-[14px] font-medium text-gray-900">
                        {userData?.education?.length > 0
                          ? userData.education[0]?.qualification ||
                            "Qualified Professional"
                          : "Educational Background"}
                      </h4>
                      <p className="text-[12px] text-gray-500 mt-1">
                        {userData?.education?.length > 0 &&
                        userData.education[0]?.university
                          ? `From ${userData.education[0].university}`
                          : "Academic qualifications and certifications"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* People you might know */}
              <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
                <h3 className="text-[16px] font-medium text-gray-900 mb-4">
                  People you might know
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
                    {
                      name: "Chance Calzoni",
                      role: "Dental Surgeon",
                      company: "Apollo Hospital",
                      image:
                        "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
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
          </div>
        </div>
      </div>

      <EditModal
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        activeModalTab={activeModalTab}
        setActiveModalTab={setActiveModalTab}
        userData={userData}
        onDataUpdate={handleDataUpdate}
        editingQualification={editingQualification}
        setEditingQualification={setEditingQualification}
        activeQualificationTab={activeQualificationTab}
        setActiveQualificationTab={setActiveQualificationTab}
        editingExperienceId={editingExperienceId}
        setEditingExperienceId={setEditingExperienceId}
        editingExperienceData={editingExperienceData}
        setEditingExperienceData={setEditingExperienceData}
        editingAchievement={editingAchievement}
        setEditingAchievement={setEditingAchievement}
        activeAchievementTab={activeAchievementTab}
        setActiveAchievementTab={setActiveAchievementTab}
      />
    </div>
  );
};

export default ProfilePage;
