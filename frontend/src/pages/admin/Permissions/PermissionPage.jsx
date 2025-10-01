import React from "react";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import PermissionAccordion from "./Components/PermissionAccordion";
import UserCompanySelector from "./Components/UserCompanySelector";
import { PermissionAPI, UserPermissionAPI } from "../../../api/permissions";

export default function PermissionPage() {
  const [permissions, setPermissions] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [selectedModules, setSelectedModules] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState({});
  const [selectedFactories, setSelectedFactories] = useState({});

  const [currentPermissionSet, setCurrentPermissionSet] = useState(null);

  // Load permissions
  useEffect(() => {
    const loadPermissions = async () => {
      const data = await PermissionAPI.list();
      setPermissions(data);

      const groupedData = {};
      data.forEach((p) => {
        const companyModules = ["company", "business_type", "factory"];
        const productModules = [
          "product",
          "product_type",
          "category",
          "unit",
          "unit_size",
          "unit_conversion",
          "product_size_setting",
        ];

        const party_type_module = ["party_type", "party", "party_commission"];
        const booking_module = ["booking"];
        const sr_module = ["sr"];
        const pallot_module = ["pallot_type", "pallot", "chamber", "floor", "pocket"];
        const loan_module = ["loan_type", "loan"];
        const settings_module = ["bag_type"];
        const accounts_module = ["account_head", "account"];

        let mainGroup = "other";
        if (companyModules.includes(p.module)) mainGroup = "company";
        else if (productModules.includes(p.module)) mainGroup = "products";
        else if (party_type_module.includes(p.module)) mainGroup = "party_type";
        else if (booking_module.includes(p.module)) mainGroup = "booking";
        else if (sr_module.includes(p.module)) mainGroup = "sr";
        else if (pallot_module.includes(p.module)) mainGroup = "pallot";
        else if (loan_module.includes(p.module)) mainGroup = "loan";
        else if (settings_module.includes(p.module)) mainGroup = "essential settings";
        else if (accounts_module.includes(p.module)) mainGroup = "accounts";

        if (!groupedData[mainGroup]) groupedData[mainGroup] = {};
        if (!groupedData[mainGroup][p.module]) groupedData[mainGroup][p.module] = [];
        groupedData[mainGroup][p.module].push(p);
      });

      setGrouped(groupedData);
    };
    loadPermissions();
  }, []);

  // Load user permissions
  useEffect(() => {
    const loadUserPermissions = async () => {
      if (!selectedUser) {
        setSelectedModules([]);
        setSelectedCompanies([]);
        setSelectedBusinessTypes({});
        setSelectedFactories({});
        setCurrentPermissionSet(null);
        return;
      }

      const sets = await UserPermissionAPI.getByUser(selectedUser.value);
      if (!sets.length) {
        setSelectedModules([]);
        setSelectedCompanies([]);
        setSelectedBusinessTypes({});
        setSelectedFactories({});
        setCurrentPermissionSet(null);
        return;
      }

      const setData = sets[0];
      setCurrentPermissionSet(setData);

      // Modules
      const moduleCodes = [];
      [
        "product_module",
        "company_module",
        "hr_module",
        "accounts_module",
        "inventory_module",
        "settings_module",
        "party_type_module",
        "sr_module",
        "loan_module",
        "booking_module",
        "pallot_module",
        "delivery_module",
        "ledger_module"
      ].forEach((mod) => {
        if (setData[mod]) {
          Object.entries(setData[mod]).forEach(([moduleKey, actions]) => {
            if (typeof actions === "object" && actions !== null) {
              Object.entries(actions).forEach(([action, val]) => {
                if (val) moduleCodes.push(`${moduleKey}_${action}`);
              });
            }
          });
        }
      });
      setSelectedModules(moduleCodes);

      // Companies
      const cleanCompanies = (setData.companies || []).map((c) => {
        if (typeof c === "number") return c;
        if (c && typeof c === "object" && c.value != null) return c.value;
        return null;
      }).filter(Boolean);
      setSelectedCompanies(cleanCompanies);

      // Business Types
      setSelectedBusinessTypes(setData.business_types || {});

      // Factories (ensure object format)
      const cleanFactories = {};
      Object.entries(setData.factories || {}).forEach(([companyId, items]) => {
        cleanFactories[companyId] = (Array.isArray(items) ? items : []).map((f) => {
          if (f && typeof f === "object" && "factory_id" in f && "business_type_id" in f) return f;
          if (f && typeof f === "object" && "id" in f && "btId" in f)
            return { factory_id: f.id, business_type_id: f.btId };
          return null;
        }).filter(Boolean);
      });
      setSelectedFactories(cleanFactories);
    };
    loadUserPermissions();
  }, [selectedUser]);

  // Save permissions
  const save = async () => {
    if (!selectedUser) return Swal.fire("⚠️ Error", "Select a user first", "warning");

    try {
      const payload = {
        user: selectedUser.value,
        role: null,
        companies: selectedCompanies.filter(c => typeof c === "number"),
        business_types: selectedBusinessTypes,
        factories: selectedFactories,
        product_module: {},
        company_module: {},
        hr_module: {},
        accounts_module: {},
        inventory_module: {},
        settings_module: {},
        party_type_module: {},
        sr_module: {},
        loan_module: {},
        booking_module: {},
        pallot_module: {},
        delivery_module: {},
        ledger_module: {}
      };

      selectedModules.forEach((modAction) => {
        const [module, action] = modAction.split(/_(?=[^_]+$)/);
        const productModules = [
          "product",
          "product_type",
          "category",
          "unit",
          "unit_size",
          "unit_conversion",
          "product_size_setting",
        ];
        const companyModules = ["company", "business_type", "factory"];

        const party_type_module = ["party_type", "party", "party_commission"];
        const booking_module = ["booking"];
        const sr_module = ["sr"];
        const pallot_module = ["pallot_type", "pallot", "chamber", "floor", "pocket"];
        const loan_module = ["loan_type", "loan"];
        const settings_module = ["bag_type"];
        const accounts_module = ["account_head", "account"];

        if (companyModules.includes(module)) {
          if (!payload.company_module[module])
            payload.company_module[module] = { create: false, edit: false, delete: false, view: false };
          if (action in payload.company_module[module]) payload.company_module[module][action] = true;
        }
        if (productModules.includes(module)) {
          if (!payload.product_module[module])
            payload.product_module[module] = { create: false, edit: false, delete: false, view: false };
          if (action in payload.product_module[module]) payload.product_module[module][action] = true;
        }

        if (party_type_module.includes(module)) {
          if (!payload.party_type_module[module])
            payload.party_type_module[module] = { create: false, edit: false, delete: false, view: false };
          if (action in payload.party_type_module[module]) payload.party_type_module[module][action] = true;
        }
        if (booking_module.includes(module)) {
          if (!payload.booking_module[module])
            payload.booking_module[module] = { create: false, edit: false, delete: false, view: false };
          if (action in payload.booking_module[module]) payload.booking_module[module][action] = true;
        }
        if (sr_module.includes(module)) {
          if (!payload.sr_module[module])
            payload.sr_module[module] = { create: false, edit: false, delete: false, view: false };
          if (action in payload.sr_module[module]) payload.sr_module[module][action] = true;
        }
        if (pallot_module.includes(module)) {
          if (!payload.pallot_module[module])
            payload.pallot_module[module] = { create: false, edit: false, delete: false, view: false };
          if (action in payload.pallot_module[module]) payload.pallot_module[module][action] = true;
        }
        if (loan_module.includes(module)) {
          if (!payload.loan_module[module])
            payload.loan_module[module] = { create: false, edit: false, delete: false, view: false };
          if (action in payload.loan_module[module]) payload.loan_module[module][action] = true;
        }
        if (settings_module.includes(module)) {
          if (!payload.settings_module[module])
            payload.settings_module[module] = { create: false, edit: false, delete: false, view: false };
          if (action in payload.settings_module[module]) payload.settings_module[module][action] = true;
        }
        if (accounts_module.includes(module)) {
          if (!payload.accounts_module[module])
            payload.accounts_module[module] = { create: false, edit: false, delete: false, view: false };
          if (action in payload.accounts_module[module]) payload.accounts_module[module][action] = true;
        }

      });
      console.log("🚀 Final Payload:", payload);
      await UserPermissionAPI.updateOrCreate(selectedUser.value, payload);
      Swal.fire("✅ Saved", "Permissions updated successfully!", "success");
    } catch (err) {
      console.error("Save Error:", err);
      Swal.fire("❌ Error", "Failed to save permissions", "error");
    }
  };

  return (
    <div className="container py-3">
      <div className="text-center bg-primary text-white py-3 rounded mb-4 shadow">
        <h2 className="mb-1">Permission Management</h2>
        <p className="mb-0">Assign module-wise permissions to users</p>
      </div>

      <UserCompanySelector
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedCompanies={selectedCompanies}
        setSelectedCompanies={setSelectedCompanies}
        selectedBusinessTypes={selectedBusinessTypes}
        setSelectedBusinessTypes={setSelectedBusinessTypes}
        selectedFactories={selectedFactories}
        setSelectedFactories={setSelectedFactories}
      />

      <PermissionAccordion
        grouped={grouped}
        selected={selectedModules}
        setSelected={setSelectedModules}
        companies={selectedCompanies}
        businessTypes={selectedBusinessTypes}
        selectedBusinessTypes={selectedBusinessTypes}
        setSelectedBusinessTypes={setSelectedBusinessTypes}
        factories={selectedFactories}
        selectedFactories={selectedFactories}
        setSelectedFactories={setSelectedFactories}
      />

      <div className="text-center mt-4">
        <button className="btn btn-primary px-5 py-2 shadow-lg" onClick={save}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
