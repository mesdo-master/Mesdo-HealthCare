import { useState, useRef, useEffect } from "react";
import { ChevronDown, Briefcase, Tag, Calendar } from "lucide-react";

export default function Filters() {
  const [openDropdown, setOpenDropdown] = useState(null);
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

  const filterOptions = [
    {
      label: "Active Jobs",
      icon: <Briefcase size={16} className="text-gray-500" />,
      menu: "activeJobs",
      options: ["All Jobs", "Active Jobs", "Closed Jobs"],
    },
    {
      label: "Tags",
      icon: <Tag size={16} className="text-gray-500" />,
      menu: "tags",
      options: ["Engineering", "Design", "Healthcare"],
    },
    {
      label: "Valid till",
      icon: <Calendar size={16} className="text-gray-500" />,
      menu: "validTill",
      options: ["7 Days", "30 Days", "No Expiry"],
    },
  ];

  return (
    <section className="flex  gap-3 mb-6">
      {filterOptions.map((filter, index) => (
        <div key={index} className="relative" ref={dropdownRef}>
          <button
            className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all"
            onClick={() => toggleDropdown(filter.menu)}
          >
            {filter.icon}
            <span className="text-gray-600 text-sm">{filter.label}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {openDropdown === filter.menu && (
            <div className="absolute left-0 mt-2 w-40 bg-white shadow-lg border border-gray-200 rounded-md z-20">
              <ul className="py-2">
                {filter.options.map((option, idx) => (
                  <li
                    key={idx}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer transition-all text-sm"
                  >
                    {option}
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