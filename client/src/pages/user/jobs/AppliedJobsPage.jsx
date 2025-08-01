import { BsFillBookmarkCheckFill, BsThreeDotsVertical } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
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

  const statusStages = ["Applied", "Under Review", "Interview", "Accepted"];

  const getStatusIndex = (status) => {
    return statusStages.indexOf(status);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Applied":
        return "text-blue-600";
      case "Under Review":
        return "text-blue-600";
      case "Interview":
        return "text-purple-600";
      case "Accepted":
        return "text-green-600";
      case "Rejected":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
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
        className={`${
          !inUserProfile && " ml-[5vw] pt-[10vh]"
        } h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30`}
      >
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-400"></div>
            <div className="absolute inset-0 rounded-full border-2 border-emerald-100"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`${
        !inUserProfile && " ml-[5vw] pt-10"
      } min-h-screen bg-[#F5F7FA]`}
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
                    Applied Jobs
                  </h2>
                  <span className="bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 text-sm font-medium px-3 py-1.5 rounded-full border border-emerald-200/60 shadow-sm">
                    {appliedJobs.length} Applied
                  </span>
                </div>
                <span className="text-sm text-slate-500 font-sm">
                  Track your job applications and their current status
                </span>
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
            Showing {appliedJobs.length} applied jobs
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 font-medium">Sort by:</span>
            <select className="text-sm bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-300 cursor-pointer transition-all">
              <option>Recently Applied</option>
              <option>Job Title</option>
              <option>Company Name</option>
              <option>Status</option>
            </select>
          </div>
        </motion.div>

        {/* Jobs List using AnimatePresence for smooth transitions */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {appliedJobs.map((application, index) => {
              const job = application.job || application;
              const applicationStatus = application.status || "Applied";
              const appliedAt = application.appliedAt || job.createdAt;
              const currentStatusIndex = getStatusIndex(applicationStatus);

              return (
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
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/60 hover:shadow-lg hover:bg-white/90 transition-all duration-300 overflow-hidden"
                >
                  {/* Job Header */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex gap-4 flex-1">
                        {/* Company Logo */}
                        <div className="w-16 h-16 rounded-xl border border-slate-200/60 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 overflow-hidden flex-shrink-0 shadow-sm">
                          <img
                            src={
                              job.hospitalLogo ||
                              "https://img.freepik.com/free-vector/hospital-logo-design-vector-medical-cross_53876-136743.jpg"
                            }
                            alt="Hospital Logo"
                            className="w-12 h-12 object-cover"
                            onError={(e) => {
                              e.target.src =
                                "https://img.freepik.com/free-vector/hospital-logo-design-vector-medical-cross_53876-136743.jpg";
                            }}
                          />
                        </div>

                        {/* Job Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-slate-800 truncate">
                              {job.jobTitle}
                            </h3>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                applicationStatus
                              )} bg-current bg-opacity-10 flex-shrink-0 shadow-sm`}
                            >
                              {applicationStatus}
                            </span>
                          </div>

                          <div className="flex items-center gap-6 text-sm text-slate-600 mb-3">
                            <div className="flex items-center gap-2">
                              <Building className="w-4 h-4 text-slate-400" />
                              <span className="font-medium">
                                {job.HospitalName}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span>{job.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span>
                                Applied {formatRelativeTime(appliedAt)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-wrap">
                            {job.employmentType && (
                              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-blue-50/80 text-blue-700 border border-blue-200/60 shadow-sm">
                                {job.employmentType}
                              </span>
                            )}
                            {job.experience && (
                              <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-purple-50/80 text-purple-700 border border-purple-200/60 shadow-sm">
                                {job.experience}+ years
                              </span>
                            )}
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-emerald-50/80 text-emerald-700 border border-emerald-200/60 shadow-sm">
                              {formatSalary(
                                job.salaryRangeFrom,
                                job.salaryRangeTo
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Progress Tracker */}
                    <div className="pt-6 border-t border-slate-200/60">
                      <div className="flex items-center justify-between relative">
                        {statusStages.map((stage, index) => (
                          <div
                            key={stage}
                            className="flex flex-col items-center relative z-10"
                          >
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shadow-sm ${
                                index <= currentStatusIndex
                                  ? "bg-emerald-500 text-white shadow-emerald-200"
                                  : "bg-slate-200 text-slate-500"
                              }`}
                            >
                              {index + 1}
                            </div>
                            <div className="mt-3 text-center">
                              <div
                                className={`text-xs font-medium ${
                                  index <= currentStatusIndex
                                    ? "text-emerald-600"
                                    : "text-slate-500"
                                }`}
                              >
                                {stage}
                              </div>
                            </div>
                          </div>
                        ))}

                        {/* Progress Line */}
                        <div className="absolute top-5 left-0 right-0 h-0.5 bg-slate-200 -z-0">
                          <div
                            className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                            style={{
                              width: `${
                                (currentStatusIndex /
                                  (statusStages.length - 1)) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </AnimatePresence>

        {/* Empty State */}
        {appliedJobs.length === 0 && (
          <motion.div className="text-center py-16" variants={itemVariants}>
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-emerald-50 rounded-full flex items-center justify-center shadow-sm">
              <BsFillBookmarkCheckFill className="text-slate-400 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No Applied Jobs Yet
            </h3>
            <p className="text-slate-600 mb-6">
              You haven't applied to any jobs yet. Start exploring opportunities
              and take the next step in your career journey.
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
