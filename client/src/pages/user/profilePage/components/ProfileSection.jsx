import { Camera, CameraIcon, MessageCircle, MoreHorizontal, Pencil } from "lucide-react";
import { useDispatch } from "react-redux";
import { uploadCoverPic, uploadProfilePic } from "../../../../store/features/user/profileSlice";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../../../lib/axio";

const ProfileSection = ({ isOwnProfile, userData, openModal }) => {
  const [profileData, setProfileData] = useState(userData);
  const [followStatus, setFollowStatus] = useState("not_following");
  const [isLoading, setIsLoading] = useState(false);
  const { username } = useParams();

  const dispatch = useDispatch()

  useEffect(() => {
    setProfileData(userData);
  }, [userData, followStatus]);

  const fetchFollowStatus = async () => {
    try {
      const response = await axiosInstance.get(`/follow/status/${username}`);
      setFollowStatus(response.data.status);
    } catch (error) {
      console.error("Failed to fetch follow status", error);
    }
  };

  useEffect(() => {
    if (username) {
      fetchFollowStatus();
    }
  }, [username]);


  const handleImageUpload = async (e, type) => {
    const image = e.target.files[0];

    if (!image) {
      alert('Please select an image to upload.');
      return;
    }
    if (type === "profile") {
      const response = await dispatch(uploadProfilePic(image));
      setProfileData((prevData) => ({
        ...prevData,
        profilePicture: response.payload,
      }));
    } else if (type === "cover") {
      const response = await dispatch(uploadCoverPic(image));
      setProfileData((prevData) => ({
        ...prevData,
        Banner: response.payload,
      }));
    } else {
      alert("Invalid type of image upload");
    }
  };

  const handleSendConnectionRequest = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post('/follow/request', { username });
      console.log(response);
      setFollowStatus("pending");
    } catch (error) {
      alert("Error sending connection request");
      console.log(error)
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawRequest = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(`/follow/withdraw/${username}`);
      if (response.data.success) {
        setFollowStatus("not_following");
      }
    } catch (error) {
      alert("Error withdrawing request");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleUnfollow = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(`/follow/unfollow/${username}`);
      if (response.data.success) {
        setFollowStatus("not_following");
      }
    } catch (error) {
      console.log(error);
      alert("Error unfollowing");
    } finally {
      setIsLoading(false);
    }
  };


  const handleAcceptRequest = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(`/connections/accept/${username}`);
      if (response.success) {
        setFollowStatus("following");
      }
    } catch (error) {
      alert("Error accepting request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectRequest = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(`/connections/reject/${username}`);
      if (response.success) {
        setFollowStatus("not_following");
      }
    } catch (error) {
      alert("Error rejecting request");
    } finally {
      setIsLoading(false);
    }
  };
  const navigate = useNavigate();

  // Frontend (React)
const handleMessageClick = async () => {
  try {
    const res = await axiosInstance.post("/chats/initiate", { username: username });
    const conversationId = res.data.conversationId;
    navigate(`/messages/${conversationId}`);
  } catch (error) {
    console.error("Error initiating chat:", error);
  }
 };


  return (
    <div className="w-full">
      {/* Cover Photo */}
      <div className="h-[200px] relative">
        <img
          src={profileData?.Banner ? profileData?.Banner : "https://res.cloudinary.com/dy9voteoc/image/upload/v1743862508/archimedis_digital_cover_tm7zro.jpg"}
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
              onChange={(e) => handleImageUpload(e, "cover")}
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
            <div className="relative -mt-16">
              <img
                src={profileData?.profilePicture ? profileData?.profilePicture : "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"}
                alt="Dr. Rahul Sharma"
                className="w-[140px] h-[140px] rounded-full border-4 border-white object-cover"
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
                    onChange={(e) => handleImageUpload(e, "profile")}
                  />
                </>
              )}
            </div>

            {/* Name and Title */}
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {profileData?.name}
              </h1>
              <p className="text-gray-600 mt-1">
                {profileData?.headline}
              </p>
              <p className="text-blue-500 mt-2 text-sm font-semibold cursor-pointer hover:underline">
                {profileData?.connections?.length} Connections
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {!isOwnProfile && (
              <>
                {followStatus === "accept_or_reject" ? (
                  <div className="flex gap-2">
                    <button
                      className="h-10 px-4 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600"
                      onClick={handleAcceptRequest}
                      disabled={isLoading}
                    >
                      Accept
                    </button>
                    <button
                      className="h-10 px-4 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600"
                      onClick={handleRejectRequest}
                      disabled={isLoading}
                    >
                      Reject
                    </button>
                  </div>
                ) : (
                  <button
                    className={`h-10 px-5 rounded-lg flex items-center gap-2 font-medium transition-colors ${followStatus === "not_following"
                      ? "bg-[#1890FF] text-white hover:bg-blue-600"
                      : followStatus === "pending"
                        ? "bg-gray-300 text-gray-700 hover:bg-gray-400"
                        : "bg-red-100 text-red-600 hover:bg-red-200"
                      }`}
                    onClick={() => {
                      if (followStatus === "not_following") handleSendConnectionRequest();
                      else if (followStatus === "pending") handleWithdrawRequest();
                      else if (followStatus === "following") handleUnfollow();
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin h-5 w-5 text-current"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <>
                        {followStatus === "not_following" && (
                          <>
                            <span className="text-lg leading-none">+</span> Follow
                          </>
                        )}
                        {followStatus === "pending" && "Pending"}
                        {followStatus === "following" && "Unfollow"}
                      </>
                    )}
                  </button>
                )}

                <button onClick={handleMessageClick} className="h-10 bg-gray-100 text-gray-900 px-5 rounded-lg flex items-center gap-2 hover:bg-gray-200 transition-colors font-medium">
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