import api from "./axios";

const crud = (resource) => ({
    list: (params = {}) => api.get(`/sr/${resource}/`, { params }).then(r => r.data),
    retrieve: (id) => api.get(`/sr/${resource}/${id}/`).then(r => r.data),
    get: (id) => api.get(`/sr/${resource}/${id}/`).then(r => r.data), // 👈 alias
    create: (data) => api.post(`/sr/${resource}/`, data).then(r => r.data),
    update: (id, data) => api.put(`/sr/${resource}/${id}/`, data).then(r => r.data),
    remove: (id) => api.delete(`/sr/${resource}/${id}/`).then(r => r.data),
    bulkCreate: (data) => api.post(`/sr/${resource}/bulk-create/`, data).then(r => r.data),
    // 🔹 Add this
    nextSRNo: () => api.get(`/sr/next_sr/`).then(r => r.data),
    bulk_import: (file) => {
        const formData = new FormData();
        formData.append("file", file); // ✅ FILE object
        return api.post(`/sr/${resource}/bulk-import/`, formData).then(r => r.data);
    }

});


export const SRAPI = crud("srs");

