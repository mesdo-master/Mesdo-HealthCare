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

  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1 overflow-hidden pt-[140px]">
        <div className="flex flex-1 ml-[50px] overflow-y-auto px-8">
          <div className="max-w-5xl mx-auto w-full">
            <div className="bg-white rounded-lg border border-gray-200 w-full mt-[-20px]">
              <div className="p-10">
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
