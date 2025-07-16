import axios from "axios";

const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL || "https://mesdo-healthcare-1.onrender.com",
  withCredentials: true,
});

// Add response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common error cases
    if (error.response) {
      // Server responded with a status code outside 2xx
      const { status, data } = error.response;
      return Promise.reject({
        status,
        message: data.message || `Server error: ${status}`,
        details: data.details || null,
      });
    } else if (error.request) {
      // Request was made but no response received
      return Promise.reject({
        status: null,
        message: "Network error: No response received from server",
        details: error.message,
      });
    }
    // Other errors
    return Promise.reject({
      status: null,
      message: "Unexpected error occurred",
      details: error.message,
    });
  }
);

export async function fetchNotifications() {
  try {
    const response = await api.get("/notification");
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || "Failed to fetch notifications",
        status: error.status || null,
        details: error.details || null,
      },
    };
  }
}

export async function markNotificationRead(id) {
  try {
    if (!id) {
      throw new Error("Notification ID is required");
    }
    const response = await api.put(`/notifications/${id}/read`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || "Failed to mark notification as read",
        status: error.status || null,
        details: error.details || null,
      },
    };
  }
}

export async function respondToConnection(fromUserId, accept) {
  try {
    if (!fromUserId) {
      throw new Error("User ID is required");
    }
    const action = accept ? "accept" : "reject";
    const response = await api.post(`/connections/${fromUserId}/${action}`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message:
          error.message ||
          `Failed to ${accept ? "accept" : "reject"} connection`,
        status: error.status || null,
        details: error.details || null,
      },
    };
  }
}

export async function sendConnectionRequest(toUserId) {
  try {
    if (!toUserId) {
      throw new Error("Target user ID is required");
    }
    const response = await api.post(`/users/${toUserId}/connect`);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message || "Failed to send connection request",
        status: error.status || null,
        details: error.details || null,
      },
    };
  }
}

export default api;
