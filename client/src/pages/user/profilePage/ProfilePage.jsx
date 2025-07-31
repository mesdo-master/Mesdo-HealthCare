import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import axiosInstance from "../../../lib/axio";
import ProfileHeader from "./components/ProfileHeader";
import OverviewTab from "./components/OverviewTab";
import EditModal from "./components/EditModal";
import Header from "../../../components/Header";

const ProfilePage = () => {
  const params = useParams();
  const { userId } = params;
  const { currentUser } = useSelector((state) => state.auth);

  console.log("🎯 PROFILE PAGE INIT:", {
    allParams: params,
    extractedUserId: userId,
    currentUserId: currentUser?._id,
    windowLocation: window.location.pathname,
    routeNowUsesUserId: "Route should now extract userId correctly",
  });
  const [userData, setUserData] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState("Basic Information");

  // Profile completion nudge state
  const [showProfileNudge, setShowProfileNudge] = useState(true);

  // Suggested users state
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [suggestedUsersLoading, setSuggestedUsersLoading] = useState(true);

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
        setError(null);
        setUserData(null); // Clear previous user data
        console.log("🔄 FORCE REFRESH: userId changed to:", userId);
        console.log("🔄 FORCE REFRESH: userId type:", typeof userId);
        console.log("🔄 FORCE REFRESH: userId truthy?", !!userId);
        console.log("🔄 FORCE REFRESH: userId length:", userId?.length);
        let response;
        let isOwn = false; // Initialize ownership flag

        if (userId && userId.trim()) {
          // Check if this is own profile - compare both ID and username
          const isOwnById = String(userId) === String(currentUser?._id);
          const isOwnByUsername =
            String(userId) === String(currentUser?.username);
          isOwn = isOwnById || isOwnByUsername;
          setIsOwnProfile(isOwn);

          console.log("🔍=== PROFILE PAGE FETCH START ===");
          console.log("🔍 Fetching profile for userId:", userId);
          console.log("🔍 Current user ID:", currentUser?._id);
          console.log("🔍 Current user username:", currentUser?.username);
          console.log("🔍 Ownership checks:", {
            userIdString: String(userId),
            currentUserIdString: String(currentUser?._id),
            currentUserUsername: String(currentUser?.username),
            isOwnById,
            isOwnByUsername,
            finalIsOwn: isOwn,
          });
          console.log("🔍 Is own profile:", isOwn);
          console.log("🔍 Profile ownership set to:", isOwn);

          if (isOwn) {
            // If viewing own profile, always use /me endpoint (reliable)
            console.log("✅ Viewing own profile - using /me endpoint");
            try {
              response = await axiosInstance.get("/me");
              console.log("✅ Successfully fetched own profile via /me");
            } catch (ownProfileError) {
              console.error("❌ Failed to fetch own profile:", ownProfileError);
              setError("Failed to load your profile. Please try again.");
              setLoading(false);
              return;
            }
          } else {
            // If viewing another user's profile, try the new endpoint
            console.log(
              "🔍 Viewing another user's profile - trying /users/profile endpoint"
            );
            try {
              response = await axiosInstance.get(`/users/profile/${userId}`);
              console.log("✅ Successfully fetched other user profile");
            } catch (apiError) {
              console.error(
                "❌ Backend endpoint not available for fetching user by ID"
              );

              // Set proper error instead of falling back
              setError(
                "This profile is currently unavailable. The feature is being deployed to production."
              );
              setLoading(false);
              return; // Exit early - don't show own profile
            }
          }

          console.log("🔍=== PROFILE PAGE FETCH END ===");
        } else {
          // No userId provided - this should only happen when visiting /profile (without ID)
          console.log(
            "🔍 No userId provided - fetching own profile via /me endpoint"
          );
          console.log(
            "🔍 This should only happen for route /profile (without ID)"
          );
          response = await axiosInstance.get("/me");
          isOwn = true;
          setIsOwnProfile(true);
          console.log("🔍 Own profile response:", response.data);
        }

        if (response.data.success) {
          console.log(
            "✅ Setting user data:",
            response.data.user?.name,
            response.data.user?._id
          );
          setUserData(response.data.user);

          console.log("🔒 PROFILE OWNERSHIP FINAL:", {
            urlUserId: userId,
            currentUserId: currentUser?._id,
            responseUserId: response.data.user?._id,
            isOwnProfile: isOwn,
            showEditButtons: isOwn,
            showFollowButtons: !isOwn,
            userDataSet: !!response.data.user,
            profilePageState: {
              loading: false,
              error: null,
              userData: !!response.data.user,
              isOwnProfile: isOwn,
            },
          });
        } else {
          console.error("❌ Response not successful:", response.data);
          setError(response.data.message || "Failed to fetch user data");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, currentUser?._id]); // Also re-fetch when current user changes

  // Fetch suggested users
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        setSuggestedUsersLoading(true);
        const response = await axiosInstance.get("/getSuggestedUsers?limit=6");

        if (response.data.success) {
          console.log("📋 Suggested users data:", response.data.suggestedUsers);
          setSuggestedUsers(response.data.suggestedUsers);
        }
      } catch (err) {
        console.error("Error fetching suggested users:", err);
        // Keep the default empty array on error
      } finally {
        setSuggestedUsersLoading(false);
      }
    };

    // Only fetch suggested users for own profile
    if (isOwnProfile) {
      fetchSuggestedUsers();
    }
  }, [isOwnProfile]);

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

  const SIDEBAR_WIDTH = "80px";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>

            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Profile Unavailable
            </h2>

            {/* Message */}
            <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full bg-gray-100 text-gray-700 py-2.5 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Go to Home
              </button>
            </div>

            {/* Footer note */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                We're working to make this feature available soon.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex min-h-screen bg-white mt-[10px] mr-[80px]">
        {/* Sidebar is rendered by parent layout */}
        <div className="flex-1" style={{ marginLeft: SIDEBAR_WIDTH }}>
          <Header />
          <div className="flex flex-col px-7 py-8 mt-[7vh]">
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
                <div className="bg-white rounded-lg shadow-sm p-6 mt-16">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[16px] font-medium text-gray-900">
                      Profile Completion
                    </h3>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">
                        {(() => {
                          const totalFields = 6; // Basic info, about, experience, education, skills, certifications
                          let completedFields = 0;

                          if (userData?.name && userData?.headline)
                            completedFields++;
                          if (userData?.about) completedFields++;
                          if (userData?.experience?.length > 0)
                            completedFields++;
                          if (userData?.education?.length > 0)
                            completedFields++;
                          if (userData?.skills?.length > 0) completedFields++;
                          if (userData?.certifications?.length > 0)
                            completedFields++;

                          return Math.round(
                            (completedFields / totalFields) * 100
                          );
                        })()}
                        %
                      </span>
                      <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-300"
                          style={{
                            width: `${(() => {
                              const totalFields = 6;
                              let completedFields = 0;

                              if (userData?.name && userData?.headline)
                                completedFields++;
                              if (userData?.about) completedFields++;
                              if (userData?.experience?.length > 0)
                                completedFields++;
                              if (userData?.education?.length > 0)
                                completedFields++;
                              if (userData?.skills?.length > 0)
                                completedFields++;
                              if (userData?.certifications?.length > 0)
                                completedFields++;

                              return (completedFields / totalFields) * 100;
                            })()}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Complete Profile Nudge - Only show if incomplete */}
                    {(() => {
                      const totalFields = 6;
                      let completedFields = 0;

                      if (userData?.name && userData?.headline)
                        completedFields++;
                      if (userData?.about) completedFields++;
                      if (userData?.experience?.length > 0) completedFields++;
                      if (userData?.education?.length > 0) completedFields++;
                      if (userData?.skills?.length > 0) completedFields++;
                      if (userData?.certifications?.length > 0)
                        completedFields++;

                      const completionPercentage =
                        (completedFields / totalFields) * 100;

                      if (completionPercentage < 100) {
                        return (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
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
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-[14px] font-semibold text-gray-900 mb-1">
                                  Complete your Profile
                                </h4>
                                <p className="text-[12px] text-gray-600 mb-3">
                                  {completionPercentage < 50
                                    ? "Your profile is incomplete. Add more information to increase your visibility to employers."
                                    : completionPercentage < 80
                                    ? "You're almost there! Complete a few more sections to make your profile stand out."
                                    : "You're very close! Just a few more details to make your profile perfect."}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {!userData?.name || !userData?.headline ? (
                                    <button
                                      onClick={() =>
                                        openModal("Basic Information")
                                      }
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-200"
                                    >
                                      Basic Info
                                    </button>
                                  ) : null}
                                  {!userData?.about ? (
                                    <button
                                      onClick={() => openModal("About")}
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-200"
                                    >
                                      About
                                    </button>
                                  ) : null}
                                  {!userData?.experience?.length ? (
                                    <button
                                      onClick={() =>
                                        openModal("Work Experience")
                                      }
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-200"
                                    >
                                      Experience
                                    </button>
                                  ) : null}
                                  {!userData?.education?.length ? (
                                    <button
                                      onClick={() => openModal("Qualification")}
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-200"
                                    >
                                      Education
                                    </button>
                                  ) : null}
                                  {!userData?.skills?.length ? (
                                    <button
                                      onClick={() => openModal("Skills")}
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-200"
                                    >
                                      Skills
                                    </button>
                                  ) : null}
                                  {!userData?.certifications?.length ? (
                                    <button
                                      onClick={() =>
                                        openModal("Certifications")
                                      }
                                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors duration-200"
                                    >
                                      Certifications
                                    </button>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

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
                    {suggestedUsersLoading ? (
                      // Loading skeleton
                      Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between animate-pulse"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 rounded-full bg-gray-200"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                              <div className="h-3 bg-gray-200 rounded w-32"></div>
                            </div>
                          </div>
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                      ))
                    ) : suggestedUsers.length > 0 ? (
                      suggestedUsers.map((person, index) => (
                        <div
                          key={person._id || index}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center space-x-3 min-w-0 flex-1">
                            <img
                              src={(() => {
                                const imageSrc =
                                  person.profilePicture ||
                                  person.image ||
                                  "/default-avatar.png";
                                console.log(`🖼️ Image for ${person.name}:`, {
                                  profilePicture: person.profilePicture,
                                  image: person.image,
                                  finalSrc: imageSrc,
                                });
                                return imageSrc;
                              })()}
                              alt={person.name}
                              className="w-12 h-12 rounded-full object-cover"
                              onError={(e) => {
                                console.log(
                                  `❌ Image failed to load for ${person.name}, using default`
                                );
                                e.target.src = "/default-avatar.png";
                              }}
                            />
                            <div className="flex-1 min-w-0 max-w-[180px]">
                              <h4 className="text-[14px] font-medium text-gray-900 truncate">
                                {person.name}
                              </h4>
                              <p className="text-[12px] text-gray-500 truncate">
                                {person.role} | {person.company}
                              </p>
                            </div>
                          </div>
                          <button
                            className="text-[12px] bg-[#1890FF] text-white hover:bg-[#1570EF] font-medium px-3 py-1 rounded-lg transition-colors"
                            onClick={() => {
                              // TODO: Implement follow functionality
                              console.log(`Following ${person.name}`);
                            }}
                          >
                            + Follow
                          </button>
                        </div>
                      ))
                    ) : (
                      // Empty state
                      <div className="text-center py-8">
                        <p className="text-gray-500 text-sm">
                          No suggestions available at the moment.
                        </p>
                      </div>
                    )}
                  </div>
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
    </>
  );
};

export default ProfilePage;
