import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UnitConversionAPI } from "../../../api/products";
import { PermissionAPI } from "../../../api/permissions";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import "../../../styles/Table.css";

export default function UnitConversionList() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await UnitConversionAPI.list();
      setRows(data);

      const perms = await PermissionAPI.list();
      setUserPermissions(perms.map((p) => p.code));
    } catch (err) {
      console.error("Error loading conversions:", err);
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onDelete = async () => {
    if (!selected.length) return;
    if (!userPermissions.includes("unit_conversion_delete")) {
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
        for (let id of selected) {
          await UnitConversionAPI.remove(id);
        }
        setSelected([]);
        load();
        Swal.fire("Deleted!", "Selected conversion(s) removed.", "success");
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }
  };

  const filtered = rows.filter(
    (r) =>
      r.parent_unit?.unit_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.child_unit?.unit_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2">Loading data...</div>
      </div>
    );
  }

  if (!userPermissions.includes("unit_conversion_view")) {
    return (
      <div className="alert alert-danger mt-3 text-center">Access Denied</div>
    );
  }

  return (
    <div className="container mt-3">
      <ActionBar
        title="Unit Conversions"
        onCreate={
          userPermissions.includes("unit_conversion_create")
            ? () => nav("/admin/unit-conversions/new")
            : undefined
        }
        showCreate={userPermissions.includes("unit_conversion_create")}
        onDelete={onDelete}
        showDelete={userPermissions.includes("unit_conversion_delete")}
        selectedCount={selected.length}
        data={filtered}
        exportFileName="unit_conversions"
        showExport={userPermissions.includes("unit_conversion_view")}
        showPrint={userPermissions.includes("unit_conversion_view")}
      />

      {/* Search */}
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

      {/* Table */}
      <div className="custom-table-wrapper">
        <table className="custom-table">
          <thead>
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
                    {userPermissions.includes("unit_conversion_edit") ? (
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
                    {userPermissions.includes("unit_conversion_delete") ? (
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
