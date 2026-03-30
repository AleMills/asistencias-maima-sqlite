import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.0.99:4000/api", // LAN IP for mobile access
});

api.interceptors.request.use((config) => {
  // Check both storages: sessionStorage for admin, localStorage for employees
  const token =
    sessionStorage.getItem("adminToken") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
