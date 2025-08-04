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
} from "lucide-react";
import axiosInstance from "../../../../lib/axio";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentUser } from "../../../../store/features/authSlice";

const ProfileHeader = ({ userData, isOwnProfile, openModal, onDataUpdate }) => {
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);

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
  const [connectionStatus, setConnectionStatus] = useState("none"); // none, pending, connected, received
  const [isFollowing, setIsFollowing] = useState(false);
  const [isUploadingProfile, setIsUploadingProfile] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

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

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
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

      // Convert image to base64 for direct storage
      const base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      console.log("Uploading profile picture...");

      // Try to update profile directly with base64 image
      let updateResponse;
      try {
        updateResponse = await axiosInstance.put("/users/updateProfile", {
          profilePicture: base64Image,
        });
        console.log("Profile update response:", updateResponse.data);
      } catch (error) {
        console.log("updateProfile failed, trying update-profile...");
        try {
          updateResponse = await axiosInstance.put("/users/update-profile", {
            profilePicture: base64Image,
          });
          console.log("Profile update response:", updateResponse.data);
        } catch (secondError) {
          console.log("Both update endpoints failed, trying /me endpoint...");
          // Try updating via /me endpoint
          updateResponse = await axiosInstance.put("/me", {
            profilePicture: base64Image,
          });
          console.log("Profile update via /me response:", updateResponse.data);
        }
      }

      if (updateResponse.data.success || updateResponse.status === 200) {
        setProfileImage(base64Image);

        // Update Redux store if this is the current user's profile
        if (showEditButtons && currentUser) {
          const updatedUser = {
            ...currentUser,
            profilePicture: base64Image,
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

    // Validate file size (max 10MB for banner)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
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

      // Convert image to base64 for direct storage
      const base64Image = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      console.log("Uploading banner image...");

      // Try to update profile directly with base64 image
      let updateResponse;
      try {
        updateResponse = await axiosInstance.put("/users/updateProfile", {
          Banner: base64Image,
        });
        console.log("Banner update response:", updateResponse.data);
      } catch (error) {
        console.log("updateProfile failed, trying update-profile...");
        try {
          updateResponse = await axiosInstance.put("/users/update-profile", {
            Banner: base64Image,
          });
          console.log("Banner update response:", updateResponse.data);
        } catch (secondError) {
          console.log("Both update endpoints failed, trying /me endpoint...");
          // Try updating via /me endpoint
          updateResponse = await axiosInstance.put("/me", {
            Banner: base64Image,
          });
          console.log("Banner update via /me response:", updateResponse.data);
        }
      }

      if (updateResponse.data.success || updateResponse.status === 200) {
        setBannerImage(base64Image);

        // Update Redux store if this is the current user's profile
        if (showEditButtons && currentUser) {
          const updatedUser = {
            ...currentUser,
            Banner: base64Image,
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

  const handleConnect = () => {
    switch (connectionStatus) {
      case "none":
        setConnectionStatus("pending");
        break;
      case "pending":
        setConnectionStatus("none");
        break;
      case "received":
        setConnectionStatus("connected");
        break;
      case "connected":
        setConnectionStatus("none");
        break;
      default:
        console.warn("Unexpected connectionStatus:", connectionStatus);
        break;
    }
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  const handleDecline = () => {
    setConnectionStatus("none");
  };

  const renderConnectionButton = () => {
    switch (connectionStatus) {
      case "none":
        return (
          <button
            onClick={handleConnect}
            className="h-10 bg-[#1890FF] text-white px-5 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors font-medium"
          >
            <UserPlus className="w-4 h-4" />
            <span>Connect</span>
          </button>
        );
      case "pending":
        return (
          <button
            onClick={handleConnect}
            className="h-10 bg-gray-200 text-gray-900 px-5 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors font-medium"
          >
            <Check className="w-4 h-4" />
            <span>Pending</span>
          </button>
        );
      case "received":
        return (
          <div className="flex gap-2">
            <button
              onClick={handleConnect}
              className="h-10 bg-[#1890FF] text-white px-5 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors font-medium"
            >
              <Check className="w-4 h-4" />
              <span>Accept</span>
            </button>
            <button
              onClick={handleDecline}
              className="h-10 bg-gray-200 text-gray-900 px-5 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors font-medium"
            >
              <X className="w-4 h-4" />
              <span>Decline</span>
            </button>
          </div>
        );
      case "connected":
        return (
          <button
            onClick={handleConnect}
            className="h-10 bg-gray-200 text-gray-900 px-5 rounded-lg flex items-center gap-2 hover:bg-gray-300 transition-colors font-medium"
          >
            <Users className="w-4 h-4" />
            <span>Connected</span>
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
    <div className="w-full">
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
      <div className="h-[200px] relative">
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
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
            ) : (
              <Camera className="w-4 h-4 text-gray-600" />
            )}
          </button>
        )}
      </div>

      {/* Profile Info Container */}
      <div className="bg-white px-8 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          {/* Profile Info Left */}
          <div className="flex items-center gap-6">
            {/* Profile Picture */}
            <div className="relative -mt-16">
              <img
                src={profileImage}
                alt={userData?.name}
                className="w-[140px] h-[140px] rounded-full border-4 border-white object-cover bg-white"
                onError={() => setProfileImage("/default-avatar.png")}
              />
              {showEditButtons && (
                <button
                  onClick={() => profileImageInputRef.current?.click()}
                  disabled={isUploadingProfile}
                  className="absolute bottom-3 right-3 w-8 h-8 p-1 border-2 rounded-full border-white bg-white/90 backdrop-blur-sm cursor-pointer flex items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-200 shadow-lg"
                  title="Change profile photo"
                >
                  {isUploadingProfile ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                  ) : (
                    <Camera className="w-4 h-4 text-gray-600" />
                  )}
                </button>
              )}
            </div>

            {/* Name and Title */}
            <div>
              <h1 className="text-2xl font-medium text-gray-900">
                {userData?.name}
              </h1>
              <p className="text-gray-600 mt-1">{userData?.headline}</p>
              <p className="text-blue-500 mt-2 text-sm font-medium cursor-pointer hover:underline">
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
                  onClick={isFollowing ? handleFollow : handleFollow}
                  className={`h-10 min-w-4 px-5 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                    isFollowing
                      ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                      : "bg-[#1890FF] text-white hover:bg-blue-600"
                  }`}
                >
                  {isFollowing ? (
                    "Following"
                  ) : (
                    <>
                      <span className="text-lg leading-none">+</span>
                      Follow
                    </>
                  )}
                </button>

                <button className="h-10 bg-gray-100 text-gray-900 px-5 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors font-medium">
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
