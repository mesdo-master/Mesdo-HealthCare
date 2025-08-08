import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { BsThreeDotsVertical } from "react-icons/bs";
import { Flag, Share2, EyeOff, CheckCircle } from "lucide-react";
import axiosInstance from "../../../../lib/axio";
import { setCurrentUser } from "../../../../store/features/authSlice";
import SavedIcon from "../../../../assets/SavedIcon.png";
import BookMarkIcon from "../../../../assets/Bookmark.png";
import Loader from "../../../../components/Loader";

import { FiBookmark } from "react-icons/fi";
import { FaRegBookmark } from "react-icons/fa";
import {
  LuClock,
  LuGraduationCap,
  LuBriefcase,
  LuCalendarDays,
} from "react-icons/lu";

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
            ? "w-full h-[200px] min-h-[100px]"
            : "w-full max-w-[900px] lg:max-w-[900px] xl:max-w-[1005px] h-[200px] min-h-[100px]"
        } rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-[#E4E5E8] relative flex ${
          small ? "flex-col" : "items-center"
        } cursor-pointer ${isHiding ? "opacity-50 pointer-events-none" : ""}`}
        onClick={() => navigate(`/jobs/${job._id}`)}
      >
        {/* Logo */}
        <div
          className={`flex items-center justify-center ${
            small ? "mb-4 w-12 h-12 mr-3" : "w-[135px] h-[128px] mr-6"
          } flex-shrink-0`}
        >
          <img
            alt="Company Logo"
            className={`object-cover rounded-lg border border-gray-200 p-1 bg-white ${
              small ? "w-12 h-12" : "w-[135px] h-[128px]"
            }`}
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
            <div className="h-[120px] w-px bg-gray-200 ml-[20px] mr-[33px]" />
            {/* Main Content - only for large cards */}
            <div className="flex-1 min-w-0">
              {/* Top Row: Status and Actions */}
              <div className="flex items-center justify-between">
                <span className="text-[#9254DE] text-xs font-medium inline-block mb-2">
                  Recently active
                </span>
                <div className="flex items-center gap-3 text-gray-400 text-sm mr-[-140px]">
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
                            <Loader />
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
              <h3 className="text-xl font-semibold text-gray-800 leading-tight mb-[8px]">
                {job.jobTitle}
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                {job.HospitalName} <span className="mx-1">|</span>{" "}
                {job.location}
              </p>
              {/* Tags */}
              <div className="flex flex-wrap gap-3 mb-1">
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
            <div className="flex items-center gap-3 ml-6 min-w-[120px] mt-[80px] ">
              <div className="relative w-11 h-11 pl-[10px]">
                <svg
                  className="w-11 h-11 transform -rotate-90"
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
                    strokeDasharray={`${job.matchPercentage * 1.01} 100`}
                    strokeDashoffset="0"
                  />
                </svg>
              </div>
              <div className="flex flex-col pl-[10px]">
                <span className="text-lg font-bold text-green-600">
                  {job.matchPercentage}%
                </span>
                <span className="text-xs text-[#BFBFBF]">Match</span>
              </div>
            </div>
          </>
        )}

        {small && (
          <>
            {/* Status and Actions for small cards */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#9254DE] text-xs font-medium">
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
            <div className="flex flex-wrap gap-3 mb-3">
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
                <div className="relative w-8 h-8">
                  <svg
                    className="w-8 h-8 transform -rotate-90"
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
                      strokeDasharray={`${job.matchPercentage * 1.01} 100`}
                      strokeDashoffset="0"
                    />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-green-600">
                    {job.matchPercentage}%
                  </span>
                  <span className="text-xs text-gray-500">Match</span>
                </div>
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
                        <Loader />
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
