
import api from "./axios";

const crud = (resource) => ({
    list: (params = {}) => api.get(`/accounts/${resource}/`, { params }).then(r => r.data),
    retrieve: (id) => api.get(`/accounts/${resource}/${id}/`).then(r => r.data),
    create: (data) => api.post(`/accounts/${resource}/`, data).then(r => r.data),
    update: (id, data) => api.put(`/accounts/${resource}/${id}/`, data).then(r => r.data),
    delete: (id) => api.delete(`/accounts/${resource}/${id}/`).then(r => r.data),
    bulk_import: (file) => {
        const formData = new FormData();
        formData.append("file", file); 
        return api.post(`/accounts/${resource}/bulk-import/`, formData).then(r => r.data);
    }

});

export const accountApi = crud("account-head");