import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion } from "framer-motion";
import {
  Camera,
  MapPin,
  Pencil,
  Building,
  Mail,
  Phone,
  Globe,
  Save,
  X,
  MoreHorizontal,
  MessageCircle,
} from "lucide-react";
import axiosInstance from "../../../../lib/axio";
import { setCurrentUser } from "../../../../store/features/authSlice";
import Loader from "../../../../components/Loader";
import {
  uploadRecuriterBanner,
  uploadRecuriterProfilePic,
} from "../../../../store/features/user/profileSlice";
import { useParams } from "react-router-dom";

const ProfileSection = ({ isOwnProfile, userData, openModal }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [profileData, setProfileData] = useState(userData);
  const dispatch = useDispatch();

  useEffect(() => {
    setProfileData(userData);
  }, [userData]);

  const { orgname } = useParams();
  console.log(orgname);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axiosInstance.get(
          `/follow/orgStatus/${orgname}`
        );
        setIsFollowing(response.data.status);
      } catch (error) {
        console.log(error);
      }
    };
    fetchStatus();
  }, [orgname]);

  const handleFollow = async () => {
    setLoadingFollow(true);
    try {
      const orgId = userData._id;
      await axiosInstance.post(`/follow/${orgId}/follow`);
      setIsFollowing(true);
    } catch (error) {
      console.error("Follow failed:", error);
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleUnfollow = async () => {
    setLoadingFollow(true);
    try {
      const orgId = userData._id;
      await axiosInstance.post(`/follow/${orgId}/unfollow`);
      setIsFollowing(false);
    } catch (error) {
      console.error("Unfollow failed:", error);
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleImageUpload = async (e, type) => {
    const image = e.target.files[0];
    if (!image) {
      alert("Please select an image to upload.");
      return;
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      alert("Please select a valid image file.");
      return;
    }

    // Validate file size (5MB limit)
    if (image.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB.");
      return;
    }

    try {
      if (type === "profile") {
        console.log("Uploading profile image:", image.name);
        const response = await dispatch(uploadRecuriterProfilePic(image));
        if (response.payload) {
          setProfileData((prevData) => ({
            ...prevData,
            orgLogo: response.payload,
          }));
          console.log("Profile image updated successfully");
        } else {
          console.error("No payload received from profile upload");
        }
      } else if (type === "cover") {
        console.log("Uploading cover image:", image.name);
        const response = await dispatch(uploadRecuriterBanner(image));
        if (response.payload) {
          setProfileData((prevData) => ({
            ...prevData,
            orgBanner: response.payload,
          }));
          console.log("Cover image updated successfully");
        } else {
          console.error("No payload received from banner upload");
        }
      } else {
        alert("Invalid type of image upload");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image. Please try again.");
    }

    // Clear the input value to allow re-uploading the same file
    e.target.value = '';
  };

  return (
    <div className="w-full h-[340px] bg-white border border-[#E4E5E8] rounded-2xl overflow-hidden">
      {/* Cover Photo */}
      <div className="h-[200px] relative overflow-hidden">
        <img
          src={
            profileData?.orgBanner
              ? profileData?.orgBanner
              : "https://res.cloudinary.com/dy9voteoc/image/upload/v1743862508/archimedis_digital_cover_tm7zro.jpg"
          }
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {isOwnProfile && (
          <>
            <label htmlFor="coverImageUpload" className="absolute top-3 right-3 w-8 h-8 p-1 border-2 rounded-full border-white bg-white/90 backdrop-blur-sm cursor-pointer flex items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-200 shadow-lg">
              <Camera className="w-4 h-4 text-gray-600" />
            </label>
            <input
              id="coverImageUpload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleImageUpload(e, "cover");
              }}
            />
          </>
        )}
      </div>

      {/* Profile Info Container */}
      <div className="bg-white px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Profile Info Left */}
          <div className="flex items-center gap-6">
            {/* Profile Picture */}
            <div className="relative -mt-16">
              {profileData?.orgLogo ? (
                <img
                  src={profileData.orgLogo}
                  alt="Organization Logo"
                  className="w-[140px] h-[140px] rounded-full border-4 border-white object-cover bg-white"
                />
              ) : (
                <div className="w-[140px] h-[140px] rounded-full border-4 border-white bg-[#1890FF] flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">
                    {profileData?.name
                      ? profileData.name.charAt(0).toUpperCase()
                      : "O"}
                  </span>
                </div>
              )}
              {isOwnProfile && (
                <>
                  <label htmlFor="avatarImageUpload" className="absolute bottom-3 right-3 w-8 h-8 p-1 border-2 rounded-full border-white bg-white/90 backdrop-blur-sm cursor-pointer flex items-center justify-center hover:bg-gray-50 hover:scale-110 transition-all duration-200 shadow-lg">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </label>
                  <input
                    id="avatarImageUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      handleImageUpload(e, "profile");
                    }}
                  />
                </>
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
                {profileData?.name}
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
                {profileData?.headline}
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
                {profileData?.followers?.length || 0} Followers
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
                  disabled={loadingFollow}
                  onClick={isFollowing ? handleUnfollow : handleFollow}
                  className={`h-10 min-w-4 px-5 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                    isFollowing
                      ? "bg-gray-200 text-gray-900 hover:bg-gray-300"
                      : "bg-[#1890FF] text-white hover:bg-blue-600"
                  } ${loadingFollow ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {loadingFollow ? (
                    <Loader />
                  ) : isFollowing ? (
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSection;
