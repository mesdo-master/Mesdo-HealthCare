// Recruiter Preferences - based on user Preferences.jsx
import { useState, useEffect } from "react";
import { getRecruiterSettings, saveRecruiterSettings } from "./settingsService";

const Preferences = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [language, setLanguage] = useState("English");
  const [profilePhotos, setProfilePhotos] = useState("All members");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      // const data = await getRecruiterSettings();
      // TODO: Load real data here
      setIsLoading(false);
    }
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // await saveRecruiterSettings({ ... });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg px-8 py-6 shadow-sm max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg px-8 py-6 shadow-sm max-w-4xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Your Preferences
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Please update your profile preferences here
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center disabled:opacity-50"
          style={{
            background:
              "linear-gradient(90deg, rgba(24,144,255,1) 0%, rgba(0,106,204,1) 100%)",
          }}
        >
          {isSaving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Language */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-black mb-2">
          Language
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={isSaving}
            className="w-full ml-[235px]  max-w-sm border border-gray-300 rounded-full py-2 px-3 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option>English</option>
          </select>
        </label>
      </div>

      {/* Showing profile photos */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-black mb-2">
          Showing profile photos
          <select
            value={profilePhotos}
            onChange={(e) => setProfilePhotos(e.target.value)}
            disabled={isSaving}
            className="w-full ml-[148px] max-w-sm border border-gray-300 rounded-full py-2 px-3 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option>All members</option>
            <option>Connections only</option>
            <option>No one</option>
          </select>
        </label>
      </div>
    </div>
  );
};

export default Preferences;
