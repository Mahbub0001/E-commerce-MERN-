import axios from "axios";

function normalizeBaseURL(url) {
  const baseURL = (url || "http://localhost:5000").replace(/\/+$/, "");
  return baseURL.endsWith("/api") ? baseURL.slice(0, -4) : baseURL;
}

const api = axios.create({
  baseURL: normalizeBaseURL(import.meta.env.VITE_API_URL),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("novamart_token") || sessionStorage.getItem("novamart_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
