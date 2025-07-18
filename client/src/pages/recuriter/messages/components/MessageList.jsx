import UserListItem from "../components/UserListItem";
import { ArrowLeft, Search } from "lucide-react";
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
}) => {
  console.log(users);

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
    navigate(`/organization/messages/${conversation._id}`);
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
    <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Messages</h2>
          <button
            onClick={() => setShowCreateGroupModal(true)}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            <Search size={20} />
          </button>
        </div>

        <div className="flex space-x-2 mb-4">
          {["Recruitment", "Groups"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === "Recruitment" && !selectedJob ? (
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Select a Job</h3>
            {jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-5xl mb-3">💼</div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  No jobs available
                </h2>
                <p className="text-gray-500 text-center max-w-xs text-sm">
                  Create a job posting to start receiving applications and
                  conversations.
                </p>
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
              <div className="flex flex-col items-center justify-center py-16">
                <div className="text-5xl mb-3">💬</div>
                <h2 className="text-lg font-semibold text-gray-800 mb-1">
                  No conversations yet
                </h2>
                <p className="text-gray-500 text-center max-w-xs text-sm">
                  No candidates have started conversations for this job yet.
                </p>
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
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16">
            <div className="text-5xl mb-3">💬</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
              No conversations yet
            </h2>
            <p className="text-gray-500 text-center max-w-xs text-sm">
              You have not started any conversations yet. Search for an
              organization or candidate to begin chatting!
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

      {showCreateGroupModal && (
        <CreateGroupModal
          isOpen={showCreateGroupModal}
          onClose={() => setShowCreateGroupModal(false)}
          users={connections}
          onCreateGroup={onCreateGroup}
        />
      )}
    </div>
  );
};

export default MessageList;
