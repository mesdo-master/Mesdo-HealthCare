import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import {
  Bell,
  Briefcase,
  Settings,
  MessageCircle,
  ChevronRight,
  Pin,
  Trash2,
} from "lucide-react";
import axiosInstance from "../../lib/axio";


export default function NotificationPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [notifications, setNotifications] = useState([]);
 const { currentUser,mode } = useSelector((state) => state.auth);


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





  const fetchAllNotifications = async () => {
    try {
      const response = await axiosInstance.get(`/notifications/?mode=${mode}`);
      console.log(response)
      setNotifications(response.data.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };


   useEffect(() => {
    if (!currentUser) return;
    fetchAllNotifications();
  }, [currentUser,mode]);


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

  const mentionsCount = notifications.filter(
    (n) => n.type === "mentions"
  ).length;

  const filtered = notifications.filter(
    (n) => activeTab === "all" || n.type === activeTab
  );

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

  return (
    <div className="h-screen bg-gray-50 pt-[10vh]">
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
                  className={`flex items-center space-x-2 ${activeTab === key
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