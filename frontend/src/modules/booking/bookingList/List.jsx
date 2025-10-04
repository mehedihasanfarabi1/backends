// src/booking/List.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookingAPI } from "../../../api/booking";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";
import useFastData from "../../../hooks/useFetch";

export default function BookingList() {
  const nav = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState("");

  // ----------------------------
  // Fetch current user instantly
  // ----------------------------
  const { data: currentUser } = useFastData({
    key: "currentUser",
    apiFn: UserAPI.me,
    staleTime: 5 * 60 * 1000, // 5 মিনিট cache
    initialData: {},          // instant UI render
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
  // Fetch bookings instantly
  // ----------------------------
  const { data: allRows = [], refetch } = useFastData({
    key: "bookings",
    apiFn: BookingAPI.list,
    enabled: !!currentUser,
    staleTime: 1,          // practically instant refresh
    initialData: [],       // instant UI
  });

  // ----------------------------
  // Process permissions
  // ----------------------------
  const permissions = [];
  userPerms.forEach((p) => {
    const bookingModule = p.booking_module || {};
    Object.entries(bookingModule).forEach(([module, actions]) => {
      Object.entries(actions).forEach(([action, allowed]) => {
        if (allowed) permissions.push(`${module}_${action}`);
      });
    });
  });

  if (!permissions.includes("booking_view"))
    return (
      <div className="alert alert-danger text-center mt-3">
        Access Denied
      </div>
    );

  // ----------------------------
  // Filter rows by search
  // ----------------------------
  const filteredRows = allRows.filter(
    (r) =>
      (r.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.desc || "").toLowerCase().includes(search.toLowerCase())
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
    if (!permissions.includes("booking_delete"))
      return Swal.fire("❌ Access Denied", "", "error");

    const confirm = await Swal.fire({
      title: "Delete selected?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      for (let id of selectedRows) await BookingAPI.remove(id);
      Swal.fire("Deleted!", "", "success");
      setSelectedRows([]);
      refetch(); // instantly refresh list
    } catch (err) {
      Swal.fire(
        "⚠️ Cannot Delete",
        "This Booking has active party. Delete them first.",
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
      await BookingAPI.bulk_import(file);
      Swal.fire("✅ Imported!", "Records saved successfully", "success");
      refetch(); // instantly refresh list
    } catch (err) {
      Swal.fire("❌ Failed", err.response?.data?.error || "Import failed", "error");
    }
  };

  return (
    <div className="container mt-3">
      <ActionBar
        title="Bookings"
        onCreate={() => nav("/booking/new")}
        showCreate={permissions.includes("booking_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("booking_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        onImport={handleImport}
        columns={["name", "description"]}
        exportFileName="bookings"
        showExport={permissions.includes("booking_view")}
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
              <th>#</th>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
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
                  <td>{r.name}</td>
                  <td>{r.desc || "-"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => nav(`/booking/edit/${r.id}`)}
                      disabled={!permissions.includes("booking_edit")}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setSelectedRows([r.id]);
                        handleDelete();
                      }}
                      disabled={!permissions.includes("booking_delete")}
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
                <td colSpan="5" className="text-center">
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
