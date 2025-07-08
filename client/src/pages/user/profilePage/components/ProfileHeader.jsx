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

const ProfileHeader = ({ userData, isOwnProfile, openModal, onDataUpdate }) => {
  const [profileImage, setProfileImage] = useState(
    userData?.profilePicture || "/default-avatar.png"
  );
  const [bannerImage, setBannerImage] = useState(
    userData?.Banner ||
      "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"
  );
  const [connectionStatus, setConnectionStatus] = useState("none"); // none, pending, connected, received
  const [isFollowing, setIsFollowing] = useState(false);

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

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setProfileImage(e.target.result);
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await axiosInstance.post("users/upload", formData);
      const imageUrl = uploadResponse.data.url;

      // Update profile
      await axiosInstance.put("/users/updateProfile", {
        profilePicture: imageUrl,
      });

      setProfileImage(imageUrl);
      if (onDataUpdate) onDataUpdate();
    } catch (error) {
      console.error("Error uploading profile image:", error);
      // Revert preview on error
      setProfileImage(userData?.profilePicture || "/default-avatar.png");
    }
  };

  // Handle banner image upload
  const handleBannerImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setBannerImage(e.target.result);
      reader.readAsDataURL(file);

      // Upload to server
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await axiosInstance.post("users/upload", formData);
      const imageUrl = uploadResponse.data.url;

      // Update profile
      await axiosInstance.put("/users/updateProfile", {
        Banner: imageUrl,
      });

      setBannerImage(imageUrl);
      if (onDataUpdate) onDataUpdate();
    } catch (error) {
      console.error("Error uploading banner image:", error);
      // Revert preview on error
      setBannerImage(
        userData?.Banner ||
          "https://images.unsplash.com/photo-1579546929518-9e396f3cc809"
      );
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
        {isOwnProfile && (
          <button
            onClick={() => bannerImageInputRef.current?.click()}
            className="absolute top-3 right-3 w-7 h-7 p-1 border-2 rounded-full border-white bg-white cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <Camera className="w-4 h-4 text-gray-600" />
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
              {isOwnProfile && (
                <button
                  onClick={() => profileImageInputRef.current?.click()}
                  className="absolute bottom-3 right-3 w-7 h-7 p-1 border-2 rounded-full border-white bg-white cursor-pointer flex items-center justify-center hover:bg-gray-50 transition-colors"
                >
                  <Camera className="w-4 h-4 text-gray-600" />
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
            {isOwnProfile && (
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

            {!isOwnProfile && (
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
