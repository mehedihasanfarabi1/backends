// src/pages/products/PTList.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ProductTypeAPI } from "../../../api/products";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import ActionBar from "../../../components/common/ActionBar";
import UserCompanySelector from "../../../components/UserCompanySelector";
import useFastData from "../../../hooks/useFetch";
import { useTranslation } from "../../../contexts/TranslationContext";

export default function PTList() {
  const nav = useNavigate();
  const { t } = useTranslation();

  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  // ----------------------------
  // Fetch all product types
  // ----------------------------
  const { data: allRows = [], refetch, isLoading } = useFastData({
    key: "product_types",
    apiFn: ProductTypeAPI.list,
    initialData: [],
  });

  // ----------------------------
  // Fetch current user
  // ----------------------------
  const { data: currentUser } = useFastData({
    key: "currentUser",
    apiFn: UserAPI.me,
  });

  // ----------------------------
  // Fetch user permissions
  // ----------------------------
  const { data: userPerms } = useFastData({
    key: ["userPermissions", currentUser?.id],
    apiFn: () => UserPermissionAPI.getByUser(currentUser.id),
    enabled: !!currentUser,
  });

  // ----------------------------
  // Process permissions
  // ----------------------------
  const permissions = [];
  const allowedCompanyIds = new Set();

  userPerms?.forEach((p) => {
    const productModule = p.product_module || {};
    if (Object.values(productModule).some((v) => v.view || v.create || v.edit || v.delete)) {
      (p.companies || []).forEach((cid) => allowedCompanyIds.add(Number(cid)));
    }
    Object.entries(productModule).forEach(([module, actions]) => {
      Object.entries(actions).forEach(([action, allowed]) => {
        if (allowed) permissions.push(`${module}_${action}`);
      });
    });
  });

  // ----------------------------
  // Filter rows by company & search
  // ----------------------------
  const filteredRows = allRows
    .filter((r) => allowedCompanyIds.has(Number(r.company?.id)))
    .filter(
      (r) =>
        (!selectedCompany || r.company?.id === selectedCompany) &&
        (!selectedBusiness || r.business_type?.id === selectedBusiness) &&
        (!selectedFactory || r.factory?.id === selectedFactory) &&
        (r.name.toLowerCase().includes(search.toLowerCase()) ||
          (r.desc || "").toLowerCase().includes(search.toLowerCase()))
    );

  // ----------------------------
  // Row selection
  // ----------------------------
  const toggleSelectRow = (id) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // ----------------------------
  // Delete handler
  // ----------------------------
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
      refetch();
    } catch (err) {
      let message = err?.response?.data?.detail || err?.message || "Something went wrong";
      if (typeof message === "object") {
        message = message.detail ? message.detail : Object.values(message).flat().join(", ");
      }
      Swal.fire(
        "⚠️ Cannot Delete",
        "This ProductType has active Categories. Delete them first.",
        "warning"
      );
    }
  };

  // ----------------------------
  // Import handler
  // ----------------------------
  const handleImport = async (file) => {
    if (!file) return;
    try {
      await ProductTypeAPI.bulk_import(file);
      Swal.fire("✅ Imported!", "Records saved successfully", "success");
      refetch();
    } catch (err) {
      console.error("Import error:", err);
      Swal.fire("❌ Failed", err.response?.data?.error || "Import failed", "error");
    }
  };

  // ----------------------------
  // Render
  // ----------------------------
  if (isLoading) return <div className="text-center mt-5">Loading...</div>;
  if (!permissions.includes("product_type_view"))
    return <div className="alert alert-danger text-center mt-3">Access Denied</div>;

  return (
    <div className="container mt-3">
      <ActionBar
        title={t("Product Types")}
        onCreate={() => nav("/admin/product-types/new")}
        showCreate={permissions.includes("product_type_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("product_type_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        onImport={handleImport}
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
              <th>{t("SL")}</th>
              <th>{t("Company")}</th>
              <th>{t("Product Type")}</th>
              <th>{t("Description")}</th>
              <th>{t("Actions")}</th>
              <th>
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length === filteredRows.length && filteredRows.length > 0
                  }
                  onChange={(e) =>
                    setSelectedRows(
                      e.target.checked ? filteredRows.map((r) => r.id) : []
                    )
                  }
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length ? (
              filteredRows.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.company?.name || "-"}</td>
                  <td>{r.name}</td>
                  <td>{r.desc || "-"}</td>
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
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(r.id)}
                      onChange={() => toggleSelectRow(r.id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
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
