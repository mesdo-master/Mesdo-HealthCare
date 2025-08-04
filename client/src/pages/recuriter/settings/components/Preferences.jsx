// Recruiter Preferences Settings - based on user Preferences.jsx
import React, { useEffect, useState } from "react";
import { getRecruiterSettings, saveRecruiterSettings } from "./settingsService";
import { Check, X } from "lucide-react";

const Preferences = () => {
  // Preference states
  const [language, setLanguage] = useState("English");
  const [profilePhotos, setProfilePhotos] = useState("All members");
  const [feedView, setFeedView] = useState("Most relevant posts");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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
      <div className="ml-[67px] mr-[67px] mt-[35px]">
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
    <div className="ml-[67px] mr-[67px] mt-[35px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Your Preferences
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Please update your profile preferences here
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            disabled={isSaving}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
          >
            Cancel
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1.5 text-sm font-medium text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
            style={{
              background:
                "linear-gradient(90deg, rgba(24,144,255,1) 0%, rgba(0,106,204,1) 100%)",
            }}
          >
            {isSaving ? "Saving..." : "Save Changes"}
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
            <label className="w-full md:w-56 text-[#434343] font-bold text-sm">
              Language
            </label>
            <div className="flex-1">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isSaving}
                className="w-full md:w-[400px] border border-gray-200 rounded-full px-4 py-2 bg-white text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-[#1890FF] focus:border-[#1890FF]"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
              <label className="w-full md:w-56 text-[#434343] font-bold text-sm">
                Showing profile photos
              </label>
              <div className="flex-1">
                <select
                  value={profilePhotos}
                  onChange={(e) => setProfilePhotos(e.target.value)}
                  disabled={isSaving}
                  className="w-full md:w-[400px] border border-gray-200 rounded-full px-4 py-2 bg-white text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-[#1890FF] focus:border-[#1890FF]"
                >
                  <option value="All members">All members</option>
                  <option value="Only connections">Only connections</option>
                  <option value="No one">No one</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;
