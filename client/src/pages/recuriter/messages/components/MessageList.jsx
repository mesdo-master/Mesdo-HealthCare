import UserListItem from "../components/UserListItem";
import { ArrowLeft, Search, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import CreateGroupModal from "./CreateGroupModal";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../../../context/NotificationContextFinal";
import axiosInstance from "../../../../lib/axio";
import MesdoLogo from "../../../../assets/mesdo_logo.png";

const MessageList = ({
  users, // <------ AllConversations
  selectedId, // <------ Selected conversation ID
  setSelectedId,
  activeTab,
  setActiveTab,
  onCreateGroup,
  loading,
  error,
}) => {
  console.log("Recruiter MessageList - users:", users);
  console.log("Recruiter MessageList - activeTab:", activeTab);

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [jobConversations, setJobConversations] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const navigate = useNavigate();
  const { unreadConversations } = useNotifications();

  // ✅ ENHANCED filtering and sorting logic - prioritize unread and recent messages
  let filteredConversations = Array.isArray(users)
    ? users
        .filter((conv) => conv.category === activeTab)
        .sort((a, b) => {
          // First priority: Unread conversations come first
          const aIsUnread = unreadConversations.has(a._id);
          const bIsUnread = unreadConversations.has(b._id);

          if (aIsUnread && !bIsUnread) return -1;
          if (!aIsUnread && bIsUnread) return 1;

          // Second priority: Sort by last message time (most recent first)
          const aTime = new Date(
            a.lastMessageAt || a.updatedAt || a.createdAt || 0
          );
          const bTime = new Date(
            b.lastMessageAt || b.updatedAt || b.createdAt || 0
          );

          return bTime - aTime; // Most recent first
        })
    : [];

  const handleOpenMessage = (conversation) => {
    console.log("Opening message for conversation:", conversation);
    console.log("Setting selectedId to:", conversation._id || conversation.id);
    // ✅ Fix: Use setSelectedId with proper ID handling
    setSelectedId(conversation._id || conversation.id);
  };

  const [connections, setConnections] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      if (activeTab === "Recruitment") {
        try {
          const res = await axiosInstance.get("/jobs");
          setJobs(res.data.jobs || []);
        } catch (err) {
          console.error("Failed to fetch jobs", err);
          setJobs([]); // ✅ Set empty array on error
        }
      }
    };
    fetchJobs();
  }, [activeTab]);

  // ✅ Fixed handleJobClick function
  const handleJobClick = async (job) => {
    try {
      setSelectedJob(job);

      // ✅ Proper filtering with safety checks
      const jobRelatedConversations = filteredConversations.filter(
        (conversation) => {
          // Check if conversation has job property and it's valid
          if (!conversation.job) return false;

          // Handle different job property formats
          if (typeof conversation.job === "string") {
            return conversation.job === job._id;
          } else if (
            typeof conversation.job === "object" &&
            conversation.job._id
          ) {
            return conversation.job._id === job._id;
          } else if (Array.isArray(conversation.job)) {
            return conversation.job.includes(job._id);
          }

          return false;
        }
      );

      setJobConversations(jobRelatedConversations);
      console.log(
        "Job conversations for",
        job.jobTitle,
        ":",
        jobRelatedConversations
      );
    } catch (error) {
      console.error("Error filtering job conversations:", error);
      setJobConversations([]);
    }
  };

  console.log("Job conversations:", jobConversations);

  return (
    <div className="w-[360px] bg-white flex flex-col">
      <div className="p-10 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Messages</h1>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              className="w-full pl-9 pr-3 py-3 text-xs bg-gray-50 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-1">
          <div className="flex ml-3">
            {["Personal", "Recruitment"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 text-xs font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white text-[#1890FF] shadow-sm"
                    : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading conversations...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-red-500 text-center">
              <p>{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Retry
              </button>
            </div>
          </div>
        ) : activeTab === "Recruitment" && !selectedJob ? (
          <div className="px-10">
            {jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <img src={MesdoLogo} alt="Mesdo Logo" className="w-12 h-12" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  No jobs posted yet
                </h2>
                <p className="text-sm text-gray-500 text-center max-w-xs">
                  Create a job posting to start receiving applications and
                  conversations.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div
                    key={job._id}
                    onClick={() => handleJobClick(job)}
                    className="cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors duration-200 p-5 rounded-xl shadow-sm"
                  >
                    <h3 className="text-gray-800 mb-1 text-sm font-semibold">
                      {job.jobTitle}
                    </h3>
                    <p className="text-gray-600 mb-1 text-xs font-semibold">
                      {job.HospitalName} | {job.location}
                    </p>
                    <p className="text-gray-500 text-xs">
                      Posted {job.timeAgo || "recently"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "Recruitment" && selectedJob ? (
          <div className="px-10">
            <div className="flex items-center mb-4">
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition mr-3"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">
                  {selectedJob.jobTitle}
                </h3>
                <p className="text-xs text-gray-600">
                  {selectedJob.HospitalName}
                </p>
              </div>
            </div>

            {jobConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                  <img src={MesdoLogo} alt="Mesdo Logo" className="w-12 h-12" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  No conversations for this job
                </h2>
                <p className="text-sm text-gray-500 text-center max-w-xs">
                  Conversations with applicants will appear here when they start
                  messaging.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {jobConversations.map((conv) => (
                  <UserListItem
                    key={conv._id}
                    user={conv}
                    selectedId={selectedId}
                    onClick={() => handleOpenMessage(conv)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : activeTab === "Personal" && filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <img src={MesdoLogo} alt="Mesdo Logo" className="w-12 h-12" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No {activeTab.toLowerCase()} conversations
            </h2>
            <p className="text-sm text-gray-500 text-center max-w-xs">
              {activeTab === "Recruitment"
                ? "No recruitment-related conversations yet. Post jobs to start chatting with applicants!"
                : activeTab === "Personal"
                ? "Your personal chats will appear here. Start connecting with people!"
                : `No ${activeTab.toLowerCase()} messages yet. Start a conversation to get started!`}
            </p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
              <img src={MesdoLogo} alt="Mesdo Logo" className="w-12 h-12" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              No {activeTab.toLowerCase()} conversations
            </h2>
            <p className="text-sm text-gray-500 text-center max-w-xs">
              {activeTab === "Recruitment"
                ? "No recruitment-related conversations yet. Post jobs to start chatting with applicants!"
                : activeTab === "Personal"
                ? "Your personal chats will appear here. Start connecting with people!"
                : `No ${activeTab.toLowerCase()} messages yet. Start a conversation to get started!`}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <UserListItem
              key={conv._id}
              user={conv}
              selectedId={selectedId}
              onClick={() => handleOpenMessage(conv)}
            />
          ))
        )}
      </div>

      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        users={connections}
        onCreateGroup={onCreateGroup}
      />
    </div>
  );
};

export default MessageList;
