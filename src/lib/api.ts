import axios from "axios";

const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  (import.meta.env.VITE_API_BASE as string | undefined) ?? // fallback ke var lama
  "http://localhost:5000";

export const api = axios.create({ baseURL: BASE_URL });

// sisipkan token otomatis
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
