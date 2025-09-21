import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8001/api",
});

// Request interceptor: attach token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: auto-refresh token on 401
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
            original._retry = true;
            const refresh = localStorage.getItem("refresh");

            if (refresh) {
                try {
                    const r = await axios.post("http://localhost:8001/api/refresh/", { refresh });
                    localStorage.setItem("token", r.data.access);
                    
                    // decode new access token
                    const jwtDecode = (await import("jwt-decode")).default;
                    const decoded = jwtDecode(r.data.access);
                    localStorage.setItem("token_exp", decoded.exp);

                    original.headers.Authorization = `Bearer ${r.data.access}`;
                    return api(original);
                } catch (err) {
                    localStorage.clear();
                    window.location.href = "/";
                }
            } else {
                localStorage.clear();
                window.location.href = "/";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
