import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL || "https://mesdo-healthcare-1.onrender.com",
  withCredentials: true, // Allow cookies to be sent with requests
});

// Add request interceptor to include token in Authorization header as fallback
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage as fallback
    const token = localStorage.getItem("jwt-mesdo-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Added token to Authorization header as fallback");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might be expired or invalid, clear localStorage
      localStorage.removeItem("jwt-mesdo-token");
      console.log("Cleared expired token from localStorage");
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
