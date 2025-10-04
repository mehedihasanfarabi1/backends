import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { UnitAPI } from "../../../api/products";
import { PermissionAPI } from "../../../api/permissions";
import UserCompanySelector from "../../../components/UserCompanySelector";
import ActionBar from "../../../components/common/ActionBar";
import useFastData from "../../../hooks/useFetch";
import "../../../styles/Table.css";

export default function UnitList() {
  const nav = useNavigate();

  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState("");

  // Company selector
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  // ----------------------------
  // Permissions
  // ----------------------------
  const { data: perms = [] } = useFastData({
    key: ["unitPermissions"],
    apiFn: () => PermissionAPI.list().then((res) => res.map((p) => p.code)),
  });

  // ----------------------------
  // Units
  // ----------------------------
  const { data: units = [], refetch: refetchUnits } = useFastData({
    key: ["units", selectedCompany, selectedBusiness, selectedFactory],
    apiFn: () =>
      UnitAPI.list({
        company: selectedCompany || undefined,
        business_type: selectedBusiness || undefined,
        factory: selectedFactory || undefined,
      }),
    initialData: [],
  });

  // ----------------------------
  // Delete
  // ----------------------------
  const handleDelete = async () => {
    if (!selectedRows.length) return;

    if (!perms.includes("unit_delete")) {
      return Swal.fire("❌ You do not have access for this feature", "", "error");
    }

    const result = await Swal.fire({
      title: `Delete ${selectedRows.length} unit(s)?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        for (let id of selectedRows) await UnitAPI.remove(id);
        setSelectedRows([]);
        refetchUnits();
        Swal.fire("Deleted!", "Selected unit(s) removed.", "success");
      } catch (err) {
        let message = err?.response?.data?.detail || err?.message || "Something went wrong";
        if (typeof message === "object") {
          message = message.detail ? message.detail : Object.values(message).flat().join(", ");
        }
        Swal.fire("⚠️ Cannot Delete", "This Unit has active UnitSize. Delete them first.", "warning");
      }
    }
  };

  // ----------------------------
  // Import
  // ----------------------------
  const handleImport = async (file) => {
    if (!file) return;
    try {
      await UnitAPI.bulk_import(file);
      Swal.fire("✅ Imported!", "Records saved successfully", "success");
      refetchUnits();
    } catch (err) {
      console.error("Import error:", err);
      Swal.fire("❌ Failed", err.response?.data?.error || "Import failed", "error");
    }
  };

  // ----------------------------
  // Filtering
  // ----------------------------
  const filteredUnits = units.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      (u.short_name || "").toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelectRow = (id) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  if (!perms.includes("unit_view")) {
    return (
      <div className="alert alert-danger mt-3 text-center">
        ❌ Access Denied
      </div>
    );
  }

  return (
    <div className="container mt-3">
      <ActionBar
        title="Units"
        onCreate={perms.includes("unit_create") ? () => nav("/admin/units/new") : undefined}
        showCreate={perms.includes("unit_create")}
        onDelete={handleDelete}
        showDelete={perms.includes("unit_delete")}
        selectedCount={selectedRows.length}
        data={filteredUnits}
        onImport={handleImport}
        exportFileName="units"
        showExport={perms.includes("unit_view")}
      />

      <UserCompanySelector
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedCompany={selectedCompany}
        setSelectedCompany={(v) => {
          setSelectedCompany(v);
          setSelectedBusiness(null);
          setSelectedFactory(null);
        }}
        selectedBusiness={selectedBusiness}
        setSelectedBusiness={(v) => {
          setSelectedBusiness(v);
          setSelectedFactory(null);
        }}
        selectedFactory={selectedFactory}
        setSelectedFactory={setSelectedFactory}
        setBusinessTypes={setBusinessTypes}
        setFactories={setFactories}
      />

      {/* Search */}
      <div className="row g-2 mb-3 align-items-end">
        <div className="col-md-6 col-sm-12">
          <input
            className="form-control"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* <div className="col-md-3 col-sm-4">
          <button
            className="btn btn-secondary w-100"
            onClick={() => setSearch("")}
          >
            Clear
          </button>
        </div> */}
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th>Serial</th>
              <th>Name</th>
              <th>Short Name</th>
              <th>Actions</th>
              <th>
                <input
                  type="checkbox"
                  checked={selectedRows.length === filteredUnits.length && filteredUnits.length > 0}
                  onChange={(e) =>
                    setSelectedRows(
                      e.target.checked ? filteredUnits.map((r) => r.id) : []
                    )
                  }
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUnits.length ? (
              filteredUnits.map((u, i) => (
                <tr key={u.id}>
                  <td>{i + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.short_name}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => nav(`/admin/units/${u.id}`)}
                      disabled={!perms.includes("unit_edit")}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setSelectedRows([u.id]);
                        handleDelete();
                      }}
                      disabled={!perms.includes("unit_delete")}
                    >
                      Delete
                    </button>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(u.id)}
                      onChange={() => toggleSelectRow(u.id)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center">
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
