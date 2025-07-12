import { useState, useEffect } from "react";
import AboutSection from "./AboutSection";
import WorkExperienceDisplay from "./WorkExperienceDisplay";
import EducationSection from "./EducationSection";
import SkillsSection from "./SkillsSection";
import CertificatesSection from "./CertificatesSection";
import AchievementsSection from "./AchievementsSection";
import PublicationsSection from "./PublicationsSection";
import LanguagesSection from "./LanguagesSection";

const OverviewTab = ({
  userData,
  isOwnProfile,
  openModal,
  setActiveModalTab,
  setEditingExperienceId,
  setEditingExperienceData,
  setIsEditing,
  setActiveQualificationTab,
  setEditingQualification,
  setEditingAchievement,
  setActiveAchievementTab,
}) => {
  const [userSkills, setUserSkills] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [publications, setPublications] = useState([]);
  const [userLanguages, setUserLanguages] = useState([]);
  const [activeTab, setActiveTab] = useState("Overview");

  const tabs = ["Overview", "Social activity", "Saved", "Connection"];

  useEffect(() => {
    setUserSkills(userData?.skills || []);
    setCertificates(userData?.certifications || []);
    setAchievements(userData?.achievements || []);
    setPublications(userData?.publications || []);
    setUserLanguages(userData?.languages || []);
  }, [userData]);

  return (
    <div className="space-y-6">
      {/* Tabs Section */}
      <div className="mt-6">
        <div className="border border-gray-200 rounded-lg p-2 bg-white">
          <div className="grid grid-cols-4 gap-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-300
                  ${
                    activeTab === tab
                      ? "bg-blue-500 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === "Overview" && (
            <div className="space-y-6">
              <AboutSection
                userData={userData}
                isOwnProfile={isOwnProfile}
                openModal={openModal}
              />

              <WorkExperienceDisplay
                userData={userData}
                isOwnProfile={isOwnProfile}
                openModal={openModal}
                setActiveModalTab={setActiveModalTab}
                setEditingExperienceId={setEditingExperienceId}
                setEditingExperienceData={setEditingExperienceData}
                setIsEditing={setIsEditing}
              />

              <EducationSection
                isOwnProfile={isOwnProfile}
                openModal={openModal}
                setActiveQualificationTab={setActiveQualificationTab}
                setEditingQualification={setEditingQualification}
                userData={userData}
              />

              <SkillsSection
                isOwnProfile={isOwnProfile}
                userData={userData}
                openModal={openModal}
              />

              <CertificatesSection
                isOwnProfile={isOwnProfile}
                userData={userData}
                openModal={openModal}
              />

              <AchievementsSection
                isOwnProfile={isOwnProfile}
                userData={userData}
                openModal={openModal}
                setEditingAchievement={setEditingAchievement}
                setActiveAchievementTab={setActiveAchievementTab}
              />

              <PublicationsSection
                isOwnProfile={isOwnProfile}
                userData={userData}
                openModal={openModal}
              />

              <LanguagesSection
                isOwnProfile={isOwnProfile}
                userData={userData}
                openModal={openModal}
              />
            </div>
          )}

          {activeTab === "Social activity" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.993 1.993 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2z"
                    />
                  </svg>
                </div>
                <h3 className="text-[16px] font-medium text-gray-900 mb-2">
                  No Social Activity Yet
                </h3>
                <p className="text-[14px] text-gray-600">
                  Your social activities like posts, comments, and interactions
                  will appear here.
                </p>
              </div>
            </div>
          )}

          {activeTab === "Saved" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                    />
                  </svg>
                </div>
                <h3 className="text-[16px] font-medium text-gray-900 mb-2">
                  No Saved Items
                </h3>
                <p className="text-[14px] text-gray-600">
                  Save posts, jobs, and articles to view them here later.
                </p>
              </div>
            </div>
          )}

          {activeTab === "Connection" && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Tabs Header */}
              {/* <div className="border border-gray-200 rounded-lg p-2 bg-white mb-6">
                <div className="grid grid-cols-4 gap-2">
                  {["Overview", "Social Activity", "Saved", "Connections"].map(
                    (tab) => (
                      <button
                        key={tab}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition duration-300
                        ${
                          tab === "Connections"
                            ? "bg-blue-500 text-white"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab}
                      </button>
                    )
                  )}
                </div>
              </div> */}

              {/* Connections Header */}
              <h2 className="text-xl font-medium text-gray-900 mb-6">
                Connections (533)
              </h2>

              {/* Search Bar */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <svg
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>

              {/* Filter Dropdowns */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white">
                    <option>Industry</option>
                    <option>Healthcare</option>
                    <option>Technology</option>
                    <option>Finance</option>
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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

                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white">
                    <option>Location</option>
                    <option>New York</option>
                    <option>San Francisco</option>
                    <option>London</option>
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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

                <div className="relative">
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white">
                    <option>Recently Connected</option>
                    <option>This Week</option>
                    <option>This Month</option>
                    <option>This Year</option>
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
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

              {/* Connections List */}
              <div className="space-y-4">
                {[
                  {
                    name: "Alena Baptista",
                    title: "Dental Surgeon | Apollo Hospital ...",
                    image:
                      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
                  },
                  {
                    name: "Alena Baptista",
                    title: "Dental Surgeon | Apollo Hospital ...",
                    image:
                      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
                  },
                  {
                    name: "Alena Baptista",
                    title: "Dental Surgeon | Apollo Hospital ...",
                    image:
                      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
                  },
                  {
                    name: "Alena Baptista",
                    title: "Dental Surgeon | Apollo Hospital ...",
                    image:
                      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
                  },
                  {
                    name: "Alena Baptista",
                    title: "Dental Surgeon | Apollo Hospital ...",
                    image:
                      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
                  },
                  {
                    name: "Alena Baptista",
                    title: "Dental Surgeon | Apollo Hospital ...",
                    image:
                      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
                  },
                  {
                    name: "Alena Baptista",
                    title: "Dental Surgeon | Apollo Hospital ...",
                    image:
                      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
                  },
                  {
                    name: "Alena Baptista",
                    title: "Dental Surgeon | Apollo Hospital ...",
                    image:
                      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
                  },
                  {
                    name: "Alena Baptista",
                    title: "Dental Surgeon | Apollo Hospital ...",
                    image:
                      "https://images.unsplash.com/photo-1557862921-37829c790f19?w=150&h=150&fit=crop&crop=face",
                  },
                ].map((connection, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <img
                      src={connection.image}
                      alt={connection.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-[16px] font-medium text-gray-900">
                        {connection.name}
                      </h4>
                      <p className="text-[14px] text-gray-500 mt-1">
                        {connection.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
