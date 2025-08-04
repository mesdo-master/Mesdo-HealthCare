import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  getAppearanceSettings,
  updateAppearanceSettings,
} from "./settingsService";

const Appearance = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    fetchAppearanceSettings();
  }, []);

  const fetchAppearanceSettings = async () => {
    try {
      setIsLoading(true);
      const data = await getAppearanceSettings();
      setTheme(data.theme);
    } catch (error) {
      console.error("Error fetching appearance settings:", error);
      // toast.error("Failed to load appearance settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (newTheme) => {
    try {
      setIsSaving(true);
      await updateAppearanceSettings({ theme: newTheme });
      setTheme(newTheme);
      toast.success("Appearance settings saved successfully");
    } catch (error) {
      console.error("Error saving appearance settings:", error);
      // toast.error("Failed to save appearance settings");
    } finally {
      setIsSaving(false);
    }
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
    <div className="ml-[67px] mr-[67px] mt-[35px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-1">
            Your Appearance
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Please update how your experience looks for this device.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {isSaving ? "Saving..." : "Changes saved automatically"}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8">
            <label className="w-full md:w-56 text-[#434343] font-bold text-sm">
              Appearance
            </label>
            <div className="flex-1">
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="theme"
                      value="system"
                      checked={theme === "system"}
                      onChange={() => handleThemeChange("system")}
                      disabled={isSaving}
                      className="opacity-0 absolute"
                    />
                    <div
                      className={`h-4 w-4 border rounded-full flex items-center justify-center ${
                        theme === "system"
                          ? "bg-[#1890FF] border-[#1890FF]"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {theme === "system" && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700">Device Settings</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="theme"
                      value="light"
                      checked={theme === "light"}
                      onChange={() => handleThemeChange("light")}
                      disabled={isSaving}
                      className="opacity-0 absolute"
                    />
                    <div
                      className={`h-4 w-4 border rounded-full flex items-center justify-center ${
                        theme === "light"
                          ? "bg-[#1890FF] border-[#1890FF]"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {theme === "light" && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700">Light Mode</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="radio"
                      name="theme"
                      value="dark"
                      checked={theme === "dark"}
                      onChange={() => handleThemeChange("dark")}
                      disabled={isSaving}
                      className="opacity-0 absolute"
                    />
                    <div
                      className={`h-4 w-4 border rounded-full flex items-center justify-center ${
                        theme === "dark"
                          ? "bg-[#1890FF] border-[#1890FF]"
                          : "bg-white border-gray-300"
                      }`}
                    >
                      {theme === "dark" && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700">Dark Mode</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appearance;
