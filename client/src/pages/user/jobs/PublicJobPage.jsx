import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../lib/axio";

const PublicJobPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/userSide/${jobId}`);
        setJob(res.data.job || res.data);
      } catch (err) {
        setError("Job not found or unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  const handleApply = () => {
    // Check auth (pseudo, replace with real check)
    const isAuthenticated = false; // TODO: wire to real auth state
    if (!isAuthenticated) {
      navigate("/signup");
    } else {
      // Proceed to application flow
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  if (!job) return null;

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col items-center py-10">
      {/* Floating Signup Prompt */}
      <div className="fixed top-1/2 right-16 transform -translate-y-1/2 z-50">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-[400px] h-[220px] flex flex-col items-start border border-gray-100 justify-between">
          <div className="w-full">
            <h2 className="text-base font-semibold mb-1 text-gray-900">
              Signup Now:
            </h2>
            <p className="text-gray-500 mb-6 text-sm">
              Lorem ipsum dolor sit amet consectetur. Elementum volutpat aliquam
              vestibulum gravida est nibh.
            </p>
          </div>
          <div className="flex w-full gap-3 mt-auto">
            <button
              onClick={() => navigate("/signup")}
              className="w-[120px] h-[40px] rounded-sm bg-[#1570EF] text-white font-medium hover:bg-[#175CD3] transition text-sm flex items-center justify-center"
            >
              Sign Up
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="w-[220px] h-[40px] text-sm rounded-sm border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2  whitespace-nowrap"
            >
              <img
                src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
                alt="Google"
                className="w-8 h-8 "
              />
              Sign Up with Google
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl shadow-lg max-w-4xl w-full p-10">
        {/* Header */}
        <div className="flex items-center gap-6 mb-6">
          <img
            src={
              job.hospitalLogo ||
              "https://img.freepik.com/free-vector/hospital-logo-design-vector-medical-cross_53876-136743.jpg?semt=ais_hybrid&w=740"
            }
            alt="Logo"
            className="w-20 h-20 rounded-lg object-contain border"
          />
          <div>
            <span className="inline-block bg-[#E6E6FA] text-[#A259FF] text-xs font-medium px-3 py-1 rounded mb-2">
              Recently active
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {job.jobTitle}
            </h1>
            <div className="text-gray-500 text-sm">
              {job.HospitalName} | {job.location}
            </div>
          </div>
          <button
            className="ml-auto bg-blue-500 hover:bg-blue-600 text-white font-semibold px-7 py-2.5 rounded-lg text-base shadow transition-all duration-150"
            onClick={handleApply}
          >
            Apply Now
          </button>
        </div>
        {/* Job Stats */}
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          {/* Area */}
          <div className="flex flex-col items-start bg-white rounded-xl shadow border border-gray-100 px-6 py-5 min-w-[180px] min-h-[90px]">
            <span className="text-blue-500 text-2xl mb-2">📍</span>
            <span className="font-bold text-[18px] text-[#1890FF] break-words text-left">
              {job.location || "-"}
            </span>
            <span className="text-xs text-gray-500 mt-1">Area</span>
          </div>
          {/* Job-Type */}
          <div className="flex flex-col items-start bg-white rounded-xl shadow border border-gray-100 px-6 py-5 min-w-[180px] min-h-[90px]">
            <span className="text-blue-500 text-2xl mb-2">��</span>
            <span className="font-bold text-[18px] text-[#1890FF]">
              {job.employmentType || "-"}
            </span>
            <span className="text-xs text-gray-500 mt-1">Job-Type</span>
          </div>
          {/* Salary */}
          <div className="flex flex-col items-start bg-white rounded-xl shadow border border-gray-100 px-6 py-5 min-w-[180px] min-h-[90px]">
            <span className="text-blue-500 text-2xl mb-2">💰</span>
            <span className="font-bold text-[18px] text-[#1890FF]">
              {job.salaryRangeFrom && job.salaryRangeTo
                ? `${job.salaryRangeFrom / 100000} - ${
                    job.salaryRangeTo / 100000
                  }L`
                : "-"}
            </span>
            <span className="text-xs text-gray-500 mt-1">Salary</span>
          </div>
          {/* Year */}
          <div className="flex flex-col items-start bg-white rounded-xl shadow border border-gray-100 px-6 py-5 min-w-[180px] min-h-[90px]">
            <span className="text-blue-500 text-2xl mb-2">⏳</span>
            <span className="font-bold text-[18px] text-[#1890FF]">
              {job.experience ? `${job.experience}+` : "-"}
            </span>
            <span className="text-xs text-gray-500 mt-1">Year</span>
          </div>
        </div>
        {/* Job Description */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2">Job Description</h2>
          <div className="text-gray-600 text-sm leading-relaxed">
            {job.jobDescription ? (
              <div dangerouslySetInnerHTML={{ __html: job.jobDescription }} />
            ) : (
              job.description || "No description provided."
            )}
          </div>
        </div>
        {/* Specialization Required */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg mb-2">
            Specialization Required
          </h2>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(job.skills) && job.skills.length > 0
              ? job.skills
              : ["Hospital", "Clinic", "Health Insurance", "Pharmacy"]
            ).map((spec, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-700 rounded-full px-4 py-1 text-sm"
              >
                {spec}
              </span>
            ))}
          </div>
        </div>
        {/* Additional Details */}
        <div className="bg-[#F7F8FA] rounded-xl p-6">
          <h2 className="font-semibold text-lg mb-4">Additional Detail</h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            <div className="font-medium text-gray-500">Employment Type</div>
            <div className="font-semibold text-gray-900">
              {job.employmentType}
            </div>
            <div className="font-medium text-gray-500">Experience Required</div>
            <div className="font-semibold text-gray-900">{job.experience}+</div>
            <div className="font-medium text-gray-500">Job Category</div>
            <div className="font-semibold text-gray-900">
              {job.category || "Doctor"}
            </div>
            <div className="font-medium text-gray-500">Number of Openings</div>
            <div className="font-semibold text-gray-900">
              {job.openings || 1}
            </div>
            <div className="font-medium text-gray-500">Salary Range</div>
            <div className="font-semibold text-gray-900">
              {job.salaryRangeFrom} - {job.salaryRangeTo} / year
            </div>
            <div className="font-medium text-gray-500">Skills</div>
            <div className="font-semibold text-gray-900">
              {job.skills || "-"}
            </div>
            <div className="font-medium text-gray-500">
              Qualification Required
            </div>
            <div className="font-semibold text-gray-900">
              {job.qualification}
            </div>
            <div className="font-medium text-gray-500">Department</div>
            <div className="font-semibold text-gray-900">{job.department}</div>
            <div className="font-medium text-gray-500">Shift</div>
            <div className="font-semibold text-gray-900">{job.shift}</div>
            <div className="font-medium text-gray-500">Preferred Language</div>
            <div className="font-semibold text-gray-900">{job.language}</div>
            <div className="font-medium text-gray-500">
              Specialization Required
            </div>
            <div className="font-semibold text-gray-900">
              {(job.specializationRequired || []).join(", ")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicJobPage;
