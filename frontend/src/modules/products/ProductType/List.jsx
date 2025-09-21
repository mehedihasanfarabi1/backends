// ====================
// PTList.jsx (Debug Final)
// ====================
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductTypeAPI } from "../../../api/products";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import UserCompanySelector from "../../../components/UserCompanySelector";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import "../../../styles/Table.css";

export default function PTList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [permissions, setPermissions] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState([]);

  // --------------------
  // Load current user
  // --------------------
  const loadCurrentUser = async () => {
    try {
      const me = await UserAPI.me();
      // console.log("[Debug] Current User:", me);
      setCurrentUserId(me.id);
      return me.id;
    } catch (err) {
      console.error("Error fetching current user:", err.response?.data || err);
      return null;
    }
  };

  // --------------------
  // Load all data
  // --------------------
  const loadData = async () => {
    setLoading(true);
    try {
      const allRows = await ProductTypeAPI.list();
      // console.log("[Debug] All Rows from API:", allRows);

      const userId = currentUserId || (await loadCurrentUser());
      if (!userId) return setLoading(false);

      const userPerms = await UserPermissionAPI.getByUser(userId);
      // console.log("[Debug] User Permissions Raw:", userPerms);

      const allowedCompanyIds = new Set();
      const allowedBusiness = {};
      const allowedFactories = {};
      const userPermissionsArr = [];

      userPerms.forEach((p) => {
        const productModule = p.product_module || {};
        if (
          Object.values(productModule).some(
            (v) => v.view || v.create || v.edit || v.delete
          )
        ) {
          // Companies
          (p.companies || []).forEach((cid) => {
            allowedCompanyIds.add(Number(cid));
          });

          // Business Types
          Object.entries(p.business_types || {}).forEach(([cid, bts]) => {
            allowedBusiness[Number(cid)] = bts.map(Number);
          });

          // Factories
          Object.entries(p.factories || {}).forEach(([cid, farr]) => {
            allowedFactories[Number(cid)] = farr.map((f) => ({
              factory_id: Number(f.factory_id),
              business_type_id: f.business_type_id
                ? Number(f.business_type_id)
                : null,
            }));
          });

          // Product Module Actions
          Object.entries(productModule).forEach(([module, actions]) => {
            Object.entries(actions).forEach(([action, allowed]) => {
              if (allowed) userPermissionsArr.push(`${module}_${action}`);
            });
          });
        }
      });

      setPermissions(userPermissionsArr);

      // console.log("[Debug] Allowed Companies:", Array.from(allowedCompanyIds));
      // console.log("[Debug] Allowed Business:", allowedBusiness);
      // console.log("[Debug] Allowed Factories:", allowedFactories);
      // console.log("[Debug] Collected Module Perms:", userPermissionsArr);

      // Filter rows by permission
      const filteredRows = allRows.filter((r) => {
        if (!r.company || !allowedCompanyIds.has(Number(r.company.id)))
          return false;

        if (r.business_type) {
          const allowedBTs = allowedBusiness[Number(r.company.id)] || [];
          if (
            allowedBTs.length &&
            !allowedBTs.includes(Number(r.business_type.id))
          )
            return false;
        }

        if (r.factory) {
          const allowedF = allowedFactories[Number(r.company.id)] || [];
          const fMatch = allowedF.some(
            (f) =>
              f.factory_id === Number(r.factory.id) &&
              (!f.business_type_id ||
                f.business_type_id === Number(r.business_type?.id))
          );
          if (allowedF.length && !fMatch) return false;
        }

        return true;
      });

      // console.log(
      //   "[Debug] Filtered Rows IDs (after check):",
      //   filteredRows.map((r) => r.id)
      // );

      setRows(filteredRows);
    } catch (err) {
      console.error("Error in loadData:", err.response?.data || err);
      Swal.fire("Error", "Failed to load product types", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUserId]);

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (!selectedRows.length) return;
    if (!permissions.includes("product_type_delete"))
      return Swal.fire("❌ Access Denied", "", "error");

    const confirm = await Swal.fire({
      title: "Delete selected?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      for (let id of selectedRows) await ProductTypeAPI.remove(id);
      Swal.fire("Deleted!", "", "success");
      setSelectedRows([]);
      loadData();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err);
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const filteredRows = rows.filter(
    (r) =>
      (!selectedCompany || r.company?.id === selectedCompany) &&
      (!selectedBusiness || r.business_type?.id === selectedBusiness) &&
      (!selectedFactory || r.factory?.id === selectedFactory) &&
      (r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.desc || "").toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!permissions.includes("product_type_view"))
    return (
      <div className="alert alert-danger text-center mt-3">Access Denied</div>
    );

  return (
    <div className="container mt-3">
      <ActionBar
        title="Product Types"
        onCreate={() => nav("/admin/product-types/new")}
        showCreate={permissions.includes("product_type_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("product_type_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        exportFileName="product_types"
        showExport={permissions.includes("product_type_view")}
      />

      <UserCompanySelector
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        selectedBusiness={selectedBusiness}
        setSelectedBusiness={setSelectedBusiness}
        selectedFactory={selectedFactory}
        setSelectedFactory={setSelectedFactory}
        setBusinessTypes={setBusinessTypes}
        setFactories={setFactories}
      />

      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input
          className="form-control"
          placeholder="Search..."
          style={{ maxWidth: 250 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-secondary" onClick={() => setSearch("")}>
          Clear
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length === filteredRows.length &&
                    filteredRows.length > 0
                  }
                  onChange={(e) =>
                    setSelectedRows(
                      e.target.checked ? filteredRows.map((r) => r.id) : []
                    )
                  }
                />
              </th>
              <th>SN</th>
              <th>Company</th>
              <th>Business Type</th>
              <th>Factory</th>
              <th>Product Type</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length ? (
              filteredRows.map((r, i) => (
                <tr key={r.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(r.id)}
                      onChange={() => toggleSelectRow(r.id)}
                    />
                  </td>
                  <td>{i + 1}</td>
                  <td>{r.company?.name}</td>
                  <td>{r.business_type?.name || "-"}</td>
                  <td>{r.factory?.name || "-"}</td>
                  <td>{r.name}</td>
                  <td>{r.desc}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => nav(`/admin/product-types/${r.id}`)}
                      disabled={!permissions.includes("product_type_edit")}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setSelectedRows([r.id]);
                        handleDelete();
                      }}
                      disabled={!permissions.includes("product_type_delete")}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
