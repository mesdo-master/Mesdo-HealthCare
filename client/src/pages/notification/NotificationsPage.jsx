import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../context/SocketProvider";
import {
  addConnection,
  removePendingRequest,
  removeFollowRequest,
  addFollowRequest,
  removeConnection,
} from "../../store/features/authSlice";

import {
  Bell,
  Briefcase,
  Settings,
  MessageCircle,
  ChevronRight,
  Pin,
  Trash2,
  ArrowLeft,
  RotateCcw,
  CheckCheck,
  User,
  X,
} from "lucide-react";
import axiosInstance from "../../lib/axio";

export default function NotificationPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [acceptingIds, setAcceptingIds] = useState(new Set());
  const [rejectingIds, setRejectingIds] = useState(new Set());
  const { currentUser, mode } = useSelector((state) => state.auth);
  const { socket } = useSocket();
  const dispatch = useDispatch();

  // ✅ Add window size tracking for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // ✅ Auto mark all as read when component mounts (opening notifications page)
  useEffect(() => {
    const autoMarkAllAsRead = async () => {
      try {
        console.log("📖 Auto-marking all notifications as read...");
        const response = await axiosInstance.put(
          `/notifications/mark-all-read?mode=${mode}`
        );
        if (response.data.success) {
          console.log(
            `✅ Marked ${response.data.modifiedCount} notifications as read`
          );
          // Update local state to mark all as read
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }
      } catch (error) {
        console.error("Error auto-marking notifications as read:", error);
      }
    };

    // Auto-mark as read when page loads
    if (notifications.length > 0) {
      autoMarkAllAsRead();
    }
  }, [mode]); // Run when mode changes or component mounts

  // ✅ Manual mark all as read function
  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      console.log("📖 Manually marking all notifications as read...");
      const response = await axiosInstance.put(
        `/notifications/mark-all-read?mode=${mode}`
      );
      if (response.data.success) {
        console.log(
          `✅ Marked ${response.data.modifiedCount} notifications as read`
        );
        // Update local state to mark all as read
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

        // Emit socket event to update header count
        if (socket) {
          socket.emit("notificationsMarkedAsRead", {
            userId: currentUser._id,
            mode: mode,
          });
        }
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  // ✅ Enhanced real-time socket listeners for notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      console.log("🔔 New notification received:", notification);
      // Add new notification to the top of the list
      setNotifications((prev) => [notification, ...prev]);
    };

    const handleFollowRequestReceived = () => {
      console.log("📨 Follow request received - refreshing notifications");
      // Refresh notifications when follow request received
      fetchAllNotifications();
    };

    const handleFollowAccepted = () => {
      console.log("✅ Follow accepted - refreshing notifications");
      // Refresh notifications when follow request accepted
      fetchAllNotifications();
    };

    const handleFollowRequestAccepted = (data) => {
      console.log(
        "🎉 Follow request accepted - updating notification status:",
        data
      );
      // Update the specific notification status
      if (data.notificationId) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === data.notificationId ? { ...n, status: "accepted" } : n
          )
        );
      }
    };

    const handleFollowRequestRejected = (data) => {
      console.log(
        "❌ Follow request rejected - updating notification status:",
        data
      );
      // Update the specific notification status
      if (data.notificationId) {
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === data.notificationId ? { ...n, status: "rejected" } : n
          )
        );
      }
    };

    // Register all socket listeners
    socket.on("newNotification", handleNewNotification);
    socket.on("followRequestReceived", handleFollowRequestReceived);
    socket.on("followAccepted", handleFollowAccepted);
    socket.on("followRequestAccepted", handleFollowRequestAccepted);
    socket.on("followRequestRejected", handleFollowRequestRejected);

    // Cleanup on unmount
    return () => {
      socket.off("newNotification", handleNewNotification);
      socket.off("followRequestReceived", handleFollowRequestReceived);
      socket.off("followAccepted", handleFollowRequestAccepted);
      socket.off("followRequestAccepted", handleFollowRequestAccepted);
      socket.off("followRequestRejected", handleFollowRequestRejected);
    };
  }, [socket]);

  // ✅ Track window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Consistent responsive layout
  const getResponsiveLayout = () => {
    if (windowWidth <= 1599) {
      // Small/normal screens - consistent left spacing
      return {
        marginLeft: "100px", // Fixed left spacing - same on all screens
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "85px", // Same top padding as message section
      };
    } else if (windowWidth <= 1920) {
      // Medium screens
      return {
        marginLeft: "50px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "85px", // Same top padding as message section
      };
    } else {
      // Large screens
      return {
        marginLeft: "50px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "85px", // Same top padding as message section
      };
    }
  };

  const layout = getResponsiveLayout();

  const formatRelativeTime = (isoDateStr) => {
    const postedDate = new Date(isoDateStr);
    const now = new Date();
    const diffInMs = now.getTime() - postedDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return `${Math.floor(diffInDays / 7)}w`;
  };

  const fetchAllNotifications = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/notifications?mode=${mode}`);
      console.log("📋 Fetched notifications:", response.data);
      if (response.data && response.data.success) {
        // ✅ Fix: Use response.data.data instead of response.data.notifications
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNotifications();
  }, [mode]);

  // ✅ Refresh notifications when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("📄 Page became visible - refreshing notifications");
        fetchAllNotifications();
      }
    };

    // Add event listener for visibility change
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // ✅ Add a manual refresh function that can be called
  const refreshNotifications = () => {
    console.log("🔄 Manual refresh triggered");
    fetchAllNotifications();
  };

  // ✅ Handle accept follow request
  const handleAcceptRequest = async (notificationId) => {
    try {
      console.log("🔄 Accepting follow request:", notificationId);
      setAcceptingIds((prev) => new Set(prev).add(notificationId));

      const response = await axiosInstance.post(`/follow/accept`, {
        notificationId,
      });

      if (response.data.success) {
        // Find the notification to get sender ID
        const notification = notifications.find(
          (n) => n._id === notificationId
        );
        const senderId = notification?.sender || notification?.data?.senderId;

        // ✅ Update local notification status immediately
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, status: "accepted" } : n
          )
        );

        // ✅ Update Redux state with sender ID
        if (senderId) {
          dispatch(addConnection(senderId));
          dispatch(removePendingRequest(senderId));
          console.log(
            "✅ Updated Redux: added connection and removed pending request"
          );
        }

        // ✅ Emit socket event for real-time updates with proper data structure
        if (socket) {
          socket.emit("acceptFollowRequest", {
            notificationId,
            senderId,
            recipientId: currentUser._id,
          });

          // ✅ Also emit for immediate local update
          socket.emit("followRequestAccepted", {
            notificationId,
            senderId,
            recipientId: currentUser._id,
          });
        }

        console.log("✅ Follow request accepted successfully");

        // ✅ Small delay to show success state
        setTimeout(() => {
          console.log("🎉 Follow request acceptance completed");
        }, 500);
      }
    } catch (error) {
      console.error("❌ Error accepting the request:", error);
    } finally {
      setAcceptingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  // ✅ Handle reject follow request
  const handleRejectRequest = async (notificationId) => {
    try {
      console.log("🔄 Rejecting follow request:", notificationId);
      setRejectingIds((prev) => new Set(prev).add(notificationId));

      const response = await axiosInstance.post(`/follow/reject`, {
        notificationId,
      });

      if (response.data.success) {
        // Find the notification to get sender ID
        const notification = notifications.find(
          (n) => n._id === notificationId
        );
        const senderId = notification?.sender || notification?.data?.senderId;

        // ✅ Update local notification status immediately
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, status: "rejected" } : n
          )
        );

        // ✅ Update Redux state with sender ID
        if (senderId) {
          dispatch(removePendingRequest(senderId));
          console.log("✅ Updated Redux: removed pending request");
        }

        // ✅ Emit socket event for real-time updates with proper data structure
        if (socket) {
          socket.emit("rejectFollowRequest", {
            notificationId,
            senderId,
            recipientId: currentUser._id,
          });

          // ✅ Also emit for immediate local update
          socket.emit("followRequestRejected", {
            notificationId,
            senderId,
            recipientId: currentUser._id,
          });
        }

        console.log("✅ Follow request rejected successfully");

        // ✅ Small delay to show success state
        setTimeout(() => {
          console.log("❌ Follow request rejection completed");
        }, 500);
      }
    } catch (error) {
      console.error("❌ Error rejecting the request:", error);
    } finally {
      setRejectingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const mentionsCount = notifications.filter(
    (n) => n.type === "mentions"
  ).length;

  const filtered = notifications.filter(
    (n) => activeTab === "all" || n.type === activeTab
  );

  // ✅ Add debugging logs
  console.log("🔍 Notifications Debug:", {
    totalNotifications: notifications.length,
    activeTab,
    filteredCount: filtered.length,
    notificationTypes: notifications.map((n) => n.type),
    sampleNotification: notifications[0],
  });

  return (
    <div className="h-screen" style={{ paddingTop: layout.topPadding }}>
      <div
        className="max-w-6xl mx-auto p-6"
        style={{
          marginLeft: layout.marginLeft,
          paddingLeft: layout.paddingLeft,
          paddingRight: layout.paddingRight,
        }}
      >
        <div className="flex gap-8">
          <div className="flex-1">
            {/* Enhanced Header with Mark All Read */}
            <div className="flex items-center justify-between mb-6 ml-[-10px]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"
                >
                  <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-semibold text-gray-900">
                  Notifications
                </h1>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Mark All Read Button */}
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingAllRead || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Mark all as read"
                >
                  <CheckCheck
                    size={16}
                    className={markingAllRead ? "animate-pulse" : ""}
                  />
                  <span className="text-sm font-medium">
                    {markingAllRead ? "Marking..." : "Mark all read"}
                  </span>
                </button>

                {/* Refresh Button */}
                <button
                  onClick={refreshNotifications}
                  disabled={loading}
                  className="text-gray-600 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full disabled:opacity-50"
                  title="Refresh notifications"
                >
                  <RotateCcw
                    size={18}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>

            <div className="flex space-x-6 border-b pb-4 mb-6">
              {[
                { key: "all", icon: null, label: "All" },
                {
                  key: "mentions",
                  icon: <MessageCircle size={18} />,
                  label: "Mentions",
                },
                { key: "jobs", icon: <Briefcase size={18} />, label: "Jobs" },
                { key: "posts", icon: <Bell size={18} />, label: "My Posts" },
              ].map(({ key, icon, label }) => (
                <button
                  key={key}
                  className={`flex items-center space-x-2 ${
                    activeTab === key
                      ? "text-blue-600 border-b-2 border-blue-600 pb-4 -mb-4"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  onClick={() => setActiveTab(key)}
                >
                  {icon}
                  <span>{label}</span>
                  {key === "mentions" && mentionsCount > 0 && (
                    <span className="bg-red-100 text-red-600 text-xs px-1.5 py-0.5 rounded-full">
                      {mentionsCount}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {loading ? (
                <p className="text-sm text-gray-500 text-center">
                  Loading notifications...
                </p>
              ) : filtered.length > 0 ? (
                filtered.map((item) => {
                  switch (item.type) {
                    case "FOLLOW_REQUEST":
                      return (
                        <div
                          key={item._id}
                          className={`relative rounded-xl p-4 shadow-sm border transition-all hover:shadow-md ${
                            item.isRead
                              ? "bg-white border-gray-100"
                              : "bg-blue-50 border-blue-200 ring-1 ring-blue-100"
                          }`}
                        >
                          {/* Unread indicator */}
                          {!item.isRead && (
                            <div className="absolute top-4 right-4">
                              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            </div>
                          )}

                          <div className="flex items-start space-x-4">
                            {/* Enhanced profile image with status ring */}
                            <div className="relative flex-shrink-0">
                              <img
                                src={
                                  item.data?.profileImage ||
                                  "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
                                }
                                alt="profile"
                                className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                              />
                              {/* Connection request icon overlay */}
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                                <User size={12} className="text-white" />
                              </div>
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Enhanced notification content */}
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900 leading-relaxed">
                                    <span className="font-semibold text-gray-900">
                                      {item.data.fullName}
                                    </span>
                                    <span className="text-gray-600 ml-1">
                                      has sent you a connection request
                                    </span>
                                  </p>

                                  {/* Time stamp with enhanced styling */}
                                  <div className="flex items-center mt-1">
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                      {formatRelativeTime(item.createdAt)}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Enhanced status and action buttons */}
                              <div className="mt-3">
                                {item.status === "accepted" ? (
                                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                      <CheckCheck
                                        size={12}
                                        className="text-white"
                                      />
                                    </div>
                                    <p className="text-sm text-green-700 font-medium">
                                      You and{" "}
                                      <span className="font-semibold">
                                        {item.data.fullName}
                                      </span>{" "}
                                      are now connected.
                                    </p>
                                  </div>
                                ) : item.status === "rejected" ? (
                                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                      <X size={12} className="text-white" />
                                    </div>
                                    <p className="text-sm text-red-700 font-medium">
                                      You rejected{" "}
                                      <span className="font-semibold">
                                        {item.data.fullName}
                                      </span>
                                      's connection request.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="flex gap-3">
                                    <button
                                      className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                      onClick={() =>
                                        handleAcceptRequest(item._id)
                                      }
                                      disabled={acceptingIds.has(item._id)}
                                    >
                                      {acceptingIds.has(item._id) ? (
                                        <div className="flex items-center justify-center gap-2">
                                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                          Accepting...
                                        </div>
                                      ) : (
                                        "Accept"
                                      )}
                                    </button>
                                    <button
                                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                      onClick={() =>
                                        handleRejectRequest(item._id)
                                      }
                                      disabled={rejectingIds.has(item._id)}
                                    >
                                      {rejectingIds.has(item._id) ? (
                                        <div className="flex items-center justify-center gap-2">
                                          <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                                          Rejecting...
                                        </div>
                                      ) : (
                                        "Reject"
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );

                    case "NEW_JOB":
                      return (
                        <div
                          key={item._id}
                          className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 relative"
                        >
                          {/* Action Icons - Top Right */}
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Pin size={16} />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex items-start space-x-4">
                            <Briefcase className="w-10 h-10 text-blue-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                New Opening at {item.data.company}:{" "}
                                {item.data.role}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.description}
                              </p>
                              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm mt-2">
                                View Job
                              </button>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatRelativeTime(item.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );

                    case "APPLICATION_STATUS_CHANGE":
                      return (
                        <div
                          key={item._id}
                          className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 relative"
                        >
                          {/* Action Icons - Top Right */}
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Pin size={16} />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex items-start space-x-4">
                            <Bell className="w-10 h-10 text-green-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {item.data.company} changed your application
                                status to{" "}
                                <span className="text-green-600 font-semibold">
                                  {item.data.status}
                                </span>
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatRelativeTime(item.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );

                    case "ACCOUNT_VERIFICATION":
                      return (
                        <div
                          key={item._id}
                          className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 relative"
                        >
                          {/* Action Icons - Top Right */}
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Pin size={16} />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex items-start space-x-4">
                            <Bell className="w-10 h-10 text-yellow-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                Your account is pending verification.
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {item.description}
                              </p>
                              <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm mt-2">
                                Mark as unread
                              </button>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatRelativeTime(item.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );

                    case "FOLLOW_ACCEPTED":
                      return (
                        <div
                          key={item._id}
                          className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 relative"
                        >
                          {/* Action Icons - Top Right */}
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Pin size={16} />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex items-start space-x-4">
                            <img
                              src={item.data?.profileImage}
                              alt="profile"
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                <span className="font-medium">
                                  {item.data.fullName}
                                </span>{" "}
                                accepted your connection request
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatRelativeTime(item.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );

                    default:
                      return (
                        <div
                          key={item._id}
                          className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 relative"
                        >
                          {/* Action Icons - Top Right */}
                          <div className="absolute top-3 right-3 flex gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Pin size={16} />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <div className="flex items-start space-x-4">
                            <Bell className="w-10 h-10 text-gray-500" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {item.title}
                              </p>
                              {item.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {item.description}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 mt-1">
                                {formatRelativeTime(item.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                  }
                })
              ) : (
                <p className="text-sm text-gray-500 text-center">
                  No notifications
                </p>
              )}
            </div>
          </div>

          <div className="w-80">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Manage your Notifications
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Adjust your preferences and other details by navigating to
                    the settings
                  </p>
                </div>
              </div>
              <button
                className="mt-4 flex items-center text-blue-600 hover:text-blue-700"
                onClick={() => navigate("/settings")}
              >
                <span>View Settings</span>
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
