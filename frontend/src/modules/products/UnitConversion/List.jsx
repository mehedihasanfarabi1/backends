// src/modules/products/UnitConversion/List.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UnitConversionAPI } from "../../../api/products";
import { PermissionAPI } from "../../../api/permissions";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import useFastData from "../../../hooks/useFetch";
import "../../../styles/Table.css";

export default function UnitConversionList() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const nav = useNavigate();

  // ----------------------------
  // Fetch conversions with FastData
  // ----------------------------
  const { data: response = {}, refetch, isLoading } = useFastData({
    key: ["unitConversions"],
    apiFn: UnitConversionAPI.list,
    initialData: {},
  });

  // ensure array
  const conversions = Array.isArray(response.results)
    ? response.results
    : Array.isArray(response)
    ? response
    : [];

  // ----------------------------
  // Fetch user permissions
  // ----------------------------
  const { data: userPerms = [] } = useFastData({
    key: ["userPermissions"],
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
  const handleDelete = async () => {
    if (!selected.length) return;
    if (!permissions.includes("unit_conversion_delete")) {
      return Swal.fire("❌ You do not have access for this feature", "", "error");
    }

    const result = await Swal.fire({
      title: `Delete ${selected.length} conversion(s)?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        for (let id of selected) await UnitConversionAPI.remove(id);
        setSelected([]);
        refetch();
        Swal.fire("Deleted!", "Selected conversion(s) removed.", "success");
      } catch (err) {
        let message = err?.response?.data?.detail || err?.message || "Something went wrong";
        if (typeof message === "object") {
          message = message.detail ? message.detail : Object.values(message).flat().join(", ");
        }
        Swal.fire("⚠️ Cannot Delete", "This UnitConversion has active Child. Delete them first.", "warning");
      }
    }
  };

  // ----------------------------
  // Import handler
  // ----------------------------
  const handleImport = async (file) => {
    if (!file) return;
    try {
      await UnitConversionAPI.bulk_import(file);
      Swal.fire("✅ Imported!", "Records saved successfully", "success");
      refetch();
    } catch (err) {
      Swal.fire("❌ Failed", err.response?.data?.error || "Import failed", "error");
    }
  };

  // ----------------------------
  // Filtered conversions
  // ----------------------------
  const filtered = conversions.filter(
    (r) =>
      (r.parent_unit?.unit_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.child_unit?.unit_name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2">Loading data...</div>
      </div>
    );
  }

  if (!permissions.includes("unit_conversion_view")) {
    return <div className="alert alert-danger mt-3 text-center">Access Denied</div>;
  }

  return (
    <div className="container mt-3">
      <ActionBar
        title="Unit Conversions"
        onCreate={
          permissions.includes("unit_conversion_create")
            ? () => nav("/admin/unit-conversions/new")
            : undefined
        }
        showCreate={permissions.includes("unit_conversion_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("unit_conversion_delete")}
        selectedCount={selected.length}
        data={filtered}
        onImport={handleImport}
        exportFileName="unit_conversions"
        showExport={permissions.includes("unit_conversion_view")}
        showPrint={permissions.includes("unit_conversion_view")}
      />

      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          style={{ maxWidth: 250 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-danger" onClick={() => setSearch("")}>
          Clear
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th style={{ width: 50 }}>
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={(e) =>
                    setSelected(e.target.checked ? filtered.map((r) => r.id) : [])
                  }
                />
              </th>
              <th style={{ width: 60 }}>#</th>
              <th>Parent Unit</th>
              <th>Quantity</th>
              <th>Child Unit</th>
              <th style={{ width: 150 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((i, index) => (
                <tr key={i.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(i.id)}
                      onChange={() => toggleSelect(i.id)}
                    />
                  </td>
                  <td>{index + 1}</td>
                  <td>
                    {i.parent_unit
                      ? `${i.parent_unit.unit_name} (${i.parent_unit.short_name})`
                      : "-"}
                  </td>
                  <td>{i.qty}</td>
                  <td>
                    {i.child_unit
                      ? `${i.child_unit.unit_name} (${i.child_unit.short_name})`
                      : "-"}
                  </td>
                  <td className="custom-actions">
                    {permissions.includes("unit_conversion_edit") ? (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => nav(`/admin/unit-conversions/${i.id}`)}
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() =>
                          Swal.fire(
                            "❌ You do not have access for this feature",
                            "",
                            "error"
                          )
                        }
                      >
                        Edit
                      </button>
                    )}
                    {permissions.includes("unit_conversion_delete") ? (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelected([i.id]);
                          handleDelete();
                        }}
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          Swal.fire(
                            "❌ You do not have access for this feature",
                            "",
                            "error"
                          )
                        }
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  No conversions found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
