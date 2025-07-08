import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axiosInstance from "../lib/axio";

import ProfileHeader from "../components/ProfileHeader";
import { useAuth } from "../context/AuthContext";
import AboutSection from "../components/AboutSection";
import { ExperienceSection } from "../components/ExperienceSection";
import { EducationSection } from "../components/EducationSection";
import { SkillsSection } from "../components/SkillsSection";

const ProfilePage = () => {
  const { username } = useParams();

  const { currentUser, setCurrentUser } = useAuth();

  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const isOwnProfile = currentUser?.username === userProfile?.username;
  const userData = isOwnProfile ? currentUser : userProfile;

  if (isLoading || !userProfile) return null; // Display a loading state

  const handleSave = async (updatedProfile) => {
    try {
      // Perform validation on editedProfile before sending to API
      if (!updatedProfile.name.trim() || !updatedProfile.headline.trim()) {
        alert("Name and title are required.");
        return;
      }

      // API request using axiosInstance
      const response = await axiosInstance.put(
        "/users/updateProfile",
        updatedProfile
      );

      if (response.status === 200) {
        const { updatedUser } = response.data;

        // Successfully saved the profile
        setCurrentUser(updatedUser); // Update parent component or state with the new data
      } else {
        // Handle unexpected status codes
        console.error("Unexpected response:", response);
        alert("Failed to update profile. Please try again.");
      }
    } catch (error) {
      // Handle errors from the API or network
      if (error.response) {
        console.error("Error updating profile:", error.response.data.message);
        alert(`Failed to update profile: ${error.response.data.message}`);
      } else {
        console.error("An unexpected error occurred:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 ">
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6 ">
        <ProfileHeader
          userData={userData}
          isOwnProfile={isOwnProfile}
          onSave={handleSave}
        />
        <AboutSection
          userData={userData}
          isOwnProfile={isOwnProfile}
          onSave={handleSave}
        />
        <ExperienceSection
          userData={userData}
          isOwnProfile={isOwnProfile}
          onSave={handleSave}
        />{" "}
        {/* add experiences, onAdd, onUpdate, onDelete probs in this section */}
        <EducationSection
          userData={userData}
          isOwnProfile={isOwnProfile}
          onSave={handleSave}
        />{" "}
        {/* add educations, onAdd, onUpdate, onDelete probs in this section */}
        <SkillsSection
          userData={userData}
          isOwnProfile={isOwnProfile}
          onSave={handleSave}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
