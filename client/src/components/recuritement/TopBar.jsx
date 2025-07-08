import { Link } from "react-router-dom";

export default function Topbar() {

  // Status indicators data
  const statuses = [
    { label: "Active", count: 2, color: "bg-green-500" },
    { label: "On Hold", count: 0, color: "bg-yellow-400" },
    { label: "Closed", count: 4, color: "bg-red-500" },
    { label: "Drafts Hold", count: 1, color: "bg-gray-400" },
  ];

  return (
    <header className="flex justify-between items-end mb-6">
      {/* Left Section - Title & Status Indicators */}
      <div>
        {/* Title */}
        <h2 className="font-inter font-semibold text-[32px] leading-[38.73px] text-gray-900">
          Recruitment
        </h2>

        {/* Status Indicators */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
          {statuses.map((status, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${status.color}`}></span>
              {status.label} ({status.count})
            </div>
          ))}
        </div>
      </div>

      {/* Right Section - Create New Job Button */}
      <Link
        className="bg-[#1890FF] text-white py-2 px-2 rounded-md hover:bg-blue-700"
        to="create"
      >
        + Create New Job
      </Link>
    </header>
  );
}