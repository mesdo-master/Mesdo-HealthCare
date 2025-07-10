import { BsFillBookmarkCheckFill, BsThreeDotsVertical } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, BookLock, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../../../lib/axio";
import JobCard from "./components/JobCard";

// Animation variants
const containerVariants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1],
      staggerChildren: 0.1,
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

// Custom wrapper component for hidden jobs with overlay
const HiddenJobCard = ({ job, onUnhide, isUnhiding }) => {
  return (
    <div className="relative">
      {/* Hidden Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/80 to-orange-50/40 backdrop-blur-[2px] rounded-3xl flex items-center justify-center z-10">
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg border border-slate-200/60 flex items-center gap-3"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <EyeOff className="text-orange-500" size={20} />
          <span className="text-sm font-medium text-slate-700">
            This job is hidden
          </span>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onUnhide(job._id);
            }}
            disabled={isUnhiding}
            className="ml-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05, y: -1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isUnhiding ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              <Eye size={16} />
            )}
            {isUnhiding ? "Unhiding..." : "Unhide"}
          </motion.button>
        </motion.div>
      </div>

      {/* JobCard underneath */}
      <JobCard
        job={{
          ...job,
          matchPercentage: job.matchPercentage || 85,
        }}
      />
    </div>
  );
};

const HiddenJobs = () => {
  const navigate = useNavigate();
  const [hiddenJobs, setHiddenJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unhidingJobId, setUnhidingJobId] = useState(null);

  useEffect(() => {
    const getHiddenJobs = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/userSide/hidden-jobs");
        console.log("Hidden jobs:", res.data.hiddenJobs);
        setHiddenJobs(res.data.hiddenJobs || []);
      } catch (error) {
        console.log("Error fetching hidden jobs:", error);
        setHiddenJobs([]); // Set empty array instead of demo data
      } finally {
        setLoading(false);
      }
    };

    getHiddenJobs();
  }, []);

  const handleUnhideJob = async (jobId) => {
    try {
      setUnhidingJobId(jobId);
      await axiosInstance.post("/userSide/unhide-job", { jobId });

      // Remove the job from hidden jobs list with animation
      setHiddenJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));

      // Show success feedback
      console.log("Job unhidden successfully");
    } catch (error) {
      console.log("Error unhiding job:", error);
      // For demo purposes, still remove from list
      setHiddenJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
    } finally {
      setUnhidingJobId(null);
    }
  };

  const formatSalary = (min, max) => {
    if (!min || !max) return "Not specified";
    const minLakhs = (min / 100000).toFixed(0);
    const maxLakhs = (max / 100000).toFixed(0);
    return `${minLakhs}-${maxLakhs}L INR/year`;
  };

  function formatRelativeTime(isoDateStr) {
    const postedDate = new Date(isoDateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - postedDate) / 1000);

    const secondsIn = {
      minute: 60,
      hour: 3600,
      day: 86400,
      week: 604800,
      month: 2629746,
      year: 31556952,
    };

    if (diffInSeconds < secondsIn.minute) {
      return "Just now";
    } else if (diffInSeconds < secondsIn.hour) {
      const mins = Math.floor(diffInSeconds / secondsIn.minute);
      return `${mins} minute${mins > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < secondsIn.day) {
      const hours = Math.floor(diffInSeconds / secondsIn.hour);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < secondsIn.week) {
      const days = Math.floor(diffInSeconds / secondsIn.day);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < secondsIn.month) {
      const weeks = Math.floor(diffInSeconds / secondsIn.week);
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < secondsIn.year) {
      const months = Math.floor(diffInSeconds / secondsIn.month);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
      const years = Math.floor(diffInSeconds / secondsIn.year);
      return `${years} year${years > 1 ? "s" : ""} ago`;
    }
  }

  if (loading) {
    return (
      <div className="ml-[5vw] pt-[10vh] h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-400"></div>
            <div className="absolute inset-0 rounded-full border-2 border-orange-100"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="ml-[5vw] pt-[10vh] min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30"
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Top Bar */}
      <motion.div
        className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 shadow-sm"
        variants={itemVariants}
      >
        <div className="px-8 pt-6 pb-4 flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-start md:items-center gap-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200/60 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 shadow-sm"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={18} className="text-slate-600" />
            </motion.button>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-2xl font-semibold text-slate-800">
                  Hidden Jobs
                </h2>
                <span className="bg-gradient-to-r from-orange-100 to-orange-50 text-orange-700 text-sm font-medium px-3 py-1.5 rounded-full border border-orange-200/60 shadow-sm">
                  {hiddenJobs.length} Hidden
                </span>
              </div>
              <span className="text-sm text-slate-500 font-sm">
                Jobs you've chosen to hide from your feed
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div className="max-w-7xl mx-auto p-6" variants={itemVariants}>
        {/* Header Controls */}
        <motion.div
          className="flex justify-between items-center mb-8"
          variants={itemVariants}
        >
          <p className="text-sm text-slate-600 font-medium">
            Showing {hiddenJobs.length} hidden jobs
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 font-medium">Sort by:</span>
            <select className="text-sm bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400/30 focus:border-orange-300 cursor-pointer transition-all">
              <option>Recently Hidden</option>
              <option>Job Title</option>
              <option>Company Name</option>
            </select>
          </div>
        </motion.div>

        {/* Jobs List */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {hiddenJobs.map((job, index) => (
              <motion.div
                key={job._id}
                variants={itemVariants}
                initial="initial"
                animate="animate"
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  y: -20,
                  transition: { duration: 0.3 },
                }}
                transition={{ delay: index * 0.05 }}
              >
                <HiddenJobCard
                  job={job}
                  onUnhide={handleUnhideJob}
                  isUnhiding={unhidingJobId === job._id}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Empty State */}
        {hiddenJobs.length === 0 && (
          <motion.div className="text-center py-16" variants={itemVariants}>
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-orange-50 rounded-full flex items-center justify-center shadow-sm">
              <BookLock className="text-slate-400 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No Hidden Jobs
            </h3>
            <p className="text-slate-600 mb-6">
              You haven't hidden any jobs yet. Hidden jobs will appear here.
            </p>
            <motion.button
              onClick={() => navigate("/jobs")}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-sm"
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Jobs
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default HiddenJobs;
