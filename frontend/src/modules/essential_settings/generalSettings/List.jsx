// src/essentialSettings/GeneralSettingsList.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import { generalSettingsApi } from "../../../api/essentialSettingsApi";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";
import useFastData from "../../../hooks/useFetch";

export default function GeneralSettingsList() {
  const nav = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState("");

  // ----------------------------
  // Fetch current user instantly
  // ----------------------------
  const { data: currentUser } = useFastData({
    key: "currentUser",
    apiFn: UserAPI.me,
    staleTime: 5 * 60 * 1000,
    initialData: {},
  });

  // ----------------------------
  // Fetch user permissions instantly
  // ----------------------------
  const { data: userPerms = [] } = useFastData({
    key: ["userPermissions", currentUser?.id],
    apiFn: () => UserPermissionAPI.getByUser(currentUser.id),
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000,
    initialData: [],
  });

  // ----------------------------
  // Fetch General Settings instantly
  // ----------------------------
  const { data: allRows = [], refetch } = useFastData({
    key: "generalSettings",
    apiFn: generalSettingsApi.list,
    enabled: !!currentUser,
    staleTime: 1,
    initialData: [],
  });

  // ----------------------------
  // Process permissions
  // ----------------------------
  const permissions = [];
  userPerms.forEach((p) => {
    const settingsModule = p.settings_module || {};
    Object.entries(settingsModule).forEach(([module, actions]) => {
      Object.entries(actions).forEach(([action, allowed]) => {
        if (allowed) permissions.push(`${module}_${action}`);
      });
    });
  });

  if (!permissions.includes("general_settings_view"))
    return <div className="alert alert-danger text-center mt-3">Access Denied</div>;

  // ----------------------------
  // Filter rows by search
  // ----------------------------
  const filteredRows = allRows.filter((r) =>
    [
      r.title,
      r.author,
      r.author_email,
      r.currency,
      r.theme,
      r.language,
      r.timezone,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
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
    if (!permissions.includes("general_settings_delete"))
      return Swal.fire("❌ Access Denied", "", "error");

    const confirm = await Swal.fire({
      title: "Delete selected?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      for (let id of selectedRows) await generalSettingsApi.delete(id);
      Swal.fire("Deleted!", "", "success");
      setSelectedRows([]);
      refetch();
    } catch (err) {
      let message = err?.response?.data?.detail || err?.message || "Something went wrong";
      if (typeof message === "object") {
        message = message.detail ? message.detail : Object.values(message).flat().join(", ");
      }
      Swal.fire("⚠️ Cannot Delete", message, "warning");
    }
  };

  // ----------------------------
  // Import handler (optional)
  // ----------------------------
  // const handleImport = async (file) => {
  //   if (!file) return;
  //   try {
  //     await generalSettingsApi.bulk_import(file);
  //     Swal.fire("✅ Imported!", "Records saved successfully", "success");
  //     refetch();
  //   } catch (err) {
  //     Swal.fire("❌ Failed", err.response?.data?.error || "Import failed", "error");
  //   }
  // };



  return (
    <div className="container mt-3">
      <ActionBar
        title="General Settings List"
        onCreate={() => nav("/admin/general-settings/new")}
        showCreate={permissions.includes("general_settings_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("general_settings_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        exportFileName="general_settings_list"
        showExport={permissions.includes("general_settings_view")}
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
        <table className="table table-bordered table-hover table-striped mb-0">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Branch</th>
              <th>Title</th>
              <th>Author</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Mobile</th>
              <th>Currency</th>
              <th>Theme</th>
              <th>Language</th>
              <th>Timezone</th>
              <th>Actions</th>
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
                  <td>{r.factory?.name}</td>
                  <td>{r.title || "-"}</td>
                  <td>{r.author || "-"}</td>
                  <td>{r.author_email || "-"}</td>
                  <td>{r.author_phone || "-"}</td>
                  <td>{r.author_mobile || "-"}</td>
                  <td>{r.currency || "-"}</td>
                  <td>{r.theme || "-"}</td>
                  <td>{r.language || "-"}</td>
                  <td>{r.timezone || "-"}</td>
                  <td>
                    <FaEdit
                      className="text-primary me-3"
                      size={18}
                      title="Edit"
                      onClick={() => nav(`/admin/general-settings/${r.id}`)}
                      style={{
                        cursor: permissions.includes("general_settings_edit")
                          ? "pointer"
                          : "not-allowed",
                        opacity: permissions.includes("general_settings_edit") ? 1 : 0.5,
                      }}
                    />
                    <FaTrash
                      className="text-danger"
                      size={18}
                      title="Delete"
                      onClick={() => {
                        if (permissions.includes("general_settings_delete")) {
                          setSelectedRows([r.id]);
                          handleDelete();
                        }
                      }}
                      style={{
                        cursor: permissions.includes("general_settings_delete")
                          ? "pointer"
                          : "not-allowed",
                        opacity: permissions.includes("general_settings_delete") ? 1 : 0.5,
                      }}
                    />
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
                <td colSpan="12" className="text-center">
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
