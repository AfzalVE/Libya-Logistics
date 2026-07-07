import { create } from "zustand";
import api from "../services/api";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  isAuthenticated: !!localStorage.getItem("user"),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/users/login", { email, password });
      if (response.data.success) {
        const user = response.data.user;
        localStorage.setItem("user", JSON.stringify(user));
        set({ user, isAuthenticated: true, loading: false });
        return { success: true };
      } else {
        set({ error: response.data.message || "Login failed", loading: false });
        return { success: false, message: response.data.message };
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid credentials or server error";
      set({ error: msg, loading: false });
      return { success: false, message: msg };
    }
  },

  logout: () => {
    localStorage.removeItem("user");
    set({ user: null, isAuthenticated: false, error: null });
  },

  // Facilitates fast one-click login for testing the full multi-role flow
  quickLogin: async (email) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post("/users/login", { email, password: "password123" });
      if (response.data.success) {
        const user = response.data.user;
        localStorage.setItem("user", JSON.stringify(user));
        set({ user, isAuthenticated: true, loading: false });
        return { success: true };
      } else {
        set({ error: response.data.message || "Quick login failed", loading: false });
        return { success: false };
      }
    } catch (err) {
      set({ error: "Server connection failed", loading: false });
      return { success: false };
    }
  }
}));

export default useAuthStore;
