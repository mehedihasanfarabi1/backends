import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8001/api/",
});

// Request interceptor to attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    // console.log("Axios request:", config.method.toUpperCase(), config.url, "Token:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Axios request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("Axios response error:", error.response?.status, error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
