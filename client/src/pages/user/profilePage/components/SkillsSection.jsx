import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import axiosInstance from "../../../../lib/axio";

const SkillsSection = ({ isOwnProfile, userData, openModal }) => {
  const [userSkills, setUserSkills] = useState([]);

  useEffect(() => {
    setUserSkills(userData?.skills || []);
  }, [userData?.skills]);

  const handleSkillsSave = async (updatedSkills) => {
    if (!Array.isArray(updatedSkills)) {
      console.error("Invalid skills format. Expected an array.");
      return;
    }

    if (updatedSkills.length === 0) {
      console.warn("No skills to update.");
      return;
    }

    try {
      console.log("Updating skills:", updatedSkills);

      const response = await axiosInstance.put("/users/updateProfile", {
        skills: updatedSkills,
      });

      if (response.status === 200) {
        setUserSkills(updatedSkills); // Update local state
        console.log("Skills updated successfully!");
      } else {
        console.error("Failed to update skills. Status:", response.status);
      }
    } catch (error) {
      console.error("Error updating skills:", error.message);
      // Optionally show a toast or UI error message
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Skills / Specialization
        </h2>
        {isOwnProfile && (
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => openModal("Skills")}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {userSkills?.length > 0 ? (
          userSkills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[14px]"
            >
              {skill}
            </span>
          ))
        ) : (
          <p className="text-gray-600 text-[14px]">No skills added yet</p>
        )}
      </div>
    </div>
  );
};

export default SkillsSection;
