import { BsFillBookmarkCheckFill, BsThreeDotsVertical } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import axiosInstance from "../../../lib/axio";
import JobCard from "./components/JobCard";
import { calculateMatchPercentage } from "../../../utils/matchPercentage";
import { useSelector, useDispatch } from "react-redux";
import { removeSavedJob } from "../../../store/features/authSlice";
import Loader from "../../../components/Loader";

// CSS for hiding scrollbar
const scrollbarStyles = `
  .savedjobs-scroll-container::-webkit-scrollbar {
    display: none;
  }
  
  .savedjobs-scroll-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = scrollbarStyles;
  document.head.appendChild(styleSheet);
}

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
  const [sortBy, setSortBy] = useState("Recently Saved");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentUser = useSelector((state) => state.auth.user);
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // ✅ Add window size tracking for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ✅ Track window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ Consistent left spacing, adaptive layout
  const getResponsiveLayout = () => {
    if (windowWidth <= 1599) {
      // Small/normal screens - consistent left spacing
      return {
        marginLeft: "90px", // Fixed left spacing - same on all screens
        paddingLeft: "32px",
        paddingRight: "32px",
        padding: "40px", // Adjusted for jobs page
      };
    } else if (windowWidth <= 1920) {
      // Medium screens
      return {
        marginLeft: "20px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        padding: "40px",
      };
    } else {
      // Large screens
      return {
        marginLeft: "20px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        padding: "40px",
      };
    }
  };

  const layout = getResponsiveLayout();

  // Custom job card component matching Applied Jobs UI
  const SavedJobCard = ({ job }) => {
    const formatRelativeTime = (isoDateStr) => {
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
    };

    const matchPercentage = calculateMatchPercentage(job, currentUser);

    return (
      <motion.div
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200/60 hover:shadow-lg hover:bg-white/90 transition-all duration-300 overflow-hidden"
        onClick={() => navigate(`/jobs/${job._id}`)}
      >
        {/* Job Header */}
        <div className="p-6">
          <div className="flex gap-4">
            {/* Company Logo - Left Section */}
            <div className="w-[135px] h-[128px] rounded-lg border border-slate-200/60 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-blue-50 overflow-hidden flex-shrink-0 shadow-sm relative">
              <img
                src={
                  job.hospitalLogo ||
                  "https://img.freepik.com/free-vector/hospital-logo-design-vector-medical-cross_53876-136743.jpg"
                }
                alt="Hospital Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src =
                    "https://img.freepik.com/free-vector/hospital-logo-design-vector-medical-cross_53876-136743.jpg";
                }}
              />
            </div>

            {/* Job Details - Middle Section */}
            <div className="flex-1 min-w-0">
              {/* Recently active tag - positioned to overlap logo */}
              <div className="relative -mt-2 ml-2 mb-4">
                <span className="text-xs font-medium text-[#9254DE]">
                  Recently active
                </span>
              </div>

              {/* Job Title */}
              <h3 className="text-xl font-semibold text-slate-800 mb-2">
                {job.jobTitle}
              </h3>

              {/* Company and Location */}
              <p className="text-sm text-slate-600 mb-6">
                {job.HospitalName} | {job.location}
              </p>

              {/* Job Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {job.experience && (
                  <div className="flex items-center gap-1 bg-[#F1F6FF] text-[#1890FF] px-3 py-1 rounded-md text-xs font-medium">
                    <span>{job.experience} Years</span>
                  </div>
                )}
                {(job.salaryRangeFrom || job.salaryRangeTo) && (
                  <div className="flex items-center gap-1 bg-[#F1F6FF] text-[#1890FF] px-3 py-1 rounded-md text-xs font-medium">
                    <span>
                      {job.salaryRangeFrom / 100000} -{" "}
                      {job.salaryRangeTo / 100000}L / year
                    </span>
                  </div>
                )}
                {job.employmentType && (
                  <div className="flex items-center gap-1 bg-[#F1F6FF] text-[#1890FF] px-3 py-1 rounded-md text-xs font-medium">
                    <span>{job.employmentType}</span>
                  </div>
                )}
                {job.qualification && (
                  <div className="flex items-center gap-1 bg-[#F1F6FF] text-[#1890FF] px-3 py-1 rounded-md text-xs font-medium">
                    <span>{job.qualification}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Status and Match */}
            <div className="flex flex-col items-end gap-4 flex-shrink-0">
              {/* Posted Date and Options */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  Posted {formatRelativeTime(job.createdAt)}
                </span>
                <button className="text-slate-400 hover:text-slate-600">
                  <BsThreeDotsVertical size={16} />
                </button>
              </div>

              {/* Match Percentage - Bottom Corner */}
              <div className="flex flex-col items-center gap-1 mt-[80px]">
                <div className="relative w-10 h-10">
                  <svg
                    className="w-10 h-10 transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    {/* Background circle */}
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="18"
                      cy="18"
                      r="16"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeDasharray={`${matchPercentage * 1.01} 100`}
                      strokeDashoffset="0"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-semibold text-green-600">
                      {matchPercentage}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-500">Match</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Debug logging
  useEffect(() => {
    console.log("Current user data:", currentUser);
    console.log("Auth state:", authState);
    console.log("User data structure:", {
      hasUser: !!currentUser,
      hasSkills: !!currentUser?.skills,
      hasExperience: !!currentUser?.experience,
      hasLocation: !!currentUser?.location,
      skills: currentUser?.skills,
      experience: currentUser?.experience,
      location: currentUser?.location,
    });
    if (savedJobs.length > 0) {
      console.log("Sample job data:", savedJobs[0]);
      const matchResult = calculateMatchPercentage(savedJobs[0], currentUser);
      console.log("Sample match calculation result:", matchResult);
    }
  }, [currentUser, savedJobs, authState]);

  const sortOptions = [
    "Recently Saved",
    "Job Title",
    "Company Name",
    "Salary Range",
  ];

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

  // Sort saved jobs based on selected option
  const sortedSavedJobs = useMemo(() => {
    if (!savedJobs.length) return [];

    const sorted = [...savedJobs];
    switch (sortBy) {
      case "Recently Saved":
        return sorted.sort((a, b) => {
          const dateA = new Date(a.savedAt || a.createdAt || 0);
          const dateB = new Date(b.savedAt || b.createdAt || 0);
          return dateB - dateA;
        });
      case "Job Title":
        return sorted.sort((a, b) => {
          const titleA = (a.jobTitle || "").toLowerCase();
          const titleB = (b.jobTitle || "").toLowerCase();
          return titleA.localeCompare(titleB);
        });
      case "Company Name":
        return sorted.sort((a, b) => {
          const companyA = (a.HospitalName || "").toLowerCase();
          const companyB = (b.HospitalName || "").toLowerCase();
          return companyA.localeCompare(companyB);
        });
      case "Salary Range":
        return sorted.sort((a, b) => {
          const salaryA = a.salaryRangeFrom || 0;
          const salaryB = b.salaryRangeFrom || 0;
          return salaryB - salaryA; // Highest salary first
        });
      default:
        return sorted;
    }
  }, [savedJobs, sortBy]);

  const handleUnsaveJob = async (jobId) => {
    try {
      setUnsavingJobId(jobId);
      await axiosInstance.post("/userSide/unsave-job", { jobId });
      setSavedJobs(savedJobs.filter((job) => job._id !== jobId));
      dispatch(removeSavedJob(jobId));
    } catch (error) {
      console.log("Error unsaving job:", error);
    } finally {
      setUnsavingJobId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex flex-1 overflow-hidden pt-[60px]">
          <div
            className="flex flex-1 overflow-y-auto"
            style={{
              marginLeft: layout.marginLeft,
              paddingLeft: layout.paddingLeft,
              paddingRight: layout.paddingRight,
            }}
          >
            <div className="mx-auto w-full max-w-[80rem]">
              <div className="bg-[#E4E5E8] rounded-lg w-full">
                <div
                  className="bg-[#F5F7FA] rounded-lg"
                  style={{ padding: layout.padding }}
                >
                  <div className="flex justify-center items-center h-64">
                    <Loader />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden pt-[60px]">
        <div
          className="flex flex-1 overflow-y-auto savedjobs-scroll-container"
          style={{
            marginLeft: layout.marginLeft,
            paddingLeft: layout.paddingLeft,
            paddingRight: layout.paddingRight,
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* Internet Explorer 10+ */,
          }}
        >
          <div className="mx-auto w-full max-w-[80rem]">
            <div className="bg-[#E4E5E8] rounded-lg w-full">
              <div
                className="bg-[#F5F7FA] rounded-lg"
                style={{ padding: layout.padding }}
              >
                <motion.div
                  className="min-h-screen"
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                >
                  {/* Top Bar */}
                  {!inUserProfile && (
                    <motion.div
                      className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 rounded-t-lg rounded-b-lg"
                      variants={itemVariants}
                    >
                      <div className="px-8 pt-6 pb-4">
                        <div className="flex items-center gap-2 mb-4">
                          <button
                            onClick={() => navigate(-1)}
                            className="text-slate-600 hover:text-slate-800 transition-colors"
                          >
                            <ArrowLeft size={16} />
                          </button>
                          <span
                            className="text-slate-800"
                            style={{
                              fontFamily: "Inter",
                              fontWeight: 500,
                              fontStyle: "normal",
                              fontSize: "20px",
                              lineHeight: "100%",
                              letterSpacing: "0%",
                            }}
                          >
                            Back / Saved Jobs
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Main Content */}
                  <motion.div
                    className="max-w-7xl mx-auto"
                    variants={itemVariants}
                  >
                    {/* Header Controls */}
                    <motion.div
                      className="flex justify-between items-center mb-8"
                      variants={itemVariants}
                    >
                      <p className="text-sm text-slate-500">
                        Showing {savedJobs.length} results
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Sort by:</span>
                        <div className="relative" ref={dropdownRef}>
                          <button
                            className="text-sm font-semibold text-slate-800 cursor-pointer transition-all duration-200 hover:text-slate-600 flex items-center justify-between min-w-[140px] px-4 py-2 bg-white rounded-xl hover:bg-gray-50"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          >
                            <span>{sortBy}</span>
                            <svg
                              className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
                                isDropdownOpen ? "rotate-180" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>

                          {/* Dropdown Options */}
                          {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 py-2 overflow-hidden">
                              {sortOptions.map((option) => (
                                <button
                                  key={option}
                                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors duration-150 ${
                                    sortBy === option
                                      ? "text-slate-800 font-medium bg-blue-50"
                                      : "text-slate-600"
                                  }`}
                                  onClick={() => {
                                    setSortBy(option);
                                    setIsDropdownOpen(false);
                                  }}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>

                    {/* Jobs List using AnimatePresence for smooth transitions */}
                    <AnimatePresence mode="popLayout">
                      <div className="space-y-4">
                        {sortedSavedJobs.map((job, index) => (
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
                            <SavedJobCard job={job} />
                          </motion.div>
                        ))}
                      </div>
                    </AnimatePresence>

                    {/* Empty State */}
                    {savedJobs.length === 0 && (
                      <motion.div
                        className="text-center py-16"
                        variants={itemVariants}
                      >
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-emerald-50 rounded-full flex items-center justify-center shadow-sm">
                          <Bookmark className="text-slate-400 text-2xl" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-800 mb-2">
                          No Saved Jobs Yet
                        </h3>
                        <p className="text-slate-600 mb-6">
                          You haven't saved any jobs yet. Start bookmarking jobs
                          that interest you.
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SavedJobs;
