import { useEffect, useState } from "react";
import {
  Bell,
  MessageCircle,
  Briefcase,
  X,
  CheckCheck,
  User,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import axiosInstance from "../../lib/axio";
import {
  addConnection,
  removePendingRequest,
  removeFollowRequest,
  addFollowRequest,
  removeConnection,
} from "../../store/features/authSlice";
import { useSocket } from "../../context/SocketProvider";

// Tabs
const TABS = [
  { key: "all", label: "All", icon: null },
  { key: "mentions", label: "Mentions", icon: <MessageCircle size={18} /> },
  { key: "jobs", label: "Jobs", icon: <Briefcase size={18} /> },
  { key: "posts", label: "My Posts", icon: <Bell size={18} /> },
];

export function NotificationPopup({ setShowPreview }) {
  const [isVisible, setIsVisible] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [acceptingIds, setAcceptingIds] = useState(new Set());
  const [rejectingIds, setRejectingIds] = useState(new Set());
  const { currentUser, mode } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const { socket } = useSocket();

  // ✅ Manual mark all as read function for popup
  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true);
      console.log("📖 [Popup] Marking all notifications as read...");
      const response = await axiosInstance.put(
        `/notifications/mark-all-read?mode=${mode}`
      );
      if (response.data.success) {
        console.log(
          `✅ [Popup] Marked ${response.data.modifiedCount} notifications as read`
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

  const handleAcceptRequest = async (notificationId) => {
    try {
      console.log("🔄 [Popup] Accepting follow request:", notificationId);
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

        // Update local notification status
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
            "✅ [Popup] Updated Redux: added connection and removed pending request"
          );
        }

        // ✅ Emit socket event for real-time updates
        if (socket) {
          socket.emit("acceptFollowRequest", {
            notificationId,
            senderId,
            recipientId: currentUser._id,
          });

          // ✅ Also emit for immediate local update across all components
          socket.emit("followRequestAccepted", {
            notificationId,
            senderId,
            recipientId: currentUser._id,
          });
        }

        console.log("✅ [Popup] Follow request accepted successfully");
      }
    } catch (error) {
      console.error("❌ [Popup] Error accepting the request:", error);
    } finally {
      setAcceptingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleRejectRequest = async (notificationId) => {
    try {
      console.log("🔄 [Popup] Rejecting follow request:", notificationId);
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

        // Update local notification status
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, status: "rejected" } : n
          )
        );

        // ✅ Update Redux state with sender ID
        if (senderId) {
          dispatch(removePendingRequest(senderId));
          console.log("✅ [Popup] Updated Redux: removed pending request");
        }

        // ✅ Emit socket event for real-time updates
        if (socket) {
          socket.emit("rejectFollowRequest", {
            notificationId,
            senderId,
            recipientId: currentUser._id,
          });

          // ✅ Also emit for immediate local update across all components
          socket.emit("followRequestRejected", {
            notificationId,
            senderId,
            recipientId: currentUser._id,
          });
        }

        console.log("✅ [Popup] Follow request rejected successfully");
      }
    } catch (error) {
      console.error("❌ [Popup] Error rejecting the request:", error);
    } finally {
      setRejectingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await axiosInstance.get(
        `/notifications/unread?mode=${mode}`
      );
      console.log(response);
      setNotifications(response.data.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const formatRelativeTime = (isoDateStr) => {
    const postedDate = new Date(isoDateStr);
    const now = new Date();
    const diff = Math.floor((now - postedDate) / 1000);

    const units = {
      minute: 60,
      hour: 3600,
      day: 86400,
      week: 604800,
      month: 2629746,
      year: 31556952,
    };

    if (diff < units.minute) return "Just now";
    if (diff < units.hour) return `${Math.floor(diff / units.minute)} min ago`;
    if (diff < units.day) return `${Math.floor(diff / units.hour)} hr ago`;
    if (diff < units.week) return `${Math.floor(diff / units.day)} days ago`;
    if (diff < units.month) return `${Math.floor(diff / units.week)} w ago`;
    if (diff < units.year) return `${Math.floor(diff / units.month)} mo ago`;
    return `${Math.floor(diff / units.year)} yr ago`;
  };

  useEffect(() => {
    if (!currentUser) return;
    fetchUnreadNotifications();
  }, [currentUser, mode]);

  if (!isVisible) return null;

  const filtered = notifications.filter(
    (n) => activeTab === "all" || n.type === activeTab
  );

  return (
    <div className="fixed top-16 right-4 w-[400px] bg-white rounded-lg shadow-lg  z-50">
      {/* Enhanced Header with Mark All Read */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
        <div className="flex items-center gap-2">
          {/* Mark All Read Button - smaller for popup */}
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAllRead}
            className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            title="Mark all as read"
          >
            <CheckCheck
              size={12}
              className={markingAllRead ? "animate-pulse" : ""}
            />
            {markingAllRead ? "..." : "Mark all"}
          </button>

          <button
            onClick={() => {
              setIsVisible(false);
              setShowPreview(false);
            }}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 px-4 pt-3 border-b">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            className={`flex items-center space-x-1 pb-2 text-sm font-medium ${
              activeTab === key
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            onClick={() => setActiveTab(key)}
          >
            {icon}
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Enhanced Notifications List */}
      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {filtered.length > 0 ? (
          filtered.map((item) => {
            switch (item.type) {
              case "FOLLOW_REQUEST":
                return (
                  <div
                    key={item._id}
                    className={`relative rounded-lg p-3 border transition-all ${
                      item.isRead
                        ? "bg-white border-gray-100"
                        : "bg-blue-50 border-blue-200 ring-1 ring-blue-100"
                    }`}
                  >
                    {/* Unread indicator */}
                    {!item.isRead && (
                      <div className="absolute top-2 right-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      </div>
                    )}

                    <div className="flex items-start space-x-3">
                      {/* Enhanced profile image */}
                      <div className="relative flex-shrink-0">
                        <img
                          src={
                            item.data?.profileImage ||
                            "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
                          }
                          alt="profile"
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <User size={10} className="text-white" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 leading-relaxed">
                          <span className="font-semibold">
                            {item.data.fullName}
                          </span>
                          <span className="text-gray-600 ml-1">
                            has sent you a connection request
                          </span>
                        </p>

                        {/* Enhanced status and actions */}
                        {item.status === "accepted" ? (
                          <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                              <CheckCheck size={8} className="text-white" />
                            </div>
                            <p className="text-xs text-green-700 font-medium">
                              Connected with {item.data.fullName}
                            </p>
                          </div>
                        ) : item.status === "rejected" ? (
                          <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                            <div className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                              <X size={8} className="text-white" />
                            </div>
                            <p className="text-xs text-red-700 font-medium">
                              Request rejected
                            </p>
                          </div>
                        ) : (
                          <div className="flex gap-2 mt-2">
                            <button
                              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                              onClick={() => handleAcceptRequest(item._id)}
                              disabled={acceptingIds.has(item._id)}
                            >
                              {acceptingIds.has(item._id) ? "..." : "Accept"}
                            </button>
                            <button
                              className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-xs font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                              onClick={() => handleRejectRequest(item._id)}
                              disabled={rejectingIds.has(item._id)}
                            >
                              {rejectingIds.has(item._id) ? "..." : "Reject"}
                            </button>
                          </div>
                        )}

                        {/* Time stamp */}
                        <p className="text-xs text-gray-500 mt-2 bg-gray-100 px-2 py-1 rounded-full inline-block">
                          {formatRelativeTime(item.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                );

              case "NEW_JOB":
                return (
                  <div key={item._id} className="flex items-start space-x-4">
                    <Briefcase className="w-10 h-10 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        New Opening at {item.data.company}: {item.data.role}
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
                );

              case "APPLICATION_STATUS_CHANGE":
                return (
                  <div key={item._id} className="flex items-start space-x-4">
                    <Bell className="w-10 h-10 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {item.data.company} changed your application status to{" "}
                        <span className="text-green-600 font-semibold">
                          {item.data.status}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                );

              case "ACCOUNT_VERIFICATION":
                return (
                  <div key={item._id} className="flex items-start space-x-4">
                    <Bell className="w-10 h-10 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Your account is pending verification.
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {item.description}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                );

              case "FOLLOW_ACCEPTED":
                return (
                  <div key={item._id} className="flex items-start space-x-4">
                    <img
                      src={item.data?.profileImage}
                      alt="profile"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
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
                );

              case "FOLLOW_ORGANIZATION":
                return (
                  <div key={item._id} className="flex items-start space-x-4">
                    <img
                      src={item.data?.profileImage}
                      alt="profile"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">
                          {item.data.fullName}
                        </span>{" "}
                        started following your organization
                      </p>
                      {/* {item.data.message && (
                        <p className="text-sm text-gray-600 mt-1">{item.data.message}</p>
                      )} */}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                );

              default:
                return (
                  <div key={item._id} className="flex items-start space-x-4">
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
                );
            }
          })
        ) : (
          <p className="text-sm text-gray-500 text-center">No notifications</p>
        )}
      </div>
    </div>
  );
}

// Add slide-in keyframe style
const styles = `
@keyframes slide-in {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}
.animate-slide-in {
  animation: slide-in 0.3s ease-out;
}
`;
if (typeof window !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}
