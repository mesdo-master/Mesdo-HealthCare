import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../../../lib/axio";
import ProfileHeader from "./components/ProfileHeader";
import OverviewTab from "./components/OverviewTab";
import EditModal from "./components/EditModal";
import Header from "../../../components/Header";
import Loader from "../../../components/Loader";
import { useSocket } from "../../../context/SocketProvider";
// ✅ Import follow actions from Redux
import {
  addFollowRequest,
  removeFollowRequest,
  addConnection,
  removeConnection,
} from "../../../store/features/authSlice";

const ProfilePage = () => {
  const params = useParams();
  const { userId } = params;
  const { currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { socket } = useSocket();

  // Add CSS to hide scrollbars
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

  // ✅ Add window size tracking for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Profile completion nudge state
  const [showProfileNudge, setShowProfileNudge] = useState(true);

  // Suggested users state
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [suggestedUsersLoading, setSuggestedUsersLoading] = useState(true);
  // ✅ Add follow states for suggested users
  const [followStates, setFollowStates] = useState({});
  const [followLoadingStates, setFollowLoadingStates] = useState({});

  // Additional state for qualification and experience management
  const [editingQualification, setEditingQualification] = useState(null);
  const [activeQualificationTab, setActiveQualificationTab] =
    useState("Preview");
  const [editingExperienceId, setEditingExperienceId] = useState(null);
  const [editingExperienceData, setEditingExperienceData] = useState(null);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [activeAchievementTab, setActiveAchievementTab] = useState("Preview");

  // ✅ Socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleConnectionUpdate = (data) => {
      console.log("🔄 Connection update received:", data);

      // Update userData if it's the profile being viewed
      if (data.userId === userData?._id) {
        setUserData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            connections: data.connections || prev.connections,
          };
        });
      }

      // Update suggested users follow states if needed
      if (data.type === "follow_accepted") {
        setFollowStates((prev) => ({
          ...prev,
          [data.senderId]: "following",
        }));
      }
    };

    const handleFollowRequestAccepted = (data) => {
      console.log("🎉 Follow request accepted:", data);
      // Update the profile connection count in real-time
      if (data.recipientId === userData?._id) {
        setUserData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            connections: [...(prev.connections || []), data.senderId],
          };
        });
      }
    };

    socket.on("connectionUpdate", handleConnectionUpdate);
    socket.on("followRequestAccepted", handleFollowRequestAccepted);

    return () => {
      socket.off("connectionUpdate", handleConnectionUpdate);
      socket.off("followRequestAccepted", handleFollowRequestAccepted);
    };
  }, [socket, userData?._id]);

  // ✅ Track window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Helper function to determine follow status based on current user data
  const getFollowStatus = (userId) => {
    if (!currentUser) return "none";

    if (currentUser.connections?.includes(userId)) {
      return "following";
    } else if (currentUser.sentRequests?.includes(userId)) {
      return "pending";
    } else if (currentUser.pendingRequests?.includes(userId)) {
      return "requested";
    }
    return "none";
  };

  // ✅ Handle follow button click for suggested users
  const handleFollowUser = async (user) => {
    const userId = user._id;
    const currentStatus = followStates[userId] || "none";

    setFollowLoadingStates((prev) => ({ ...prev, [userId]: true }));

    try {
      if (currentStatus === "none") {
        // Send follow request
        const response = await axiosInstance.post("/follow/request", {
          username: user.username,
        });

        if (response.data) {
          setFollowStates((prev) => ({ ...prev, [userId]: "pending" }));
          dispatch(addFollowRequest(userId));
          console.log(`✅ Follow request sent to ${user.name}`);
        }
      } else if (currentStatus === "pending") {
        // Withdraw follow request
        const response = await axiosInstance.post(
          `/follow/withdraw/${user.username}`
        );

        if (response.data) {
          setFollowStates((prev) => ({ ...prev, [userId]: "none" }));
          dispatch(removeFollowRequest(userId));
          console.log(`✅ Follow request withdrawn from ${user.name}`);
        }
      } else if (currentStatus === "following") {
        // Unfollow user
        const response = await axiosInstance.post(
          `/follow/unfollow/${user.username}`
        );

        if (response.data) {
          setFollowStates((prev) => ({ ...prev, [userId]: "none" }));
          dispatch(removeConnection(userId));
          console.log(`✅ Unfollowed ${user.name}`);
        }
      }
    } catch (error) {
      console.error("Error handling follow action:", error);
    } finally {
      setFollowLoadingStates((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // ✅ Get button text and style based on follow status
  const getFollowButtonConfig = (userId) => {
    const status = followStates[userId] || "none";
    const isLoading = followLoadingStates[userId];

    switch (status) {
      case "following":
        return {
          text: "Following",
          className:
            "text-[12px] bg-gray-200 text-gray-700 hover:bg-red-500 hover:text-white font-medium px-3 py-1 rounded-lg transition-colors",
          hoverText: "Unfollow",
        };
      case "pending":
        return {
          text: "Pending",
          className:
            "text-[12px] bg-yellow-100 text-yellow-700 hover:bg-yellow-200 font-medium px-3 py-1 rounded-lg transition-colors",
          hoverText: "Cancel",
        };
      case "requested":
        return {
          text: "Requested",
          className:
            "text-[12px] bg-blue-100 text-blue-700 font-medium px-3 py-1 rounded-lg cursor-not-allowed",
          hoverText: "Requested",
        };
      default:
        return {
          text: isLoading ? "..." : "+ Follow",
          className:
            "text-[12px] bg-[#1890FF] text-white hover:bg-[#1570EF] font-medium px-3 py-1 rounded-lg transition-colors",
          hoverText: "+ Follow",
        };
    }
  };

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

          // ✅ Initialize follow states for each suggested user
          const initialFollowStates = {};
          for (const user of response.data.suggestedUsers) {
            initialFollowStates[user._id] = getFollowStatus(user._id);
          }
          setFollowStates(initialFollowStates);
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

  // ✅ Update follow states when currentUser connection data changes
  useEffect(() => {
    if (currentUser && suggestedUsers.length > 0) {
      const updatedFollowStates = {};
      for (const user of suggestedUsers) {
        updatedFollowStates[user._id] = getFollowStatus(user._id);
      }
      setFollowStates(updatedFollowStates);
    }
  }, [
    currentUser?.connections,
    currentUser?.sentRequests,
    currentUser?.pendingRequests,
    suggestedUsers,
  ]);

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
        topPadding: "65px", // Reduced top padding
      };
    } else if (windowWidth <= 1920) {
      // Medium screens
      return {
        marginLeft: "50px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "65px", // Reduced top padding
      };
    } else {
      // Large screens
      return {
        marginLeft: "50px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "65px", // Reduced top padding
      };
    }
  };

  const layout = getResponsiveLayout();

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <div
          className="flex flex-1 overflow-hidden"
          style={{ paddingTop: layout.topPadding }}
        >
          <div
            className="flex flex-1 overflow-y-auto"
            style={{
              marginLeft: layout.marginLeft,
              paddingLeft: layout.paddingLeft,
              paddingRight: layout.paddingRight,
            }}
          >
            <div className="mx-auto w-full max-w-[80rem]">
              <div className="bg-[#E4E5E8] rounded-lg w-full">
                <div
                  className="bg-[#F5F7FA] rounded-lg"
                  style={{ padding: layout.padding }}
                >
                  <div className="flex justify-center items-center h-64">
                    <Loader />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <div
          className="flex flex-1 overflow-hidden"
          style={{ paddingTop: layout.topPadding }}
        >
          <div
            className="flex flex-1 overflow-y-auto"
            style={{
              marginLeft: layout.marginLeft,
              paddingLeft: layout.paddingLeft,
              paddingRight: layout.paddingRight,
            }}
          >
            <div className="mx-auto w-full max-w-[80rem]">
              <div className="bg-[#E4E5E8] rounded-lg w-full">
                <div
                  className="bg-[#F5F7FA] rounded-lg"
                  style={{ padding: layout.padding }}
                >
                  <div className="max-w-md w-full mx-auto">
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
                      <p className="text-gray-600 mb-6 leading-relaxed">
                        {error}
                      </p>

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
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header - Moved outside blurred container for proper control */}
      <div className={`${isEditing ? "opacity-0 pointer-events-none" : ""}`}>
        <Header />
      </div>

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
                <div
                  className={`flex flex-col mt-6 ${
                    isEditing ? "blur-sm pointer-events-none" : ""
                  }`}
                >
                  {/* Profile Section */}
                  <ProfileHeader
                    userData={userData}
                    isOwnProfile={isOwnProfile}
                    openModal={openModal}
                    onDataUpdate={handleDataUpdate}
                  />

                  {/* Tabs and Content */}
                  <div className="flex gap-4 mt-1">
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
                    <div className="w-1/3 mt-7">
                      {/* Profile Completion */}
                      <div className="bg-white rounded-2xl p-6 border border-[#E4E5E8]">
                        <div className="flex items-center justify-between mb-6 ">
                          <h3 className="text-[16px] font-medium text-gray-900">
                            Profile Completion
                          </h3>
                        </div>

                        {/* Profile Image and Progress */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="relative">
                            <img
                              src={
                                userData?.profilePicture ||
                                "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
                              }
                              alt="Profile"
                              className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                            />

                            {/* Circular Progress Overlay */}
                            <div className="absolute -inset-2">
                              <svg
                                className="w-20 h-20 transform -rotate-90"
                                viewBox="0 0 36 36"
                              >
                                <path
                                  d="M18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                                  fill="none"
                                  stroke="#3B82F6"
                                  strokeWidth="2"
                                  strokeDasharray={`${(() => {
                                    const totalFields = 7;
                                    let completedFields = 0;

                                    if (
                                      userData?.name &&
                                      userData?.email &&
                                      userData?.phoneNo
                                    )
                                      completedFields++;
                                    if (userData?.profilePicture)
                                      completedFields++;
                                    if (
                                      userData?.about &&
                                      userData?.about.trim().length > 0
                                    )
                                      completedFields++;
                                    if (
                                      userData?.experience &&
                                      userData?.experience.length > 0
                                    )
                                      completedFields++;
                                    if (
                                      userData?.education &&
                                      userData?.education.length > 0
                                    )
                                      completedFields++;
                                    if (
                                      userData?.skills &&
                                      userData?.skills.length > 0
                                    )
                                      completedFields++;
                                    if (
                                      userData?.location ||
                                      userData?.city ||
                                      userData?.state
                                    )
                                      completedFields++;

                                    return Math.round(
                                      (completedFields / totalFields) * 100
                                    );
                                  })()}, 100`}
                                  className="transition-all duration-700"
                                />
                              </svg>
                            </div>
                          </div>

                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              GET DISCOVERED
                            </h4>
                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                              <div
                                className="bg-[#1890FF] h-2 rounded-full transition-all duration-700"
                                style={{
                                  width: `${(() => {
                                    const totalFields = 7;
                                    let completedFields = 0;

                                    if (
                                      userData?.name &&
                                      userData?.email &&
                                      userData?.phoneNo
                                    )
                                      completedFields++;
                                    if (userData?.profilePicture)
                                      completedFields++;
                                    if (
                                      userData?.about &&
                                      userData?.about.trim().length > 0
                                    )
                                      completedFields++;
                                    if (
                                      userData?.experience &&
                                      userData?.experience.length > 0
                                    )
                                      completedFields++;
                                    if (
                                      userData?.education &&
                                      userData?.education.length > 0
                                    )
                                      completedFields++;
                                    if (
                                      userData?.skills &&
                                      userData?.skills.length > 0
                                    )
                                      completedFields++;
                                    if (
                                      userData?.location ||
                                      userData?.city ||
                                      userData?.state
                                    )
                                      completedFields++;

                                    return (
                                      (completedFields / totalFields) * 100
                                    );
                                  })()}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-gray-500">
                              {(() => {
                                const totalFields = 7;
                                let completedFields = 0;

                                if (
                                  userData?.name &&
                                  userData?.email &&
                                  userData?.phoneNo
                                )
                                  completedFields++;
                                if (userData?.profilePicture) completedFields++;
                                if (
                                  userData?.about &&
                                  userData?.about.trim().length > 0
                                )
                                  completedFields++;
                                if (
                                  userData?.experience &&
                                  userData?.experience.length > 0
                                )
                                  completedFields++;
                                if (
                                  userData?.education &&
                                  userData?.education.length > 0
                                )
                                  completedFields++;
                                if (
                                  userData?.skills &&
                                  userData?.skills.length > 0
                                )
                                  completedFields++;
                                if (
                                  userData?.location ||
                                  userData?.city ||
                                  userData?.state
                                )
                                  completedFields++;

                                return Math.round(
                                  (completedFields / totalFields) * 100
                                );
                              })()}
                              % complete
                            </p>
                          </div>
                        </div>

                        {/* Completion Sections */}
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {/* Basic Information */}
                          <div
                            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                              userData?.name &&
                              userData?.email &&
                              userData?.phoneNo
                                ? "bg-gray-50"
                                : "hover:bg-gray-50 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (
                                !(
                                  userData?.name &&
                                  userData?.email &&
                                  userData?.phoneNo
                                )
                              ) {
                                openModal("Basic Information");
                              }
                            }}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                userData?.name &&
                                userData?.email &&
                                userData?.phoneNo
                                  ? "bg-[#1890FF]"
                                  : "border-2 border-gray-300"
                              }`}
                            >
                              {userData?.name &&
                              userData?.email &&
                              userData?.phoneNo ? (
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <span className="text-xs">1</span>
                              )}
                            </div>
                            <span
                              className={`text-sm font-medium flex-1 ${
                                userData?.name &&
                                userData?.email &&
                                userData?.phoneNo
                                  ? "text-gray-500 line-through"
                                  : "text-gray-700"
                              }`}
                            >
                              Basic Information
                            </span>
                            <div className="flex-shrink-0">
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

                          {/* Profile Photo */}
                          <div
                            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                              userData?.profilePicture
                                ? "bg-gray-50"
                                : "hover:bg-gray-50 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (!userData?.profilePicture) {
                                // Trigger profile photo upload
                                const profileImageInput =
                                  document.querySelector('input[type="file"]');
                                if (profileImageInput)
                                  profileImageInput.click();
                              }
                            }}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                userData?.profilePicture
                                  ? "bg-[#1890FF]"
                                  : "border-2 border-gray-300"
                              }`}
                            >
                              {userData?.profilePicture ? (
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <span className="text-xs">📷</span>
                              )}
                            </div>
                            <span
                              className={`text-sm font-medium flex-1 ${
                                userData?.profilePicture
                                  ? "text-gray-500 line-through"
                                  : "text-gray-700"
                              }`}
                            >
                              Profile Photo
                            </span>
                            <div className="flex-shrink-0">
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

                          {/* About Section */}
                          <div
                            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                              userData?.about &&
                              userData?.about.trim().length > 0
                                ? "bg-gray-50"
                                : "hover:bg-gray-50 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (
                                !(
                                  userData?.about &&
                                  userData?.about.trim().length > 0
                                )
                              ) {
                                openModal("About");
                              }
                            }}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                userData?.about &&
                                userData?.about.trim().length > 0
                                  ? "bg-[#1890FF]"
                                  : "border-2 border-gray-300"
                              }`}
                            >
                              {userData?.about &&
                              userData?.about.trim().length > 0 ? (
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <span className="text-xs">3</span>
                              )}
                            </div>
                            <span
                              className={`text-sm font-medium flex-1 ${
                                userData?.about &&
                                userData?.about.trim().length > 0
                                  ? "text-gray-500 line-through"
                                  : "text-gray-700"
                              }`}
                            >
                              About Section
                            </span>
                            <div className="flex-shrink-0">
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

                          {/* Experience */}
                          <div
                            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                              userData?.experience &&
                              userData?.experience.length > 0
                                ? "bg-gray-50"
                                : "hover:bg-gray-50 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (
                                !(
                                  userData?.experience &&
                                  userData?.experience.length > 0
                                )
                              ) {
                                openModal("Experience");
                              }
                            }}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                userData?.experience &&
                                userData?.experience.length > 0
                                  ? "bg-[#1890FF]"
                                  : "border-2 border-gray-300"
                              }`}
                            >
                              {userData?.experience &&
                              userData?.experience.length > 0 ? (
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <span className="text-xs">4</span>
                              )}
                            </div>
                            <span
                              className={`text-sm font-medium flex-1 ${
                                userData?.experience &&
                                userData?.experience.length > 0
                                  ? "text-gray-500 line-through"
                                  : "text-gray-700"
                              }`}
                            >
                              Experience
                            </span>
                            <div className="flex-shrink-0">
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

                          {/* Education */}
                          <div
                            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                              userData?.education &&
                              userData?.education.length > 0
                                ? "bg-gray-50"
                                : "hover:bg-gray-50 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (
                                !(
                                  userData?.education &&
                                  userData?.education.length > 0
                                )
                              ) {
                                openModal("Education");
                              }
                            }}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                userData?.education &&
                                userData?.education.length > 0
                                  ? "bg-[#1890FF]"
                                  : "border-2 border-gray-300"
                              }`}
                            >
                              {userData?.education &&
                              userData?.education.length > 0 ? (
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <span className="text-xs">5</span>
                              )}
                            </div>
                            <span
                              className={`text-sm font-medium flex-1 ${
                                userData?.education &&
                                userData?.education.length > 0
                                  ? "text-gray-500 line-through"
                                  : "text-gray-700"
                              }`}
                            >
                              Education
                            </span>
                            <div className="flex-shrink-0">
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

                          {/* Skills */}
                          <div
                            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                              userData?.skills && userData?.skills.length > 0
                                ? "bg-gray-50"
                                : "hover:bg-gray-50 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (
                                !(
                                  userData?.skills &&
                                  userData?.skills.length > 0
                                )
                              ) {
                                openModal("Skills");
                              }
                            }}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                userData?.skills && userData?.skills.length > 0
                                  ? "bg-[#1890FF]"
                                  : "border-2 border-gray-300"
                              }`}
                            >
                              {userData?.skills &&
                              userData?.skills.length > 0 ? (
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <span className="text-xs">6</span>
                              )}
                            </div>
                            <span
                              className={`text-sm font-medium flex-1 ${
                                userData?.skills && userData?.skills.length > 0
                                  ? "text-gray-500 line-through"
                                  : "text-gray-700"
                              }`}
                            >
                              Skills
                            </span>
                            <div className="flex-shrink-0">
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

                          {/* Location */}
                          <div
                            className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                              userData?.location ||
                              userData?.city ||
                              userData?.state
                                ? "bg-gray-50"
                                : "hover:bg-gray-50 cursor-pointer"
                            }`}
                            onClick={() => {
                              if (
                                !(
                                  userData?.location ||
                                  userData?.city ||
                                  userData?.state
                                )
                              ) {
                                openModal("Basic Information");
                              }
                            }}
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                                userData?.location ||
                                userData?.city ||
                                userData?.state
                                  ? "bg-[#1890FF]"
                                  : "border-2 border-gray-300"
                              }`}
                            >
                              {userData?.location ||
                              userData?.city ||
                              userData?.state ? (
                                <svg
                                  className="w-4 h-4 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : (
                                <span className="text-xs">7</span>
                              )}
                            </div>
                            <span
                              className={`text-sm font-medium flex-1 ${
                                userData?.location ||
                                userData?.city ||
                                userData?.state
                                  ? "text-gray-500 line-through"
                                  : "text-gray-700"
                              }`}
                            >
                              Location
                            </span>
                            <div className="flex-shrink-0">
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

                      {/* Suggested Users */}
                      {suggestedUsers.length > 0 && (
                        <div className="bg-white rounded-2xl p-6 border border-[#E4E5E8] mt-6">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[16px] font-medium text-gray-900">
                              Suggested Users
                            </h3>
                          </div>
                          <div className="space-y-4">
                            {suggestedUsers.slice(0, 4).map((person, index) => {
                              const buttonConfig = getFollowButtonConfig(
                                person._id
                              );
                              const isLoading = followLoadingStates[person._id];

                              return (
                                <div
                                  key={person._id || index}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                                    <img
                                      src={
                                        person.profilePicture ||
                                        person.image ||
                                        "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
                                      }
                                      alt={person.name}
                                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                      onError={(e) => {
                                        e.target.src =
                                          "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif";
                                      }}
                                    />
                                    <div className="flex-1 min-w-0 max-w-[180px]">
                                      <h4 className="text-[14px] font-medium text-gray-900 truncate">
                                        {person.name ||
                                          person.username ||
                                          `User ${index + 1}`}
                                      </h4>
                                      <p className="text-[12px] text-gray-500 truncate">
                                        {person.headline ||
                                          person.role ||
                                          person.title ||
                                          "Professional"}
                                        {person.company &&
                                          ` at ${person.company}`}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    className={buttonConfig.className}
                                    onClick={() => handleFollowUser(person)}
                                    disabled={
                                      isLoading ||
                                      followStates[person._id] === "requested"
                                    }
                                    title={buttonConfig.hoverText}
                                  >
                                    {buttonConfig.text}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* People You Might Know */}
                      {suggestedUsers.length === 0 && (
                        <div className="bg-white rounded-2xl p-6 border border-[#E4E5E8] mt-6">
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[16px] font-medium text-gray-900">
                              People You Might Know
                            </h3>
                          </div>
                          <div className="space-y-4">
                            {suggestedUsers.length > 0 ? (
                              <div className="space-y-4">
                                {suggestedUsers
                                  .slice(0, 4)
                                  .map((person, index) => {
                                    const buttonConfig = getFollowButtonConfig(
                                      person._id
                                    );
                                    const isLoading =
                                      followLoadingStates[person._id];

                                    return (
                                      <div
                                        key={person._id || index}
                                        className="flex items-center justify-between"
                                      >
                                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                                          <img
                                            src={
                                              person.profilePicture ||
                                              person.image ||
                                              "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
                                            }
                                            alt={person.name}
                                            className="w-12 h-12 rounded-full object-cover border border-gray-200"
                                            onError={(e) => {
                                              e.target.src =
                                                "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif";
                                            }}
                                          />
                                          <div className="flex-1 min-w-0 max-w-[180px]">
                                            <h4 className="text-[14px] font-medium text-gray-900 truncate">
                                              {person.name ||
                                                person.username ||
                                                `User ${index + 1}`}
                                            </h4>
                                            <p className="text-[12px] text-gray-500 truncate">
                                              {person.headline ||
                                                person.role ||
                                                person.title ||
                                                "Professional"}
                                              {person.company &&
                                                ` at ${person.company}`}
                                            </p>
                                          </div>
                                        </div>
                                        <button
                                          className={buttonConfig.className}
                                          onClick={() =>
                                            handleFollowUser(person)
                                          }
                                          disabled={
                                            isLoading ||
                                            followStates[person._id] ===
                                              "requested"
                                          }
                                          title={buttonConfig.hoverText}
                                        >
                                          {buttonConfig.text}
                                        </button>
                                      </div>
                                    );
                                  })}
                              </div>
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
                      )}
                    </div>
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
    </div>
  );
};

export default ProfilePage;
