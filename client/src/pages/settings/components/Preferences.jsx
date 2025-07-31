import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  getPreferencesSettings,
  updatePreferencesSettings,
} from "./settingsService";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentUser } from "../../../store/features/authSlice";

const Preferences = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
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
      dispatch(setCurrentUser(currentUser)); // Update Redux store
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg px-8 py-6 shadow-sm">
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
    <div className="bg-white rounded-lg px-8 py-6 shadow-sm">
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

      <div className="border-t border-gray-200 pt-6">
        {/* Language */}
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-3">
            Language Settings
          </h3>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
            <label className="w-full md:w-56 text-gray-600 font-normal text-sm">
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={isSaving}
              className="w-full md:w-[320px] border border-gray-100 rounded-xl px-4 py-2 bg-[#F8FAFC] text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
            >
              <option>English</option>
            </select>
          </div>
        </div>

        {/* Showing profile photos */}
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-3">
            Profile Visibility
          </h3>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
            <label className="w-full md:w-56 text-gray-600 font-normal text-sm">
              Showing profile photos
            </label>
            <select
              value={profilePhotos}
              onChange={(e) => setProfilePhotos(e.target.value)}
              disabled={isSaving}
              className="w-full md:w-[320px] border border-gray-100 rounded-xl px-4 py-2 bg-[#F8FAFC] text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
            >
              <option>All members</option>
              <option>Connections only</option>
              <option>No one</option>
            </select>
          </div>
        </div>

        {/* Preferred Feed View */}
        <div className="mb-6">
          <h3 className="text-base font-medium text-gray-900 mb-3">
            Feed Preferences
          </h3>
          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8">
            <label className="w-full md:w-56 text-gray-600 font-normal text-sm">
              Preferred Feed View
            </label>
            <select
              value={feedView}
              onChange={(e) => setFeedView(e.target.value)}
              disabled={isSaving}
              className="w-full md:w-[320px] border border-gray-100 rounded-xl px-4 py-2 bg-[#F8FAFC] text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
            >
              <option>Most relevant posts</option>
              <option>Most recent posts</option>
              <option>Trending posts</option>
              <option>Posts from connections only</option>
            </select>
          </div>
        </div>

        {/* Unfollowed People */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">
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
    </div>
  );
};

export default Preferences;
