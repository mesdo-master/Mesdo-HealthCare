import { BsFillBookmarkCheckFill, BsThreeDotsVertical } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
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

const SavedJobs = ({ inUserProfile }) => {
  const navigate = useNavigate();
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unsavingJobId, setUnsavingJobId] = useState(null);

  useEffect(() => {
    const getSavedJobs = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/userSide/saved-jobs");
        console.log("Saved jobs:", res.data.savedJobs);
        setSavedJobs(res.data.savedJobs);
      } catch (error) {
        console.log("Error fetching saved jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    getSavedJobs();
  }, []);

  //   const savedJobs = [
  //     {
  //       id: 1,
  //       title: "Dermatologist Specialist",
  //       company: "Apollo Hospital",
  //       location: "Mumbai, Maharashtra",
  //       logo: "https://randomuser.me/api/portraits/men/1.jpg",
  //       saved: true,
  //       postedTime: "2 days ago",
  //       status: "Recently active",
  //       jobType: "Full-time",
  //       experience: { min: 2, max: 5 },
  //       salary: { min: 800000, max: 1200000, currency: "INR" },
  //       skills: ["Healthcare", "Dermatology", "Dentist"],
  //       matchPercentage: 88,
  //     },
  //     {
  //       id: 2,
  //       title: "Cardiologist",
  //       company: "Fortis Hospital",
  //       location: "Delhi, India",
  //       logo: "https://randomuser.me/api/portraits/men/2.jpg",
  //       saved: true,
  //       postedTime: "1 day ago",
  //       status: "Recently active",
  //       jobType: "Part-time",
  //       experience: { min: 5, max: 8 },
  //       salary: { min: 1000000, max: 1500000, currency: "INR" },
  //       skills: ["Healthcare", "Cardiology"],
  //       matchPercentage: 92,
  //     },
  //     {
  //       id: 3,
  //       title: "Dermatologist Specialist",
  //       company: "Apollo Hospital",
  //       location: "Mumbai, Maharashtra",
  //       logo: "https://randomuser.me/api/portraits/men/3.jpg",
  //       saved: true,
  //       postedTime: "2 days ago",
  //       status: "Recently active",
  //       jobType: "Full-time",
  //       experience: { min: 2, max: 5 },
  //       salary: { min: 800000, max: 1200000, currency: "INR" },
  //       skills: ["Healthcare", "Dermatology", "Dentist"],
  //       matchPercentage: 88,
  //     },
  //   ];

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

  const formatSalary = (min, max) => {
    if (!min || !max) return "Not specified";
    const minLakhs = (min / 100000).toFixed(0);
    const maxLakhs = (max / 100000).toFixed(0);
    return `${minLakhs}-${maxLakhs}L INR/year`;
  };

  const handleUnsaveJob = async (jobId) => {
    try {
      setUnsavingJobId(jobId);
      await axiosInstance.post("/userSide/unsave-job", { jobId });
      setSavedJobs(savedJobs.filter((job) => job._id !== jobId));
    } catch (error) {
      console.log("Error unsaving job:", error);
    } finally {
      setUnsavingJobId(null);
    }
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
        !inUserProfile && " ml-[5vw] pt-[10vh]"
      } min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30`}
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
                  <h2 className="text-2xl font-semibold  text-slate-800">
                    Saved Jobs
                  </h2>
                  <span className="bg-gradient-to-r from-emerald-100 to-emerald-50 text-emerald-700 text-sm font-medium px-3 py-1.5 rounded-full border border-emerald-200/60 shadow-sm">
                    {savedJobs.length} Saved
                  </span>
                </div>
                <span className="text-sm text-slate-500 font-sm">
                  Jobs you've bookmarked for later
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
            Showing {savedJobs.length} saved jobs
          </p>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-600 font-medium">Sort by:</span>
            <select className="text-sm bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-xl px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:border-emerald-300 cursor-pointer transition-all">
              <option>Recently Saved</option>
              <option>Job Title</option>
              <option>Company Name</option>
              <option>Salary Range</option>
            </select>
          </div>
        </motion.div>

        {/* Jobs List using JobCard component */}
        <AnimatePresence mode="popLayout">
          <div className="space-y-4">
            {savedJobs.map((job, index) => (
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
                <JobCard
                  job={{
                    ...job,
                    matchPercentage: job.matchPercentage || 85,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Empty State */}
        {savedJobs.length === 0 && (
          <motion.div className="text-center py-16" variants={itemVariants}>
            <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-emerald-50 rounded-full flex items-center justify-center shadow-sm">
              <Bookmark className="text-slate-400 text-2xl" />
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No Saved Jobs
            </h3>
            <p className="text-slate-600 mb-6">
              You haven't saved any jobs yet. Start browsing to bookmark jobs
              you're interested in.
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

export default SavedJobs;
