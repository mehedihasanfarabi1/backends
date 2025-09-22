// src/pages/admin/category/CategoryList.jsx
import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CategoryAPI, ProductTypeAPI } from "../../../api/products";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import ActionBar from "../../../components/common/ActionBar";
import UserCompanySelector from "../../../components/UserCompanySelector";
import Swal from "sweetalert2";
import "../../../styles/Table.css";

export default function CategoryList() {
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
  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState("");

  // -------------------
  // Load current user
  // -------------------
  const loadCurrentUser = async () => {
    try {
      const me = await UserAPI.me();
      setCurrentUserId(me.id);
      return me.id;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // -------------------
  // Load categories
  // -------------------
  const loadData = async () => {
    setLoading(true);
    try {
      const allCategories = await CategoryAPI.list();

      const userId = currentUserId || (await loadCurrentUser());
      if (!userId) return setLoading(false);

      const userPerms = await UserPermissionAPI.getByUser(userId);
      const userPermissionsArr = [];

      userPerms.forEach((p) => {
        const categoryModule = p.product_module?.category || {};
        Object.entries(categoryModule).forEach(([action, allowed]) => {
          if (allowed) userPermissionsArr.push(`category_${action}`);
        });
      });

      setPermissions(userPermissionsArr);
      setRows(allCategories);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load categories", "error");
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
    if (!permissions.includes("category_delete"))
      return Swal.fire("❌ Access Denied", "", "error");

    const confirm = await Swal.fire({
      title: `Delete ${selectedRows.length} category(s)?`,
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      for (let id of selectedRows) await CategoryAPI.remove(id);
      Swal.fire("Deleted!", "", "success");
      setSelectedRows([]);
      loadData();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const filteredRows = rows.filter(
    (r) =>
      (!selectedCompany || r.company?.id === selectedCompany) &&
      (!selectedBusiness || r.business_type?.id === selectedBusiness) &&
      (!selectedFactory || r.factory?.id === selectedFactory) &&
      (r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!permissions.includes("category_view"))
    return <div className="alert alert-danger text-center mt-3">Access Denied</div>;

  return (
    <div className="container mt-3">
      <ActionBar
        title="Categories"
        onCreate={permissions.includes("category_create") ? () => nav("/admin/categories/new") : undefined}
        showCreate={permissions.includes("category_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("category_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        exportFileName="categories"
        showExport={permissions.includes("category_view")}
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
                  checked={selectedRows.length === filteredRows.length && filteredRows.length > 0}
                  onChange={(e) =>
                    setSelectedRows(e.target.checked ? filteredRows.map((r) => r.id) : [])
                  }
                />
              </th>
              <th>SN</th>
              {/* <th>Company</th>
              <th>Business_Type</th>
              <th>Factory</th> */}
              <th>Category_Name</th>
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
                  {/* <td>{r.company?.name}</td>
                  <td>{r.business_type?.name || "-"}</td>
                  <td>{r.factory?.name || "-"}</td> */}
                  <td>{r.name}</td>
                  <td>{r.description}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => nav(`/admin/categories/${r.id}`)}
                      disabled={!permissions.includes("category_edit")}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setSelectedRows([r.id]);
                        handleDelete();
                      }}
                      disabled={!permissions.includes("category_delete")}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center">
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
