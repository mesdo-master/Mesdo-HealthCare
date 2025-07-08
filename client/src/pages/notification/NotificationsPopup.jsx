import { useEffect, useState } from "react";
import { Bell, MessageCircle, Briefcase, X } from "lucide-react";
import { useSelector } from "react-redux";
import axiosInstance from "../../lib/axio";

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
  const { currentUser, mode } = useSelector((state) => state.auth);

  const handleAcceptRequest = async (notificationId) => {
    try {
      await axiosInstance.post(`/follow/accept`, { notificationId });
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: "accepted" } : n
        )
      );
    } catch (error) {
      console.error("Error accepting the request:", error);
    }
  };

  const handleRejectRequest = async (notificationId) => {
    try {
      await axiosInstance.post(`/follow/reject`, { notificationId });
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notificationId ? { ...n, status: "rejected" } : n
        )
      );
    } catch (error) {
      console.error("Error rejecting the request:", error);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      const response = await axiosInstance.get(`/notifications/unread?mode=${mode}`);
      console.log(response)
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
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
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

      {/* Tabs */}
      <div className="flex space-x-4 px-4 pt-3 border-b">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            className={`flex items-center space-x-1 pb-2 text-sm font-medium ${activeTab === key
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

      {/* Notifications List */}
      <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
        {filtered.length > 0 ? (
          filtered.map((item) => {
            switch (item.type) {
              case "FOLLOW_REQUEST":
                return (
                  <div key={item._id} className="flex items-start space-x-4">
                    <img
                      src={item.data?.profileImage}
                      alt="profile"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{item.data.fullName}</span> has sent you a connection request
                      </p>

                      {item.status === "accepted" ? (
                        <p className="text-sm text-green-600 mt-2 font-medium">
                          You and <span className="font-semibold">{item.data.fullName}</span> are now connected.
                        </p>
                      ) : item.status === "rejected" ? (
                        <p className="text-sm text-red-500 mt-2 font-medium">
                          You rejected <span className="font-semibold">{item.data.fullName}</span>'s connection request.
                        </p>
                      ) : (
                        <div className="flex gap-2 mt-2">
                          <button
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                            onClick={() => handleAcceptRequest(item._id)}
                          >
                            Accept
                          </button>
                          <button
                            className="bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm"
                            onClick={() => handleRejectRequest(item._id)}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatRelativeTime(item.createdAt)}
                      </p>
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
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      <button className="bg-blue-600 text-white px-3 py-1 rounded text-sm mt-2">View Job</button>
                      <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(item.createdAt)}</p>
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
                        <span className="text-green-600 font-semibold">{item.data.status}</span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(item.createdAt)}</p>
                    </div>
                  </div>
                );

              case "ACCOUNT_VERIFICATION":
                return (
                  <div key={item._id} className="flex items-start space-x-4">
                    <Bell className="w-10 h-10 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Your account is pending verification.</p>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(item.createdAt)}</p>
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
                        <span className="font-medium">{item.data.fullName}</span> accepted your connection request
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
                        <span className="font-medium">{item.data.fullName}</span>{" "}
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
                      <p className="text-sm font-medium text-gray-900">{item.title}</p>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(item.createdAt)}</p>
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
