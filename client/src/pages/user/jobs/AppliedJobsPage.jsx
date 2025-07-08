import { BsFillBookmarkCheckFill, BsThreeDotsVertical } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { FaRegBookmark } from "react-icons/fa";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../../lib/axio";

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

const AppliedJob = ({ inUserProfile }) => {
  const navigate = useNavigate();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAppliedJobs = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/userSide/applied-jobs", {
          withCredentials: true,
        });
        console.log(res.data.appliedJobs);
        setAppliedJobs(res.data.appliedJobs);
      } catch (error) {
        console.log("Error fetching applied jobs:", error);
      } finally {
        setLoading(false);
      }
    };
    getAppliedJobs();
  }, []);

  const stages = [
    "Application Received",
    "Application Under Review",
    "Interview Stage",
    "Final Stage",
  ];

  function formatRelativeTime(isoDateStr) {
    const postedDate = new Date(isoDateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - postedDate) / 1000);

    const secondsIn = {
      minute: 60,
      hour: 3600,
      day: 86400,
      week: 604800,
      month: 2629746, // Approx: 30.44 days
      year: 31556952, // Approx: 365.24 days
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
      <div
        className={`h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 ${
          !inUserProfile && " ml-[5vw] pt-[10vh]"
        }`}
      >
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1890FF]"></div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-100"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 ${
        !inUserProfile && " ml-[5vw] pt-[10vh]"
      }`}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
      {/* Top Bar */}
      {!inUserProfile && (
        <motion.div
          className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 shadow-sm"
          variants={itemVariants}
        >
          <div className="px-8 pt-6 pb-4 flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex items-start md:items-center gap-4">
              {/* Back Arrow */}
              <motion.button
                onClick={() => navigate(-1)}
                className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200/60 bg-white/70 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 shadow-sm"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={18} className="text-slate-600" />
              </motion.button>

              {/* Text block */}
              <div className="flex flex-col justify-center">
                <span className="text-sm text-slate-500 mb-1 font-medium">
                  Total Jobs Applied
                </span>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-semibold text-slate-800">
                    Applied Jobs
                  </h2>
                  <span className="bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full border border-blue-200/60 shadow-sm">
                    {appliedJobs.length} Total
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div className="max-w-7xl mx-auto p-6" variants={itemVariants}>
        {/* Header Controls */}
        <motion.div
          className="flex justify-between items-center mb-8"
          variants={itemVariants}
        >
          <p className="text-sm text-slate-600 font-medium">
            Showing {appliedJobs.length} results
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 font-medium">Sort by:</span>
            <select className="text-sm bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-300 cursor-pointer transition-all">
              <option>Recently Applied</option>
              <option>Job Title</option>
              <option>Company Name</option>
            </select>
          </div>
        </motion.div>

        {/* Jobs List */}
        <AnimatePresence>
          {appliedJobs.map((job, index) => (
            <motion.div
              key={job._id}
              variants={itemVariants}
              initial="initial"
              animate="animate"
              exit="initial"
              transition={{ delay: index * 0.05 }}
              whileHover={{
                scale: 1.01,
                y: -2,
                boxShadow:
                  "0 20px 40px -10px rgba(0, 0, 0, 0.1), 0 10px 20px -5px rgba(0, 0, 0, 0.04)",
              }}
              whileTap={{ scale: 0.99 }}
              className="bg-white/70 backdrop-blur-sm rounded-3xl px-8 py-6 mb-6 shadow-sm border border-slate-200/60 relative cursor-pointer transition-all duration-300 hover:border-slate-300/60 hover:bg-white/80"
            >
              {/* Top Section */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-5">
                  <motion.div
                    className="w-[90px] flex-shrink-0"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-[80px] h-[80px] rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-center bg-white/80 backdrop-blur-sm overflow-hidden">
                      <img
                        src={
                          job.hospitalLogo ||
                          "https://img.freepik.com/free-vector/hospital-logo-design-vector-medical-cross_53876-136743.jpg"
                        }
                        alt="Hospital Logo"
                        className="w-[70px] h-[70px] object-contain"
                        onError={(e) => {
                          e.target.src =
                            "https://img.freepik.com/free-vector/hospital-logo-design-vector-medical-cross_53876-136743.jpg";
                        }}
                      />
                    </div>
                  </motion.div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <motion.span
                        className="text-xs font-medium text-purple-700 bg-gradient-to-r from-purple-50 to-purple-100/80 px-3 py-1.5 rounded-full border border-purple-200/60 shadow-sm"
                        whileHover={{ scale: 1.05 }}
                      >
                        {job.jobStatus || "Recently active"}
                      </motion.span>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2 leading-tight">
                      {job.jobTitle}
                    </h3>
                    <p className="text-base text-slate-600 font-medium">
                      {job.HospitalName} | {job.location}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500 font-medium">
                      Applied {formatRelativeTime(job.createdAt)}
                    </span>
                    <motion.button
                      className="p-2 hover:bg-white/60 rounded-lg transition-colors backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <BsThreeDotsVertical className="text-slate-400" />
                    </motion.button>
                  </div>

                  {/* Match Percentage - Top Right */}
                  <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="w-12 h-12 rounded-full border-4 border-green-500 bg-white/90 backdrop-blur-sm mb-1 flex items-center justify-center relative shadow-sm">
                      <svg className="w-12 h-12 -rotate-90 absolute">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="#e5e7eb"
                          strokeWidth="4"
                          fill="none"
                        />
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="#10b981"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${(job.progress || 85) * 1.26} 126`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="text-xs font-bold text-green-600 z-10">
                        {job.progress || 85}%
                      </span>
                    </div>
                    <span className="text-xs text-slate-500 font-medium">
                      Match
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="relative">
                <div className="w-4/5">
                  {/* Progress Bar */}
                  <div className="relative h-2 bg-slate-100/80 rounded-full mb-4 backdrop-blur-sm">
                    <motion.div
                      className="absolute h-2 bg-gradient-to-r from-[#1890FF] to-[#40A9FF] rounded-full transition-all duration-500 shadow-sm"
                      style={{
                        width: `${
                          (job.currentStage / (stages.length - 1)) * 100
                        }%`,
                      }}
                      initial={{ width: 0 }}
                      animate={{
                        width: `${
                          (job.currentStage / (stages.length - 1)) * 100
                        }%`,
                      }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />

                    {/* Stage Indicators */}
                    <div className="absolute top-1/2 left-0 w-full flex justify-between -translate-y-1/2 px-0">
                      {stages.map((_, idx) => (
                        <motion.div
                          key={idx}
                          className={`w-4 h-4 rounded-full border-2 transition-all duration-300 shadow-sm backdrop-blur-sm ${
                            idx <= job.currentStage
                              ? "bg-[#1890FF] border-[#1890FF]"
                              : "bg-white/80 border-slate-300/60"
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.1 + 0.3 }}
                          whileHover={{ scale: 1.2 }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Stage Labels */}
                  <div className="flex justify-between text-xs text-slate-600 font-medium">
                    {stages.map((stage, index) => (
                      <span
                        key={index}
                        className={`w-1/4 text-left leading-tight ${
                          index === job.currentStage
                            ? "text-[#1890FF] font-semibold"
                            : ""
                        }`}
                      >
                        {stage}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {appliedJobs.length === 0 && (
          <motion.div className="text-center py-16" variants={itemVariants}>
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-blue-50 rounded-full flex items-center justify-center shadow-sm">
              <BsFillBookmarkCheckFill className="text-slate-400 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No Applied Jobs
            </h3>
            <p className="text-slate-600 mb-6">
              You haven't applied to any jobs yet.
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

export default AppliedJob;
