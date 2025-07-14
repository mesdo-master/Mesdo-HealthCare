import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";

const LanguagesSection = ({ isOwnProfile, userData, openModal }) => {
  const [userLanguages, setUserLanguages] = useState([]);

  useEffect(() => {
    console.log("LanguagesSection - userData:", userData);
    console.log("LanguagesSection - userData.languages:", userData?.languages);
    setUserLanguages(userData?.languages || []);
  }, [userData]);

  console.log("LanguagesSection - userLanguages:", userLanguages);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">Languages</h2>
        {isOwnProfile && (
          <button
            className="text-gray-400 hover:text-gray-600"
            onClick={() => openModal("Extra Information")}
          >
            <Pencil className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {userLanguages.length > 0 ? (
          userLanguages.map((language, index) => (
            <span
              key={`${language}-${index}`}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[12px] font-medium"
            >
              {language}
            </span>
          ))
        ) : (
          <p className="text-[14px] text-gray-600">No languages added yet</p>
        )}
      </div>
    </div>
  );
};

export default LanguagesSection;
