import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  MapPin,
  Briefcase,
  UserPlus,
  UserCheck,
  Clock,
  UserX,
} from "lucide-react";
import axiosInstance from "../lib/axio";
import { useSocket } from "../context/SocketProvider";
import {
  addFollowRequest,
  removeFollowRequest,
  addConnection,
  removeConnection,
  removePendingRequest,
} from "../store/features/authSlice";

const PeopleCard = ({ user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const { socket } = useSocket();

  const [followStatus, setFollowStatus] = useState("not_following");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Determine initial follow status based on Redux state
  useEffect(() => {
    if (!currentUser || !user._id) return;

    if (currentUser.connections?.includes(user._id)) {
      setFollowStatus("following");
    } else if (currentUser.sentRequests?.includes(user._id)) {
      setFollowStatus("pending");
    } else if (currentUser.pendingRequests?.includes(user._id)) {
      setFollowStatus("received");
    } else {
      setFollowStatus("not_following");
    }
  }, [currentUser, user._id]);

  // ✅ Real-time socket listeners for follow updates
  useEffect(() => {
    if (!socket) return;

    const handleFollowRequestReceived = (data) => {
      if (data.senderId === user._id) {
        setFollowStatus("received");
      }
    };

    const handleFollowAccepted = (data) => {
      if (data.recipientId === user._id) {
        setFollowStatus("following");
        dispatch(addConnection(user._id));
        dispatch(removeFollowRequest(user._id));
      }
    };

    const handleFollowRejected = (data) => {
      if (data.recipientId === user._id) {
        setFollowStatus("not_following");
        dispatch(removeFollowRequest(user._id));
      }
    };

    const handleRequestWithdrawn = (data) => {
      if (data.senderId === user._id) {
        setFollowStatus("not_following");
        dispatch(removePendingRequest(user._id));
      }
    };

    const handleUnfollowed = (data) => {
      if (data.unfollowerId === user._id || data.targetId === user._id) {
        setFollowStatus("not_following");
        dispatch(removeConnection(user._id));
      }
    };

    socket.on("followRequestReceived", handleFollowRequestReceived);
    socket.on("followAccepted", handleFollowAccepted);
    socket.on("followRejected", handleFollowRejected);
    socket.on("requestWithdrawn", handleRequestWithdrawn);
    socket.on("unfollowed", handleUnfollowed);

    return () => {
      socket.off("followRequestReceived", handleFollowRequestReceived);
      socket.off("followAccepted", handleFollowAccepted);
      socket.off("followRejected", handleFollowRejected);
      socket.off("requestWithdrawn", handleRequestWithdrawn);
      socket.off("unfollowed", handleUnfollowed);
    };
  }, [socket, user._id, dispatch]);

  const handleSendConnectionRequest = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post("/follow/request", {
        username: user.username,
      });

      if (response.data.success || response.status === 200) {
        setFollowStatus("pending");
        dispatch(addFollowRequest(user._id));

        // Emit socket event for real-time update
        if (socket) {
          socket.emit("sendFollowRequest", {
            senderId: currentUser._id,
            recipientId: user._id,
            senderName: currentUser.name,
            senderUsername: currentUser.username,
            senderProfilePicture: currentUser.profilePicture,
          });
        }
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      // You could add a toast notification here instead of alert
      alert("Error sending connection request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdrawRequest = async () => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.post(
        `/follow/withdraw/${user.username}`
      );

      if (response.data.success) {
        setFollowStatus("not_following");
        dispatch(removeFollowRequest(user._id));

        // Emit socket event for real-time update
        if (socket) {
          socket.emit("withdrawFollowRequest", {
            senderId: currentUser._id,
            recipientId: user._id,
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
        `/follow/unfollow/${user.username}`
      );

      if (response.data.success) {
        setFollowStatus("not_following");
        dispatch(removeConnection(user._id));

        // Emit socket event for real-time update
        if (socket) {
          socket.emit("unfollowUser", {
            unfollowerId: currentUser._id,
            targetId: user._id,
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
        (n) => n.type === "FOLLOW_REQUEST" && n.sender === user._id
      );

      if (notification) {
        const response = await axiosInstance.post(`/follow/accept`, {
          notificationId: notification._id,
        });

        if (response.status === 200) {
          setFollowStatus("following");
          dispatch(addConnection(user._id));
          dispatch(removePendingRequest(user._id));

          // Real-time notification will be sent by the server
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
        (n) => n.type === "FOLLOW_REQUEST" && n.sender === user._id
      );

      if (notification) {
        const response = await axiosInstance.post(`/follow/reject`, {
          notificationId: notification._id,
        });

        if (response.status === 200) {
          setFollowStatus("not_following");
          dispatch(removePendingRequest(user._id));
        }
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Error rejecting request");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = () => {
    if (user.username) {
      navigate(`/profile/${user.username}`);
    }
  };

  const getButtonConfig = () => {
    switch (followStatus) {
      case "not_following":
        return {
          text: "Connect",
          icon: <UserPlus className="w-4 h-4" />,
          onClick: handleSendConnectionRequest,
          className:
            "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
        };
      case "pending":
        return {
          text: "Pending",
          icon: <Clock className="w-4 h-4" />,
          onClick: handleWithdrawRequest,
          className:
            "text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100",
        };
      case "following":
        return {
          text: "Following",
          icon: <UserCheck className="w-4 h-4" />,
          onClick: handleUnfollow,
          className:
            "text-green-600 bg-green-50 border-green-200 hover:bg-green-100",
        };
      case "received":
        return {
          text: "Accept",
          icon: <UserCheck className="w-4 h-4" />,
          onClick: handleAcceptRequest,
          className:
            "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
          showReject: true,
        };
      default:
        return {
          text: "Connect",
          icon: <UserPlus className="w-4 h-4" />,
          onClick: handleSendConnectionRequest,
          className:
            "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleUserClick}
    >
      <div className="flex items-start space-x-4">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <img
            src={
              user.profilePicture ||
              "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
            }
            alt={`${user.name}'s profile`}
            className="w-16 h-16 rounded-full object-cover border border-gray-200"
          />
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {user.name || "User Name"}
              </h3>

              {user.headline && (
                <p className="text-sm text-gray-600 mt-1">{user.headline}</p>
              )}

              {user.about && (
                <p className="text-sm text-gray-700 mt-2 line-clamp-2">
                  {user.about}
                </p>
              )}

              <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                {user.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {user.location.city && user.location.state
                        ? `${user.location.city}, ${user.location.state}`
                        : user.location.city ||
                          user.location.state ||
                          user.location}
                    </span>
                  </div>
                )}

                {user.currentPosition && (
                  <div className="flex items-center space-x-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{user.currentPosition}</span>
                  </div>
                )}
              </div>

              {user.skills && user.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {user.skills.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                  {user.skills.length > 3 && (
                    <span className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-full">
                      +{user.skills.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Connect Button */}
            <div className="flex-shrink-0 ml-4">
              {buttonConfig.showReject ? (
                // For received requests, show Accept and Reject buttons
                <div className="flex gap-2">
                  <button
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1 ${
                      buttonConfig.className
                    } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      buttonConfig.onClick();
                    }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                    ) : (
                      buttonConfig.icon
                    )}
                    <span>{isLoading ? "Loading..." : buttonConfig.text}</span>
                  </button>
                  <button
                    className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRejectRequest();
                    }}
                    disabled={isLoading}
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                // For other states, show single button
                <button
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center space-x-1 border ${
                    buttonConfig.className
                  } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    buttonConfig.onClick();
                  }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-current"></div>
                  ) : (
                    buttonConfig.icon
                  )}
                  <span>{isLoading ? "Loading..." : buttonConfig.text}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeopleCard;
