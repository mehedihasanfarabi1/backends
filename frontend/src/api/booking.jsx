import api from "./axios";

const crud = (resource) => ({
  list: (params = {}) => api.get(`/booking_list/${resource}/`, { params }).then(r => r.data),
  retrieve: (id) => api.get(`/booking_list/${resource}/${id}/`).then(r => r.data),
  get: (id) => api.get(`/booking_list/${resource}/${id}/`).then(r => r.data), // 👈 alias
  create: (data) => api.post(`/booking_list/${resource}/`, data).then(r => r.data),
  update: (id, data) => api.put(`/booking_list/${resource}/${id}/`, data).then(r => r.data),
  remove: (id) => api.delete(`/booking_list/${resource}/${id}/`).then(r => r.data),
  bulkCreate: (data) => api.post(`/booking_list/${resource}/bulk-create/`, data).then(r => r.data),
  bulk_import: (file) => {
    const formData = new FormData();
    formData.append("file", file); // ✅ FILE object
    return api.post(`/booking_list/${resource}/bulk-import/`, formData).then(r => r.data);
  }

});


export const BookingAPI = crud("booking");

