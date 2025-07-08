import { Bookmark, EyeOff } from "lucide-react";
import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import JobUpdateIcon from "../../../../assets/JobUpdateIcon.png";
import SavedIcon from "../../../../assets/SavedIcon.png";
import HiddenIcon from "../../../../assets/HiddenIcon.png";

const JobStats = ({ activeTab }) => {
  const { currentUser } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const routeChange = (route) => {
    navigate(route);
  };

  const tabs = [
    {
      id: "applied",
      label: "Applied Jobs",
      count: currentUser?.appliedJobs?.length,
      icon: (
        <img
          src={JobUpdateIcon}
          alt="Applied Jobs"
          className="w-[32px] h-[32px] object-contain"
        />
      ),
      color: "text-blue-500",
      route: "/appliedJobs",
    },
    {
      id: "saved",
      label: "Saved Jobs",
      count: currentUser?.savedJobs?.length,
      icon: (
        <img
          src={SavedIcon}
          alt="Applied Jobs"
          className="w-[32px] h-[32px] object-contain"
        />
      ),
      color: "text-green-500",
      route: "/savedJobs",
    },
    {
      id: "hidden",
      label: "Hidden Jobs",
      count: currentUser?.hiddenJobs?.length,
      icon: (
        <img
          src={HiddenIcon}
          alt="Applied Jobs"
          className="w-[32px] h-[32px] object-contain"
        />
      ),
      color: "text-purple-500",
      route: "/hiddenJobs",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-6 mb-6 bg-[#f6f8fb] p-4 rounded-xl">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => routeChange(tab.route)}
          className={`flex flex-col items-start justify-between h-[170px] w-full bg-white rounded-xl border border-gray-200 shadow-sm transition-all px-6 py-6 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-100 ${
            activeTab === tab.id ? "ring-2 ring-blue-100" : ""
          }`}
          style={{ minWidth: 240 }}
        >
          <div className="mb-6">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
              {React.cloneElement(tab.icon, {
                className: `w-[32px] h-[32px] text-blue-500`,
              })}
            </span>
          </div>
          <div>
            <div className="text-base text-[18px] font-medium text-gray-900 mb-1">
              {tab.label}
            </div>
            <div className="text-sm text-gray-400 text-left font-normal">
              {tab.count || 10023} Jobs
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default JobStats;
