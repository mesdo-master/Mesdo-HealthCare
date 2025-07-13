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
        className={`h-screen bg-gray-50 ${
          !inUserProfile && " ml-[5vw] pt-[10vh]"
        }`}
      >
        <div className="flex justify-center items-center h-64">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <div className="absolute inset-0 rounded-full border-2 border-blue-100"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gray-50 ${
        !inUserProfile && " ml-[5vw] pt-[10vh]"
      }`}
    >
      {/* Header */}
      {!inUserProfile && (
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-6 pt-8 pb-6">
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors shadow-sm"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    Applied Jobs
                  </h1>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200">
                    {appliedJobs.length} Total
                  </span>
                </div>
                <p className="text-gray-600">
                  Track your job applications and their current status
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {appliedJobs.length}
              </span>{" "}
              results
            </p>
            {appliedJobs.length > 0 && (
              <div className="h-4 w-px bg-gray-300"></div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 font-medium">Sort by:</span>
            <select className="text-sm bg-white border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm">
              <option>Recently Applied</option>
              <option>Job Title</option>
              <option>Company Name</option>
              <option>Status</option>
            </select>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-6">
          {appliedJobs.map((application, index) => {
            const job = application.job || application;
            const applicationStatus = application.status || "Applied";
            const appliedAt = application.appliedAt || job.createdAt;
            const currentStatusIndex = getStatusIndex(applicationStatus);

            return (
              <div
                key={job._id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 overflow-hidden"
              >
                {/* Job Header */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex gap-4 flex-1">
                      {/* Company Logo */}
                      <div className="w-16 h-16 rounded-xl border border-gray-200 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden flex-shrink-0">
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

                      {/* Job Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 truncate">
                            {job.jobTitle}
                          </h3>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                              applicationStatus
                            )} bg-current bg-opacity-10 flex-shrink-0`}
                          >
                            {applicationStatus}
                          </span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">
                              {job.HospitalName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{job.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span>Applied {formatRelativeTime(appliedAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                          {job.employmentType && (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                              {job.employmentType}
                            </span>
                          )}
                          {job.experience && (
                            <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                              {job.experience}+ years
                            </span>
                          )}
                          <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200">
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
                  <div className="pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between relative">
                      {statusStages.map((stage, index) => (
                        <div
                          key={stage}
                          className="flex flex-col items-center relative z-10"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                              index <= currentStatusIndex
                                ? "bg-blue-500 text-white shadow-lg"
                                : "bg-gray-200 text-gray-500"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <div className="mt-3 text-center">
                            <div
                              className={`text-xs font-medium ${
                                index <= currentStatusIndex
                                  ? "text-blue-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {stage}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Progress Line */}
                      <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0">
                        <div
                          className="h-full bg-blue-500 transition-all duration-500 ease-out"
                          style={{
                            width: `${
                              (currentStatusIndex / (statusStages.length - 1)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {appliedJobs.length === 0 && (
          <div className="text-center py-20">
            <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-full flex items-center justify-center">
              <BsFillBookmarkCheckFill className="text-blue-500 text-4xl" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              No Applied Jobs Yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't applied to any jobs yet. Start exploring opportunities
              and take the next step in your career journey.
            </p>
            <button
              onClick={() => navigate("/jobs")}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Browse Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppliedJob;
