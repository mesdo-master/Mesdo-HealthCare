import { useEffect, useState, useCallback } from "react";
import JobStats from "./components/JobStats";
import JobFilters from "./components/JobFilters";
import JobSort from "./components/JobSort";
import JobCard from "./components/JobCard";
import axiosInstance from "../../../lib/axio";
import { useNavigate, Outlet, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { AnimatePresence, motion } from "framer-motion";
import ReactDOM from "react-dom";

const JobPage = () => {
  const { filteredJobs, currentUser } = useSelector((state) => state.auth);

  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();
  const { jobId } = useParams();

  // Animation close state
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await axiosInstance.get("/userSide");
        setJobs(data);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, []);

  const handleJobSelect = useCallback(
    (id) => {
      navigate(`/jobs/${id}`);
    },
    [navigate]
  );

  // This is called by JobDetails close button
  const requestClose = useCallback(() => {
    setIsClosing(true);
  }, []);

  // Called after exit animation
  const handleExitComplete = useCallback(() => {
    if (isClosing) {
      setIsClosing(false);
      navigate("/jobs");
    }
  }, [isClosing, navigate]);

  // Weighted job match calculation
  function calculateMatchPercentage(job, user) {
    if (!user) return 0;
    // --- Skills ---
    const jobSkills = Array.isArray(job.skills)
      ? job.skills.map((s) => s.toLowerCase())
      : [];
    const userSkills = Array.isArray(user.skills)
      ? user.skills.map((s) => s.toLowerCase())
      : [];
    let skillScore = 0;
    if (jobSkills.length > 0 && userSkills.length > 0) {
      const matchedSkills = userSkills.filter((s) => jobSkills.includes(s));
      skillScore = matchedSkills.length / jobSkills.length;
    }
    // --- Experience ---
    let userExp = 0;
    if (Array.isArray(user.workExperience) && user.workExperience.length > 0) {
      userExp = Math.max(
        ...user.workExperience.map((exp) => {
          if (exp.startDate && exp.endDate) {
            return (
              (new Date(exp.endDate) - new Date(exp.startDate)) /
              (1000 * 60 * 60 * 24 * 365)
            );
          } else if (exp.startDate && exp.currentlyWorking) {
            return (
              (Date.now() - new Date(exp.startDate)) /
              (1000 * 60 * 60 * 24 * 365)
            );
          }
          return 0;
        })
      );
    }
    const jobExp = Number(job.experience) || 0;
    let expScore = 0;
    if (jobExp > 0) {
      expScore = Math.min(userExp / jobExp, 1);
    } else {
      expScore = 1; // If job doesn't specify, full score
    }
    // --- Location ---
    let locationScore = 0;
    if (user.city && job.location) {
      locationScore =
        user.city.toLowerCase() === job.location.toLowerCase() ? 1 : 0;
    } else {
      locationScore = 0.5; // Partial if missing
    }
    // --- Salary ---
    let salaryScore = 0;
    if (user.expectedSalary && job.salaryRangeFrom && job.salaryRangeTo) {
      salaryScore =
        user.expectedSalary >= job.salaryRangeFrom &&
        user.expectedSalary <= job.salaryRangeTo
          ? 1
          : 0;
    } else {
      salaryScore = 0.5; // Partial if missing
    }
    // --- Weighted sum ---
    const match =
      skillScore * 65 + expScore * 20 + locationScore * 10 + salaryScore * 5;
    return Math.round(match);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 mt-[-40px] ml-[30px] mr-[10px] ">
      {/* Blur sidebar + main content when jobId is present */}
      <div className={jobId ? "blur-sm pointer-events-none select-none" : ""}>
        <div className={"flex flex-1 overflow-hidden pt-16 mb-7 mr-20 ml-18"}>
          <div className="flex flex-1 ml-[300px] mt-9 mb-5 overflow-y-auto p-6">
            <div className="w-full max-w-5xl mx-auto">
              <JobStats />
              <JobFilters />
              <JobSort
                totalResults={
                  filteredJobs != null ? filteredJobs.length : jobs.length
                }
              />

              <div className="space-y-4">
                {(filteredJobs != null ? filteredJobs : jobs).map((job) => (
                  <JobCard
                    key={job._id}
                    job={{
                      ...job,
                      matchPercentage: calculateMatchPercentage(
                        job,
                        currentUser
                      ),
                    }}
                    onClick={() => handleJobSelect(job._id)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* JobDetails slide-in (not blurred, rendered in portal) */}
      {jobId &&
        ReactDOM.createPortal(
          <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
            {!isClosing && (
              <motion.div
                className="fixed inset-y-0 right-0 w-4/5 max-w-6xl bg-white z-[200] shadow-2xl overflow-hidden h-full"
                initial={{ x: "100%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0 }}
                transition={{
                  type: "tween",
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94], // Ultra-smooth cubic bezier
                }}
                style={{
                  willChange: "transform, opacity",
                  backfaceVisibility: "hidden",
                  transform: "translateZ(0)",
                }}
              >
                <Outlet
                  context={{
                    handleCloseDetails: requestClose,
                    jobs: filteredJobs != null ? filteredJobs : jobs,
                    jobId,
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};

export default JobPage;
