import axiosInstance from "../../../lib/axio";

// Account Settings
export const getAccountSettings = async () => {
  try {
    const response = await axiosInstance.get(`/api/settings/account`);
    return response.data;
  } catch (error) {
    console.error("getAccountSettings error:", error);
    throw error;
  }
};

export const updateAccountSettings = async (data) => {
  // console.log(data)
  const response = await axiosInstance.put(`/users/updateProfile`, data);
  return response.data;
};

export const updateProfileImage = async (imageFile) => {
  const formData = new FormData();
  formData.append("profilePicture", imageFile);
  const response = await axiosInstance.put(
    `/api/settings/account/profile-picture`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
};

// Privacy Settings
export const getPrivacySettings = async () => {
  const response = await axiosInstance.get(`/api/settings/privacy`);
  return response.data;
};

export const updatePrivacySettings = async (data) => {
  const response = await axiosInstance.put(`/users/updateProfile`, data);
  return response.data;
};

// Notification Settings
export const getNotificationSettings = async () => {
  const response = await axiosInstance.get(`/api/settings/notifications`);
  return response.data;
};

export const updateNotificationSettings = async (data) => {
  const response = await axiosInstance.put(`/users/updateProfile`, data);
  return response.data;
};

// Preferences Settings
export const getPreferencesSettings = async () => {
  const response = await axiosInstance.get(`/api/settings/preferences`);
  return response.data;
};

export const updatePreferencesSettings = async (data) => {
  const response = await axiosInstance.put(`/users/updateProfile`, data);
  return response.data;
};

// Appearance Settings
export const getAppearanceSettings = async () => {
  const response = await axiosInstance.get(`/api/settings/appearance`);
  return response.data;
};

export const updateAppearanceSettings = async (data) => {
  const response = await axiosInstance.put(`/api/settings/appearance`, data);
  return response.data;
};