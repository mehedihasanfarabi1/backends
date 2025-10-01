import api from "./axios";

const crud = (resource) => ({
  list: (params = {}) => api.get(`/party_type/${resource}/`, { params }).then(r => r.data),
  retrieve: (id) => api.get(`/party_type/${resource}/${id}/`).then(r => r.data),
  get: (id) => api.get(`/party_type/${resource}/${id}/`).then(r => r.data), // 👈 alias
  create: (data) => api.post(`/party_type/${resource}/`, data).then(r => r.data),
  update: (id, data) => api.put(`/party_type/${resource}/${id}/`, data).then(r => r.data),
  remove: (id) => api.delete(`/party_type/${resource}/${id}/`).then(r => r.data),
  bulkCreate: (data) => api.post(`/party_type/${resource}/bulk-create/`, data).then(r => r.data),
  bulk_import: (file) => {
    const formData = new FormData();
    formData.append("file", file); // ✅ FILE object
    return api.post(`/party_type/${resource}/bulk-import/`, formData).then(r => r.data);
  }

});


export const PartyTypeAPI = crud("party-types");
export const PartyAPI = crud("parties");
export const PartyCommissionAPI = crud("party-commissions");

