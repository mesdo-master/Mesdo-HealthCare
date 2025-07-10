import { BsFillBookmarkCheckFill, BsThreeDotsVertical } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaRegBookmark,
  FaClock,
  FaMapMarkerAlt,
  FaBuilding,
} from "react-icons/fa";
import { ArrowLeft, CheckCircle, Clock, MapPin, Building } from "lucide-react";
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

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "from-emerald-50 to-emerald-100 text-emerald-700 border-emerald-200";
      case "pending":
        return "from-amber-50 to-amber-100 text-amber-700 border-amber-200";
      case "closed":
        return "from-red-50 to-red-100 text-red-700 border-red-200";
      default:
        return "from-blue-50 to-blue-100 text-blue-700 border-blue-200";
    }
  };

  const formatSalary = (from, to) => {
    const formatAmount = (amount) => {
      if (amount >= 100000) {
        return `${(amount / 100000).toFixed(1)}L`;
      } else if (amount >= 1000) {
        return `${(amount / 1000).toFixed(0)}K`;
      }
      return amount?.toString();
    };

    if (from && to) {
      return `₹${formatAmount(from)} - ₹${formatAmount(to)}`;
    } else if (from) {
      return `₹${formatAmount(from)}+`;
    }
    return "Salary not disclosed";
  };

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
                y: -3,
                boxShadow:
                  "0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
              whileTap={{ scale: 0.99 }}
              className="bg-white/80 backdrop-blur-md rounded-2xl p-6 mb-6 shadow-lg border border-white/60 relative cursor-pointer transition-all duration-300 hover:border-white/80 hover:bg-white/90 group overflow-hidden"
            >
              {/* Subtle gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

              {/* Job Card Content */}
              <div className="relative z-10">
                {/* Header Section */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-4 flex-1">
                    {/* Company Logo */}
                    <motion.div
                      className="flex-shrink-0"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="w-16 h-16 rounded-xl border border-slate-200/60 shadow-sm flex items-center justify-center bg-white/90 backdrop-blur-sm overflow-hidden">
                        <img
                          src={
                            job.hospitalLogo ||
                            "https://img.freepik.com/free-vector/hospital-logo-design-vector-medical-cross_53876-136743.jpg"
                          }
                          alt="Hospital Logo"
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            e.target.src =
                              "https://img.freepik.com/free-vector/hospital-logo-design-vector-medical-cross_53876-136743.jpg";
                          }}
                        />
                      </div>
                    </motion.div>

                    {/* Job Details */}
                    <div className="flex-1 min-w-0">
                      {/* Status Badge */}
                      <div className="flex items-center gap-3 mb-3">
                        <motion.span
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border shadow-sm bg-gradient-to-r ${getStatusColor(
                            job.jobStatus
                          )}`}
                          whileHover={{ scale: 1.05 }}
                        >
                          <CheckCircle className="w-3 h-3 inline-block mr-1.5" />
                          {job.jobStatus || "Active"}
                        </motion.span>
                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Applied {formatRelativeTime(job.createdAt)}
                        </span>
                      </div>

                      {/* Job Title */}
                      <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight truncate">
                        {job.jobTitle}
                      </h3>

                      {/* Company & Location */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-slate-400" />
                          <span className="font-medium">
                            {job.HospitalName}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          <span>{job.location}</span>
                        </div>
                      </div>

                      {/* Job Details Tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        {job.employmentType && (
                          <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-medium">
                            {job.employmentType.charAt(0).toUpperCase() +
                              job.employmentType.slice(1)}
                          </span>
                        )}
                        {job.experience && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                            {job.experience}+ years
                          </span>
                        )}
                        <span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md font-medium">
                          {formatSalary(job.salaryRangeFrom, job.salaryRangeTo)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Match & Actions */}
                  <div className="flex flex-col items-end gap-3 ml-4">
                    {/* Actions Menu */}
                    <motion.button
                      className="p-2 hover:bg-white/60 rounded-lg transition-colors backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <BsThreeDotsVertical className="text-slate-400" />
                    </motion.button>

                    {/* Match Percentage */}
                    <motion.div
                      className="flex flex-col items-center"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="relative w-14 h-14">
                        <svg
                          className="w-14 h-14 -rotate-90"
                          viewBox="0 0 56 56"
                        >
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="#e5e7eb"
                            strokeWidth="3"
                            fill="none"
                          />
                          <circle
                            cx="28"
                            cy="28"
                            r="24"
                            stroke="url(#gradient)"
                            strokeWidth="3"
                            fill="none"
                            strokeDasharray={`${
                              (job.progress || 85) * 1.51
                            } 151`}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                          />
                          <defs>
                            <linearGradient
                              id="gradient"
                              x1="0%"
                              y1="0%"
                              x2="100%"
                              y2="100%"
                            >
                              <stop offset="0%" stopColor="#10b981" />
                              <stop offset="100%" stopColor="#059669" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-green-600">
                            {job.progress || 85}%
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-slate-500 font-medium mt-1">
                        Match
                      </span>
                    </motion.div>
                  </div>
                </div>

                {/* Application Progress Section */}
                <div className="bg-gradient-to-r from-slate-50/80 to-blue-50/80 rounded-xl p-4 border border-slate-200/40">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-slate-700">
                      Application Progress
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      {job.currentStage + 1} of {stages.length} stages
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="h-2 bg-slate-200/60 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-[#1890FF] to-[#40A9FF] rounded-full"
                        style={{
                          width: `${
                            ((job.currentStage || 0) / (stages.length - 1)) *
                            100
                          }%`,
                        }}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${
                            ((job.currentStage || 0) / (stages.length - 1)) *
                            100
                          }%`,
                        }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>

                    {/* Stage Indicators */}
                    <div className="absolute top-1/2 left-0 w-full flex justify-between -translate-y-1/2">
                      {stages.map((_, idx) => (
                        <motion.div
                          key={idx}
                          className={`w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                            idx <= (job.currentStage || 0)
                              ? "bg-[#1890FF] border-[#1890FF] shadow-sm"
                              : "bg-white border-slate-300"
                          }`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.1 + 0.3 }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Stage Labels */}
                  <div className="flex justify-between mt-3">
                    {stages.map((stage, index) => (
                      <div
                        key={index}
                        className={`flex-1 text-center ${
                          index < stages.length - 1 ? "pr-2" : ""
                        }`}
                      >
                        <span
                          className={`text-xs leading-tight font-medium ${
                            index === (job.currentStage || 0)
                              ? "text-[#1890FF] font-semibold"
                              : index <= (job.currentStage || 0)
                              ? "text-green-600"
                              : "text-slate-500"
                          }`}
                        >
                          {stage}
                        </span>
                      </div>
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
