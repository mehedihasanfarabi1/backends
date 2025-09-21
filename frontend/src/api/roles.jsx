import api from "./axios"; // তোমার axios instance

// ✅ Roles
export const fetchRoles = () => api.get("/roles/");
export const createRole = (data) => api.post("/roles/", data);
export const updateRole = (id, data) => api.put(`/roles/${id}/`, data);
export const deleteRole = (id) => api.delete(`/roles/${id}/`);

// ✅ Role Permissions
export const fetchRolePermissions = (id) => api.get(`/roles/${id}/permissions/`);
export const assignRolePermissions = (id, permissions) =>
  api.post(`/roles/${id}/assign_permissions/`, { permissions });

// ✅ Permissions
// Permissions CRUD
export const fetchPermissions = () => api.get("/permissions/");
export const createPermission = (data) => api.post("/permissions/", data);
export const updatePermission = (id, data) => api.put(`/permissions/${id}/`, data);
export const deletePermission = (id) => api.delete(`/permissions/${id}/`);
