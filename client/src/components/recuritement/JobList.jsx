import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import {
  Calendar,
  ChevronDown,
  Stethoscope,
  MoreVertical,
  TrendingUp,
  Pencil,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../lib/axio";

const JobCard = ({ job, onEdit, onDelete }) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    }
    if (openDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openDropdown]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#F1F1F1] p-4 w-full max-w-[587px] mx-auto transition hover:shadow-md max-h-[372px] h-[320px] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Status */}
          <div className="relative">
            <button className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold focus:outline-none border border-green-200 min-w-[70px]">
              <span className="h-2 w-2 bg-green-500 rounded-full mr-1 inline-block"></span>
              Active
            </button>
          </div>
          {/* Role */}
          <span className="flex items-center gap-1 text-[13px] text-gray-700 font-medium truncate">
            <Stethoscope size={14} className="text-purple-500" /> Doctor
          </span>
        </div>
        <div className="relative">
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown((v) => !v);
            }}
          >
            <MoreVertical size={18} />
          </button>
          {openDropdown && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-8 z-30 min-w-[200px] bg-white rounded-xl shadow-xl border border-gray-100 py-2 px-0 flex flex-col gap-1 animate-fade-in"
              style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.10)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="flex items-center justify-between w-full px-5 py-2 text-[15px] text-[#595959] hover:bg-gray-50 focus:outline-none"
                onClick={() => {
                  setOpenDropdown(false);
                  onEdit(job._id);
                }}
              >
                <span>Edit</span>
                <Pencil size={18} className="ml-2 text-gray-400" />
              </button>
              <button
                className="flex items-center justify-between w-full px-5 py-2 text-[15px] text-[#595959] hover:bg-gray-50 focus:outline-none"
                onClick={async () => {
                  setOpenDropdown(false);
                  if (
                    window.confirm("Are you sure you want to delete this job?")
                  ) {
                    await onDelete(job._id);
                  }
                }}
              >
                <span>Close</span>
                <Trash2 size={18} className="ml-2 text-gray-400" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Active Until */}
      <div className="text-[12px] text-gray-500 mb-1 flex items-center gap-1 truncate">
        <Calendar size={12} />
        Active Until -{" "}
        <span className="font-semibold text-gray-900 ml-1 truncate">
          {new Date(job?.endDate).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Title */}
      <div className="h-12 flex items-end mb-3">
        <div className="text-[22px] font-bold text-gray-900 mb-1 leading-tight break-words overflow-hidden line-clamp-2 min-h-[56px] flex items-end ">
          {job?.jobTitle}
        </div>
      </div>

      {/* Stats Box */}
      <div className="bg-[#F7F9FB] rounded-xl flex items-center px-4 py-4 mb-3 border border-[#E9E9E9] w-full min-w-0 overflow-hidden gap-3">
        <div className="flex flex-row flex-grow min-w-0 items-center w-full gap-4">
          <div className="flex flex-col items-start min-w-[90px] flex-shrink-0">
            <div className="flex items-end gap-1">
              <span className="text-[22px] font-semibold text-gray-900 truncate">
                {job.applied?.length || 0}
              </span>
              <span className="text-xs text-green-600 font-bold align-bottom">
                +25%
              </span>
            </div>
            <span className="text-[12px] text-gray-500 font-medium mt-1 truncate">
              Total Applied
            </span>
          </div>
          <div className="flex flex-col items-start min-w-[90px] flex-shrink-0">
            <span className="text-[22px] font-semibold text-gray-900 truncate">
              {job?.shortListed?.length || 0}
            </span>
            <span className="text-[12px] text-gray-500 font-medium mt-1 truncate">
              Shortlisted
            </span>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => navigate(`${job._id}/applicants`)}
            className="text-[#1890FF] text-[12px] font-medium hover:underline whitespace-nowrap ml-[-70px] flex-shrink-0"
          >
            View All Applicants &rarr;
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-[12px] text-gray-600 mt-2">
        <div className="flex items-center gap-2 truncate">
          <TrendingUp size={16} className="text-[#1890FF]" />
          <span className="truncate">2 new message, 3 new applicants</span>
        </div>
      </div>
    </div>
  );
};

// ✅ JobCards Component (Uses JobCard)
export default function JobList() {
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axiosInstance.get("/jobs");
        setJobs(response.data.jobs);
      } catch (error) {
        console.log(error);
      }
    };
    fetchJobs();
  }, []);

  const handleEdit = (jobId) => {
    navigate(`/recruitment/create?jobId=${jobId}`);
  };

  const handleDelete = async (jobId) => {
    try {
      await axiosInstance.delete(`/jobs/${jobId}`);
      setJobs((prev) => prev.filter((job) => job._id !== jobId));
    } catch (err) {
      alert("Failed to delete job.");
    }
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 justify-items-center">
      {jobs.length === 0 ? (
        <div className="col-span-full flex flex-col items-center justify-center w-full py-24">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No jobs posted yet
          </h2>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            Start by creating your first job to attract top candidates and grow
            your team!
          </p>
          <button
            onClick={() => navigate("/recruitment/create")}
            className="px-6 py-3 rounded-lg bg-[#1890FF] text-white font-semibold shadow hover:bg-blue-700 transition"
          >
            + Create New Job
          </button>
        </div>
      ) : (
        jobs.map((job, index) => (
          <JobCard
            key={index}
            job={job}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))
      )}
    </section>
  );
}
