// src/modules/products/ProductSizeSetting/List.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductSizeSettingAPI } from "../../../api/products";
import { PermissionAPI } from "../../../api/permissions";
import UserCompanySelector from "../../../components/UserCompanySelector";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import useFastData from "../../../hooks/useFetch";
import "../../../styles/Table.css";

export default function ProductSizeSettingList() {
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  
  // ✅ Company Selector States
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  // ----------------------------
  // Fetch Product Size Settings
  // ----------------------------
  const { data: response = {}, refetch, isLoading } = useFastData({
    key: [
      "productSizeSettings",
      selectedCompany,
      selectedBusiness,
      selectedFactory,
    ],
    apiFn: () =>
      ProductSizeSettingAPI.list({
        company: selectedCompany,
        business_type: selectedBusiness,
        factory: selectedFactory,
      }),
    initialData: [],
  });

  const items = Array.isArray(response.results) ? response.results : Array.isArray(response) ? response : [];

  // ----------------------------
  // Fetch User Permissions
  // ----------------------------
  const { data: userPerms = [] } = useFastData({
    key: "userPermissions",
    apiFn: PermissionAPI.list,
    initialData: [],
  });

  const permissions = userPerms.map((p) => p.code);

  // ----------------------------
  // Row selection
  // ----------------------------
  const toggleSelect = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // ----------------------------
  // Delete handler
  // ----------------------------
  const onDelete = async () => {
    if (!selected.length) return;
    if (!permissions.includes("product_size_setting_delete"))
      return Swal.fire("❌ No access", "", "error");

    const result = await Swal.fire({
      title: `Delete ${selected.length} item(s)?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (!result.isConfirmed) return;

    try {
      for (let id of selected) {
        await ProductSizeSettingAPI.remove(id);
      }
      setSelected([]);
      refetch();
      Swal.fire("Deleted!", "Selected items removed.", "success");
    } catch (err) {
      let message = err?.response?.data?.detail || err?.message || "Something went wrong";
      if (typeof message === "object") {
        message = message.detail ? message.detail : Object.values(message).flat().join(", ");
      }
      Swal.fire(
        "⚠️ Cannot Delete",
        "These items have active childs. Delete them first.",
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
      await ProductSizeSettingAPI.bulk_import(file);
      Swal.fire("✅ Imported!", "Records saved successfully", "success");
      refetch();
    } catch (err) {
      Swal.fire("❌ Failed", err.response?.data?.error || "Import failed", "error");
    }
  };

  // ----------------------------
  // Filtered items
  // ----------------------------
  const filtered = items.filter((i) => {
    const matchesSearch =
      i.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.unit?.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.unit?.short_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.size?.size_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.customize_name?.toLowerCase().includes(search.toLowerCase());

    return matchesSearch;
  });

  if (isLoading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2">Loading data...</div>
      </div>
    );

  if (!permissions.includes("product_size_setting_view"))
    return <div className="alert alert-danger mt-3 text-center">Access Denied</div>;

  return (
    <div className="container mt-3">
      <ActionBar
        title="Product Size Settings"
        onCreate={
          permissions.includes("product_size_setting_create")
            ? () => nav("/admin/product-size-settings/new")
            : undefined
        }
        showCreate={permissions.includes("product_size_setting_create")}
        onDelete={onDelete}
        showDelete={permissions.includes("product_size_setting_delete")}
        selectedCount={selected.length}
        data={filtered}
        columns={["category", "product", "size", "unit", "customize_name"]}
        onImport={handleImport}
        exportFileName="product_size_settings"
        showExport={permissions.includes("product_size_setting_view")}
        showPrint={permissions.includes("product_size_setting_view")}
      />

      {/* Company Selector */}
      <UserCompanySelector
        selectedUser={selectedUser} setSelectedUser={setSelectedUser}
        selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}
        selectedBusiness={selectedBusiness} setSelectedBusiness={setSelectedBusiness}
        selectedFactory={selectedFactory} setSelectedFactory={setSelectedFactory}
        setBusinessTypes={setBusinessTypes} setFactories={setFactories}
      />

      {/* Search */}
      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          style={{ maxWidth: 300 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-danger" onClick={() => setSearch("")}>
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th style={{ width: 60 }}>#</th>
              <th>Category</th>
              <th>Product</th>
              <th>Unit</th>
              <th>Size</th>
              <th>Custom Name</th>
              <th style={{ width: 180 }}>Actions</th>
              <th style={{ width: 50 }}>
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={(e) =>
                    setSelected(e.target.checked ? filtered.map((s) => s.id) : [])
                  }
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((i, idx) => (
                <tr key={i.id}>
                  <td>{idx + 1}</td>
                  <td>{i.category?.name || "-"}</td>
                  <td>{i.product?.name || "-"}</td>
                  <td>{i.unit?.name} ({i.unit?.short_name})</td>
                  <td>{i.size?.size_name || "-"}</td>
                  <td>{i.customize_name || "-"}</td>
                  <td className="custom-actions">
                    {permissions.includes("product_size_setting_edit") ? (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => nav(`/admin/product-size-settings/${i.id}`)}
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => Swal.fire("❌ No access", "", "error")}
                      >
                        Edit
                      </button>
                    )}
                    {permissions.includes("product_size_setting_delete") ? (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelected([i.id]);
                          onDelete();
                        }}
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => Swal.fire("❌ No access", "", "error")}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(i.id)}
                      onChange={() => toggleSelect(i.id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center">
                  No product size settings found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
