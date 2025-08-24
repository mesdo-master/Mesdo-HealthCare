import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Users, Briefcase, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ApplicantDetails } from "./ApplicantDetails";
import axiosInstance from "../../../../lib/axio";
import { useSelector } from "react-redux";
import { calculateMatchPercentage } from "../../../../utils/matchPercentage";
import ReactDOM from "react-dom";
import LeftArrowIcon from "../../../../assets/LeftArrow.png";

// Hide scrollbar CSS
const scrollbarHideStyle = `
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

const progressStages = ["Applied", "Interview", "Offer", "Hired"];

export default function Applicants() {
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [sortType, setSortType] = useState("matchPercentage");
  const [statusFilter, setStatusFilter] = useState("all");
  const [jobStatus, setJobStatus] = useState("Active");
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // ✅ Add window size tracking for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

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
        marginLeft: "100px", // Fixed left spacing - same on all screens
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "85px", // Same top padding as message section
      };
    } else if (windowWidth <= 1920) {
      // Medium screens
      return {
        marginLeft: "50px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "85px", // Same top padding as message section
      };
    } else {
      // Large screens
      return {
        marginLeft: "50px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "85px", // Same top padding as message section
      };
    }
  };

  const layout = getResponsiveLayout();

  // ✅ Separate responsive function for header positioning
  const getHeaderPosition = () => {
    if (windowWidth <= 1599) {
      // Small screens - your working value
      return {
        marginLeft: "320px",
      };
    } else if (windowWidth <= 1920) {
      // Medium screens
      return {
        marginLeft: "500px",
      };
    } else {
      // Large screens
      return {
        marginLeft: "520px",
      };
    }
  };

  const headerLayout = getHeaderPosition();

  // Prevent background scrolling when ApplicantDetails is open
  useEffect(() => {
    if (selectedApplicant && !isClosing) {
      // Store the current scroll position
      const scrollY = window.scrollY;

      // Add styles to prevent scrolling
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";

      // Cleanup function to restore scrolling
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [selectedApplicant, isClosing]);

  const handleSort = () => {
    const sortedApplicants = [...applicants].sort((a, b) => {
      if (sortType === "matchPercentage") {
        return b.matchPercentage - a.matchPercentage;
      } else if (sortType === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
    setApplicants(sortedApplicants);
  };

  // Filter applicants based on status
  const filteredApplicants = applicants.filter((applicant) => {
    if (statusFilter === "all") return true;
    return applicant.status === statusFilter;
  });

  const totalApplicants = filteredApplicants?.length || 0;

  const { jobId } = useParams();

  // Function to calculate progress based on status
  const getProgressFromStatus = (status) => {
    switch (status) {
      case "Applied":
        return 1;
      case "Under Review":
        return 2;
      case "Interview":
        return 3;
      case "Accepted":
        return 5;
      case "Rejected":
        return 1; // Keep at 1 for rejected
      default:
        return 1;
    }
  };

  // Function to handle status updates from ApplicantDetails
  const handleStatusUpdate = async (userId, newStatus) => {
    // Update the applicant in the list
    setApplicants((prevApplicants) =>
      prevApplicants.map((applicant) =>
        applicant.id === userId
          ? {
              ...applicant,
              status: newStatus,
              progress: getProgressFromStatus(newStatus),
            }
          : applicant
      )
    );

    // Update selected applicant if it's the same one
    if (selectedApplicant && selectedApplicant.id === userId) {
      setSelectedApplicant((prev) => ({
        ...prev,
        status: newStatus,
        progress: getProgressFromStatus(newStatus),
      }));
    }
  };

  const requestClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setSelectedApplicant(null);
      setIsClosing(false);
    }, 300);
  };

  const handleExitComplete = () => {
    setIsClosing(false);
  };

  useEffect(() => {
    // Fetch applicants from the server
    const fetchApplicants = async () => {
      try {
        const response = await axiosInstance.get("/jobs/applicants", {
          params: { jobId },
        });

        // Handle both old and new data structures
        let applicantsData = [];
        if (
          response.data.applicantsWithStatus &&
          response.data.applicantsWithStatus.length > 0
        ) {
          // New tracking system
          applicantsData = response.data.applicantsWithStatus.map((app) => ({
            ...app.user,
            status: app.status,
            appliedAt: app.appliedAt,
            note: app.note,
            id: app.user._id,
            progress: getProgressFromStatus(app.status),
            matchPercentage: calculateMatchPercentage(response.data, app.user),
          }));
        } else if (response.data.applied && response.data.applied.length > 0) {
          // Old system fallback
          applicantsData = response.data.applied.map((user) => ({
            ...user,
            status: "Applied",
            appliedAt: response.data.createdAt,
            note: "",
            id: user._id,
            progress: getProgressFromStatus("Applied"),
            matchPercentage: calculateMatchPercentage(response.data, user),
          }));
        }

        setApplicants(applicantsData);
        setJob(response.data);
        // Initialize job status from fetched data
        setJobStatus(response.data.jobStatus || "Active");
      } catch (error) {
        console.error("Error fetching applicants:", error);
      }
    };

    if (jobId) {
      fetchApplicants();
    }
  }, [jobId]);

  const { currentUser } = useSelector((state) => state.auth);

  // Handle job status change
  const handleJobStatusChange = async (newStatus) => {
    try {
      await axiosInstance.put(`/jobs/${jobId}`, {
        formData: { ...job, jobStatus: newStatus },
        description: job.jobDescription,
      });
      setJobStatus(newStatus);
      // Update the job object as well
      setJob((prev) => ({ ...prev, jobStatus: newStatus }));
    } catch (error) {
      console.error("Error updating job status:", error);
      alert("Failed to update job status. Please try again.");
    }
  };

  // Get status colors based on job status
  const getStatusColors = (status) => {
    switch (status) {
      case "Active":
        return {
          bg: "bg-green-100",
          text: "text-green-600",
          ring: "focus:ring-green-500",
          arrow: "#16a34a",
        };
      case "Inactive":
        return {
          bg: "bg-red-100",
          text: "text-red-600",
          ring: "focus:ring-red-500",
          arrow: "#dc2626",
        };
      case "Paused":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-600",
          ring: "focus:ring-yellow-500",
          arrow: "#ca8a04",
        };
      case "Closed":
        return {
          bg: "bg-gray-100",
          text: "text-gray-600",
          ring: "focus:ring-gray-500",
          arrow: "#6b7280",
        };
      default:
        return {
          bg: "bg-green-100",
          text: "text-green-600",
          ring: "focus:ring-green-500",
          arrow: "#16a34a",
        };
    }
  };

  const statusColors = getStatusColors(jobStatus);

  // Inject scrollbar hide CSS
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = scrollbarHideStyle;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <div
        className="flex flex-1 overflow-hidden"
        style={{ paddingTop: layout.topPadding }}
      >
        <div
          className="flex flex-1 overflow-y-auto scrollbar-hide"
          style={{
            marginLeft: layout.marginLeft,
            paddingLeft: layout.paddingLeft,
            paddingRight: layout.paddingRight,
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* Internet Explorer 10+ */,
          }}
        >
          {/* TOP PROFILE HEADER - EDGE TO EDGE */}
          <div
            className="fixed top-[-12px] right-0 bg-white border-b z-10 p-7"
            style={{
              marginTop: layout.topPadding,
              marginLeft: headerLayout.marginLeft,
              width: `calc(100% - ${headerLayout.marginLeft})`,
            }}
          >
            {/* Row 1: Back arrow + Top Info */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between px-8 pt-4 pb-4">
              <div className="flex items-start md:items-center gap-3">
                {/* Back Arrow */}
                <button
                  onClick={() => navigate(-1)}
                  className="text-gray-600 hover:text-gray-900 transition"
                >
                  <img src={LeftArrowIcon} alt="Back" className="w-6 h-6" />
                </button>

                {/* Text block with increased spacing */}
                <div className="flex flex-col justify-center">
                  {/* "Active Until" line */}
                  <span className="text-xs text-gray-500 mb-1">
                    Active Until -{" "}
                    {new Date(job?.endDate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Title */}
                    <h2 className="text-2xl font-medium text-gray-900 leading-tight">
                      {job?.jobTitle}
                    </h2>

                    {/* Active Status Dropdown */}
                    <div className="relative">
                      <select
                        value={jobStatus}
                        onChange={(e) => handleJobStatusChange(e.target.value)}
                        className={`${statusColors.bg} ${statusColors.text} text-xs font-medium px-2.5 py-1 pr-5 rounded-full border-0 appearance-none ${statusColors.ring} focus:outline-none cursor-pointer`}
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Paused">Paused</option>
                        <option value="Closed">Closed</option>
                      </select>
                      {/* Custom Dropdown Arrow */}
                      <div className="absolute inset-y-0 right-1 flex items-center pointer-events-none">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke={statusColors.arrow}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    {/* Small Divider */}
                    <div className="w-px h-4 bg-gray-300"></div>

                    {/* Role */}
                    <span className="text-xs text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
                      Doctor
                    </span>

                    {/* Small Divider */}
                    <div className="w-px h-4 bg-gray-300"></div>

                    {/* Creator */}
                    <span className="text-xs text-gray-500">
                      Created by {currentUser?.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Tabs */}
            <div className="flex gap-9 px-8 border-b text-base font-medium p-3 ml-2">
              <div className="flex items-center gap-2 cursor-pointer py-3 border-b-2 border-[#222] text-[#222] font-medium">
                <Users size={18} />
                Candidates ({totalApplicants})
              </div>
              <div className="flex items-center gap-1 cursor-pointer py-3 border-b-2 border-transparent text-gray-500 hover:text-[#222] transition-all">
                <Briefcase size={18} />
                Job Info
              </div>
              <div className="flex items-center gap-1 cursor-pointer py-3 border-b-2 border-transparent text-gray-500 hover:text-[#222] transition-all">
                <Search size={18} />
                Search Candidate
              </div>
            </div>
          </div>

          {/* MAIN CONTENT CONTAINER - Keep exactly as is */}
          <div
            className="mx-auto w-full max-w-[80rem]"
            style={{ marginTop: "150px" }}
          >
            <div className="bg-[#E4E5E8] rounded-lg w-full min-h-[calc(100vh-120px)] ml-[-50px]">
              <div
                className="bg-[#F5F7FA] rounded-lg min-h-[calc(100vh-120px)]"
                style={{ padding: layout.padding }}
              >
                <div className="  w-full min-h-[calc(100vh-160px)]">
                  <div className="p-10 min-h-[calc(100vh-200px)]">
                    {/* APPLICANTS CONTENT */}
                    <div className="mt-6">
                      {/* Top row: Search + Sort */}
                      <div className="flex items-center justify-between mb-6">
                        {/* Left: Wide Search bar */}
                        <div className="relative w-full max-w-2xl">
                          <input
                            type="text"
                            placeholder="Search Candidate"
                            className="w-full px-4 py-3 pl-10 border-0 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                          />
                          <Search
                            size={16}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          />
                        </div>
                        {/* Right: Sort dropdown */}
                        <div className="flex items-center gap-2 ml-4">
                          <select
                            value={sortType}
                            onChange={(e) => setSortType(e.target.value)}
                            className="border-0 rounded-xl px-4 py-3 pr-8 text-gray-700 bg-white appearance-none bg-no-repeat bg-right pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{
                              fontFamily: "Inter",
                              fontWeight: 400,
                              fontSize: "14px",
                              lineHeight: "100%",
                              letterSpacing: "2%",
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundPosition: "right 0.5rem center",
                              backgroundSize: "1.5em 1.5em",
                            }}
                          >
                            <option value="matchPercentage">
                              Match Percentage
                            </option>
                            <option value="name">Name</option>
                          </select>

                          <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border-0 rounded-xl px-4 py-3 pr-8 text-gray-700 bg-white appearance-none bg-no-repeat bg-right pr-8 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            style={{
                              fontFamily: "Inter",
                              fontWeight: 400,
                              fontSize: "14px",
                              lineHeight: "100%",
                              letterSpacing: "2%",
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundPosition: "right 0.5rem center",
                              backgroundSize: "1.5em 1.5em",
                            }}
                          >
                            <option value="all">All Status</option>
                            <option value="Applied">Applied</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Interview">Interview</option>
                            <option value="Accepted">Accepted</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                      </div>

                      {/* Applicant List */}
                      <div className="min-h-[400px]">
                        <div className="relative">
                          {/* Applicants List */}
                          {filteredApplicants &&
                          filteredApplicants.length > 0 ? (
                            <div className="space-y-6">
                              {filteredApplicants.map((applicant) => (
                                <motion.div
                                  key={applicant.id}
                                  onClick={() =>
                                    setSelectedApplicant(applicant)
                                  } // Open drawer with selected applicant
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="bg-white shadow-sm rounded-xl px-6 py-4 border border-gray-200 flex items-center cursor-pointer hover:shadow-md transition-all"
                                >
                                  {/* COLUMN 1: Profile + Name */}
                                  <div className="min-w-[180px] flex items-center gap-3">
                                    <img
                                      src={
                                        applicant.profilePicture ||
                                        "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
                                      }
                                      alt={applicant.name || "Unknown"}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                    <h2 className="text-sm font-semibold text-gray-800">
                                      {applicant.name || "N/A"}
                                    </h2>
                                  </div>

                                  {/* COLUMN 2: Status + Progress */}
                                  <div className="min-w-[160px] flex flex-col ml-8">
                                    <span className="text-xs text-gray-600 mb-2">
                                      {applicant.status || "Applied"}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      {Array.from({ length: 5 }).map(
                                        (_, index) => {
                                          const progress =
                                            applicant.progress || 1;
                                          const isActive = index < progress;
                                          const isRejected =
                                            applicant.status === "Rejected";

                                          let barColor = "bg-gray-300";
                                          if (isActive) {
                                            if (isRejected) {
                                              barColor = "bg-red-500";
                                            } else if (
                                              applicant.status === "Accepted"
                                            ) {
                                              barColor = "bg-green-500";
                                            } else {
                                              barColor = "bg-blue-500";
                                            }
                                          }

                                          return (
                                            <div
                                              key={index}
                                              className={`w-6 h-1 rounded-full ${barColor}`}
                                            />
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>

                                  {/* COLUMN 3: Email */}
                                  <div className="ml-8 min-w-[180px]">
                                    <span className="text-sm text-[#4B9BD4] bg-[#F8FAFC] px-3 py-2 rounded-lg border border-gray-100">
                                      {applicant.email || "No email"}
                                    </span>
                                  </div>

                                  {/* COLUMN 4: Phone */}
                                  <div className="ml-8 min-w-[120px]">
                                    <span className="text-sm text-[#4B9BD4] bg-[#F8FAFC] px-3 py-2 rounded-lg border border-gray-100">
                                      {applicant.phoneNo || "No phone"}
                                    </span>
                                  </div>

                                  {/* COLUMN 5: Match % */}
                                  <div className="ml-auto">
                                    <span className="text-sm text-gray-800 font-medium">
                                      {applicant.matchPercentage !== undefined
                                        ? `${applicant.matchPercentage}%`
                                        : "N/A"}
                                    </span>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-20">
                              <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
                                <Users className="text-gray-400 text-2xl" />
                              </div>
                              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                No Applicants Yet
                              </h3>
                              <p className="text-gray-600">
                                No one has applied to this job yet. Share the
                                job posting to attract candidates.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ApplicantDetails slide-in with blur backdrop (rendered in portal) */}
      {selectedApplicant &&
        ReactDOM.createPortal(
          <>
            <AnimatePresence>
              <>
                {!isClosing && (
                  <div className="fixed inset-0 z-[199] bg-black/30 backdrop-blur-sm shadow-2xl transition-all duration-300" />
                )}
              </>
            </AnimatePresence>
            <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
              {!isClosing && (
                <motion.div
                  className="fixed inset-y-0 right-0 w-4/5 max-w-6xl bg-white z-[200] shadow-2xl overflow-hidden h-full"
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{
                    type: "tween",
                    duration: 0.6,
                    ease: [0.25, 0.46, 0.45, 0.94], // Ultra-smooth cubic bezier
                  }}
                  style={{
                    willChange: "transform, opacity",
                    backfaceVisibility: "hidden",
                    transform: "translateZ(0)",
                  }}
                >
                  <ApplicantDetails
                    applicant={selectedApplicant}
                    setSelectedApplicant={setSelectedApplicant}
                    jobId={jobId}
                    onStatusUpdate={handleStatusUpdate}
                    applicants={applicants}
                    currentIndex={applicants.findIndex(
                      (a) => a.id === selectedApplicant?.id
                    )}
                    onClose={requestClose}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>,
          document.body
        )}
    </div>
  );
}
