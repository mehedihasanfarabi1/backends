import api from "./axios";

const crud = (resource) => ({
    list: (params = {}) => api.get(`/pallot/${resource}/`, { params }).then(r => r.data),
    retrieve: (id) => api.get(`/pallot/${resource}/${id}/`).then(r => r.data),
    get: (id) => api.get(`/pallot/${resource}/${id}/`).then(r => r.data), // 
    create: (data) => api.post(`/pallot/${resource}/`, data).then(r => r.data),
    update: (id, data) => api.put(`/pallot/${resource}/${id}/`, data).then(r => r.data),
    remove: (id) => api.delete(`/pallot/${resource}/${id}/`).then(r => r.data),
    bulk_create: (data) => api.post(`/pallot/${resource}/bulk_create/`, data).then(r => r.data),
    get_sr_quantity: (params = {}) => api.get(`/pallot/get_sr_quantity/`, { params }).then(r => r.data),
    bulk_import: (file) => {
        const formData = new FormData();
        formData.append("file", file); // ✅ FILE object
        return api.post(`/pallot/${resource}/bulk-import/`, formData).then(r => r.data);
    }

});


export const PallotAPI = crud("pallot_types");
export const ChamberAPI = crud("chambers");
export const FloorAPI = crud("floors");
export const PocketAPI = crud("pockets");
export const PallotListAPI = crud("pallots");