import { useState, useEffect } from "react";
import { Switch } from "@headlessui/react";

import { toast } from "react-hot-toast";
import { updateNotificationSettings } from "./settingsService";
import { useSelector, useDispatch } from "react-redux";
import { setCurrentUser } from "../../../store/features/authSlice";

const Notification = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [quietHours, setQuietHours] = useState(true);
  const [fromTime, setFromTime] = useState("22:00");
  const [toTime, setToTime] = useState("08:00");
  const [weekendOnly, setWeekendOnly] = useState(true);

  const [notifications, setNotifications] = useState({
    groupNotifications: true,
    emailNotifications: true,
    soundNotifications: true,
    jobPostNotifications: true,
    pageNotifications: true,
  });

  useEffect(() => {
    if (!currentUser) return;

    setQuietHours(currentUser.notificationSettings.quietHours);
    setFromTime(currentUser.notificationSettings.fromTime);
    setToTime(currentUser.notificationSettings.toTime);
    setWeekendOnly(currentUser.notificationSettings.weekendOnly);
    setNotifications(currentUser.notificationSettings.notifications);

    setIsLoading(false);
  }, [currentUser]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateNotificationSettings({
        notificationSettings: {
          quietHours,
          fromTime,
          toTime,
          weekendOnly,
          notifications,
        },
      });
      toast.success("Notification settings saved successfully");
      dispatch(
        setCurrentUser({
          ...currentUser,
          notificationSettings: {
            quietHours,
            fromTime,
            toTime,
            weekendOnly,
            notifications,
          },
        })
      );
    } catch (error) {
      console.error("Error saving notification settings:", error);
      toast.error("Failed to save notification settings");
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = (key) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const NotificationItem = ({ label, description, checked, onChange }) => (
    <div className="flex items-start gap-3 mb-4 ml-60">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={isSaving}
        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );

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
            Your Notifications
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Please update your notification preferences here
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
        <h3 className="text-md font-semibold text-gray-900 mb-4">
          Notifications
        </h3>

        <NotificationItem
          label="Allow Group Notifications"
          description="You will be notified when a new group arrives."
          checked={notifications?.groupNotifications}
          onChange={() => handleNotificationChange("groupNotifications")}
        />

        <NotificationItem
          label="Email Notification"
          description="You will be notified when a new email arrives."
          checked={notifications?.emailNotifications}
          onChange={() => handleNotificationChange("emailNotifications")}
        />

        <NotificationItem
          label="Sound Notification"
          description="You will be notified with sound when someone messages you."
          checked={notifications?.soundNotifications}
          onChange={() => handleNotificationChange("soundNotifications")}
        />

        <NotificationItem
          label="Allow Job Post Notifications"
          description="You will be notified with sound when any job opening alerts."
          checked={notifications?.jobPostNotifications}
          onChange={() => handleNotificationChange("jobPostNotifications")}
        />

        <NotificationItem
          label="Allow Page Notifications"
          description="You will be notified with sound when any job opening alerts."
          checked={notifications?.pageNotifications}
          onChange={() => handleNotificationChange("pageNotifications")}
        />

        <div className="mt-6 ml-[235px]">
          <div className="flex items-start gap-4 mb-2">
            <div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={quietHours}
                  onChange={setQuietHours}
                  disabled={isSaving}
                  className={`${
                    quietHours ? "bg-blue-600" : "bg-gray-300"
                  } relative inline-flex h-[20px] w-[40px] items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50`}
                >
                  <span
                    className={`${
                      quietHours ? "translate-x-5" : "translate-x-1"
                    } inline-block h-[16px] w-[16px] transform rounded-full bg-white transition-transform`}
                  />
                </Switch>
                <h4 className="text-md font-semibold text-gray-900 ml-2 mb-0">
                  Quiet Hours
                </h4>
              </div>
              <p className="text-[13px] text-gray-500 mt-1 ml-12 gap-2">
                Set Specific times when notifications are muted to avoid
                disturbances during your chosen time
              </p>
            </div>
          </div>

          {quietHours && (
            <div className="mt-2 flex items-center gap-3 ml-12">
              <select
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                disabled={isSaving}
                className="rounded-full border border-gray-300 px-4 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white text-gray-700 appearance-none"
              >
                <option value="">From</option>
                {/* Add time options here as needed */}
                <option value="22:00">22:00</option>
                <option value="21:00">21:00</option>
                <option value="20:00">20:00</option>
                <option value="19:00">19:00</option>
                <option value="18:00">18:00</option>
                <option value="17:00">17:00</option>
                <option value="16:00">16:00</option>
                <option value="15:00">15:00</option>
                <option value="14:00">14:00</option>
                <option value="13:00">13:00</option>
                <option value="12:00">12:00</option>
                <option value="11:00">11:00</option>
                <option value="10:00">10:00</option>
                <option value="09:00">09:00</option>
                <option value="08:00">08:00</option>
                <option value="07:00">07:00</option>
                <option value="06:00">06:00</option>
                <option value="05:00">05:00</option>
                <option value="04:00">04:00</option>
                <option value="03:00">03:00</option>
                <option value="02:00">02:00</option>
                <option value="01:00">01:00</option>
                <option value="00:00">00:00</option>
              </select>
              <span className="text-gray-400 text-sm">To</span>
              <select
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                disabled={isSaving}
                className="rounded-full border border-gray-300 px-4 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white text-gray-700 appearance-none"
              >
                <option value="">To</option>
                {/* Add time options here as needed */}
                <option value="08:00">08:00</option>
                <option value="09:00">09:00</option>
                <option value="10:00">10:00</option>
                <option value="11:00">11:00</option>
                <option value="12:00">12:00</option>
                <option value="13:00">13:00</option>
                <option value="14:00">14:00</option>
                <option value="15:00">15:00</option>
                <option value="16:00">16:00</option>
                <option value="17:00">17:00</option>
                <option value="18:00">18:00</option>
                <option value="19:00">19:00</option>
                <option value="20:00">20:00</option>
                <option value="21:00">21:00</option>
                <option value="22:00">22:00</option>
                <option value="23:00">23:00</option>
                <option value="00:00">00:00</option>
              </select>
              <button
                type="button"
                onClick={() => setWeekendOnly(!weekendOnly)}
                disabled={isSaving}
                className={`px-4 py-1 rounded-md text-sm font-medium focus:outline-none transition-colors duration-150 ${
                  weekendOnly
                    ? "bg-[#1890FF] text-white"
                    : "bg-gray-100 text-gray-500 border border-gray-200"
                }`}
              >
                Weekends
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notification;
