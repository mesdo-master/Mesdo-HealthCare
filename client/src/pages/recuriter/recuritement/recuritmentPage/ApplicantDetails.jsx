import React, { useState, useEffect } from "react";
import {
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
  AiOutlineClose,
  AiOutlineDown,
  AiOutlineUp,
} from "react-icons/ai";
import { FaTools } from "react-icons/fa";
import { MdWork } from "react-icons/md";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { SlBadge } from "react-icons/sl";
import { CheckCircle, XCircle } from "lucide-react";
import Resume from "./Resume";
import Message from "./Message";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../lib/axio";
import UsersIcon from "../../../../assets/Users.png";
import MessageIcon from "../../../../assets/Message.png";
import ResumeIcon from "../../../../assets/Resume.png";
import {
  calculateMatchPercentage,
  getMatchBreakdown,
} from "../../../../utils/matchPercentage";

const schoolIcon =
  "https://res.cloudinary.com/dy9voteoc/image/upload/v1744904300/famicons_school-outline_kuqz1z.png";
const schoolIcon2 =
  "https://res.cloudinary.com/dy9voteoc/image/upload/v1744904308/School_2_bzrqw7.png";
const schoolIcon3 =
  "https://res.cloudinary.com/dy9voteoc/image/upload/v1744904312/School_3_egvf9b.png";
// HEADER with three sections: Job Application, Resume, Message
function TopBar({
  setSelectedApplicant,
  applicants = [],
  currentIndex = 0,
  onClose,
}) {
  const navigate = useNavigate();
  const total = applicants.length;
  return (
    <div className="sticky top-0 h-16 bg-white flex items-center justify-between px-8 z-10 border-b border-[#E5E7EB]">
      {/* Left side: back/forward arrows */}
      <div className="flex items-center gap-3 ml-2">
        {/* Back Button - Navigates to Applicants Section */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50"
          onClick={() => {
            if (currentIndex > 0)
              setSelectedApplicant(applicants[currentIndex - 1]);
          }}
          disabled={currentIndex === 0}
          aria-label="Previous Applicant"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="#4B5563"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-50"
          onClick={() => {
            if (currentIndex < total - 1)
              setSelectedApplicant(applicants[currentIndex + 1]);
          }}
          disabled={currentIndex === total - 1}
          aria-label="Next Applicant"
        >
          <svg
            width="18"
            height="18"
            fill="none"
            stroke="#4B5563"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      {/* Right side: close icon */}
      <button
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 mr-2"
        onClick={onClose || (() => setSelectedApplicant(null))}
        aria-label="Close"
      >
        <AiOutlineClose className="w-5 h-5 text-gray-700" />
      </button>
    </div>
  );
}

function ProfileHeaderWithTabs({
  activeTab,
  onTabClick,
  applicant,
  jobId,
  onStatusUpdate,
}) {
  const [loading, setLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(
    applicant.status || "Applied"
  );

  // Update currentStatus when applicant status changes
  useEffect(() => {
    setCurrentStatus(applicant.status || "Applied");
  }, [applicant.status]);

  const handleAcceptApplication = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/jobs/accept-application", {
        jobId: jobId,
        userId: applicant._id || applicant.id,
        note: "Application accepted",
      });

      if (response.data) {
        setCurrentStatus("Accepted");
        if (onStatusUpdate) {
          onStatusUpdate(applicant._id || applicant.id, "Accepted");
        }
      }
    } catch (error) {
      console.error("Error accepting application:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Unknown error occurred";
      alert(`Error accepting application: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectApplication = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.post("/jobs/reject-application", {
        jobId: jobId,
        userId: applicant._id || applicant.id,
        note: "Application rejected",
      });

      if (response.data) {
        setCurrentStatus("Rejected");
        if (onStatusUpdate) {
          onStatusUpdate(applicant._id || applicant.id, "Rejected");
        }
      }
    } catch (error) {
      console.error("Error rejecting application:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Unknown error occurred";
      alert(`Error accepting application: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Applied":
        return "bg-blue-100 text-blue-600";
      case "Under Review":
        return "bg-orange-100 text-orange-600";
      case "Interview":
        return "bg-purple-100 text-purple-600";
      case "Accepted":
        return "bg-green-100 text-green-600";
      case "Rejected":
        return "bg-red-100 text-red-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const renderActionButtons = () => {
    // Show Accept/Reject buttons only for "Applied" status
    if (currentStatus === "Applied") {
      return (
        <div className="flex gap-3 items-center">
          <button
            onClick={handleAcceptApplication}
            disabled={loading}
            className="bg-green-100 text-green-600 flex items-center justify-center rounded-md text-sm font-medium hover:bg-green-200 disabled:opacity-50"
            style={{
              width: "141px",
              height: "48px",
              borderRadius: "6px",
              padding: "12px 24px 12px 32px",
              gap: "8px",
            }}
          >
            <span>{loading ? "Processing..." : "Accept"}</span>{" "}
            {!loading && <CheckCircle className="w-5 h-5 text-green-600" />}
          </button>

          <button
            onClick={handleRejectApplication}
            disabled={loading}
            className="bg-red-100 text-red-600 flex items-center justify-center rounded-md text-sm font-medium hover:bg-red-200 disabled:opacity-50"
            style={{
              width: "141px",
              height: "48px",
              borderRadius: "6px",
              padding: "12px 24px 12px 32px",
              gap: "8px",
            }}
          >
            <span>{loading ? "Processing..." : "Reject"}</span>{" "}
            {!loading && <XCircle className="w-5 h-5 text-red-600" />}
          </button>
        </div>
      );
    } else {
      // Show current status badge for all other statuses
      return (
        <div className="flex gap-3 items-center">
          <div
            className={`flex items-center justify-center rounded-md text-sm font-medium ${getStatusColor(
              currentStatus
            )} gap-2`}
            style={{
              width: "141px",
              height: "48px",
              borderRadius: "6px",
              padding: "12px 24px 12px 32px",
            }}
          >
            <span>{currentStatus}</span>
            {currentStatus === "Accepted" && (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
            {currentStatus === "Rejected" && (
              <XCircle className="w-5 h-5 text-red-600" />
            )}
            {currentStatus !== "Accepted" && currentStatus !== "Rejected" && (
              <span style={{ width: 20, display: "inline-block" }} />
            )}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      {/* Profile Info */}
      <div className="flex items-center justify-between px-8 pt-6 pb-4">
        <div className="flex items-center gap-5 flex-1">
          <img
            src={
              applicant.profilePicture ||
              "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
            }
            alt="Profile"
            className="w-16 h-16 rounded-lg object-cover border border-gray-100"
          />
          <div className="flex flex-col gap-1">
            <span
              className="text-2xl font-medium text-gray-900 leading-tight"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {applicant.name}
            </span>
            <span
              className="text-base text-gray-500 font-normal"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {applicant.email}
            </span>
          </div>
        </div>

        {/* Dynamic Action Buttons */}
        {renderActionButtons()}
      </div>

      {/* Tabs */}
      <div className="flex gap-8 px-8 border-b text-base font-medium w-full mt-4">
        <button
          className={`flex items-center gap-2 py-3 border-b-2 transition-all font-inter ${
            activeTab === "jobApplication"
              ? "border-[#222] text-[#222]"
              : "border-transparent text-gray-500 hover:text-[#222]"
          }`}
          onClick={() => onTabClick("jobApplication")}
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <img src={UsersIcon} alt="Job Application" className="w-5 h-5" />
          Job Application
        </button>
        <button
          className={`flex items-center gap-2 py-3 border-b-2 transition-all font-inter ${
            activeTab === "Resume"
              ? "border-[#222] text-[#222]"
              : "border-transparent text-gray-500 hover:text-[#222]"
          }`}
          onClick={() => onTabClick("Resume")}
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <img src={ResumeIcon} alt="Resume" className="w-5 h-5" />
          Resume
        </button>
        <button
          className={`flex items-center gap-2 py-3 border-b-2 transition-all font-inter ${
            activeTab === "Message"
              ? "border-[#222] text-[#222]"
              : "border-transparent text-gray-500 hover:text-[#222]"
          }`}
          onClick={() => onTabClick("Message")}
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <img src={MessageIcon} alt="Message" className="w-5 h-5" />
          Message
        </button>
      </div>
    </div>
  );
}

function TabItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative py-3 text-sm font-medium text-gray-600 hover:text-gray-800 transition font-inter ${
        active ? "text-gray-800" : ""
      }`}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-500" />
      )}
    </button>
  );
}

function ProfileHeader({
  activeTab,
  onTabClick,
  applicant,
  setSelectedApplicant,
  jobId,
  onStatusUpdate,
  applicants = [],
  currentIndex = 0,
  onClose,
}) {
  return (
    <div>
      <TopBar
        setSelectedApplicant={setSelectedApplicant}
        applicants={applicants}
        currentIndex={currentIndex}
        onClose={onClose}
      />
      <ProfileHeaderWithTabs
        activeTab={activeTab}
        onTabClick={onTabClick}
        applicant={applicant}
        jobId={jobId}
        onStatusUpdate={onStatusUpdate}
      />
    </div>
  );
}

// About + Qualification Container with a tracking line style
function AboutSection({ applicant }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      {/* Title */}
      <h2
        className="text-lg font-medium text-gray-800 mb-4 font-inter"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        About
      </h2>
      {/* Render HTML */}
      <div
        className="text-sm text-gray-700 leading-relaxed font-inter"
        style={{ fontFamily: "Inter, sans-serif" }}
        dangerouslySetInnerHTML={{
          __html: applicant?.about || "<em>No information provided.</em>",
        }}
      />
    </div>
  );
}

// QUALIFICATION SECTION
function QualificationSection({ applicant }) {
  const educationList = applicant?.education || [];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2
        className="text-lg font-medium text-gray-800 mb-4 font-inter"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Qualification
      </h2>

      {educationList.length > 0 ? (
        <div className="space-y-4">
          {educationList.map((qual, index) => (
            <QualificationItem
              key={index}
              icon={
                <img
                  src={schoolIcon}
                  alt="School"
                  className="w-5 h-5 opacity-70"
                />
              }
              title={qual.qualification}
              institute={qual.university}
              date={qual.passingYear}
            />
          ))}
        </div>
      ) : (
        <div
          className="text-sm text-gray-500 italic font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          No qualifications added yet.
        </div>
      )}
    </div>
  );
}

function QualificationItem({ icon, title, institute, date }) {
  return (
    <div className="flex items-start space-x-3">
      <div className="mt-1">{icon}</div>
      <div>
        <p
          className="text-sm font-medium text-gray-800 font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {title}
        </p>
        <p
          className="text-sm text-gray-600 font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {institute}
        </p>
        <p
          className="text-xs text-gray-500 mt-1 font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {date}
        </p>
      </div>
    </div>
  );
}

// Work Experience with a similar tracking line style
function WorkExperienceSection({ applicant }) {
  const experiences = applicant?.experience || [];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2
        className="text-lg font-medium text-gray-800 mb-4 font-inter"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Work Experience
      </h2>

      {experiences.length > 0 ? (
        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <WorkExperienceItem
              key={index}
              icon={<MdWork className="text-gray-500 text-xl" />}
              title={exp.title}
              organization={exp.institution}
              date={`${exp.type}  | ${exp.startDate} – ${exp.endDate}`}
              htmlDescription={exp.description}
            />
          ))}
        </div>
      ) : (
        <div
          className="text-sm text-gray-500 italic font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          No work experience added yet.
        </div>
      )}
    </div>
  );
}

function WorkExperienceItem({
  icon,
  title,
  organization,
  date,
  htmlDescription,
}) {
  return (
    <div className="flex items-start space-x-3">
      <div className="mt-1">{icon}</div>
      <div className="flex-1">
        <h3
          className="text-base font-medium text-gray-800 mb-1 font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {title}
        </h3>
        <p
          className="text-sm text-gray-600 font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {organization}
        </p>
        <p
          className="text-xs text-gray-500 mt-1 font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          {date}
        </p>
        {htmlDescription && (
          <div
            className="mt-2 text-sm text-gray-600 leading-relaxed space-y-2 font-inter"
            style={{ fontFamily: "Inter, sans-serif" }}
            dangerouslySetInnerHTML={{ __html: htmlDescription }}
          />
        )}
      </div>
    </div>
  );
}

// Separate Skills section
function SkillsSection({ applicant }) {
  const skills = applicant?.skills || [];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2
        className="text-lg font-medium text-gray-800 flex items-center gap-2 font-inter"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Skills
      </h2>
      {skills.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-block bg-gray-100 text-gray-700 text-sm py-1 px-3 rounded-full font-inter"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p
          className="text-sm text-gray-500 mt-2 italic font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          No skills added yet.
        </p>
      )}
    </div>
  );
}

// Separate Certificates section
function CertificatesSection({ applicant }) {
  const certifications = applicant?.certifications || [];

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2
        className="text-lg font-medium text-gray-800 flex items-center gap-2 font-inter"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Certificates &amp; Awards
      </h2>
      {certifications.length > 0 ? (
        <div className="mt-4 space-y-4">
          {certifications.map((cert, index) => (
            <CertificateItem
              key={index}
              name={cert.name}
              issuer={cert.issuedBy}
              date={cert.year}
              icon={<SlBadge className="text-gray-500 mt-1" />}
            />
          ))}
        </div>
      ) : (
        <p
          className="text-sm text-gray-500 mt-2 italic font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          No certificates or awards added yet.
        </p>
      )}
    </div>
  );
}

function CertificateItem({ name, issuer, date, icon }) {
  return (
    <div className="flex items-start space-x-3">
      {icon}
      <div
        className="text-sm text-gray-600 font-inter"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <p className="font-medium text-gray-800">{name}</p>
        <p className="mt-1">
          {issuer} | {date}
        </p>
      </div>
    </div>
  );
}

// RIGHT COLUMN SECTIONS

function ApplicationStatusDropdown({
  applicant,
  jobId,
  currentStatus,
  onStatusUpdate,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(
    currentStatus || "Applied"
  );
  const [loading, setLoading] = useState(false);

  // Enable dropdown for any status except 'Applied' and 'Rejected'
  const isDropdownEnabled =
    currentStatus !== "Applied" && currentStatus !== "Rejected";

  const toggleOpen = () => {
    if (isDropdownEnabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      const response = await axiosInstance.post(
        "/jobs/update-application-status",
        {
          jobId: jobId,
          userId: applicant._id || applicant.id,
          status: newStatus,
          note: `Status updated to ${newStatus}`,
        }
      );

      if (response.data) {
        setSelectedStatus(newStatus);
        setIsOpen(false);
        if (onStatusUpdate) {
          onStatusUpdate(applicant._id || applicant.id, newStatus);
        }
      }
    } catch (error) {
      console.error("Error updating application status:", error);
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Unknown error occurred";
      alert(`Error updating status: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Update selectedStatus when currentStatus changes
  React.useEffect(() => {
    setSelectedStatus(currentStatus || "Applied");
    if (isDropdownEnabled) setIsOpen(false);
  }, [currentStatus]);

  // Define colors based on selected status
  const getColor = () => {
    switch (selectedStatus) {
      case "Applied":
        return "#3B82F6"; // Blue
      case "Under Review":
        return "#F59E0B"; // Orange
      case "Interview":
        return "#8B5CF6"; // Purple
      case "Accepted":
        return "#10B981"; // Green
      case "Rejected":
        return "#EF4444"; // Red
      default:
        return "#6B7280"; // Gray
    }
  };

  const statusOptions = [
    "Applied",
    "Under Review",
    "Interview",
    "Accepted",
    "Rejected",
  ];

  return (
    <div
      className={`rounded-xl shadow-sm border border-gray-100 ${
        !isDropdownEnabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
      style={{
        border: `1px solid ${getColor()}`,
        backgroundColor: `${getColor()}20`,
      }}
    >
      {/* Header Row */}
      <div
        className={`flex items-center justify-between px-4 py-3 ${
          isDropdownEnabled ? "cursor-pointer" : "cursor-not-allowed"
        }`}
        onClick={toggleOpen}
      >
        <div className="flex items-center space-x-2">
          <h2
            className="text-base font-medium font-inter"
            style={{ color: getColor(), fontFamily: "Inter, sans-serif" }}
          >
            {selectedStatus}
          </h2>
          {!isDropdownEnabled && (
            <span
              className="text-xs text-gray-500 font-inter"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {currentStatus === "Applied"
                ? "(Accept applicant to enable)"
                : currentStatus === "Rejected"
                ? "(Rejected applicants cannot be staged)"
                : null}
            </span>
          )}
        </div>
        {isDropdownEnabled && (
          <>
            {isOpen ? (
              <AiOutlineUp className="text-sm" style={{ color: getColor() }} />
            ) : (
              <AiOutlineDown
                className="text-sm"
                style={{ color: getColor() }}
              />
            )}
          </>
        )}
      </div>

      {/* Dropdown Content */}
      {isOpen && isDropdownEnabled && (
        <div className="bg-white p-4 space-y-2 rounded-b-xl">
          {statusOptions.map((status) => (
            <button
              key={status}
              disabled={loading}
              className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50 font-inter ${
                selectedStatus === status ? "bg-gray-100 font-medium" : ""
              }`}
              style={{ fontFamily: "Inter, sans-serif" }}
              onClick={() => handleStatusChange(status)}
            >
              {status}
            </button>
          ))}
          {loading && (
            <div
              className="text-center text-sm text-gray-500 font-inter"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              Updating status...
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InterviewStage({ label }) {
  return (
    <div className="flex items-center justify-between">
      <span
        className="text-sm text-gray-700 font-inter"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {label}
      </span>
      <button
        className="text-sm text-blue-500 hover:text-blue-600 font-inter"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Edit
      </button>
    </div>
  );
}

function PersonalInformation({ applicant }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2
        className="text-lg font-medium text-gray-800 mb-4 font-inter"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Personal Information
      </h2>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span
            className="text-sm text-gray-500 font-inter"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Email Address
          </span>
          <a
            href="mailto:rahulthakar@gmail.com"
            className="text-sm text-blue-600 hover:underline font-inter"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {applicant.email}
          </a>
        </div>
        <div className="flex items-center justify-between">
          <span
            className="text-sm text-gray-500 font-inter"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Mobile No.
          </span>
          <a
            href={`tel:+91${applicant.phoneNo}`}
            className="text-sm text-blue-600 hover:underline font-inter"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            +91 {applicant.phoneNo}
          </a>
        </div>
        <div className="flex items-center justify-between">
          <span
            className="text-sm text-gray-500 font-inter"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            Location
          </span>
          <span
            className="text-sm text-gray-700 font-inter"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {applicant.location.city}, {applicant.location.state}
          </span>
        </div>
      </div>
    </div>
  );
}

function MatchPercentage({ applicant, jobId }) {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/userSide/${jobId}`);
        setJob(response.data);
      } catch (err) {
        setError(err);
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [jobId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
        <div
          className="text-center text-sm text-gray-500 font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Loading job details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
        <div
          className="text-center text-sm text-red-500 font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Error: {error.message}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
        <div
          className="text-center text-sm text-gray-500 font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          No job data found
        </div>
      </div>
    );
  }

  // Use the exact matchPercentage from the applicant object (calculated in Applicants.jsx)
  const percentage =
    applicant.matchPercentage || calculateMatchPercentage(job, applicant);
  const breakdown = getMatchBreakdown(job, applicant);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
      <h3
        className="text-base font-medium text-gray-800 mb-1 text-start font-inter"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Match Percentage
      </h3>
      <p
        className="text-sm text-gray-500 text-start mb-4 font-inter"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Here's how well this candidate matches your job criteria.
      </p>

      {/* Match Percentage Chart */}
      <div className="mx-auto my-6" style={{ width: "120px", height: "120px" }}>
        <CircularProgressbar
          value={percentage}
          text={`${percentage}%`}
          styles={buildStyles({
            rotation: 0,
            strokeLinecap: "round",
            textSize: "20px",
            pathColor: "#1890FF",
            textColor: "#1F2937",
            trailColor: "#E5E7EB",
            backgroundColor: "#fff",
          })}
          strokeWidth={10}
        />
      </div>

      <p
        className="text-2xl font-medium text-gray-800 mb-1 font-inter"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        {percentage}%
      </p>
      <p
        className="text-sm text-gray-500 mb-4 font-inter"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        Match Score
      </p>
      <hr className="mb-4" />

      {/* Qualification */}
      <div className="text-left mt-4">
        <h3
          className="text-lg font-medium text-gray-800 font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Qualification
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <span
            className={`inline-block text-sm py-1 px-3 rounded-md font-inter ${
              breakdown?.qualification?.matched
                ? "bg-[#1890FF] text-white"
                : "bg-red-100 text-red-600"
            }`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {breakdown?.qualification?.userHas ||
              applicant?.education?.[0]?.qualification ||
              "Not specified"}
          </span>
        </div>
      </div>

      {/* Experience */}
      <div className="text-left mt-4">
        <h3
          className="text-lg font-medium text-gray-800 font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Experience
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <span
            className={`inline-block text-sm py-1 px-3 rounded-md font-inter ${
              breakdown?.experience?.matched
                ? "bg-[#1890FF] text-white"
                : "bg-red-100 text-red-600"
            }`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {breakdown?.experience?.userHas
              ? `${breakdown.experience.userHas} Years`
              : "No experience"}
          </span>
        </div>
      </div>

      {/* Skills */}
      <div className="text-left mt-4">
        <h3
          className="text-lg font-medium text-gray-800 font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Skills
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {breakdown?.skills?.matched?.map((skill, index) => (
            <span
              key={index}
              className="inline-block bg-[#1890FF] text-white text-sm py-1 px-3 rounded-md font-inter"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {skill}
            </span>
          ))}
          {breakdown?.skills?.unmatched?.map((skill, index) => (
            <span
              key={`unmatched-${index}`}
              className="inline-block bg-red-100 text-red-600 text-sm py-1 px-3 rounded-md font-inter"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              {skill}
            </span>
          ))}
          {!breakdown?.skills?.matched?.length &&
            !breakdown?.skills?.unmatched?.length && (
              <span
                className="text-sm text-gray-500 font-inter"
                style={{ fontFamily: "Inter, sans-serif" }}
              >
                No skills data available
              </span>
            )}
        </div>
      </div>

      {/* Location */}
      <div className="text-left mt-4">
        <h3
          className="text-lg font-medium text-gray-800 font-inter"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          Location
        </h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <span
            className={`inline-block text-sm py-1 px-3 rounded-md font-inter ${
              breakdown?.location?.matched
                ? "bg-[#1890FF] text-white"
                : "bg-red-100 text-red-600"
            }`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {breakdown?.location?.userHas || "Not specified"}
          </span>
        </div>
      </div>
    </div>
  );
}

// function SpecializationSection() {
//   return (
//     <div className="bg-white rounded-md shadow-sm p-4 md:p-6">
//       <h2 className="text-lg font-semibold text-gray-800">Specialization</h2>
//       <p className="text-sm text-gray-600 mt-2">Medical Dermatology</p>
//     </div>
//   );
// }

export function ApplicantDetails({
  applicant,
  setSelectedApplicant,
  jobId,
  onStatusUpdate,
  applicants = [],
  currentIndex = 0,
  onClose,
}) {
  const [activeTab, setActiveTab] = useState("jobApplication");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div
      className="h-full w-full bg-[#F7F8FA] overflow-y-auto"
      style={{ minHeight: "100vh" }}
    >
      <div className="flex flex-col min-h-0">
        <ProfileHeader
          activeTab={activeTab}
          onTabClick={handleTabClick}
          applicant={applicant}
          setSelectedApplicant={setSelectedApplicant}
          jobId={jobId}
          onStatusUpdate={onStatusUpdate}
          applicants={applicants}
          currentIndex={currentIndex}
          onClose={onClose}
        />

        {/* Content Area - Exact same structure as JobDetails */}
        <div className="flex flex-row gap-6 p-6 min-h-0">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* Content sections moved here */}
            <div>
              {activeTab === "jobApplication" && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="md:col-span-2 space-y-6">
                    <AboutSection applicant={applicant} />
                    <QualificationSection applicant={applicant} />
                    <WorkExperienceSection applicant={applicant} />
                    <SkillsSection applicant={applicant} />
                    <CertificatesSection applicant={applicant} />
                  </div>
                  <div className="md:col-span-1 space-y-6">
                    <ApplicationStatusDropdown
                      applicant={applicant}
                      jobId={jobId}
                      currentStatus={applicant.status || "Applied"}
                      onStatusUpdate={onStatusUpdate}
                    />
                    <PersonalInformation applicant={applicant} />
                    <MatchPercentage applicant={applicant} jobId={jobId} />
                  </div>
                </div>
              )}
              {activeTab === "Resume" && <Resume applicant={applicant} />}
              {activeTab === "Message" && <Message applicant={applicant} />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
