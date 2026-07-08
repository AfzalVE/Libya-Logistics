
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user._id) {
        config.headers["x-user-id"] = user._id;
      }
    } catch (e) {
      console.error("Error parsing user from localStorage:", e);
    }
  }
  return config;
});

export default api;