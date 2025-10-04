import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductAPI, ProductTypeAPI, CategoryAPI } from "../../../api/products";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import ActionBar from "../../../components/common/ActionBar";
import UserCompanySelector from "../../../components/UserCompanySelector";
import Swal from "sweetalert2";
import "../../../styles/Table.css";
import { useTranslation } from "../../../contexts/TranslationContext";
import useFastData from "../../../hooks/useFetch";


export default function ProductList() {
  const nav = useNavigate();

  // const [rows, setRows] = useState([]);
  // const [permissions, setPermissions] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);

  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState("");

  // const [productTypes, setProductTypes] = useState([]);
  // const [categories, setCategories] = useState([]);

  const [selectedProductType, setSelectedProductType] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const { t } = useTranslation();

    // ----------------------------
  // Current user
  // ----------------------------
  const { data: currentUser } = useFastData({ key: "currentUser", apiFn: UserAPI.me });

  // ----------------------------
  // Permissions
  // ----------------------------
  const { data: userPerms } = useFastData({
    key: ["userPermissions", currentUser?.id],
    apiFn: () => UserPermissionAPI.getByUser(currentUser.id),
    enabled: !!currentUser,
  });

  const permissions = [];
  userPerms?.forEach((p) => {
    const productModule = p.product_module?.product || {};
    Object.entries(productModule).forEach(([action, allowed]) => {
      if (allowed) permissions.push(`product_${action}`);
    });
  });

  // ----------------------------
  // Load products
  // ----------------------------
  const { data: rows = [], refetch: refetchProducts } = useFastData({
    key: ["products", selectedCompany, selectedBusiness, selectedFactory],
    apiFn: () =>
      ProductAPI.list({
        company: selectedCompany || undefined,
        business_type: selectedBusiness || undefined,
        factory: selectedFactory || undefined,
      }),
    initialData: [],
  });

  // ----------------------------
  // Product types
  // ----------------------------
  const { data: productTypes = [] } = useFastData({
    key: ["productTypes", selectedCompany],
    apiFn: () => ProductTypeAPI.list({ company: selectedCompany }),
    enabled: !!selectedCompany,
    initialData: [],
  });

  // ----------------------------
  // Categories
  // ----------------------------
  const { data: categories = [] } = useFastData({
    key: ["categories", selectedProductType],
    apiFn: () => CategoryAPI.list({ product_type: selectedProductType }),
    enabled: !!selectedProductType,
    initialData: [],
  });


  const toggleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (!selectedRows.length) return;
    if (!permissions.includes("product_delete"))
      return Swal.fire("❌ Access Denied", "", "error");

    const confirm = await Swal.fire({
      title: `Delete ${selectedRows.length} product(s)?`,
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      for (let id of selectedRows) await ProductAPI.remove(id);
      Swal.fire("Deleted!", "", "success");
      setSelectedRows([]);
      loadData();
    } catch (err) {

      let message = err?.response?.data?.detail || err?.message || "Something went wrong";

      if (typeof message === "object") {
        // DRF ValidationError returns array
        message = message.detail ? message.detail : Object.values(message).flat().join(", ");
      }

      Swal.fire("⚠️ Cannot Delete", "This Prodcucts has active Childs. Delete them first.", "warning");
    }
  };

  // ✅ Filtering products
  const filteredRows = rows.filter((r) => {
    const matchSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.short_name || "").toLowerCase().includes(search.toLowerCase());

    const matchProductType =
      !selectedProductType || r.product_type?.id === selectedProductType;

    const matchCategory =
      !selectedCategory || r.category?.id === selectedCategory;

    return matchSearch && matchProductType && matchCategory;
  });



  const handleImport = async (file) => {
    if (!file) return;
    try {
      await ProductAPI.bulk_import(file);
      Swal.fire("✅ Imported!", "Records saved successfully", "success");
      loadData();
    } catch (err) {
      console.error("Import error:", err);
      Swal.fire("❌ Failed", err.response?.data?.error || "Import failed", "error");
    }
  };


  if (!permissions.includes("product_view"))
    return (
      <div className="alert alert-danger text-center mt-3">Access Denied</div>
    );

  return (
    <div className="container mt-3">
      <ActionBar
        title="Products"
        onCreate={
          permissions.includes("product_create")
            ? () => nav("/admin/products/new")
            : undefined
        }
        showCreate={permissions.includes("product_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("product_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        onImport={handleImport}
        exportFileName="products"
        showExport={permissions.includes("product_view")}
      />

      {/* Company Selector */}
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

      {/* ✅ Search + ProductType + Category same row (responsive) */}
      <div className="row g-2 mb-3 align-items-end">
        <div className="col-md-3 col-sm-6">
          <input
            className="form-control"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="col-md-3 col-sm-6">
          <select
            className="form-select"
            value={selectedProductType || ""}
            onChange={(e) =>
              setSelectedProductType(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
          >
            <option value="">-- Product Type --</option>
            {productTypes.map((pt) => (
              <option key={pt.id} value={pt.id}>
                {pt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3 col-sm-6">
          <select
            className="form-select"
            value={selectedCategory || ""}
            onChange={(e) =>
              setSelectedCategory(
                e.target.value ? parseInt(e.target.value) : null
              )
            }
            disabled={!selectedProductType}
          >
            <option value="">-- Category --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="col-md-3 col-sm-6">
          <button
            className="btn btn-secondary w-100"
            onClick={() => {
              setSearch("");
              setSelectedProductType(null);
              setSelectedCategory(null);
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* ✅ Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th>{t("serial")}</th>
              <th>{t("product_type")}</th>
              <th>{t("category_name")}</th>
              <th>{t("name")}</th>
              <th>{t("short_name")}</th>
              <th>{t("actions")}</th>
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
            </tr>
          </thead>
          <tbody>
            {filteredRows.length ? (
              filteredRows.map((r, i) => (
                <tr key={r.id}>
                  <td>{i + 1}</td>
                  <td>{r.product_type?.name || "-"}</td>
                  <td>{r.category?.name || "-"}</td>
                  <td>{r.name}</td>
                  <td>{r.short_name}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => nav(`/admin/products/${r.id}`)}
                      disabled={!permissions.includes("product_edit")}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setSelectedRows([r.id]);
                        handleDelete();
                      }}
                      disabled={!permissions.includes("product_delete")}
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
                <td colSpan={7} className="text-center">
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
