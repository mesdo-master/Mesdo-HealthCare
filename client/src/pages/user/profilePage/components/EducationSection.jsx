import { useState, useEffect } from "react";
import { Pencil, GraduationCap, Trash2 } from "lucide-react";
import axiosInstance from "../../../../lib/axio";

const EducationSection = ({
  isOwnProfile,
  openModal,
  setActiveQualificationTab,
  setEditingQualification,
  userData,
}) => {
  const [qualifications, setQualifications] = useState([]);

  useEffect(() => {
    // Use userData.education from props (populated after onboarding) first
    if (userData?.education && userData.education.length > 0) {
      const formattedEducation = userData.education.map((edu, index) => ({
        ...edu,
        id: edu._id || `education_${index}`,
        qualification: edu.degree || edu.qualification || "Degree",
        course: edu.fieldOfStudy || edu.course || "",
        university: edu.schoolName || edu.university || "",
        passingYear: edu.endDate
          ? new Date(edu.endDate).getFullYear()
          : edu.passingYear,
        specialization: edu.specialization || "",
        description: edu.description || "",
        skills: edu.skills || [],
      }));
      setQualifications(formattedEducation);
    } else {
      // Fallback to API call if no education in userData
      fetchQualifications();
    }
  }, [userData]);

  const fetchQualifications = async () => {
    try {
      const response = await axiosInstance.get("/users/fetchQualifications");
      if (response.data.success) {
        const { educations } = response.data;
        const fetchedQualifications = educations.map((edu) => ({
          ...edu,
          id: edu._id,
        }));
        setQualifications(fetchedQualifications);
      }
    } catch (error) {
      console.error("Error fetching qualifications:", error);
      // Don't show error to user, just leave empty
      setQualifications([]);
    }
  };

  const handleEditQualification = (qualification) => {
    setEditingQualification(qualification);
    setActiveQualificationTab("Edit");
    openModal("Qualification");
  };

  const handleDeleteQualification = (id) => {
    const updatedQualifications = qualifications.filter(
      (qualification) => qualification.id !== id
    );
    const payload = {
      education: updatedQualifications.map(({ id, ...rest }) => rest),
    };

    axiosInstance
      .put("/users/updateProfile", payload)
      .then((response) => {
        if (response.data.success) {
          setQualifications(updatedQualifications);
          console.log(
            "handleDeleteQualification: Qualification deleted, id:",
            id
          );
        } else {
          throw new Error(
            response.data.message || "Failed to delete qualification."
          );
        }
      })
      .catch((error) => {
        console.error("Error deleting qualification:", error);
        alert(
          error.message || "An error occurred while deleting the qualification."
        );
      });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Education/Qualification
        </h2>
        {isOwnProfile && (
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => openModal("Qualification")}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="space-y-4">
        {qualifications && qualifications.length > 0 ? (
          qualifications.map((qualification, index) => (
            <div
              key={qualification.id || index}
              className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg"
            >
              <div className="bg-blue-100 w-10 h-10 flex justify-center items-center rounded-lg">
                <GraduationCap className="text-blue-600 w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h3 className="text-[14px] font-medium text-gray-900 mr-2">
                    {qualification.qualification ||
                      qualification.degree ||
                      "Degree"}
                  </h3>
                  {(qualification.course || qualification.fieldOfStudy) && (
                    <>
                      <span className="text-[12px] text-gray-400 font-medium">
                        |
                      </span>
                      <span className="text-[12px] text-gray-600">
                        {qualification.course || qualification.fieldOfStudy}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 text-[12px] text-gray-600 mb-1">
                  {(qualification.university || qualification.schoolName) && (
                    <span>
                      {qualification.university || qualification.schoolName}
                    </span>
                  )}
                  {(qualification.university || qualification.schoolName) &&
                    qualification.passingYear && <span>·</span>}
                  {qualification.passingYear && (
                    <span>{qualification.passingYear}</span>
                  )}
                </div>
                {qualification.specialization && (
                  <p className="text-[12px] text-gray-500 mt-1">
                    {qualification.specialization}
                  </p>
                )}
                {qualification.description && (
                  <div className="mt-2 text-[14px] text-gray-600">
                    {qualification.description.split("\n").map((line, i) => {
                      const cleanLine = line.replace(/<[^>]*>/g, "").trim();
                      return cleanLine ? (
                        <p key={i} className="mb-1">
                          {cleanLine}
                        </p>
                      ) : null;
                    })}
                  </div>
                )}
                {qualification.skills && qualification.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {qualification.skills.map((skill, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 rounded-full px-3 py-1 text-[12px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={() => handleEditQualification(qualification)}
                    className="text-gray-400 hover:text-gray-600 p-2 rounded-full transition"
                    aria-label="Edit qualification"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQualification(qualification.id)}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-full transition"
                    aria-label="Delete qualification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <GraduationCap className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No education added
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding your educational background.
            </p>
            {isOwnProfile && (
              <div className="mt-6">
                <button
                  onClick={() => openModal("Qualification")}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <GraduationCap className="-ml-1 mr-2 h-5 w-5" />
                  Add Education
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EducationSection;
