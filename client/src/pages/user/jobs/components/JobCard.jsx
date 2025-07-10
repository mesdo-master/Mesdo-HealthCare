import { useEffect, useState, useRef } from "react";
import { FiBookmark } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";
import { FaRegBookmark } from "react-icons/fa";
import BookMarkIcon from "../../../../assets/Bookmark.png";
import SavedIcon from "../../../../assets/SavedIcon.png";
import {
  LuClock,
  LuGraduationCap,
  LuBriefcase,
  LuCalendarDays,
} from "react-icons/lu";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../lib/axio";

import { Flag, Share2, EyeOff, UserCircle, CheckCircle } from "lucide-react";

const getTagIcon = (tag) => {
  if (tag.includes("Year")) return <LuCalendarDays size={14} />;
  if (tag.includes("L") || tag.includes("/")) return <LuBriefcase size={14} />;
  if (tag.toLowerCase().includes("time")) return <LuClock size={14} />;
  return <LuGraduationCap size={14} />;
};

const JobCard = ({ job, small, fullWidth, onJobHidden }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [isHiding, setIsHiding] = useState(false);
  const dropdownRef = useRef(null);
  // useEffect(() => {
  //   const checkSave = async () => {
  //     try {
  //       const response = await axiosInstance.get('/userSide/checkSave', { params: { jobId: job._id } });
  //       setIsSaved(response.data.saved);
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }
  //   checkSave();
  // }, [])

  const toggleSaveHandler = async () => {
    try {
      const response = await axiosInstance.post("/userSide/saveJob", {
        jobId: job._id,
      });
      setIsSaved(!isSaved);
      console.log(response);
    } catch (error) {
      console.log(error);
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

  // Inside the JobCard component (before return)
  const tags = [
    job.experience && `${job.experience} Years`,
    (job.salaryRangeFrom || job.salaryRangeTo) &&
      `${job.salaryRangeFrom / 100000} - ${job.salaryRangeTo / 100000}L / year`,
    job.employmentType,
    job.qualification,
  ].filter(Boolean); // Remove null/undefined values

  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleShare = (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/jobs/${job._id}`;
    navigator.clipboard.writeText(url);
    setToast("Link copied!");
    setTimeout(() => setToast(""), 2000);
  };

  const handleHideJob = async (e) => {
    e.stopPropagation();
    try {
      setIsHiding(true);
      setDropdownOpen(false);

      const response = await axiosInstance.post("/userSide/hide-job", {
        jobId: job._id,
      });

      console.log("Job hidden successfully:", response.data);

      // Show success toast
      setToast("Job hidden successfully!");
      setTimeout(() => setToast(""), 2000);

      // Call the parent callback to remove this job from the list
      if (onJobHidden) {
        setTimeout(() => {
          onJobHidden(job._id);
        }, 1000); // Delay to show the toast first
      }
    } catch (error) {
      console.error("Error hiding job:", error);
      setToast("Failed to hide job");
      setTimeout(() => setToast(""), 2000);
    } finally {
      setIsHiding(false);
    }
  };

  return (
    <div className="relative">
      {toast && (
        <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 z-40">
          <div
            className={`flex items-center gap-3 bg-white border shadow-xl rounded-2xl px-6 py-4 animate-fade-in ${
              toast.includes("Failed") ? "border-red-200" : "border-green-200"
            }`}
          >
            <CheckCircle
              className={`w-6 h-6 ${
                toast.includes("Failed") ? "text-red-500" : "text-green-500"
              }`}
            />
            <span
              className={`font-semibold text-base ${
                toast.includes("Failed") ? "text-red-700" : "text-green-700"
              }`}
            >
              {toast}
            </span>
          </div>
        </div>
      )}
      <motion.div
        className={`bg-white p-5 ${
          small
            ? "w-full h-auto"
            : fullWidth
            ? "w-full h-[180px] min-h-[100px]"
            : "w-[1002px] h-[180px] ml-3 min-h-[100px]"
        } rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-[#E4E5E8] relative flex ${
          small ? "flex-col" : "items-center"
        } cursor-pointer ${isHiding ? "opacity-50 pointer-events-none" : ""}`}
        onClick={() => navigate(`/jobs/${job._id}`)}
      >
        {/* Logo */}
        <div
          className={`flex ${
            small
              ? "flex-row items-center mb-4"
              : "flex-col items-center justify-center"
          } ${small ? "w-auto h-auto" : "w-24 h-24"} ${small ? "" : "mr-6"}`}
        >
          <img
            alt="Company Logo"
            className={`${
              small ? "w-12 h-12 mr-3" : "w-[135px] h-[128px]"
            } object-contain rounded-lg border border-gray-200 p-1 bg-white`}
            src={
              job.hospitalLogo ||
              "https://img.freepik.com/free-vector/hospital-logo-design-vector-medical-cross_53876-136743.jpg?semt=ais_hybrid&w=740"
            }
          />
          {small && (
            <div className="flex-1 min-w-0">
              {/* Title and Company for small cards */}
              <h3 className="text-lg font-semibold text-gray-800 leading-tight mb-1 truncate">
                {job.jobTitle}
              </h3>
              <p className="text-sm text-gray-500 mb-2 truncate">
                {job.HospitalName} <span className="mx-1">|</span>{" "}
                {job.location}
              </p>
            </div>
          )}
        </div>

        {!small && (
          <>
            {/* Divider - only for large cards */}
            <div className="h-16 w-px bg-gray-200 mx-2" />
            {/* Main Content - only for large cards */}
            <div className="flex-1 min-w-0">
              {/* Top Row: Status and Actions */}
              <div className="flex items-center justify-between">
                <span className="bg-[#F3EFFF] text-[#A259FF] text-xs font-medium px-3 py-1 rounded-md inline-block mb-1">
                  Recently active
                </span>
                <div className="flex items-center gap-3 text-gray-400 text-sm mr-[-110px]">
                  <span className="text-xs text-gray-500 ">
                    Posted {formatRelativeTime(job.createdAt)}
                  </span>
                  <button
                    className="hover:text-blue-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveHandler();
                    }}
                  >
                    {!isSaved ? (
                      <img
                        src={SavedIcon}
                        alt="Saved Icon"
                        className="w-[24px] h-[24px] object-contain"
                      />
                    ) : (
                      <img
                        src={BookMarkIcon}
                        alt="Bookmark Icon"
                        className="w-[24px] h-[24px] object-contain"
                      />
                    )}
                  </button>
                  <button
                    className="hover:text-gray-600 relative"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDropdownOpen((prev) => !prev);
                    }}
                    aria-label="Open job actions menu"
                  >
                    <BsThreeDotsVertical size={20} />
                    {dropdownOpen && (
                      <div
                        ref={dropdownRef}
                        className="absolute right-0 top-8 z-30 min-w-[220px] bg-white rounded-2xl shadow-xl border border-gray-100 py-3 px-0 flex flex-col gap-1 animate-fade-in"
                        style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center px-5 pb-2">
                          <span className="font-bold text-[18px] text-[#6B7280]"></span>
                        </div>
                        <button className="flex items-center  justify-between w-full px-5 py-2 text-[15px] text-[#595959] hover:bg-gray-50 focus:outline-none">
                          <span>Report the job</span>
                          <Flag size={18} className="text-[#595959]" />
                        </button>
                        <button
                          className="flex items-center justify-between w-full px-5 py-2 text-[15px] text-[#595959] hover:bg-gray-50 focus:outline-none"
                          onClick={handleShare}
                        >
                          <span>Share</span>
                          <Share2 size={18} className="text-[#595959]" />
                        </button>
                        <button
                          className="flex items-center justify-between w-full px-5 py-2 text-[15px] text-[#595959] hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleHideJob}
                          disabled={isHiding}
                        >
                          <span>{isHiding ? "Hiding..." : "Hide Job"}</span>
                          {isHiding ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400"></div>
                          ) : (
                            <EyeOff size={18} className="text-[#595959]" />
                          )}
                        </button>
                      </div>
                    )}
                  </button>
                </div>
              </div>
              {/* Title and Company */}
              <h3 className="text-xl font-semibold text-gray-800 leading-tight mb-1">
                {job.jobTitle}
              </h3>
              <p className="text-sm text-gray-500 mb-3 truncate">
                {job.HospitalName} <span className="mx-1">|</span>{" "}
                {job.location}
              </p>
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-1">
                {tags.map((tag, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-[#F1F6FF] text-[#1890FF] px-3 py-1 rounded-md text-xs font-medium"
                  >
                    {getTagIcon(tag)}
                    <span>{tag}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Match Percentage - only for large cards */}
            <div className="flex flex-col items-center mt-20 justify-center ml-6 min-w-[80px]">
              <div className="flex flex-col items-center justify-center mb-1">
                <span className="text-green-500 text-xl font-bold">
                  {job.matchPercentage}%
                </span>
              </div>
              <span className="text-xs text-gray-500">Match</span>
            </div>
          </>
        )}

        {small && (
          <>
            {/* Status and Actions for small cards */}
            <div className="flex items-center justify-between mb-3">
              <span className="bg-[#F3EFFF] text-[#A259FF] text-xs font-medium px-2 py-1 rounded-md">
                Recently active
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Posted {formatRelativeTime(job.createdAt)}
                </span>
                <button
                  className="hover:text-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSaveHandler();
                  }}
                >
                  {!isSaved ? (
                    <img
                      src={SavedIcon}
                      alt="Saved Icon"
                      className="w-5 h-5 object-contain"
                    />
                  ) : (
                    <img
                      src={BookMarkIcon}
                      alt="Bookmark Icon"
                      className="w-5 h-5 object-contain"
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Tags for small cards */}
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.slice(0, 2).map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-[#F1F6FF] text-[#1890FF] px-2 py-1 rounded-md text-xs font-medium"
                >
                  {getTagIcon(tag)}
                  <span>{tag}</span>
                </div>
              ))}
              {tags.length > 2 && (
                <div className="flex items-center bg-gray-100 text-gray-600 px-2 py-1 rounded-md text-xs font-medium">
                  +{tags.length - 2} more
                </div>
              )}
            </div>

            {/* Match Percentage for small cards */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-lg font-bold">
                  {job.matchPercentage}%
                </span>
                <span className="text-xs text-gray-500">Match</span>
              </div>
              <button
                className="hover:text-gray-600 relative"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen((prev) => !prev);
                }}
                aria-label="Open job actions menu"
              >
                <BsThreeDotsVertical size={16} />
                {dropdownOpen && (
                  <div
                    ref={dropdownRef}
                    className="absolute right-0 top-6 z-30 min-w-[180px] bg-white rounded-xl shadow-xl border border-gray-100 py-2 px-0 flex flex-col gap-1 animate-fade-in"
                    style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button className="flex items-center justify-between w-full px-4 py-2 text-sm text-[#595959] hover:bg-gray-50 focus:outline-none">
                      <span>Report the job</span>
                      <Flag size={16} className="text-[#595959]" />
                    </button>
                    <button
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-[#595959] hover:bg-gray-50 focus:outline-none"
                      onClick={handleShare}
                    >
                      <span>Share</span>
                      <Share2 size={16} className="text-[#595959]" />
                    </button>
                    <button
                      className="flex items-center justify-between w-full px-4 py-2 text-sm text-[#595959] hover:bg-gray-50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleHideJob}
                      disabled={isHiding}
                    >
                      <span>{isHiding ? "Hiding..." : "Hide Job"}</span>
                      {isHiding ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-gray-400"></div>
                      ) : (
                        <EyeOff size={16} className="text-[#595959]" />
                      )}
                    </button>
                  </div>
                )}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default JobCard;
