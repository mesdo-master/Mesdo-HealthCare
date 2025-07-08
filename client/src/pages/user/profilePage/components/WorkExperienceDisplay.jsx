import { useState, useEffect } from "react";
import { Pencil, Briefcase, Trash2 } from "lucide-react";
import axiosInstance from "../../../../lib/axio";

const WorkExperienceDisplay = ({
  isOwnProfile,
  openModal,
  setActiveModalTab,
  setEditingExperienceId,
  setEditingExperienceData,
  setIsEditing,
}) => {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        const response = await axiosInstance.get(`/users/fetchExperiences`);
        const fetchedExperiences = response.data.experiences.map((exp) => ({
          ...exp,
          id: exp._id,
        }));
        setExperiences(fetchedExperiences);
      } catch (error) {
        console.log(error);
      }
    };
    fetchExperiences();
  }, []);

  // Open edit modal for a specific experience
  const handleEditExperience = (exp) => {
    setEditingExperienceId(exp.id);
    setEditingExperienceData({ ...exp });
    setActiveModalTab("Add Work Experience");
    setIsEditing(true);
  };

  // Delete handler for a specific experience
  const handleDeleteExperience = async (id) => {
    const originalExperiences = [...experiences];
    try {
      const filteredExperiences = experiences.filter((exp) => exp.id !== id);
      setExperiences(filteredExperiences);
      const payload = {
        experience: filteredExperiences.map(({ id, ...rest }) => rest),
      };
      const response = await axiosInstance.put("/users/updateProfile", payload);
      if (!response.data.success) {
        setExperiences(originalExperiences);
        throw new Error(
          response.data.message || "Failed to delete experience."
        );
      }
      const syncedExperiences = response.data.updatedUser.experience.map(
        (exp) => ({ ...exp, id: exp._id })
      );
      setExperiences(syncedExperiences);
    } catch (error) {
      setExperiences(originalExperiences);
      alert(
        error.message || "An error occurred while deleting the experience."
      );
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Work Experience</h2>
        {isOwnProfile && (
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => openModal("Work Experience")}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="space-y-4">
        {experiences.map((exp, index) => (
          <div
            key={exp.id || index}
            className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
          >
            <div className="bg-blue-100 w-10 h-10 flex justify-center items-center rounded-lg">
              <Briefcase className="text-blue-600 w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="text-[14px] font-medium text-gray-900 mr-2">
                  {exp.title}
                </h3>
                {exp.type && (
                  <>
                    <span className="text-[12px] text-gray-400 font-medium">
                      |
                    </span>
                    <span className="text-[12px] text-gray-600">
                      {exp.type}
                    </span>
                  </>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-[12px] text-gray-600 mb-1">
                {exp.institution && <span>{exp.institution}</span>}
                {exp.institution && exp.location && <span>·</span>}
                {exp.location && <span>{exp.location}</span>}
                {(exp.startDate || exp.endDate) && (
                  <span>
                    · {exp.startDate ? exp.startDate : ""}
                    {exp.startDate && exp.endDate ? " - " : ""}
                    {exp.currentlyWorking ? "Present" : exp.endDate}
                  </span>
                )}
              </div>
              {exp.description && (
                <div className="mt-2 text-[14px] text-gray-600">
                  {exp.description.split("\n").map((line, i) => {
                    // Remove HTML tags and render as plain text
                    const cleanLine = line.replace(/<[^>]*>/g, "").trim();
                    return cleanLine ? (
                      <p key={i} className="mb-1">
                        {cleanLine}
                      </p>
                    ) : null;
                  })}
                </div>
              )}
              {exp.tags && exp.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {exp.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-[12px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {isOwnProfile && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 ml-4">
                <button
                  onClick={() => handleEditExperience(exp)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full transition"
                  aria-label="Edit experience"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteExperience(exp.id)}
                  className="text-gray-400 hover:text-red-500 p-2 rounded-full transition"
                  aria-label="Delete experience"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkExperienceDisplay;
