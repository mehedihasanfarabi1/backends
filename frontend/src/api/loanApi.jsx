import api from "./axios";

const crud = (resource) => ({
  list: (params = {}) => api.get(`/loan/${resource}/`, { params }).then(r => r.data),
  retrieve: (id) => api.get(`/loan/${resource}/${id}/`).then(r => r.data),
  create: (data) => api.post(`/loan/${resource}/`, data).then(r => r.data),
  update: (id, data) => api.put(`/loan/${resource}/${id}/`, data).then(r => r.data),
  delete: (id) => api.delete(`/loan/${resource}/${id}/`).then(r => r.data),
  bulk_import: (file) => {
    const formData = new FormData();
    formData.append("file", file); // ✅ FILE object
    return api.post(`/loan/${resource}/bulk-import/`, formData).then(r => r.data);
  }

});

export const loanTypeApi = crud("loan-types");
