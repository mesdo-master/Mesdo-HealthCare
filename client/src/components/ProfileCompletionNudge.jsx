import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useSelector } from "react-redux";

const ProfileCompletionNudge = ({ onClose }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [completionData, setCompletionData] = useState({
    percentage: 0,
    completedSections: [],
    pendingSections: [],
  });

  const { currentUser, mode, businessProfile } = useSelector(
    (state) => state.auth
  );

  // Check if nudge was dismissed
  const [isDismissed, setIsDismissed] = useState(() => {
    const dismissed = localStorage.getItem("profileNudgeDismissed");
    return dismissed === "true";
  });

  // Handle close with persistence
  const handleClose = () => {
    setIsDismissed(true);
    localStorage.setItem("profileNudgeDismissed", "true");
    onClose?.();
  };

  // Reset dismissal when profile completion changes significantly
  useEffect(() => {
    if (completionData.percentage >= 90) {
      localStorage.removeItem("profileNudgeDismissed");
    }
  }, [completionData.percentage]);

  // Calculate profile completion
  useEffect(() => {
    if (!currentUser) return;

    const calculateCompletion = () => {
      let completed = 0;
      let total = 0;
      let completedSections = [];
      let pendingSections = [];

      if (mode === "individual") {
        // User profile sections
        const userSections = [
          {
            name: "Basic Information",
            completed: !!(
              currentUser.name &&
              currentUser.email &&
              currentUser.phoneNo
            ),
          },
          {
            name: "Profile Photo",
            completed: !!currentUser.profilePicture,
          },
          {
            name: "About Section",
            completed: !!(currentUser.about && currentUser.about.length > 50),
          },
          {
            name: "Experience",
            completed: !!(
              currentUser.experience && currentUser.experience.length > 0
            ),
          },
          {
            name: "Education",
            completed: !!(
              currentUser.education && currentUser.education.length > 0
            ),
          },
          {
            name: "Skills",
            completed: !!(currentUser.skills && currentUser.skills.length >= 3),
          },
          {
            name: "Location",
            completed: !!(
              currentUser.location &&
              currentUser.location.city &&
              currentUser.location.state
            ),
          },
        ];

        userSections.forEach((section) => {
          total++;
          if (section.completed) {
            completed++;
            completedSections.push(section);
          } else {
            pendingSections.push(section);
          }
        });
      } else if (mode === "recruiter") {
        // Recruiter profile sections
        const recruiterSections = [
          {
            name: "Organization Info",
            completed: !!(
              businessProfile?.orgName && businessProfile?.orgDescription
            ),
          },
          {
            name: "Organization Logo",
            completed: !!businessProfile?.orgLogo,
          },
          {
            name: "Contact Information",
            completed: !!(
              businessProfile?.orgEmail && businessProfile?.orgPhone
            ),
          },
          {
            name: "Industry",
            completed: !!businessProfile?.industry,
          },
          {
            name: "Location",
            completed: !!businessProfile?.orgLocation,
          },
          {
            name: "Website",
            completed: !!businessProfile?.orgWebsite,
          },
        ];

        recruiterSections.forEach((section) => {
          total++;
          if (section.completed) {
            completed++;
            completedSections.push(section);
          } else {
            pendingSections.push(section);
          }
        });
      }

      const percentage = Math.round((completed / total) * 100);

      setCompletionData({
        percentage,
        completedSections,
        pendingSections,
      });
    };

    calculateCompletion();
  }, [currentUser, mode, businessProfile]);

  // Don't show if profile is complete
  if (completionData.percentage >= 100) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Collapsed State */}
      {!isExpanded && (
        <div
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 cursor-pointer hover:shadow-xl transition-all duration-300 max-w-sm animate-bounce"
          onClick={() => setIsExpanded(true)}
        >
          <div className="flex items-center gap-3">
            {/* Circular Progress */}
            <div className="relative w-12 h-12">
              <svg
                className="w-12 h-12 transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  d="M18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="#E5E7EB"
                  strokeWidth="3"
                />
                <path
                  d="M18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeDasharray={`${completionData.percentage}, 100`}
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-[#1890FF]">
                  {completionData.percentage}%
                </span>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-medium text-gray-900">
                Complete your Profile
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {completionData.pendingSections.length} steps remaining
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleClose();
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Expanded State */}
      {isExpanded && (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-w-md animate-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-mb font-semibold text-gray-900">
              Complete your Profile to get hired
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1  ml-5 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Profile Image and Progress */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <img
                src={
                  mode === "individual"
                    ? currentUser?.profilePicture ||
                      "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
                    : businessProfile?.orgLogo ||
                      "https://res.cloudinary.com/dy9voteoc/image/upload/v1743420262/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383_sxcncq.avif"
                }
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
              />

              {/* Circular Progress Overlay */}
              <div className="absolute -inset-2">
                <svg
                  className="w-20 h-20 transform -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    d="M18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="2"
                  />
                  <path
                    d="M18,2.0845 a 15.9155,15.9155 0 0,1 0,31.831 a 15.9155,15.9155 0 0,1 0,-31.831"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2"
                    strokeDasharray={`${completionData.percentage}, 100`}
                    className="transition-all duration-700"
                  />
                </svg>
              </div>
            </div>

            <div className="flex-1">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">
                GET DISCOVERED
              </h4>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#1890FF] h-2 rounded-full transition-all duration-700"
                  style={{ width: `${completionData.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {completionData.percentage}% complete
              </p>
            </div>
          </div>

          {/* Completion Sections */}
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {/* Completed Sections */}
            {completionData.completedSections.map((section, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg bg-green-50 border border-green-200"
              >
                <div className="w-6 h-6 bg-[#595959] rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-sm font-inter text-[#BFBFBF] line-through">
                  {section.name}
                </span>
                <div className="ml-auto">
                  <svg
                    className="w-4 h-4 text-[#595959] transform rotate-180"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            ))}

            {/* Pending Sections */}
            {completionData.pendingSections.map((section, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-200"
              >
                <div className="w-6 h-6 border-2 border-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-xs">{section.icon}</span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {section.name}
                </span>
                <div className="ml-auto">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionNudge;
