import React, { useState, useEffect } from "react";
import Filters from "../../../../components/recuritement/Filters";
import JobList from "../../../../components/recuritement/JobList";
import Topbar from "../../../../components/recuritement/TopBar";
import ProfileCompletionNudge from "../../../../components/ProfileCompletionNudge";
import axiosInstance from "../../../../lib/axio";

const RecruitementPage = () => {
  // Profile completion nudge state
  const [showProfileNudge, setShowProfileNudge] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Add window size tracking for responsive design
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // ✅ Track window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch jobs data
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/jobs");
        const jobsData = response.data.jobs || [];
        setJobs(jobsData);
        setFilteredJobs(jobsData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        setJobs([]);
        setFilteredJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Handle filter changes
  const handleFilterChange = (filters) => {
    let filtered = [...jobs];

    // Filter by status
    if (filters.status !== "All Jobs") {
      if (filters.status === "Active Jobs") {
        filtered = filtered.filter((job) => job.jobStatus === "Active");
      } else if (filters.status === "Closed Jobs") {
        filtered = filtered.filter((job) => job.jobStatus === "Closed");
      }
    }

    // Filter by tags
    if (filters.tags !== "All Tags") {
      filtered = filtered.filter(
        (job) =>
          job.tags && Array.isArray(job.tags) && job.tags.includes(filters.tags)
      );
    }

    // Filter by expiry
    if (filters.validTill !== "All Time") {
      const now = new Date();
      if (filters.validTill === "7 Days") {
        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        filtered = filtered.filter((job) => {
          const endDate = new Date(job.endDate);
          return endDate <= sevenDaysFromNow && job.jobStatus === "Active";
        });
      } else if (filters.validTill === "30 Days") {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        filtered = filtered.filter((job) => {
          const endDate = new Date(job.endDate);
          return endDate <= thirtyDaysFromNow && job.jobStatus === "Active";
        });
      }
    }

    setFilteredJobs(filtered);
  };

  // Handle job deletion
  const handleJobsUpdate = (deletedJobId) => {
    setJobs((prevJobs) => prevJobs.filter((job) => job._id !== deletedJobId));
    setFilteredJobs((prevFiltered) =>
      prevFiltered.filter((job) => job._id !== deletedJobId)
    );
  };

  // ✅ Consistent left spacing, adaptive layout
  const getResponsiveLayout = () => {
    if (windowWidth <= 1599) {
      // Small/normal screens - consistent left spacing
      return {
        marginLeft: "40px", // Fixed left spacing - same on all screens
        paddingLeft: "32px",
        paddingRight: "32px",
        padding: "40px", // Adjusted for recruitment page
      };
    } else if (windowWidth <= 1920) {
      // Medium screens
      return {
        marginLeft: "-90px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        padding: "40px",
      };
    } else {
      // Large screens
      return {
        marginLeft: "50px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        padding: "40px",
      };
    }
  };

  const layout = getResponsiveLayout();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden pt-[80px]">
        <div
          className="flex flex-1 overflow-y-auto"
          style={{
            marginLeft: layout.marginLeft,
            paddingLeft: layout.paddingLeft,
            paddingRight: layout.paddingRight,
          }}
        >
          <div className="max-w-5xl mx-auto w-full">
            <div className="bg-#464d4f rounded-xl shadow-sm w-full mt-[-20px]">
              <div style={{ padding: layout.padding }}>
                <Topbar jobs={jobs} />
                <Filters jobs={jobs} onFilterChange={handleFilterChange} />
                <JobList
                  jobs={filteredJobs}
                  loading={loading}
                  onJobsUpdate={handleJobsUpdate}
                />
              </div>
            </div>
          </div>
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
