import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:5020", // Update with your API's base URL
  withCredentials: true, // Allow cookies to be sent with requests
});

export default axiosInstance;
