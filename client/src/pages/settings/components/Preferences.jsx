import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  getPreferencesSettings,
  updatePreferencesSettings,
} from "./settingsService";
import { useSelector } from "react-redux";

const Preferences = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [language, setLanguage] = useState("English");
  const [profilePhotos, setProfilePhotos] = useState("All members");
  const [feedView, setFeedView] = useState("Most relevant posts");
  const [unfollowedPeople, setUnfollowedPeople] = useState([]);

  useEffect(() => {
    setLanguage(currentUser.preferences.language);
    setProfilePhotos(currentUser.preferences.profilePhotos);
    setFeedView(currentUser.preferences.feedView);
    setUnfollowedPeople(currentUser.preferences.unfollowedPeople);
    setIsLoading(false);
  }, [currentUser]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updatePreferencesSettings({
        preferences: {
          language,
          profilePhotos,
          feedView,
        },
      });
      toast.success("Preferences saved successfully");
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
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
          {isSaving ? "Saving..." : "Save Changes"}
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

      {/* Preferred Feed View */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-black mb-2">
          Preferred Feed View
          <select
            value={feedView}
            onChange={(e) => setFeedView(e.target.value)}
            disabled={isSaving}
            className="w-full ml-[167px] max-w-sm border border-gray-300 rounded-full py-2 px-3 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option>Most relevant posts</option>
            <option>Most recent posts</option>
            <option>Trending posts</option>
            <option>Posts from connections only</option>
          </select>
        </label>
      </div>

      {/* Unfollowed People */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-black">
            People you unfollowed
          </h3>
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View All
          </a>
        </div>

        <ul className="space-y-3">
          {unfollowedPeople.map((person) => (
            <li
              key={person.id}
              className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md"
            >
              <div className="flex items-center gap-3">
                <img
                  src={person.avatar}
                  alt={person.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <p className="text-sm text-gray-800 font-medium">
                  {person.name}
                </p>
              </div>
              <button
                disabled={isSaving}
                className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50"
              >
                Follow
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Preferences;
