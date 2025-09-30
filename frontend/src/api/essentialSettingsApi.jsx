
import api from "./axios";

const crud = (resource) => ({
    list: (params = {}) => api.get(`/essential_settings/${resource}/`, { params }).then(r => r.data),
    retrieve: (id) => api.get(`/essential_settings/${resource}/${id}/`).then(r => r.data),
    create: (data) => api.post(`/essential_settings/${resource}/`, data).then(r => r.data),
    update: (id, data) => api.put(`/essential_settings/${resource}/${id}/`, data).then(r => r.data),
    delete: (id) => api.delete(`/essential_settings/${resource}/${id}/`).then(r => r.data),
});

export const bagTypeApi = crud("bag-types");
