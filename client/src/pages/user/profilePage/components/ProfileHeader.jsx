import { useState, useRef, useEffect } from "react";
import {
  Camera,
  MapPin,
  Pencil,
  UserPlus,
  MessageCircle,
  Users,
  Check,
  X,
  MoreHorizontal,
  Clock,
  UserCheck,
  UserX,
} from "lucide-react";
import axiosInstance from "../../../../lib/axio";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useSocket } from "../../../../context/SocketProvider";
import {
  setCurrentUser,
  addFollowRequest,
  removeFollowRequest,
  addConnection,
  removeConnection,
  removePendingRequest,
} from "../../../../store/features/authSlice";
import Loader from "../../../../components/Loader";

const ProfileHeader = ({ userData, isOwnProfile, openModal, onDataUpdate }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const { socket } = useSocket();
  const navigate = useNavigate();
  const { userId } = useParams();

  // Simple logic: trust the isOwnProfile prop from parent
  const showEditButtons = isOwnProfile;

  // Show Follow/Connect buttons only when viewing someone else's profile
  const showFollowButtons = !isOwnProfile;

  console.log("🔒 PROFILE BUTTON LOGIC:", {
    isOwnProfile,
    showEditButtons,
    showFollowButtons,
    userDataId: userData?._id,
    currentUserId: currentUser?._id,
    userDataName: userData?.name,
    currentUserName: currentUser?.name,
    idsMatch: String(userData?._id) === String(currentUser?._id),
    "URL should show edit buttons?": isOwnProfile,
    "Actual showing edit buttons?": showEditButtons,
  });

  const [profileImage, setProfileImage] = useState(
    userData?.profilePicture || "/default-avatar.png"
  );
  const [bannerImage, setBannerImage] = useState(
    userData?.Banner ||
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"
  );
  const [followStatus, setFollowStatus] = useState("not_following");
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  // ✅ Initialize follow status based on Redux state
  useEffect(() => {
    if (!currentUser || !userData?._id || isOwnProfile) return;

    console.log("🔍 ProfileHeader - Initializing follow status");
    console.log("🔍 currentUser.connections:", currentUser.connections);
    console.log("🔍 currentUser.sentRequests:", currentUser.sentRequests);
    console.log("🔍 currentUser.pendingRequests:", currentUser.pendingRequests);
    console.log("🔍 userData._id:", userData._id);

    if (currentUser.connections?.includes(userData._id)) {
      setFollowStatus("following");
      console.log("🔍 Status set to: following");
    } else if (currentUser.sentRequests?.includes(userData._id)) {
      setFollowStatus("pending");
      console.log("🔍 Status set to: pending");
    } else if (currentUser.pendingRequests?.includes(userData._id)) {
      setFollowStatus("accept_or_reject");
      console.log("🔍 Status set to: accept_or_reject");
    } else {
      setFollowStatus("not_following");
      console.log("🔍 Status set to: not_following");
    }
  }, [currentUser, userData?._id, isOwnProfile]);

  // ✅ Debug logging
  useEffect(() => {
    console.log("🔍 ProfileHeader Debug Info:");
    console.log("🔍 isOwnProfile:", isOwnProfile);
    console.log("🔍 followStatus:", followStatus);
    console.log("🔍 showFollowButtons:", showFollowButtons);
    console.log("🔍 userData?.username:", userData?.username);
  }, [isOwnProfile, followStatus, showFollowButtons, userData]);

  // File input refs for direct upload
  const profileImageInputRef = useRef(null);
  const bannerImageInputRef = useRef(null);

  // Sync images with userData changes
  useEffect(() => {
    setProfileImage(userData?.profilePicture || "/default-avatar.png");
    setBannerImage(
      userData?.Banner ||
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"
    );
  }, [userData]);

  // Handle profile picture upload
  const handleProfileImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 1MB for profile picture to prevent 413 errors)
    if (file.size > 1 * 1024 * 1024) {
      alert("File size must be less than 1MB. Please choose a smaller image.");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setIsUploadingProfile(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target.result);
      reader.readAsDataURL(file);

      // Compress image before converting to base64
      const compressedImage = await compressImage(file, 0.8, 400); // 80% quality, max width 400px for profile

      console.log("Uploading profile picture...");

      // Try to update profile directly with compressed base64 image
      let updateResponse;
      try {
        updateResponse = await axiosInstance.put("/users/updateProfile", {
          profilePicture: compressedImage,
        });
        console.log("Profile update response:", updateResponse.data);
      } catch (error) {
        console.log("updateProfile failed, trying update-profile...");
        try {
          updateResponse = await axiosInstance.put("/users/update-profile", {
            profilePicture: compressedImage,
          });
          console.log("Profile update response:", updateResponse.data);
        } catch (secondError) {
          console.log("Both update endpoints failed, trying /me endpoint...");
          // Try updating via /me endpoint
          updateResponse = await axiosInstance.put("/me", {
            profilePicture: compressedImage,
          });
          console.log("Profile update via /me response:", updateResponse.data);
        }
      }

      if (updateResponse.data.success || updateResponse.status === 200) {
        setProfileImage(compressedImage);

        // Update Redux store if this is the current user's profile
        if (showEditButtons && currentUser) {
          const updatedUser = {
            ...currentUser,
            profilePicture: compressedImage,
          };
          dispatch(setCurrentUser(updatedUser));
        }

        if (onDataUpdate) onDataUpdate();

        // Show success message
        console.log("Profile picture updated successfully!");
      } else {
        throw new Error(
          updateResponse.data.message || "Failed to update profile"
        );
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      // Revert preview on error
      setProfileImage(userData?.profilePicture || "/default-avatar.png");

      // Show error message to user
      alert(
        `Failed to upload profile picture: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsUploadingProfile(false);
    }
  };

  // Handle banner image upload
  const handleBannerImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (max 2MB for banner to prevent 413 errors)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size must be less than 2MB. Please choose a smaller image.");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    setIsUploadingBanner(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setBannerImage(e.target.result);
      reader.readAsDataURL(file);

      // Compress image before converting to base64
      const compressedImage = await compressImage(file, 0.7, 1200); // 70% quality, max width 1200px

      console.log("Uploading banner image...");

      // Try to update profile directly with compressed base64 image
      let updateResponse;
      try {
        updateResponse = await axiosInstance.put("/users/updateProfile", {
          Banner: compressedImage,
        });
        console.log("Banner update response:", updateResponse.data);
      } catch (error) {
        console.log("updateProfile failed, trying update-profile...");
        try {
          updateResponse = await axiosInstance.put("/users/update-profile", {
            Banner: compressedImage,
          });
          console.log("Banner update response:", updateResponse.data);
        } catch (secondError) {
          console.log("Both update endpoints failed, trying /me endpoint...");
          // Try updating via /me endpoint
          updateResponse = await axiosInstance.put("/me", {
            Banner: compressedImage,
          });
          console.log("Banner update via /me response:", updateResponse.data);
        }
      }

      if (updateResponse.data.success || updateResponse.status === 200) {
        setBannerImage(compressedImage);

        // Update Redux store if this is the current user's profile
        if (showEditButtons && currentUser) {
          const updatedUser = {
            ...currentUser,
            Banner: compressedImage,
          };
          dispatch(setCurrentUser(updatedUser));
        }

        if (onDataUpdate) onDataUpdate();

        // Show success message
        console.log("Banner image updated successfully!");
      } else {
        throw new Error(
          updateResponse.data.message || "Failed to update profile"
        );
      }
    } catch (error) {
      console.error("Error uploading banner image:", error);
      // Revert preview on error
      setBannerImage(
        userData?.Banner ||
          "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"
      );

      // Show error message to user
      alert(
        `Failed to upload banner image: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsUploadingBanner(false);
    }
  };

  // Image compression function
  const compressImage = (file, quality = 0.7, maxWidth = 1200) => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(compressedDataUrl);
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const handleSendConnectionRequest = async () => {
    console.log("🔵 Sending connection request to:", userData?.username);
    console.log("🔵 Current follow status:", followStatus);

    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/follow/request", {
        username: userData?.username,
      });
      console.log("🟢 Connection request sent successfully:", response.data);
      setFollowStatus("pending");

      // ✅ Update Redux state
      dispatch(addFollowRequest(userData._id));

      // ✅ Emit socket event for real-time update
      if (socket) {
        socket.emit("sendFollowRequest", {
          senderId: currentUser._id,
          recipientId: userData._id,
          senderName: currentUser.name,
          senderUsername: currentUser.username,
          senderProfilePicture: currentUser.profilePicture,
        });
      }
    } catch (error) {
      console.error("🔴 Error sending connection request:", error);
      alert("Error sending connection request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawRequest = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        `/follow/withdraw/${userData?.username}`
      );
      if (response.data.success) {
        setFollowStatus("not_following");
        dispatch(removeFollowRequest(userData._id));

        if (socket) {
          socket.emit("withdrawFollowRequest", {
            senderId: currentUser._id,
            recipientId: userData._id,
          });
        }
      }
    } catch (error) {
      console.error("Error withdrawing request:", error);
      alert("Error withdrawing request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        `/follow/unfollow/${userData?.username}`
      );
      if (response.data.success) {
        setFollowStatus("not_following");
        dispatch(removeConnection(userData._id));

        if (socket) {
          socket.emit("unfollowUser", {
            unfollowerId: currentUser._id,
            targetId: userData._id,
          });
        }
      }
    } catch (error) {
      console.error("Error unfollowing:", error);
      alert("Error unfollowing");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptRequest = async () => {
    setIsLoading(true);
    try {
      // Find the notification ID for this request
      const notificationsResponse = await axiosInstance.get(
        `/notifications/?mode=individual`
      );
      const notification = notificationsResponse.data.data.find(
        (n) => n.type === "FOLLOW_REQUEST" && n.sender === userData._id
      );

      if (notification) {
        const response = await axiosInstance.post(`/follow/accept`, {
          notificationId: notification._id,
        });

        if (response.status === 200) {
          setFollowStatus("following");
          dispatch(addConnection(userData._id));
          dispatch(removePendingRequest(userData._id));
        }
      }
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Error accepting request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    setIsLoading(true);
    try {
      // Find the notification ID for this request
      const notificationsResponse = await axiosInstance.get(
        `/notifications/?mode=individual`
      );
      const notification = notificationsResponse.data.data.find(
        (n) => n.type === "FOLLOW_REQUEST" && n.sender === userData._id
      );

      if (notification) {
        const response = await axiosInstance.post(`/follow/reject`, {
          notificationId: notification._id,
        });

        if (response.status === 200) {
          setFollowStatus("not_following");
          dispatch(removePendingRequest(userData._id));
        }
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Error rejecting request");
    } finally {
      setIsLoading(false);
    }
  };

  const renderConnectionButton = () => {
    switch (followStatus) {
      case "not_following":
        return (
          <button
            onClick={handleSendConnectionRequest}
            className="h-10 bg-[#1890FF] text-white px-5 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors font-medium"
            disabled={isLoading}
          >
            <UserPlus className="w-4 h-4" />
            <span>Connect</span>
          </button>
        );
      case "pending":
        return (
          <div className="flex gap-2">
            <button
              onClick={handleWithdrawRequest}
              className="h-10 bg-gray-200 text-gray-900 px-5 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors font-medium"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
            <button
              onClick={handleAcceptRequest}
              className="h-10 bg-[#1890FF] text-white px-5 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors font-medium"
              disabled={isLoading}
            >
              <Check className="w-4 h-4" />
              <span>Accept</span>
            </button>
          </div>
        );
      case "accept_or_reject":
        return (
          <div className="flex gap-2">
            <button
              onClick={handleAcceptRequest}
              className="h-10 bg-[#1890FF] text-white px-5 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors font-medium"
              disabled={isLoading}
            >
              <Check className="w-4 h-4" />
              <span>Accept</span>
            </button>
            <button
              onClick={handleRejectRequest}
              className="h-10 bg-gray-200 text-gray-900 px-5 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors font-medium"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
              <span>Decline</span>
            </button>
          </div>
        );
      case "following":
        return (
          <button
            onClick={handleUnfollow}
            className="h-10 bg-gray-200 text-gray-900 px-5 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors font-medium"
            disabled={isLoading}
          >
            <Users className="w-4 h-4" />
            <span>Following</span>
          </button>
        );
      default:
        return (
          <button
            className="h-10 bg-red-600 text-white px-5 rounded-lg font-medium"
            disabled
          >
            <span>Unknown Status</span>
          </button>
        );
    }
  };

  return (
    <div className="w-full h-[340px] bg-white border border-[#E4E5E8] rounded-2xl overflow-hidden">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={bannerImageInputRef}
        onChange={handleBannerImageUpload}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={profileImageInputRef}
        onChange={handleProfileImageUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Cover Photo */}
      <div className="h-[200px] relative overflow-hidden">
        <img
          src={bannerImage}
          alt="Profile Banner"
          className="w-full h-full object-cover"
        />
        {showEditButtons && (
          <button
            onClick={() => bannerImageInputRef.current?.click()}
            disabled={isUploadingBanner}
            className="absolute top-3 right-3 w-8 h-8 p-1 border-2 rounded-full border-white bg-white/90 backdrop-blur-sm cursor-pointer flex items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-200 shadow-lg"
            title="Change cover photo"
          >
            {isUploadingBanner ? (
              <Loader />
            ) : (
              <Camera className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Profile Info Container */}
      <div className="bg-white px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Profile Info Left */}
          <div className="flex items-center gap-6">
            {/* Profile Picture */}
            <div className="relative -mt-16">
              {profileImage && profileImage !== "/default-avatar.png" ? (
                <img
                  src={profileImage}
                  alt={userData?.name}
                  className="w-[140px] h-[140px] rounded-full border-4 border-white object-cover bg-white"
                  onError={() => setProfileImage("/default-avatar.png")}
                />
              ) : (
                <div className="w-[140px] h-[140px] rounded-full border-4 border-white bg-[#1890FF] flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {userData?.name
                      ? userData.name.charAt(0).toUpperCase()
                      : "U"}
                  </span>
                </div>
              )}
              {showEditButtons && (
                <button
                  onClick={() => profileImageInputRef.current?.click()}
                  disabled={isUploadingProfile}
                  className="absolute bottom-3 right-3 w-8 h-8 p-1 border-2 rounded-full border-white bg-white/90 backdrop-blur-sm cursor-pointer flex items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-200 shadow-lg"
                  title="Change profile photo"
                >
                  {isUploadingProfile ? (
                    <Loader />
                  ) : (
                    <Camera className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>

            {/* Name and Title */}
            <div>
              <h1
                className="text-gray-900"
                style={{
                  fontFamily: "Inter",
                  fontWeight: 500,
                  fontStyle: "Medium",
                  fontSize: "24px",
                  lineHeight: "100%",
                  letterSpacing: "0.5px",
                  verticalAlign: "middle",
                }}
              >
                {userData?.name}
              </h1>
              <p
                className="text-gray-600 mt-1 pt-[6px]"
                style={{
                  fontFamily: "Inter",
                  fontWeight: 300,
                  fontStyle: "Light",
                  fontSize: "16px",
                  lineHeight: "100%",
                  letterSpacing: "0.5px",
                  verticalAlign: "middle",
                }}
              >
                {userData?.headline}
              </p>
              <p
                className="text-blue-500 mt-2 cursor-pointer hover:underline pt-[4px]"
                style={{
                  fontFamily: "Inter",
                  fontWeight: 600,
                  fontStyle: "Semi Bold",
                  fontSize: "14px",
                  lineHeight: "100%",
                  letterSpacing: "0px",
                  verticalAlign: "middle",
                }}
              >
                {userData?.connections?.length || 0} connections
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {showEditButtons && (
              <button
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => openModal("Basic Information")}
              >
                <Pencil className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <button className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors">
              <MoreHorizontal className="w-5 h-5 text-gray-600" />
            </button>

            {showFollowButtons && (
              <>
                <button
                  onClick={() => navigate(`/messages`)}
                  className="h-10 bg-gray-100 text-gray-900 px-5 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message
                </button>

                {renderConnectionButton()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
