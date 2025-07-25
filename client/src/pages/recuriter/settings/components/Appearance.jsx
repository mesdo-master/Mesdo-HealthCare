// Recruiter Appearance Settings - based on user Appearance.jsx
import { useState, useEffect } from "react";
import { getRecruiterSettings, saveRecruiterSettings } from "./settingsService";

const Appearance = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState("light");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      setIsLoading(true);
      // const data = await getRecruiterSettings();
      // setTheme(data.theme);
      setIsLoading(false);
    }
    fetchSettings();
  }, []);

  const handleThemeChange = async (newTheme) => {
    setIsSaving(true);
    setTheme(newTheme);
    // await saveRecruiterSettings({ theme: newTheme });
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Apply theme to HTML root
  useEffect(() => {
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      document.documentElement.className = systemTheme;
    } else {
      document.documentElement.className = theme;
    }
  }, [theme]);

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
            Appearance
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Please update how your experience looks for this device.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {isSaving
            ? "Saving..."
            : saved
            ? "Changes saved"
            : "Changes saved automatically"}
        </div>
      </div>

      <hr className="mb-6" />

      <div className="space-y-4">
        <div className="text-sm text-gray-700 font-medium">Theme</div>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="theme"
            value="system"
            checked={theme === "system"}
            onChange={() => handleThemeChange("system")}
            disabled={isSaving}
            className="form-radio h-4 w-4 text-blue-600"
          />
          <span className="text-gray-800 text-sm">Device Settings</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="theme"
            value="light"
            checked={theme === "light"}
            onChange={() => handleThemeChange("light")}
            disabled={isSaving}
            className="form-radio h-4 w-4 text-blue-600"
          />
          <span className="text-gray-800 text-sm">Light Mode</span>
        </label>

        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="radio"
            name="theme"
            value="dark"
            checked={theme === "dark"}
            onChange={() => handleThemeChange("dark")}
            disabled={isSaving}
            className="form-radio h-4 w-4 text-blue-600"
          />
          <span className="text-gray-800 text-sm">Dark Mode</span>
        </label>
      </div>
    </div>
  );
};

export default Appearance;
