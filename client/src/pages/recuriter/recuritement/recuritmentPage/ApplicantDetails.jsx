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
import Resume from "./Resume";
import Message from "./Message";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../../../lib/axio";
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
function TopBar({ setSelectedApplicant }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white mt-[7vh]">
      {/* Left side: back/forward arrows + "1 out of 10" */}
      <div className="flex items-center space-x-2">
        {/* Back Button - Navigates to Applicants Section */}
        <button
          className="p-1 text-gray-600 hover:text-gray-900"
          onClick={() => navigate("/applicants/:jobTitle")} // Change to your applicants page route
        >
          <AiOutlineArrowLeft className="text-lg" />
        </button>
        <span className="text-sm text-gray-500">1 out of 10</span>
        <button className="p-1 text-gray-600 hover:text-gray-900">
          <AiOutlineArrowRight className="text-lg" />
        </button>
      </div>
      {/* Right side: close icon */}
      <button
        className="p-1 text-gray-600 hover:text-gray-900"
        onClick={() => setSelectedApplicant(null)}
      >
        <AiOutlineClose className="text-xl" />
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
      alert(`Error rejecting application: ${errorMessage}`);
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
    if (currentStatus === "Accepted") {
      return (
        <div className="flex items-center space-x-2">
          <div
            className={`flex items-center justify-center rounded-md text-sm font-medium ${getStatusColor(
              "Accepted"
            )}`}
            style={{
              width: "141px",
              height: "48px",
              borderRadius: "6px",
              padding: "12px 24px 12px 32px",
              gap: "8px",
            }}
          >
            <span>Accepted</span> ✔
          </div>
        </div>
      );
    } else if (currentStatus === "Rejected") {
      return (
        <div className="flex items-center space-x-2">
          <div
            className={`flex items-center justify-center rounded-md text-sm font-medium ${getStatusColor(
              "Rejected"
            )}`}
            style={{
              width: "141px",
              height: "48px",
              borderRadius: "6px",
              padding: "12px 24px 12px 32px",
              gap: "8px",
            }}
          >
            <span>Rejected</span> ✖
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-2">
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
            {!loading && "✔"}
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
            {!loading && "✖"}
          </button>
        </div>
      );
    }
  };

  return (
    <div className="bg-white shadow-sm">
      {/* Profile Info */}
      <div className="flex items-center justify-between px-4 py-4 h-38">
        <div className="flex items-center space-x-4">
          <img
            src={
              applicant.profilePicture ||
              "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
            }
            alt="Profile"
            className="w-14 h-14 rounded-full object-cover"
          />
          <div>
            <h1 className="text-base font-semibold text-gray-800">
              {applicant.name}
            </h1>
            {/* <p className="text-sm text-gray-500">
              Dermatologist at Apollo Hospital | MBBS ---> change this in the future
            </p> */}
          </div>
        </div>

        {/* Dynamic Action Buttons */}
        {renderActionButtons()}
      </div>

      {/* Spacing between profile details and tabs */}
      <div className="border-t border-gray-200"></div>

      {/* Tabs */}
      <div className="flex items-center space-x-6 px-4 mt-2">
        <TabItem
          label="Job Application"
          active={activeTab === "jobApplication"}
          onClick={() => onTabClick("jobApplication")}
        />
        <TabItem
          label="Resume"
          active={activeTab === "Resume"}
          onClick={() => onTabClick("Resume")}
        />
        <TabItem
          label="Messages"
          active={activeTab === "Messages"}
          onClick={() => onTabClick("Messages")}
        />
      </div>
    </div>
  );
}

function TabItem({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative py-3 text-sm font-medium text-gray-600 hover:text-gray-800 transition ${
        active ? "text-gray-800" : ""
      }`}
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
}) {
  const [applicantStatus, setApplicantStatus] = useState(
    applicant.status || "Applied"
  );

  const handleStatusUpdate = (userId, newStatus) => {
    setApplicantStatus(newStatus);
    // Call the parent's onStatusUpdate function
    if (onStatusUpdate) {
      onStatusUpdate(userId, newStatus);
    }
  };

  return (
    <div>
      <TopBar setSelectedApplicant={setSelectedApplicant} />
      <ProfileHeaderWithTabs
        activeTab={activeTab}
        onTabClick={onTabClick}
        applicant={applicant}
        jobId={jobId}
        onStatusUpdate={handleStatusUpdate}
      />
      <div className="mt-6">
        {activeTab === "jobApplication" && (
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <AboutSection applicant={applicant} />
              <QualificationSection applicant={applicant} />
              <WorkExperienceSection applicant={applicant} />
              <SkillsCertificatesSection applicant={applicant} />
            </div>
            <div className="md:col-span-1 space-y-6">
              <ApplicationStatusDropdown
                applicant={applicant}
                jobId={jobId}
                currentStatus={applicantStatus}
                onStatusUpdate={handleStatusUpdate}
              />
              <PersonalInformation applicant={applicant} />
              <MatchPercentage applicant={applicant} jobId={jobId} />
            </div>
          </div>
        )}
        {activeTab === "Resume" && <Resume applicant={applicant} />}
        {activeTab === "Messages" && <Message applicant={applicant} />}
      </div>
    </div>
  );
}

// About + Qualification Container with a tracking line style
function AboutSection({ applicant }) {
  return (
    <div className="bg-white rounded-md shadow-sm p-4 md:p-6">
      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-800 mb-2">About</h2>
      {/* Render HTML */}
      <div
        className="text-sm text-gray-600 leading-relaxed"
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
    <div className="bg-white rounded-md shadow-sm p-4 md:p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Qualification
      </h2>

      {educationList.length > 0 ? (
        <div className="space-y-4">
          {educationList.map((qual, index) => (
            <QualificationItem
              key={index}
              icon={<img src={schoolIcon} alt="School" className="w-5 h-5" />}
              title={qual.qualification}
              institute={qual.university}
              date={qual.passingYear}
            />
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic">
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
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-600">{institute}</p>
        <p className="text-xs text-gray-500 mt-1">{date}</p>
      </div>
    </div>
  );
}

// Work Experience with a similar tracking line style
function WorkExperienceSection({ applicant }) {
  const experiences = applicant?.experience || [];

  return (
    <div className="bg-white rounded-md shadow-sm p-4 md:p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Work Experience
      </h2>

      {experiences.length > 0 ? (
        <div className="space-y-6">
          {experiences.map((exp, index) => (
            <WorkExperienceItem
              key={index}
              icon={<MdWork className="text-blue-500 text-xl" />}
              title={exp.title}
              organization={exp.institution}
              date={`${exp.type}  | ${exp.startDate} – ${exp.endDate}`}
              htmlDescription={exp.description}
            />
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-500 italic">
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
      {/* Icon on the left */}
      <div className="mt-1">{icon}</div>

      {/* Content */}
      <div>
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-600 mt-0.5">{organization}</p>
        <p className="text-xs text-gray-500 mt-1">{date}</p>

        <div
          className="mt-2 text-sm text-gray-600 leading-relaxed space-y-2"
          dangerouslySetInnerHTML={{ __html: htmlDescription }}
        />
      </div>
    </div>
  );
}

// Combined Skills and Certificates/Awards container
function SkillsCertificatesSection({ applicant }) {
  const skills = applicant?.skills || [];
  const certifications = applicant?.certifications || [];

  return (
    <div className="bg-white rounded-md shadow-sm p-4 md:p-6 space-y-8">
      {/* Skills Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FaTools className="text-blue-600" /> Skills
        </h2>
        {skills.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="inline-block bg-blue-50 text-blue-700 text-sm py-1 px-3 rounded-full"
              >
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-2 italic">
            No skills added yet.
          </p>
        )}
      </div>

      {/* Certificates Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <SlBadge className="text-yellow-600" /> Certificates &amp; Awards
        </h2>
        {certifications.length > 0 ? (
          <div className="mt-4 space-y-4">
            {certifications.map((cert, index) => (
              <CertificateItem
                key={index}
                name={cert.name}
                issuer={cert.issuedBy}
                date={cert.year}
                icon={<SlBadge className="text-yellow-600 mt-1" />}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-2 italic">
            No certificates or awards added yet.
          </p>
        )}
      </div>
    </div>
  );
}

function CertificateItem({ name, issuer, date, icon }) {
  return (
    <div className="flex items-start space-x-3">
      {icon}
      <div className="text-sm text-gray-600">
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

  // Determine if dropdown should be enabled based on current status
  const isDropdownEnabled = currentStatus === "Accepted";

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

    // Auto-open dropdown when status changes to "Accepted"
    if (currentStatus === "Accepted") {
      setIsOpen(true);
    }
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
      className={`rounded-md shadow-sm ${
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
          <h2 className="text-base font-medium" style={{ color: getColor() }}>
            {selectedStatus}
          </h2>
          {!isDropdownEnabled && (
            <span className="text-xs text-gray-500">
              (Accept applicant to enable)
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
        <div className="bg-white p-4 space-y-2 rounded-b-md">
          {statusOptions.map((status) => (
            <button
              key={status}
              disabled={loading}
              className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50 ${
                selectedStatus === status ? "bg-gray-100 font-medium" : ""
              }`}
              onClick={() => handleStatusChange(status)}
            >
              {status}
            </button>
          ))}
          {loading && (
            <div className="text-center text-sm text-gray-500">
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
      <span className="text-sm text-gray-700">{label}</span>
      <button className="text-sm text-blue-500 hover:text-blue-600">
        Edit
      </button>
    </div>
  );
}

function PersonalInformation({ applicant }) {
  return (
    <div className="bg-white rounded-md shadow-sm p-4">
      <h2 className="text-base font-semibold text-gray-800 mb-3">
        Personal Information
      </h2>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">Email Address</span>
        <a
          href="mailto:rahulthakar@gmail.com"
          className="text-sm text-blue-600 hover:underline"
        >
          {applicant.email}
        </a>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">Mobile No.</span>
        <a
          href={`tel:+91${applicant.phoneNo}`}
          className="text-sm text-blue-600 hover:underline"
        >
          +91 {applicant.phoneNo}
        </a>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Location</span>
        <span className="text-sm text-gray-700">
          {applicant.location.city}, {applicant.location.state}
        </span>
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
      <div className="bg-white rounded-md shadow-sm p-4 md:p-6 text-center">
        <div className="text-center text-sm text-gray-500">
          Loading job details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-md shadow-sm p-4 md:p-6 text-center">
        <div className="text-center text-sm text-red-500">
          Error: {error.message}
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="bg-white rounded-md shadow-sm p-4 md:p-6 text-center">
        <div className="text-center text-sm text-gray-500">
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
    <div className="bg-white rounded-md shadow-sm p-4 md:p-6 text-center">
      <h3 className="text-base font-medium text-gray-800 mb-1 text-start">
        Match Percentage
      </h3>
      <p className="text-sm text-gray-500 text-start mb-4">
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

      <p className="text-2xl font-medium text-gray-800 mb-1">{percentage}%</p>
      <p className="text-sm text-gray-500 mb-4">Match Score</p>
      <hr className="mb-4" />

      {/* Qualification */}
      <div className="text-left mt-4">
        <h3 className="text-lg font-medium text-gray-800">Qualification</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <span
            className={`inline-block text-sm py-1 px-3 rounded-md ${
              breakdown?.qualification?.matched
                ? "bg-[#1890FF] text-white"
                : "bg-red-100 text-red-600"
            }`}
          >
            {breakdown?.qualification?.userHas ||
              applicant?.education?.[0]?.qualification ||
              "Not specified"}
          </span>
        </div>
      </div>

      {/* Experience */}
      <div className="text-left mt-4">
        <h3 className="text-lg font-medium text-gray-800">Experience</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <span
            className={`inline-block text-sm py-1 px-3 rounded-md ${
              breakdown?.experience?.matched
                ? "bg-[#1890FF] text-white"
                : "bg-red-100 text-red-600"
            }`}
          >
            {breakdown?.experience?.userHas
              ? `${breakdown.experience.userHas} Years`
              : "No experience"}
          </span>
        </div>
      </div>

      {/* Skills */}
      <div className="text-left mt-4">
        <h3 className="text-lg font-medium text-gray-800">Skills</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {breakdown?.skills?.matched?.map((skill, index) => (
            <span
              key={index}
              className="inline-block bg-[#1890FF] text-white text-sm py-1 px-3 rounded-md"
            >
              {skill}
            </span>
          ))}
          {breakdown?.skills?.unmatched?.map((skill, index) => (
            <span
              key={`unmatched-${index}`}
              className="inline-block bg-red-100 text-red-600 text-sm py-1 px-3 rounded-md"
            >
              {skill}
            </span>
          ))}
          {!breakdown?.skills?.matched?.length &&
            !breakdown?.skills?.unmatched?.length && (
              <span className="text-sm text-gray-500">
                No skills data available
              </span>
            )}
        </div>
      </div>

      {/* Location */}
      <div className="text-left mt-4">
        <h3 className="text-lg font-medium text-gray-800">Location</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          <span
            className={`inline-block text-sm py-1 px-3 rounded-md ${
              breakdown?.location?.matched
                ? "bg-[#1890FF] text-white"
                : "bg-red-100 text-red-600"
            }`}
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
}) {
  const [activeTab, setActiveTab] = useState("jobApplication");

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <ProfileHeader
          activeTab={activeTab}
          onTabClick={handleTabClick}
          applicant={applicant}
          setSelectedApplicant={setSelectedApplicant}
          jobId={jobId}
          onStatusUpdate={onStatusUpdate}
        />
      </div>
    </div>
  );
}
