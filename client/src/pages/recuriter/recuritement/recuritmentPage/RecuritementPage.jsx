import React, { useState } from "react";
import Filters from "../../../../components/recuritement/Filters";
import JobList from "../../../../components/recuritement/JobList";
import Topbar from "../../../../components/recuritement/TopBar";
import ProfileCompletionNudge from "../../../../components/ProfileCompletionNudge";

const SIDEBAR_WIDTH = "80px";

const RecruitementPage = () => {
  // Profile completion nudge state
  const [showProfileNudge, setShowProfileNudge] = useState(true);

  return (
    <div className="flex min-h-screen bg-white mt-[10px] mr-[80px]">
      {/* Sidebar is rendered by parent layout */}
      <div className="flex-1" style={{ marginLeft: SIDEBAR_WIDTH }}>
        <div className="flex flex-col px-7 py-8 mt-[7vh]">
          <Topbar />
          <Filters />
          <JobList />
        </div>
      </div>

      {/* Profile Completion Nudge */}
      {showProfileNudge && (
        <ProfileCompletionNudge onClose={() => setShowProfileNudge(false)} />
      )}
    </div>
  );
};

export default RecruitementPage;
