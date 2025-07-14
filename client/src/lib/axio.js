import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5020",
  withCredentials: true, // Allow cookies to be sent with requests
});

export default axiosInstance;
