import axios from "axios";

const axiosInstance = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL || "https://mesdo-healthcare-1.onrender.com",
  withCredentials: true, // Allow cookies to be sent with requests
});

export default axiosInstance;
