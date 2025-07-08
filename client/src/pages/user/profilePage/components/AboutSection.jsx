import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import axiosInstance from "../../../../lib/axio";

const AboutSection = ({ isOwnProfile, userData, openModal }) => {
  const [aboutData, setAboutData] = useState("");

  useEffect(() => {
    if (userData && userData.about) {
      setAboutData(userData.about);
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
      <p className="text-[14px] text-gray-600 leading-relaxed">{aboutData}</p>
    </div>
  );
};

export default AboutSection;
