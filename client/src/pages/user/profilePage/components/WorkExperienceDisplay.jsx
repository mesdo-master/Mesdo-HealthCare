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
  userData, // Add userData prop
}) => {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    // Use userData.experience from props (populated after onboarding) first
    if (userData?.experience && userData.experience.length > 0) {
      const formattedExperience = userData.experience.map((exp, index) => ({
        ...exp,
        id: exp._id || `experience_${index}`,
        title: exp.title || exp.jobTitle || "",
        institution: exp.institution || exp.hospital || exp.company || "",
        type: exp.type || exp.employmentType || "",
        location: exp.location || "",
        startDate: exp.startDate || "",
        endDate: exp.endDate || "",
        currentlyWorking: exp.currentlyWorking || exp.current || false,
        description: exp.description || "",
        tags: exp.tags || exp.skills || [],
      }));
      setExperiences(formattedExperience);
    } else {
      // Fallback to API call if no experience in userData
      fetchExperiences();
    }
  }, [userData]);

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
      // Don't show error to user, just leave empty
      setExperiences([]);
    }
  };

  // Open edit modal for a specific experience
  const handleEditExperience = (exp) => {
    setEditingExperienceId(exp.id);
    setEditingExperienceData({ ...exp });
    setActiveModalTab("Add Work Experience");
    setIsEditing(true);
  };

  // Delete handler for a specific experience
  const handleDeleteExperience = (id) => {
    const updatedExperiences = experiences.filter((exp) => exp.id !== id);
    const payload = {
      experience: updatedExperiences.map(({ id, ...rest }) => rest),
    };

    axiosInstance
      .put("/users/updateProfile", payload)
      .then((response) => {
        if (response.data.success) {
          setExperiences(updatedExperiences);
          console.log("handleDeleteExperience: Experience deleted, id:", id);
        } else {
          throw new Error(
            response.data.message || "Failed to delete experience."
          );
        }
      })
      .catch((error) => {
        console.error("Error deleting experience:", error);
        alert(
          error.message || "An error occurred while deleting the experience."
        );
      });
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
        {experiences && experiences.length > 0 ? (
          experiences.map((exp, index) => (
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
          ))
        ) : (
          <div className="text-center py-8">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No work experience added
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your professional experience.
            </p>
            {isOwnProfile && (
              <div className="mt-6">
                <button
                  onClick={() => openModal("Work Experience")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Briefcase className="-ml-1 mr-2 h-5 w-5" />
                  Add Experience
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkExperienceDisplay;
