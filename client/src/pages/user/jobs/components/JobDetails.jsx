import { useState, useEffect, Fragment } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Hospital,
  ChevronRight,
  ExternalLink,
  Edit,
  XCircleIcon,
  X,
  MessageCircle,
} from "lucide-react";
import { AiOutlineUp, AiOutlineDown } from "react-icons/ai";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import {
  MdLocalHospital,
  MdWorkOutline,
  MdWorkspacesOutline,
} from "react-icons/md";
import HospitalDetails from "./HospitalDetails";
import JobCard from "./JobCard";
import axiosInstance from "../../../../lib/axio";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentJobOrganisationData } from "../../../../store/features/user/jobSlice";
import MessageSkeleton from "../../messages/MessageSkeleton";
import { getMessageDateLabel } from "../../../../lib/utils";
import MessageInput from "./MessageInput";
import { useSocket } from "../../../../context/SocketProvider";
import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BLUE = "#1890FF";

// Animation variants
const containerVariants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const itemVariants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

const MatchPercentage = ({ job, user }) => {
  // Weighted job match calculation (same as JobPage)
  function calculateMatchPercentage(job, user) {
    if (!user) return 0;
    // --- Skills ---
    const jobSkills = Array.isArray(job.skills)
      ? job.skills.map((s) => s.toLowerCase())
      : [];
    const userSkills = Array.isArray(user.skills)
      ? user.skills.map((s) => s.toLowerCase())
      : [];
    let skillScore = 0;
    if (jobSkills.length > 0 && userSkills.length > 0) {
      const matchedSkills = userSkills.filter((s) => jobSkills.includes(s));
      skillScore = matchedSkills.length / jobSkills.length;
    }
    // --- Experience ---
    let userExp = 0;
    if (Array.isArray(user.workExperience) && user.workExperience.length > 0) {
      userExp = Math.max(
        ...user.workExperience.map((exp) => {
          if (exp.startDate && exp.endDate) {
            return (
              (new Date(exp.endDate) - new Date(exp.startDate)) /
              (1000 * 60 * 60 * 24 * 365)
            );
          } else if (exp.startDate && exp.currentlyWorking) {
            return (
              (Date.now() - new Date(exp.startDate)) /
              (1000 * 60 * 60 * 24 * 365)
            );
          }
          return 0;
        })
      );
    }
    const jobExp = Number(job.experience) || 0;
    let expScore = 0;
    if (jobExp > 0) {
      expScore = Math.min(userExp / jobExp, 1);
    } else {
      expScore = 1;
    }
    // --- Location ---
    let locationScore = 0;
    if (user.city && job.location) {
      locationScore =
        user.city.toLowerCase() === job.location.toLowerCase() ? 1 : 0;
    } else {
      locationScore = 0.5;
    }
    // --- Salary ---
    let salaryScore = 0;
    if (user.expectedSalary && job.salaryRangeFrom && job.salaryRangeTo) {
      salaryScore =
        user.expectedSalary >= job.salaryRangeFrom &&
        user.expectedSalary <= job.salaryRangeTo
          ? 1
          : 0;
    } else {
      salaryScore = 0.5;
    }
    // --- Weighted sum ---
    const match =
      skillScore * 65 + expScore * 20 + locationScore * 10 + salaryScore * 5;
    return Math.round(match);
  }

  const percentage = calculateMatchPercentage(job, user);

  const skills = [
    { name: "Communication", matched: true },
    { name: "Manual Dexterity", matched: false },
  ];
  const languages = [
    { name: "Hindi", matched: true },
    { name: "English", matched: false },
  ];
  const specializations = [
    { name: "Orthodontics", matched: true },
    { name: "Periodontics", matched: false },
  ];

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100 mt-6"
      layout
    >
      <h3 className="text-base font-medium text-gray-800 mb-1 text-start">
        Match Percentage
      </h3>
      <p className="text-sm text-gray-500 text-start">
        Here's how well this candidate matches your job criteria.
      </p>

      <div className="mx-auto my-6" style={{ width: 120, height: 120 }}>
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            textSize: "20px",
            pathColor: BLUE,
            textColor: "#1F2937",
            trailColor: "#E5E7EB",
          })}
          strokeWidth={10}
        />
      </div>
      <p className="text-2xl font-medium text-gray-800">{percentage}%</p>
      <p className="text-sm text-gray-500 mb-4">Match Score</p>
      <hr className="mb-4" />

      <DetailSection title="Qualification" items={["MBBS"]} matched />
      <DetailSection title="Experience" items={["6 Year"]} matched={false} />
      <DetailSection title="Skills" items={skills} />
      <DetailSection title="Language" items={languages} />
      <DetailSection title="Specialization" items={specializations} />
    </motion.div>
  );
};

const MatchPercentageSkeleton = () => (
  <motion.div
    variants={itemVariants}
    className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100 mt-6"
    layout
  >
    <div className="h-4 bg-gray-200 rounded-md mb-3 animate-pulse"></div>
    <div className="h-3 bg-gray-200 rounded-md mb-6 animate-pulse"></div>

    <div className="mx-auto my-6 w-[120px] h-[120px] bg-gray-200 rounded-full animate-pulse"></div>

    <div className="h-6 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
    <div className="h-3 bg-gray-200 rounded-md mb-4 animate-pulse"></div>
    <hr className="mb-4" />

    {/* Skeleton sections */}
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="text-left mt-4">
        <div className="h-4 bg-gray-200 rounded-md mb-2 animate-pulse"></div>
        <div className="flex flex-wrap gap-2 mt-2">
          <div className="h-7 w-16 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-7 w-20 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
      </div>
    ))}
  </motion.div>
);

const DetailSection = ({ title, items, matched = true }) => (
  <div className="text-left mt-4">
    <h3 className="text-lg font-medium text-gray-800">{title}</h3>
    <div className="flex flex-wrap gap-2 mt-2">
      {items.map((item) => {
        const name = typeof item === "string" ? item : item.name;
        const isMatched = typeof item === "string" ? matched : item.matched;
        return (
          <span
            key={name}
            className={`inline-block text-sm py-1 px-3 rounded-md ${
              isMatched ? "bg-[#1890FF] text-white" : "bg-red-100 text-red-600"
            }`}
          >
            {name}
          </span>
        );
      })}
    </div>
  </div>
);

const ReviewRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 mb-3 text-sm">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium text-right text-gray-800">{value}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-4">
    <h2 className="text-lg font-medium mb-4">{title}</h2>
    {children}
  </div>
);

const Tag = ({ label }) => (
  <span className="px-4 py-1 bg-gray-100 rounded-full text-gray-700 text-sm">
    {label}
  </span>
);

const InfoItem = ({ label, value, isLink = false }) => (
  <div className="flex justify-between items-start gap-4 py-1">
    <span className="text-[14px] text-gray-600 flex-shrink-0 min-w-0">
      {label}
    </span>
    {isLink ? (
      <a
        href={`https://${value}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[14px] text-[#1890FF] hover:underline flex items-center text-right flex-shrink-0"
      >
        {value}
        <ExternalLink className="w-3 h-3 ml-1" />
      </a>
    ) : (
      <span className="text-[14px] text-gray-900 text-right flex-shrink-0 max-w-[60%]">
        {value}
      </span>
    )}
  </div>
);

const JobDetails = ({ onClose }) => {
  const { jobId } = useParams(); // Get jobId from URL params
  const [organizationData, setOrganizationData] = useState({});
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [conversation, setConversation] = useState([]);
  const [otherUser, setOtherUser] = useState("");
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true); // rectify it again to true
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Job Description");
  const dispatch = useDispatch();

  const [similarJobs, setSimilarJobs] = useState([]);

  const {
    handleCloseDetails,
    jobs = [],
    jobId: outletJobId,
  } = useOutletContext();
  const navigate = useNavigate();
  // Find current job index
  const currentIndex = jobs.findIndex((j) => j._id === outletJobId);
  const prevJobId = currentIndex > 0 ? jobs[currentIndex - 1]?._id : null;
  const nextJobId =
    currentIndex < jobs.length - 1 ? jobs[currentIndex + 1]?._id : null;

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyNote, setApplyNote] = useState("");

  useEffect(() => {
    const fetchJobDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axiosInstance.get(`userSide/${jobId}`);

        if (!res.data) {
          throw new Error("Empty response from server");
        }

        const jobData = res.data.job || res.data;

        if (!jobData) {
          throw new Error("Invalid job data format");
        }

        const response = await axiosInstance.get(`/jobs/getOrgLogo`, {
          params: { orgId: jobData.organization },
        });

        setOrganizationData(response.data);
        dispatch(setCurrentJobOrganisationData(response.data));

        setJob(jobData);
      } catch (err) {
        console.error("Detailed error:", {
          message: err.message,
          response: err.response,
          stack: err.stack,
        });

        let errorMessage = "Failed to load job details";

        if (err.response) {
          errorMessage =
            err.response.data?.message ||
            `Server error: ${err.response.status}`;
        } else if (err.request) {
          errorMessage = "No response from server - is it running?";
        } else {
          errorMessage = err.message;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchJobDetails();
  }, [jobId]);

  const { currentUser, businessProfile } = useSelector((state) => state.auth);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const isApplied = job?.applied?.some(
      (userId) => (userId?._id || userId)?.toString() === currentUser?._id
    );
    setHasApplied(isApplied);
  }, [job, currentUser?._id]);

  useEffect(() => {
    const fetchSimilarJobs = async () => {
      if (!job?.jobTitle) return; // Don't fetch if no job title

      try {
        const response = await axiosInstance.post("/userSide/filters", {
          jobTitle: job.jobTitle,
        });
        setSimilarJobs(
          response.data.filter((similarJob) => similarJob._id !== jobId)
        );
      } catch (error) {
        console.error("Error fetching similar jobs:", error);
        setSimilarJobs([]); // Set empty array on error
      }
    };
    fetchSimilarJobs();
  }, [job?.jobTitle, jobId]); // Add jobId dependency

  const handleApplyJob = async () => {
    try {
      await axiosInstance.post(`/userSide/applyJob`, {
        jobId,
        note: applyNote,
      });
      setHasApplied(true);
      setShowApplyModal(false);
    } catch (error) {
      console.error("Error applying for job:", error);
    }
  };

  function formatSalaryRange(job) {
    const minSalary = job.salaryRangeFrom || 0;
    const maxSalary = job.salaryRangeTo || 0;

    // Convert rupees to lakhs (divide by 100,000)
    const minLakhs = (minSalary / 100000).toFixed(0);
    const maxLakhs = (maxSalary / 100000).toFixed(0);

    if (minSalary === 0 && maxSalary === 0) {
      return "Not specified";
    } else if (minLakhs === maxLakhs) {
      return `${minLakhs}L`;
    } else {
      return `${minLakhs}-${maxLakhs}L`;
    }
  }

  const [conversationId, setConversationId] = useState();

  const socket = useSocket();

  useEffect(() => {
    if (!socket || !otherUser || !currentUser) return;

    const handleNewMessage = (newMessage) => {
      // Check if the sender is either the current user or the otherUser
      console.log(otherUser);
      console.log(businessProfile._id);
      console.log("newMessage", newMessage);
      if (
        (newMessage.sender === otherUser[0] &&
          newMessage.receiver === currentUser._id) ||
        (newMessage.receiver === otherUser[0] &&
          newMessage.sender === currentUser._id)
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [socket, currentUser, otherUser]);

  const messageEndRef = useRef(null);
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    const initaiteMessages = async () => {
      try {
        const res = await axiosInstance.post("/jobs/initiate", { jobId });
        // console.log(res)
        setConversationId(res.data.conversationId);
      } catch (error) {
        console.error("Error initiating chat:", error);
      }
    };
    initaiteMessages();
  }, []);

  useEffect(() => {
    if (!conversationId) return;

    const getMessages = async () => {
      setIsMessageLoading(true);
      try {
        const response = await axiosInstance.get(
          `/jobs/getMessages/${conversationId}`
        );
        console.log(response);
        const { messages, otherUser } = response.data;
        setMessages(messages);
        setOtherUser(Array.isArray(otherUser) ? otherUser : [otherUser]);
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsMessageLoading(false);
      }
    };

    getMessages();
  }, [conversationId]);

  if (loading) {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="flex justify-center items-center h-64"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="p-6"
      >
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading job details
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
                <p className="mt-2">
                  Please check:
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Is the backend server running?</li>
                    <li>Is the job ID correct?</li>
                    <li>Check browser console for more details</li>
                  </ul>
                </p>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </motion.div>
    );
  }

  if (!job) {
    return (
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        className="p-6 text-center"
      >
        <p className="text-gray-500">No job data found</p>
      </motion.div>
    );
  }

  const emptyMessagesText = [
    "No messages yet. Looks like a clean slate 🧼",
    "Still waiting for the first word... 🐣",
    "Nobody's home... yet! 👻",
    "Start the conversation before it becomes a staring contest 👀",
    "This space is emptier than your fridge at midnight 🍽️",
  ];

  // Mock similar jobs data (you might want to fetch this from API)
  const piimage =
    "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif";

  const getRandomEmptyText = () =>
    emptyMessagesText[Math.floor(Math.random() * emptyMessagesText.length)];

  const groupedMessages = messages.reduce((acc, msg) => {
    const label = getMessageDateLabel(msg.createdAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(msg);
    return acc;
  }, {});

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full w-full bg-[#F7F8FA] overflow-y-auto"
      style={{ minHeight: "100vh" }}
      layout
    >
      {/* Top Bar */}
      <motion.div
        variants={itemVariants}
        className="sticky top-0 h-16 bg-white flex items-center justify-between px-8 z-10 border-b border-[#E5E7EB]"
        layout
      >
        <div className="flex items-center gap-3 ml-2">
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50"
            onClick={() => prevJobId && navigate(`/jobs/${prevJobId}`)}
            aria-label="Previous Job"
            disabled={!prevJobId}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="#BDBDBD"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50"
            onClick={() => nextJobId && navigate(`/jobs/${nextJobId}`)}
            aria-label="Next Job"
            disabled={!nextJobId}
          >
            <svg
              width="18"
              height="18"
              fill="none"
              stroke="#BDBDBD"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button
          onClick={handleCloseDetails}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 mr-2"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-700" />
        </button>
      </motion.div>

      {/* Job Header */}
      <motion.div
        variants={itemVariants}
        className="bg-white shadow-sm border-b border-gray-200"
        layout
      >
        <div className="flex items-center justify-between px-8 pt-6 pb-4">
          <div className="flex items-center gap-5 flex-1">
            <motion.img
              src={
                organizationData.orgLogo ||
                "https://img.freepik.com/free-vector/hospital-logo-design-vector-medical-cross_53876-136743.jpg?semt=ais_hybrid&w=740"
              }
              alt={organizationData.name}
              className="w-16 h-16 rounded-lg object-contain border border-gray-100"
              onError={(e) => {
                e.target.src =
                  "https://img.freepik.com/free-vector/hospital-logo-design-vector-medical-cross_53876-136743.jpg?semt=ais_hybrid&w=740";
              }}
              loading="eager"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
            <div className="flex flex-col gap-1">
              <motion.span
                className="bg-purple-50 text-purple-600 text-xs font-medium px-2.5 py-1 rounded-full w-fit mb-1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Recently active
              </motion.span>
              <motion.span
                className="text-2xl font-medium text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                {job.jobTitle}
              </motion.span>
              <motion.span
                className="text-base text-gray-500 font-normal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {organizationData.name} | {job.location}
              </motion.span>
            </div>
          </div>
          <motion.div
            className="flex gap-3 items-center"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            {/* Apply Now / Sent button */}
            {!hasApplied ? (
              <button
                className="px-8 py-2 rounded-md text-white text-base font-medium shadow-sm bg-[#1890FF] hover:bg-[#175CD3] transition"
                onClick={() => setShowApplyModal(true)}
              >
                Apply Now
              </button>
            ) : (
              <span className="px-6 py-2 rounded-md bg-green-100 text-green-700 text-base font-medium flex items-center gap-2">
                Sent{" "}
                <svg
                  className="w-5 h-5 text-green-600 inline-block ml-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </span>
            )}
          </motion.div>
        </div>

        {/* Tabs */}
        <motion.div
          className="flex gap-8 px-8 border-b text-base font-medium"
          variants={itemVariants}
          layout
        >
          <button
            className={`flex items-center gap-2 py-3 border-b-2 transition-all font-inter ${
              activeTab === "Job Description"
                ? "border-[#222] text-[#222] "
                : "border-transparent text-gray-500 hover:text-[#222]"
            }`}
            onClick={() => setActiveTab("Job Description")}
          >
            <MdWorkOutline size={18} /> Job Description
          </button>
          <button
            className={`flex items-center gap-2 py-3 border-b-2 transition-all ${
              activeTab === "Hospital Detail"
                ? "border-[#222] text-[#222]"
                : "border-transparent text-gray-500 hover:text-[#222]"
            }`}
            onClick={() => setActiveTab("Hospital Detail")}
          >
            <MdLocalHospital size={18} /> Hospital Detail
          </button>
          <button
            className={`flex items-center gap-2 py-3 border-b-2 transition-all ${
              activeTab === "Similar Job"
                ? "border-[#222] text-[#222]"
                : "border-transparent text-gray-500 hover:text-[#222]"
            }`}
            onClick={() => setActiveTab("Similar Job")}
          >
            <MdWorkspacesOutline size={18} /> Similar Job
          </button>
        </motion.div>
      </motion.div>

      {/* Content Area */}
      <motion.div
        className="flex flex-row gap-6 p-6 min-h-0"
        variants={itemVariants}
        layout
      >
        <motion.div className="flex-1 min-w-0 flex flex-col gap-6" layout>
          {/* Job Description Tab - Always rendered, visibility controlled */}
          <motion.div
            className={activeTab === "Job Description" ? "block" : "hidden"}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: activeTab === "Job Description" ? 1 : 0,
              y: activeTab === "Job Description" ? 0 : 20,
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Job Description Content */}
            <motion.div
              className="bg-transparent w-full"
              variants={itemVariants}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  {
                    icon: MapPin,
                    label: "Area",
                    value: job.location || "Chembur",
                  },
                  {
                    icon: Briefcase,
                    label: "Job-Type",
                    value: job.employmentType || "Full-Time",
                  },
                  {
                    icon: DollarSign,
                    label: "Salary",
                    value: formatSalaryRange(job),
                  },
                  {
                    icon: Clock,
                    label: "Experience",
                    value: job.experience || "Not specified",
                  },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    className="bg-white rounded-xl shadow-sm flex flex-col items-start justify-center h-[120px] px-4 font-inter text-sm"
                    style={{ fontFamily: "Inter, sans-serif" }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    layout
                  >
                    <item.icon className="w-5 h-5 text-[#1890FF] mb-2" />
                    <div
                      className="text-base font-medium text-gray-900 text-left mb-1 font-inter text-mb"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {item.value}
                    </div>
                    <div
                      className="text-xs text-gray-400 text-left font-inter"
                      style={{ fontFamily: "Inter, sans-serif" }}
                    >
                      {item.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-6"
              variants={itemVariants}
              layout
            >
              <Section title="Job Description">
                <p className="text-gray-700 text-sm">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: job.jobDescription,
                    }}
                  />
                </p>
              </Section>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-6"
              variants={itemVariants}
              layout
            >
              <Section title="Specialization Required">
                <div className="flex flex-wrap gap-2 mb-2">
                  {job.skills && job.skills.length > 0
                    ? job.skills.map((skill) => (
                        <Tag key={skill} label={skill} />
                      ))
                    : [
                        "Hospital",
                        "Clinic",
                        "Health Insurance",
                        "Pharmacy",
                      ].map((tag) => <Tag key={tag} label={tag} />)}
                </div>
              </Section>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-6"
              variants={itemVariants}
              layout
            >
              <Section title="Additional Detail">
                <div className="space-y-3">
                  <ReviewRow
                    label="Employment Type"
                    value={job.employmentType}
                  />
                  <ReviewRow
                    label="Experience Required"
                    value={job.experience}
                  />
                  <ReviewRow label="Job Category" value={job.jobCategory} />
                  <ReviewRow label="Number of Openings" value={job.openings} />
                  <ReviewRow
                    label="Salary Range"
                    value={`${formatSalaryRange(job)}/year`}
                  />
                  <ReviewRow
                    label="Skills"
                    value="Communication, Manual Dexterity"
                  />
                  <ReviewRow label="Qualification Required" value="MBBS" />
                  <ReviewRow label="Department" value="Dentist" />
                  <ReviewRow label="Shift" value="Morning Shift (9am - 3pm)" />
                  <ReviewRow
                    label="Preferred Language"
                    value="English, Hindi"
                  />
                  <ReviewRow
                    label="Specialization Required"
                    value="Orthodontics, Periodontics"
                  />
                </div>
              </Section>
            </motion.div>
          </motion.div>

          {/* Hospital Detail Tab - Always rendered, visibility controlled */}
          <motion.div
            className={activeTab === "Hospital Detail" ? "block" : "hidden"}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: activeTab === "Hospital Detail" ? 1 : 0,
              y: activeTab === "Hospital Detail" ? 0 : 20,
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Hospital Details - Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
              {/* Left Column - Main Content (2/3 width) */}
              <div className="lg:col-span-2 space-y-6 w-[640px]">
                {/* About */}
                <motion.div
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  variants={itemVariants}
                  layout
                >
                  <Section title="About">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Lorem ipsum dolor sit amet consectetur. Duis rutrum eu
                      vitae sed consequat at elit sit. Aenean tellus hac eu
                      accumsan non. Sagittis etiam odio viverra in sit. Lobortis
                      ac et platea sed.
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed mt-4">
                      Leo interdum cum augue tellus vitae. Lacus neque sodales
                      duis tortor pharetra et. Nibh molestie in sed id faucibus
                      amet. Pellentesque aenean consectetur proin faucibus purus
                      blandit. Rutrum nullam lacinia bibendum sed varius. Mauris
                      quis sit ultrices diam. Commodo etiam rhoncus cras
                      imperdiet consectetur ac. In scelerisque amet eget cras
                      et.
                    </p>
                  </Section>
                </motion.div>

                {/* Specialties */}
                <motion.div
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  variants={itemVariants}
                  layout
                >
                  <Section title="Specialties">
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Hospital",
                        "Clinic",
                        "Health Insurance",
                        "Pharmacy",
                        "Apollo Lifeline",
                        "Apollo Lifeline",
                        "Apollo Lifeline",
                        "Apollo Lifeline",
                        "Loren Ipsum",
                      ].map((specialty, idx) => (
                        <motion.span
                          key={`${specialty}-${idx}`}
                          className="px-4 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                        >
                          {specialty}
                        </motion.span>
                      ))}
                    </div>
                  </Section>
                </motion.div>

                {/* Jobs */}
                <motion.div
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 min-h-[200px]"
                  variants={itemVariants}
                  layout
                >
                  <Section title="Jobs">
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">
                        No job listings available at the moment.
                      </p>
                    </div>
                  </Section>
                </motion.div>

                {/* People at Apollo */}
                <motion.div
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  variants={itemVariants}
                  layout
                >
                  <Section title="People at Apollo">
                    <div className="space-y-4">
                      {[
                        {
                          name: "Alena Baptista",
                          role: "Dental Surgeon | Apollo Hospitals",
                          image:
                            "https://randomuser.me/api/portraits/men/1.jpg",
                        },
                        {
                          name: "Mira Curtis",
                          role: "Dental Surgeon | Apollo Hospitals",
                          image:
                            "https://randomuser.me/api/portraits/women/2.jpg",
                        },
                        {
                          name: "Mira Curtis",
                          role: "Dental Surgeon | Apollo Hospitals",
                          image:
                            "https://randomuser.me/api/portraits/women/2.jpg",
                        },
                        {
                          name: "Mira Curtis",
                          role: "Dental Surgeon | Apollo Hospitals",
                          image:
                            "https://randomuser.me/api/portraits/women/2.jpg",
                        },
                      ].map((person, idx) => (
                        <motion.div
                          key={idx}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <img
                            src={person.image}
                            alt={person.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <h3 className="text-sm font-medium text-gray-900">
                              {person.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {person.role}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </Section>
                </motion.div>
              </div>

              {/* Right Column - Sidebar (1/3 width) */}
              <div className="space-y-6 w-[400px] ml-40">
                {/* More Information */}
                <motion.div
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  variants={itemVariants}
                  layout
                >
                  <Section title="More Information">
                    <div className="space-y-3 text-sm">
                      <InfoItem
                        label="Website"
                        value="www.apollo.com"
                        isLink={true}
                      />
                      <InfoItem label="Org Size" value="1000-5000" />
                      <InfoItem label="Type" value="Public" />
                      <InfoItem label="Founded" value="1999" />
                      <InfoItem
                        label="Industry"
                        value="Hospital & Healthcare"
                      />
                      <InfoItem label="Socials" value="Hospital & Healthcare" />
                    </div>
                  </Section>
                </motion.div>

                {/* Map */}
                <motion.div
                  className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100"
                  variants={itemVariants}
                  layout
                >
                  <img
                    alt="Map showing the location of the branches"
                    className="w-full h-[200px] object-cover"
                    src="https://storage.googleapis.com/a1aa/image/UON34o44GtUuLhUko-NgbOZtFjGoTkCqN7k1OGTaHPg.jpg"
                  />
                </motion.div>

                {/* Address */}
                <motion.div
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  variants={itemVariants}
                  layout
                >
                  <Section title="Address (10)">
                    <div className="space-y-4 text-sm text-gray-700">
                      <div>
                        <h3 className="font-medium">Main Branch</h3>
                        <div className="flex mt-2">
                          <MapPin className="text-gray-500 mt-0.5 w-4 h-4" />
                          <p className="ml-2">
                            Apollo Hospitals Hyderabad Hyderabad, Telangana
                            500033, IN
                          </p>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-medium">Other Branch</h3>
                        <div className="flex mt-2">
                          <MapPin className="text-gray-500 mt-0.5 w-4 h-4" />
                          <p className="ml-2">
                            Apollo Hospitals Hyderabad Hyderabad, Telangana
                            500033, IN
                          </p>
                        </div>
                        <div className="flex mt-2">
                          <MapPin className="text-gray-500 mt-0.5 w-4 h-4" />
                          <p className="ml-2">
                            Apollo Hospitals Hyderabad Hyderabad, Telangana
                            500033, IN
                          </p>
                        </div>
                      </div>
                    </div>
                    <a
                      className="text-blue-500 hover:underline flex items-center text-sm mt-4"
                      href="/"
                    >
                      See All <ChevronRight className="w-4 h-4 ml-1" />
                    </a>
                  </Section>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Similar Job Tab - Always rendered, visibility controlled */}
          <motion.div
            className={activeTab === "Similar Job" ? "block" : "hidden"}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: activeTab === "Similar Job" ? 1 : 0,
              y: activeTab === "Similar Job" ? 0 : 20,
            }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              variants={itemVariants}
              layout
            >
              <h3 className="text-lg font-medium text-gray-800 mb-6 ">
                Similar Jobs
              </h3>
              {similarJobs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-6 ">
                  {similarJobs.map((job, idx) => (
                    <motion.div
                      key={job.id || job._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      whileHover={{ scale: 1.02 }}
                      className="w-full"
                    >
                      <JobCard job={job} small />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 ">
                  <p className="text-gray-500 text-sm">
                    No similar jobs found at the moment.
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          className="w-[340px] flex-shrink-0"
          layout
          style={{ minHeight: "400px" }}
        >
          {/* Show sidebar content ONLY for Job Description tab */}
          {activeTab === "Job Description" &&
            (job && currentUser ? (
              <MatchPercentage key="match" job={job} user={currentUser} />
            ) : (
              <MatchPercentageSkeleton key="skeleton" />
            ))}
        </motion.div>
      </motion.div>

      {/* Apply Modal with Framer Motion */}
      <AnimatePresence>
        {showApplyModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-auto flex flex-col items-center"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            >
              <h3 className="text-xl font-medium mb-2 text-gray-900 text-center">
                Apply to {organizationData.name || "Hospital"}
              </h3>
              <p className="text-gray-500 text-center mb-6">
                Check what recruiter will see your profile like →
              </p>
              <div className="w-full mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add Note
                </label>
                <textarea
                  className="w-full h-24 border border-gray-200 rounded-lg p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add a note (optional)"
                  value={applyNote}
                  onChange={(e) => setApplyNote(e.target.value)}
                />
              </div>
              <div className="flex w-full gap-3 mt-2">
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyJob}
                  className="flex-1 py-2 rounded-lg bg-[#1890FF] text-white font-medium hover:bg-[#1570EF] transition"
                >
                  Apply
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default JobDetails;
