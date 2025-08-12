import React, { useState, useEffect } from "react";
import Filters from "../../../../components/recuritement/Filters";
import JobList from "../../../../components/recuritement/JobList";
import Topbar from "../../../../components/recuritement/TopBar";
import ProfileCompletionNudge from "../../../../components/ProfileCompletionNudge";
import axiosInstance from "../../../../lib/axio";

// CSS for hiding scrollbar
const scrollbarStyles = `
  .recruitment-scroll-container::-webkit-scrollbar {
    display: none;
  }
  
  .recruitment-scroll-container {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

// Inject styles
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = scrollbarStyles;
  document.head.appendChild(styleSheet);
}

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
        marginLeft: "100px", // Fixed left spacing - same on all screens
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "90px", // Same top padding as ProfilePage
      };
    } else if (windowWidth <= 1920) {
      // Medium screens
      return {
        marginLeft: "50px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "90px", // Same top padding as ProfilePage
      };
    } else {
      // Large screens
      return {
        marginLeft: "50px", // Same left spacing
        paddingLeft: "32px",
        paddingRight: "32px",
        gap: "16px",
        padding: "16px",
        topPadding: "90px", // Same top padding as ProfilePage
      };
    }
  };

  const layout = getResponsiveLayout();

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <div
          className="flex flex-1 overflow-hidden"
          style={{ paddingTop: layout.topPadding }}
        >
          <div
            className="flex flex-1 overflow-y-auto recruitment-scroll-container"
            style={{
              marginLeft: layout.marginLeft,
              paddingLeft: layout.paddingLeft,
              paddingRight: layout.paddingRight,
              scrollbarWidth: "none" /* Firefox */,
              msOverflowStyle: "none" /* Internet Explorer 10+ */,
            }}
          >
            <div className="mx-auto w-full max-w-[80rem]">
              <div className="bg-[#E4E5E8] rounded-lg w-full">
                <div
                  className="bg-[#F5F7FA] rounded-lg"
                  style={{ padding: layout.padding }}
                >
                  <div className="flex justify-center items-center h-64">
                    <div className="animate-pulse">
                      <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                      <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <div
        className="flex flex-1 overflow-hidden"
        style={{ paddingTop: layout.topPadding }}
      >
        <div
          className="flex flex-1 overflow-y-auto recruitment-scroll-container"
          style={{
            marginLeft: layout.marginLeft,
            paddingLeft: layout.paddingLeft,
            paddingRight: layout.paddingRight,
            scrollbarWidth: "none" /* Firefox */,
            msOverflowStyle: "none" /* Internet Explorer 10+ */,
          }}
        >
          <div className="mx-auto w-full max-w-[80rem]">
            <div className="bg-[#E4E5E8] rounded-lg w-full">
              <div
                className="bg-[#F5F7FA] rounded-lg"
                style={{ padding: layout.padding }}
              >
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
