import api from "./axios";

// ====================
// Master Permissions (product, company, etc.)
// ====================
export const PermissionAPI = {
  list: async () => {
    try {
      const [prod, comp] = await Promise.all([
        api.get("/products/permissions/"),
        api.get("/company/permissions/"),
      ]);
      return [...prod.data, ...comp.data];
    } catch (err) {
      console.error("PermissionAPI.list error", err);
      return [];
    }
  }
};

// ====================
// User APIs
// ====================
export const UserAPI = {
  list: async () => {
    const res = await api.get("/users/");
    return res.data;
  },
  me: async () => {
    const res = await api.get("/me/");
    return res.data;
  }
};

// ====================
// User Permission APIs (Hybrid Model)
// ====================
export const UserPermissionAPI = {
  // ✅ একটা user এর সব PermissionSets নিয়ে আসবে
  getByUser: async (userId) => {
    const res = await api.get(`/permission-sets/user/${userId}/`);
    return res.data;
  },

  // ✅ Update / Create একসাথে
  updateOrCreate: async (userId, payload) => {
    const res = await api.post("/permission-sets/update-or-create/", {
      user: userId,
      role: payload.role,
      companies: payload.companies,
      business_types: payload.business_types,
      factories: payload.factories,
      product_module: payload.product_module,
      company_module: payload.company_module,
      hr_module: payload.hr_module,
      accounts_module: payload.accounts_module,
      inventory_module: payload.inventory_module,
      settings_module: payload.settings_module,
    });
    return res.data;
  }
};
