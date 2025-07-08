    import React, { useEffect, useState } from "react";
import {
  Bell,
  Briefcase,
  Settings,
  MessageCircle,
  ChevronRight,
  Pin,
  Trash2,
} from "lucide-react";

function NotificationItem({
  avatar,
  title,
  description,
  time,
  showMarkUnread,
  actionButton,
  isPinned,
  onDelete,
  onPin,
}) {
  return (
    <div
      className={`p-6 flex items-start space-x-4 ${
        isPinned ? "bg-blue-50" : ""
      }`}
    >
      {avatar ? (
        <img src={avatar} alt="" className="w-10 h-10 rounded-full" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <Bell size={20} className="text-gray-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        {description && (
          <div className="text-sm text-gray-600 mt-1">{description}</div>
        )}
        <div className="text-xs text-gray-500 mt-1">{time}</div>
        {actionButton && <div className="mt-3">{actionButton}</div>}
      </div>
      <div className="flex space-x-2">
        <button
          className={`p-1 ${
            isPinned ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
          }`}
          onClick={onPin}
        >
          <Pin size={16} />
        </button>
        <button
          className="p-1 text-gray-400 hover:text-red-600"
          onClick={onDelete}
        >
          <Trash2 size={16} />
        </button>
      </div>
      {showMarkUnread && (
        <button className="text-sm text-blue-600 hover:text-blue-700 whitespace-nowrap">
          Mark as unread
        </button>
      )}
    </div>
  );
}

export default function NotificationApp() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);

  // Simulated backend fetch
  const fetchNotifications = async () => {
    // replace with actual API call
    const data = [
      {
        id: 1,
        type: "all",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&h=50&fit=crop",
        title: "Dr. Krishna and 3 others have added comments on your post",
        description:
          "15 more opening at your alerted company within the last hour, Apply Now!",
        time: "Today at 9:42 AM",
        isPinned: false,
      },
      {
        id: 2,
        type: "mentions",
        avatar:
          "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=50&h=50&fit=crop",
        title: (
          <>
            Healthcare{" "}
            <span className="text-gray-600">
              has changed your application status to
            </span>{" "}
            <span className="text-green-500">SHORTLISTED</span>
          </>
        ),
        time: "Today at 9:42 AM",
        isPinned: false,
      },
      {
        id: 3,
        type: "all",
        title: "Your account is pending verification.",
        description: "Verify your account for continued experience.",
        time: "Today at 9:42 AM",
        showMarkUnread: true,
        isPinned: false,
      },
      {
        id: 4,
        type: "jobs",
        title: "New Opening at HealthCare: Radiologist",
        description:
          "15 more opening at your alerted company within the last hour, Apply Now!",
        time: "Today at 9:42 AM",
        actionButton: (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            View Job
          </button>
        ),
        isPinned: false,
      },
    ];
    setNotifications(data);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleDelete = async (id) => {
    // await deleteNotificationAPI(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const handlePin = async (id) => {
    // await pinNotificationAPI(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const filteredNotifications = notifications
    .filter(
      (notification) => activeTab === "all" || notification.type === activeTab
    )
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  const mentionsCount = notifications.filter(
    (n) => n.type === "mentions"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex gap-8">
          <div className="flex-1">
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

            <div className="bg-white rounded-lg shadow divide-y">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  {...notification}
                  onDelete={() => handleDelete(notification.id)}
                  onPin={() => handlePin(notification.id)}
                />
              ))}
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
              <button className="mt-4 flex items-center text-blue-600 hover:text-blue-700">
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