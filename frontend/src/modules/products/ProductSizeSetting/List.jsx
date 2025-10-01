import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductSizeSettingAPI } from "../../../api/products";
import { PermissionAPI } from "../../../api/permissions";
import UserCompanySelector from "../../../components/UserCompanySelector";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import "../../../styles/Table.css";

export default function ProductSizeSettingList() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);

  // ✅ Company Selector States
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  const nav = useNavigate();

  const load = async () => {
    try {
      const params = {
        company: selectedCompany,
        business_type: selectedBusiness,
        factory: selectedFactory,
      };

      const data = await ProductSizeSettingAPI.list(params);
      setItems(data);

      const perms = await PermissionAPI.list();
      setUserPermissions(perms.map((p) => p.code));
    } catch (err) {
      console.error("Error loading product size settings:", err);
      Swal.fire("Error", "Failed to load data", "error");
    }
  };

  useEffect(() => {
    load();
  }, [selectedCompany, selectedBusiness, selectedFactory]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onDelete = async () => {
    if (!selected.length) return;

    if (!userPermissions.includes("product_size_setting_delete")) {
      return Swal.fire("❌ You do not have access for this feature", "", "error");
    }

    const result = await Swal.fire({
      title: `Delete ${selected.length} item(s)?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        for (let id of selected) {
          await ProductSizeSettingAPI.remove(id);
        }
        setSelected([]);
        load();
        Swal.fire("Deleted!", "Selected items removed.", "success");
      } catch (err) {
        
        let message = err?.response?.data?.detail || err?.message || "Something went wrong";

        if (typeof message === "object") {
          
          message = message.detail ? message.detail : Object.values(message).flat().join(", ");
        }

        Swal.fire("⚠️ Cannot Delete", "This items has active childs. Delete them first.", "warning");
      }
    }
  };

  // 🔹 Filter by search + company/business/factory
  const filtered = items.filter((i) => {
    const matchesSearch =
      i.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.unit?.name?.toLowerCase().includes(search.toLowerCase()) ||
      i.unit?.short_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.size?.size_name?.toLowerCase().includes(search.toLowerCase()) ||
      i.customize_name?.toLowerCase().includes(search.toLowerCase());

    const matchesCompany =
      (!selectedCompany || i.company?.id === selectedCompany) &&
      (!selectedBusiness || i.business_type?.id === selectedBusiness) &&
      (!selectedFactory || i.factory?.id === selectedFactory);

    return matchesSearch && matchesCompany;
  });

  if (!userPermissions.includes("product_size_setting_view")) {
    return <div className="alert alert-danger mt-3 text-center">Access Denied</div>;
  }

  return (
    <div className="container mt-3">
      <ActionBar
        title="Product Size Settings"
        onCreate={
          userPermissions.includes("product_size_setting_create")
            ? () => nav("/admin/product-size-settings/new")
            : undefined
        }
        showCreate={userPermissions.includes("product_size_setting_create")}
        onDelete={onDelete}
        showDelete={userPermissions.includes("product_size_setting_delete")}
        selectedCount={selected.length}
        data={filtered}
        exportFileName="product_size_settings"
        showExport={userPermissions.includes("product_size_setting_view")}
        showPrint={userPermissions.includes("product_size_setting_view")}
      />

      {/* ✅ Company Selector */}
      <div className="mb-3">
        <UserCompanySelector
          selectedUser={selectedUser} setSelectedUser={setSelectedUser}
          selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}
          selectedBusiness={selectedBusiness} setSelectedBusiness={setSelectedBusiness}
          selectedFactory={selectedFactory} setSelectedFactory={setSelectedFactory}
          setBusinessTypes={setBusinessTypes} setFactories={setFactories}
        />
      </div>

      {/* ✅ Search */}
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

      {/* ✅ Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>

              <th style={{ width: 60 }}>#</th>
              {/* <th>Company</th>
              <th>Business Type</th>
              <th>Factory</th> */}
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
                  {/* <td>{i.company?.name || "-"}</td>
                  <td>{i.business_type?.name || "-"}</td>
                  <td>{i.factory?.name || "-"}</td> */}
                  <td>{i.category?.name || "-"}</td>
                  <td>{i.product?.name || "-"}</td>
                  <td>{i.unit?.name} ({i.unit?.short_name})</td>
                  <td>{i.size?.size_name || "-"}</td>
                  <td>{i.customize_name || "-"}</td>
                  <td className="custom-actions">
                    {userPermissions.includes("product_size_setting_edit") ? (
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
                    {userPermissions.includes("product_size_setting_delete") ? (
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
                <td colSpan={11} className="text-center">
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
