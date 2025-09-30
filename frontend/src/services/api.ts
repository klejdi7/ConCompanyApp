// import axios from "axios";

// const api = axios.create({
// 	baseURL: "http://localhost:4000", // backend base URL
// });

// api.interceptors.request.use((config) => {
// 	const token = localStorage.getItem("token");
// 	if (token && config.headers) {
// 		config.headers.Authorization = `Bearer ${token}`;
// 	}
// 	return config;
// });

// export default api;

// services/api.ts - TEMPORARY FIX
import axios from "axios";

// Replace 192.168.1.100 with your actual computer IP
const API_BASE_URL = typeof window !== 'undefined' 
  ? "http://192.168.1.166:4000"  // Your computer's IP
  : "http://localhost:4000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;