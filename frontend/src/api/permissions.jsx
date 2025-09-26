import api from "./axios";

// ====================
// Master Permissions (optional, for reference)
// ====================
export const PermissionAPI = {
  list: async () => {
    try {
      const [prod, comp,party,booking,sr,pallot] = await Promise.all([

        api.get("/company/permissions/"),
        api.get("/products/permissions/"),
        api.get("/party_type/permissions/"),
        api.get("/booking_list/permissions/"),
        api.get("/sr/permissions/"),
        api.get("/pallot/permissions/"),
      ]);
      return [...prod.data, ...comp.data,...party.data,...booking.data,...sr.data,...pallot.data];
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
  getByUser: async (userId) => {
    const res = await api.get(`/permission-sets/user/${userId}/`);
    // Ensure always array
    return Array.isArray(res.data) ? res.data : [res.data];
  },

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
      party_type_module: payload.party_type_module,
      loan_module: payload.loan_module,
      sr_module: payload.sr_module,
      booking_module: payload.booking_module,
      pallot_module: payload.pallot_module,
      delivery_module: payload.delivery_module,
      ledger_module: payload.ledger_module
    });
    return res.data;
  }
};
