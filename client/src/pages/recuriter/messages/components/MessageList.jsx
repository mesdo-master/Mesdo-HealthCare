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
  let filteredConversations = users.filter(
    (conv) => conv.category === activeTab
  );

  const handleOpenMessage = (conversation) => {
    navigate(`/organization/messages/${conversation._id}`);
  };

  const [connections, setConnections] = useState([]);

  //   filteredConversations = users.filter((conv) =>
  //   conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  useEffect(() => {
    const fetchJobs = async () => {
      if (activeTab === "Recruitment") {
        try {
          const res = await axiosInstance.get("/jobs");
          setJobs(res.data.jobs || []);
        } catch (err) {
          console.error("Failed to fetch jobs", err);
        }
      }
    };
    fetchJobs();
  }, [activeTab]);

  const handleJobClick = async (job) => {
    setSelectedJob(job);
    setJobConversations(
      filteredConversations.filter((u) => u.job?.includes(job._id))
    );
  };

  console.log(jobConversations);

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
            {["Organization", "Recruitment"].map((tab) => (
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
        {activeTab === "Recruitment" ? (
          selectedJob ? (
            <div className="p-4">
              <button
                onClick={() => setSelectedJob(null)}
                className="bold space-x-2  m-2 flex justify-center items-center text-lg"
              >
                <ArrowLeft className="mx-2" size={20} /> {selectedJob.jobTitle}
              </button>
              <h2 className="text-md font-semibold mb-3">Messages</h2>
              {jobConversations.length === 0 ? (
                <p className="text-gray-500">No applicants yet.</p>
              ) : (
                jobConversations.map((con) => (
                  <UserListItem
                    key={con._id}
                    user={con}
                    selectedId={selectedId}
                    onClick={() => handleOpenMessage(con)}
                  />
                ))
              )}
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16">
              <div className="text-5xl mb-3">💬</div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                No jobs found
              </h2>
              <p className="text-gray-500  text-center max-w-xs text-sm">
                You have not posted any jobs yet. Create a job to start
                receiving messages from applicants!
              </p>
            </div>
          ) : (
            jobs.map((job) => (
              <div
                key={job._id}
                onClick={() => handleJobClick(job)}
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 transition-colors duration-200 p-5 rounded-xl"
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
          )
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-16">
            <div className="text-5xl mb-3">💬</div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1 ">
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
    </div>
  );
};

export default MessageList;
