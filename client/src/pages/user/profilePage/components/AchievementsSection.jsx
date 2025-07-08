import { useState, useEffect } from "react";
import { Pencil, AwardIcon, Trash2 } from "lucide-react";
import axiosInstance from "../../../../lib/axio";

const AchievementsSection = ({
  isOwnProfile,
  userData,
  openModal,
  setEditingAchievement,
  setActiveAchievementTab,
}) => {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    setAchievements(userData?.achievements || []);
  }, [userData?.achievements]);

  // Edit Achievement
  const handleEditAchievement = (achievement) => {
    setEditingAchievement(achievement);
    setActiveAchievementTab("Edit");
    openModal("Awards & Achievements");
  };

  // Delete Achievement
  const handleDeleteAchievement = (id) => {
    const updatedAchievements = achievements.filter(
      (achievement) => achievement.id !== id
    );
    setAchievements(updatedAchievements);

    // Update backend
    axiosInstance
      .put("/users/updateProfile", {
        achievements: updatedAchievements,
      })
      .catch((error) => {
        console.error("Error deleting achievement:", error);
        // Revert on error
        setAchievements(achievements);
      });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Awards & Achievements
        </h2>
        {isOwnProfile && (
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => openModal("Awards & Achievements")}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="space-y-4">
        {achievements.length > 0 ? (
          achievements?.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
            >
              <div className="bg-blue-100 w-10 h-10 flex justify-center items-center rounded-lg">
                <AwardIcon className="text-blue-600 w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-[14px] font-medium text-gray-900 mr-2">
                    {achievement.title}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 text-[12px] text-gray-600 mb-1">
                  {achievement.issuer && (
                    <span>Issued by - {achievement.issuer}</span>
                  )}
                  {achievement.issuer && achievement.date && <span>·</span>}
                  {achievement.date && <span>{achievement.date}</span>}
                </div>
                {achievement.description && (
                  <div className="mt-2 text-[14px] text-gray-600">
                    {achievement.description.split("\n").map((line, i) => {
                      const cleanLine = line.replace(/<[^>]*>/g, "").trim();
                      return cleanLine ? (
                        <p key={i} className="mb-1">
                          {cleanLine}
                        </p>
                      ) : null;
                    })}
                  </div>
                )}
                {achievement.highlights &&
                  achievement.highlights.length > 0 && (
                    <div className="mt-2">
                      <ul className="list-disc pl-5 text-[14px] text-gray-600">
                        {achievement.highlights.map((highlight, index) => (
                          <li key={index} className="mb-1">
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
              {isOwnProfile && (
                <div className="flex flex-col md:flex-row items-center justify-center gap-2 ml-4">
                  <button
                    onClick={() => handleEditAchievement(achievement)}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full transition"
                    aria-label="Edit achievement"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAchievement(achievement.id)}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-full transition"
                    aria-label="Delete achievement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-[14px] text-gray-600">
            No achievements added yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default AchievementsSection;
