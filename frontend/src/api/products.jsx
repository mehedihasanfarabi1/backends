import api from "./axios";

const crud = (resource) => ({
  list: (params = {}) => api.get(`/products/${resource}/`, { params }).then(r => r.data),
  retrieve: (id) => api.get(`/products/${resource}/${id}/`).then(r => r.data),
  get: (id) => api.get(`/products/${resource}/${id}/`).then(r => r.data), // 👈 alias
  create: (data) => api.post(`/products/${resource}/`, data).then(r => r.data),
  update: (id, data) => api.put(`/products/${resource}/${id}/`, data).then(r => r.data),
  remove: (id) => api.delete(`/products/${resource}/${id}/`).then(r => r.data),
});


export const ProductTypeAPI        = crud("product-types");
export const CategoryAPI           = crud("categories");
export const ProductAPI            = crud("products");
export const UnitAPI               = crud("units");
export const UnitSizeAPI           = crud("unit-sizes");
export const UnitConversionAPI     = crud("unit-conversions");
export const ProductSizeSettingAPI = crud("product-size-settings");
