import React, { useState, useEffect, useCallback } from "react";
import {
  useNavigate,
  useParams,
  Outlet,
  useOutletContext,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import JobCard from "./components/JobCard";
import JobDetails from "./components/JobDetails";
import JobStats from "./components/JobStats";
import JobFilters from "./components/JobFilters";
import JobSort from "./components/JobSort";
// import { fetchJobs } from "../../../store/features/jobSlice";
import { setFilteredJobs } from "../../../store/features/authSlice";
import { calculateMatchPercentage } from "../../../utils/matchPercentage";
import axiosInstance from "../../../lib/axio";
import ReactDOM from "react-dom";

const JobPage = () => {
  const { filteredJobs, currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

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

  // Handle job hidden - remove from current display and filtered jobs
  const handleJobHidden = useCallback(
    (hiddenJobId) => {
      setJobs((prevJobs) => prevJobs.filter((job) => job._id !== hiddenJobId));

      // Also remove from filtered jobs if they exist
      if (filteredJobs) {
        const updatedFilteredJobs = filteredJobs.filter(
          (job) => job._id !== hiddenJobId
        );
        dispatch(setFilteredJobs(updatedFilteredJobs));
      }
    },
    [filteredJobs, dispatch]
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
                    onJobHidden={handleJobHidden}
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
