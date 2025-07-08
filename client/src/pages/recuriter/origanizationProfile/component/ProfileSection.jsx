import {
  CameraIcon,
  MessageCircle,
  MoreHorizontal,
  Pencil,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  uploadRecuriterBanner,
  uploadRecuriterProfilePic,
} from "../../../../store/features/user/profileSlice";
import { useEffect, useState } from "react";
import axiosInstance from "../../../../lib/axio";
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
    if (type === "profile") {
      const response = await dispatch(uploadRecuriterProfilePic(image));
      setProfileData((prevData) => ({
        ...prevData,
        orgLogo: response.payload,
      }));
    } else if (type === "cover") {
      const response = await dispatch(uploadRecuriterBanner(image));
      setProfileData((prevData) => ({
        ...prevData,
        orgBanner: response.payload,
      }));
    } else {
      alert("Invalid type of image upload");
    }
  };

  return (
    <div className="w-full">
      {/* Cover Photo */}
      <div className="h-[200px] relative">
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
            <label htmlFor="coverImageUpload">
              <CameraIcon className="absolute top-3 right-3 w-7 h-7 p-1 border-2 rounded-full border-white bg-white cursor-pointer" />
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
      <div className="bg-white px-8 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          {/* Profile Info Left */}
          <div className="flex items-center gap-6">
            {/* Profile Picture */}
            <div className="relative -mt-16 ">
              <img
                src={
                  profileData?.orgLogo
                    ? profileData?.orgLogo
                    : "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
                }
                alt="Organization Logo"
                className="w-[140px] h-[140px] rounded-full border-4 border-white object-cover bg-white"
              />
              {isOwnProfile && (
                <>
                  <label htmlFor="avatarImageUpload">
                    <CameraIcon className="absolute bottom-3 right-3 w-7 h-7 p-1 border-2 rounded-full border-white bg-white cursor-pointer" />
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
              <h1 className="text-2xl font-semibold text-gray-900">
                {profileData?.name}
              </h1>
              <p className="text-gray-600 mt-1">{profileData?.headline}</p>
              <p className="text-blue-500 mt-2 text-sm font-semibold cursor-pointer hover:underline">
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
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
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
