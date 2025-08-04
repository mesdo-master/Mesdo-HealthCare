import { useState, useRef, useEffect } from "react";
import { ChevronDown, Users } from "lucide-react";
import { useSelector } from "react-redux";

export default function Filters({ jobs = [], onFilterChange }) {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    status: "All Jobs",
    tags: "All Tags",
    validTill: "All Time",
  });
  const dropdownRef = useRef(null);

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate real data from jobs
  const getActiveJobsCount = () => {
    return jobs.filter((job) => job.jobStatus === "Active").length;
  };

  const getClosedJobsCount = () => {
    return jobs.filter((job) => job.jobStatus === "Closed").length;
  };

  const getAllJobsCount = () => jobs.length;

  // Get unique tags from jobs
  const getUniqueTags = () => {
    const tags = jobs.reduce((acc, job) => {
      if (job.tags && Array.isArray(job.tags)) {
        job.tags.forEach((tag) => {
          if (!acc.includes(tag)) acc.push(tag);
        });
      }
      return acc;
    }, []);
    return tags;
  };

  // Get jobs expiring soon (within 7 days)
  const getJobsExpiringSoon = () => {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    return jobs.filter((job) => {
      const endDate = new Date(job.endDate);
      return endDate <= sevenDaysFromNow && job.jobStatus === "Active";
    }).length;
  };

  // Get jobs expiring in 30 days
  const getJobsExpiringIn30Days = () => {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return jobs.filter((job) => {
      const endDate = new Date(job.endDate);
      return endDate <= thirtyDaysFromNow && job.jobStatus === "Active";
    }).length;
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...selectedFilters, [filterType]: value };
    setSelectedFilters(newFilters);
    setOpenDropdown(null);

    // Call parent callback if provided
    if (onFilterChange) {
      onFilterChange(newFilters);
    }
  };

  const filterOptions = [
    {
      label: "Active Jobs",
      icon: <Users size={16} className="text-gray-500" />,
      menu: "status",
      options: [
        { label: `All Jobs (${getAllJobsCount()})`, value: "All Jobs" },
        {
          label: `Active Jobs (${getActiveJobsCount()})`,
          value: "Active Jobs",
        },
        {
          label: `Closed Jobs (${getClosedJobsCount()})`,
          value: "Closed Jobs",
        },
      ],
      currentValue: selectedFilters.status,
    },
    {
      label: "Tags",
      icon: <Users size={16} className="text-gray-500" />,
      menu: "tags",
      options: [
        { label: "All Tags", value: "All Tags" },
        ...getUniqueTags().map((tag) => ({ label: tag, value: tag })),
      ],
      currentValue: selectedFilters.tags,
    },
    {
      label: "Valid till",
      icon: <Users size={16} className="text-gray-500" />,
      menu: "validTill",
      options: [
        { label: `7 Days (${getJobsExpiringSoon()})`, value: "7 Days" },
        { label: `30 Days (${getJobsExpiringIn30Days()})`, value: "30 Days" },
        { label: "No Expiry", value: "No Expiry" },
      ],
      currentValue: selectedFilters.validTill,
    },
  ];

  return (
    <section className="flex gap-3 mb-6">
      {filterOptions.map((filter, index) => (
        <div key={index} className="relative" ref={dropdownRef}>
          <button
            className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:bg-gray-50"
            onClick={() => toggleDropdown(filter.menu)}
          >
            {filter.icon}
            <span className="text-gray-600 text-sm font-medium font-inter font-normal leading-none tracking-[0.02em]">
              {filter.currentValue}
            </span>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform duration-200 ${
                openDropdown === filter.menu ? "rotate-180" : ""
              }`}
            />
          </button>

          {openDropdown === filter.menu && (
            <div className="absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-lg z-20 overflow-hidden">
              <ul className="py-1">
                {filter.options.map((option, idx) => (
                  <li
                    key={idx}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors duration-150 text-sm font-inter font-normal leading-none tracking-[0.02em]"
                    onClick={() =>
                      handleFilterChange(filter.menu, option.value)
                    }
                  >
                    {option.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
