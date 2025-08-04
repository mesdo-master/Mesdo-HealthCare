import { Link } from "react-router-dom";

export default function Topbar({ jobs = [] }) {
  // Calculate real status counts from jobs data
  const getStatusCounts = () => {
    const counts = {
      Active: 0,
      "On Hold": 0,
      Closed: 0,
      Draft: 0,
    };

    jobs.forEach((job) => {
      if (job.jobStatus === "Active") {
        counts.Active++;
      } else if (job.jobStatus === "On Hold" || job.jobStatus === "Pending") {
        counts["On Hold"]++;
      } else if (job.jobStatus === "Closed" || job.jobStatus === "Inactive") {
        counts.Closed++;
      } else if (job.jobStatus === "Draft" || job.jobStatus === "Draft Hold") {
        counts.Draft++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

  // Status indicators data with real counts
  const statuses = [
    { label: "Active", count: statusCounts.Active, color: "bg-green-500" },
    {
      label: "On Hold",
      count: statusCounts["On Hold"],
      color: "bg-yellow-400",
    },
    { label: "Closed", count: statusCounts.Closed, color: "bg-red-500" },
    { label: "Draft", count: statusCounts.Draft, color: "bg-gray-400" },
  ];

  return (
    <header className="flex justify-between items-end mb-6 min-h-[60px]">
      {/* Left Section - Title & Status Indicators */}
      <div className="min-w-0 flex-1 pr-4">
        {/* Title */}
        <h2 className="font-inter font-semibold text-[24px] sm:text-[28px] lg:text-[32px] leading-[1.2] text-gray-900">
          Recruitment
        </h2>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 text-sm text-gray-600 mt-2 overflow-x-auto scrollbar-hide">
          {statuses.map((status, index) => (
            <div
              key={index}
              className="flex items-center gap-1 whitespace-nowrap flex-shrink-0"
            >
              <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
              {status.label} ({status.count})
            </div>
          ))}
        </div>
      </div>

      {/* Right Section - Create New Job Button */}
      <Link
        className="bg-[#1890FF] text-white py-2 px-2 lg:px-3 rounded-md hover:bg-blue-700 text-sm lg:text-base whitespace-nowrap flex-shrink-0"
        to="create"
      >
        + Create New Job
      </Link>
    </header>
  );
}
