import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import axiosInstance from "../../../../lib/axio";

const AboutSection = ({ isOwnProfile, userData, openModal }) => {
  const [aboutData, setAboutData] = useState("");

  // Helper function to strip HTML tags from text
  const stripHtmlTags = (html) => {
    if (!html) return "";
    // Create a temporary element to decode HTML entities and strip tags
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || "";
  };

  useEffect(() => {
    if (userData && userData.about) {
      // Strip HTML tags before setting the data
      const cleanAbout = stripHtmlTags(userData.about);
      setAboutData(cleanAbout);
    }
  }, [userData]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">About</h2>
        {isOwnProfile && (
          <button
            onClick={() => openModal("About")}
            className="text-gray-400 hover:text-gray-600"
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="text-[14px] text-gray-600 leading-relaxed">
        {aboutData ? (
          // Split by newlines and render each paragraph
          aboutData.split("\n").map((paragraph, index) => {
            const cleanParagraph = paragraph.trim();
            return cleanParagraph ? (
              <p key={index} className="mb-2 last:mb-0">
                {cleanParagraph}
              </p>
            ) : null;
          })
        ) : (
          <p className="text-gray-400 italic">No bio added yet</p>
        )}
      </div>
    </div>
  );
};

export default AboutSection;
