import UserListItem from "../components/UserListItem";
import { ArrowLeft, Search, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import CreateGroupModal from "./CreateGroupModal";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../lib/axio";

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

  // ✅ Safe filtering with proper array check
  let filteredConversations = Array.isArray(users)
    ? users.filter((conv) => conv.category === activeTab)
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
    <div className="w-[360px] bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-semibold mb-4">Messages</h1>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#1890FF] w-5 h-5" />
            <input
              type="text"
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg focus:outline-none"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-1 mb-4">
          <div className="flex">
            {["Recruitment", "Groups"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white text-blue-500 shadow-sm"
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
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Select a Job</h3>
            {jobs.length === 0 ? (
              <div className="w-full min-h-0 flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50">
                <div className="backdrop-blur-md bg-white/70 border border-blue-100 rounded-2xl shadow-xl max-w-sm w-full mx-auto flex flex-col items-center py-8 px-4 sm:px-8 space-y-6">
                  <div className="flex justify-center mb-1 animate-bounce-slow">
                    <div className="w-14 h-14 rounded-xl bg-white border border-blue-100 flex items-center justify-center shadow">
                      <span className="text-blue-300 text-3xl">💼</span>
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 tracking-tight drop-shadow-sm">
                    No jobs posted yet
                  </h2>
                  <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed text-center">
                    Create a job posting to start receiving applications and
                    conversations.
                  </p>
                </div>
                <style jsx>{`
                  @keyframes bounce-slow {
                    0%,
                    100% {
                      transform: translateY(0);
                    }
                    50% {
                      transform: translateY(-8px);
                    }
                  }
                  .animate-bounce-slow {
                    animation: bounce-slow 2.5s infinite;
                  }
                `}</style>
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job._id}
                  onClick={() => handleJobClick(job)}
                  className="cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors duration-200 p-5 rounded-xl mb-3"
                >
                  <h3 className="text-lg font-semibold text-gray-800">
                    {job.jobTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {job.HospitalName} | {job.location}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Posted {job.timeAgo || "recently"}
                  </p>
                </div>
              ))
            )}
          </div>
        ) : activeTab === "Recruitment" && selectedJob ? (
          <div className="p-4">
            <div className="flex items-center mb-4">
              <button
                onClick={() => setSelectedJob(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition mr-2"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h3 className="text-lg font-semibold">
                  {selectedJob.jobTitle}
                </h3>
                <p className="text-sm text-gray-600">
                  {selectedJob.HospitalName}
                </p>
              </div>
            </div>

            {jobConversations.length === 0 ? (
              <div className="w-full min-h-0 flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50">
                <div className="backdrop-blur-md bg-white/70 border border-blue-100 rounded-2xl shadow-xl max-w-sm w-full mx-auto flex flex-col items-center py-8 px-4 sm:px-8 space-y-6">
                  <div className="flex justify-center mb-1 animate-bounce-slow">
                    <div className="w-14 h-14 rounded-xl bg-white border border-blue-100 flex items-center justify-center shadow">
                      <span className="text-blue-300 text-3xl">💬</span>
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 tracking-tight drop-shadow-sm">
                    No conversations yet
                  </h2>
                  <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed text-center">
                    Conversations will appear here when applicants message you
                    about this job.
                  </p>
                </div>
                <style jsx>{`
                  @keyframes bounce-slow {
                    0%,
                    100% {
                      transform: translateY(0);
                    }
                    50% {
                      transform: translateY(-8px);
                    }
                  }
                  .animate-bounce-slow {
                    animation: bounce-slow 2.5s infinite;
                  }
                `}</style>
              </div>
            ) : (
              jobConversations.map((conv) => (
                <UserListItem
                  key={conv._id}
                  user={conv}
                  selectedId={selectedId}
                  onClick={() => handleOpenMessage(conv)}
                />
              ))
            )}
          </div>
        ) : activeTab === "Groups" && filteredConversations.length === 0 ? (
          <div className="w-full min-h-0 flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50">
            <div className="backdrop-blur-md bg-white/70 border border-blue-100 rounded-2xl shadow-xl max-w-sm w-full mx-auto flex flex-col items-center py-8 px-4 sm:px-8 space-y-6">
              <div className="flex justify-center mb-1 animate-bounce-slow">
                <div className="w-14 h-14 rounded-xl bg-white border border-blue-100 flex items-center justify-center shadow">
                  <span className="text-blue-300 text-3xl">💬</span>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 tracking-tight drop-shadow-sm">
                No groups yet
              </h2>
              <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed text-center">
                No groups yet
              </p>
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Create new group"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <style jsx>{`
              @keyframes bounce-slow {
                0%,
                100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-8px);
                }
              }
              .animate-bounce-slow {
                animation: bounce-slow 2.5s infinite;
              }
            `}</style>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="w-full min-h-0 flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-pink-50">
            <div className="backdrop-blur-md bg-white/70 border border-blue-100 rounded-2xl shadow-xl max-w-sm w-full mx-auto flex flex-col items-center py-8 px-4 sm:px-8 space-y-6">
              <div className="flex justify-center mb-1 animate-bounce-slow">
                <div className="w-14 h-14 rounded-xl bg-white border border-blue-100 flex items-center justify-center shadow">
                  <span className="text-blue-300 text-3xl">💬</span>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-700 tracking-tight drop-shadow-sm">
                No conversations yet
              </h2>
              <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed text-center">
                Conversations will appear here when you start chatting.
              </p>
            </div>
            <style jsx>{`
              @keyframes bounce-slow {
                0%,
                100% {
                  transform: translateY(0);
                }
                50% {
                  transform: translateY(-8px);
                }
              }
              .animate-bounce-slow {
                animation: bounce-slow 2.5s infinite;
              }
            `}</style>
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
