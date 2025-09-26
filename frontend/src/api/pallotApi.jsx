import api from "./axios";

const crud = (resource) => ({
    list: (params = {}) => api.get(`/pallot/${resource}/`, { params }).then(r => r.data),
    retrieve: (id) => api.get(`/pallot/${resource}/${id}/`).then(r => r.data),
    get: (id) => api.get(`/pallot/${resource}/${id}/`).then(r => r.data), // 
    create: (data) => api.post(`/pallot/${resource}/`, data).then(r => r.data),
    update: (id, data) => api.put(`/pallot/${resource}/${id}/`, data).then(r => r.data),
    remove: (id) => api.delete(`/pallot/${resource}/${id}/`).then(r => r.data),

});


export const PallotAPI = crud("pallot_types");