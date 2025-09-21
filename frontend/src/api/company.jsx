import api from "./axios";

export const CompanyAPI = {
  list: () => api.get("/company/companies/").then(res => res.data),
  get: (id) => api.get(`/company/companies/${id}/`).then(res => res.data),
  details: (id) => api.get(`/company/details/${id}/`).then(res => res.data),
  create: (data) => api.post("/company/companies/", data).then(res => res.data),
  update: (id, data) => api.put(`/company/companies/${id}/`, data).then(res => res.data),
  remove: (id) => api.delete(`/company/companies/${id}/`).then(res => res.data),
};

export const BusinessTypeAPI = {
  list: () => api.get("/company/business-types/").then(res => res.data),
  get: (id) => api.get(`/company/business-types/${id}/`).then(res => res.data),
  create: (data) => api.post("/company/business-types/", data).then(res => res.data),
  update: (id, data) => api.put(`/company/business-types/${id}/`, data).then(res => res.data),
  remove: (id) => api.delete(`/company/business-types/${id}/`).then(res => res.data),
};

export const FactoryAPI = {
  list: () => api.get("/company/factories/").then(res => res.data),
  get: (id) => api.get(`/company/factories/${id}/`).then(res => res.data),
  create: (data) => api.post("/company/factories/", data).then(res => res.data),
  update: (id, data) => api.put(`/company/factories/${id}/`, data).then(res => res.data),
  remove: (id) => api.delete(`/company/factories/${id}/`).then(res => res.data),
};
