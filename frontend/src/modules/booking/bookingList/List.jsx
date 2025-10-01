// src/booking/List.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import { BookingAPI } from "../../../api/booking";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function BookingList() {
  const nav = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState("");

  // Load current user
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

  // Load bookings
  const loadData = async () => {
    setLoading(true);
    try {
      const allRows = await BookingAPI.list();
      const userId = currentUserId || (await loadCurrentUser());
      if (!userId) return setLoading(false);

      const userPerms = await UserPermissionAPI.getByUser(userId);
      const userPermissionsArr = [];

      userPerms.forEach((p) => {
        const bookingModule = p.booking_module || {};
        Object.entries(bookingModule).forEach(([module, actions]) => {
          Object.entries(actions).forEach(([action, allowed]) => {
            if (allowed) userPermissionsArr.push(`${module}_${action}`);
          });
        });
      });

      setPermissions(userPermissionsArr);
      setRows(allRows);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load bookings", "error");
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
      loadData();
    } catch (err) {

      let message = err?.response?.data?.detail || err?.message || "Something went wrong";

      if (typeof message === "object") {

        message = message.detail ? message.detail : Object.values(message).flat().join(", ");
      }

      Swal.fire("⚠️ Cannot Delete", "This Booking has active party. Delete them first.", "warning");
    }
  };

  // filter by search
  const filteredRows = rows.filter(
    (r) =>
      (r.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.desc || "").toLowerCase().includes(search.toLowerCase())
  );


  const handleImport = async (file) => {
    if (!file) return;
    try {
      await BookingAPI.bulk_import(file); // ✅ শুধু FILE object
      Swal.fire("✅ Imported!", "Records saved successfully", "success");
      loadData();
    } catch (err) {
      console.error("Import error:", err);
      Swal.fire("❌ Failed", err.response?.data?.error || "Import failed", "error");
    }
  };


  if (loading) return <div className="text-center mt-5 ">Loading...</div>;
  if (!permissions.includes("booking_view"))
    return (
      <div className="alert alert-danger text-center mt-3">
        Access Denied
      </div>
    );

  return (
    <div className="container mt-3">
      <ActionBar
        title="Bookings"
        onCreate={() => nav("/admin/bookings/new")}
        showCreate={permissions.includes("booking_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("booking_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        exportFileName="bookings"
        onImport={handleImport}
        columns={["id","name","desc"]}
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

      <div className="table-responsive" style={{ fontSize: "0.75rem" }}>
        <table className="table table-bordered table-hover table-striped mb-0">
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
                    <FaEdit
                      className="text-secondary me-3"
                      size={20}
                      title="Edit"
                      onClick={() => nav(`/admin/bookings/${r.id}`)}
                      style={{
                        cursor: permissions.includes("booking_edit")
                          ? "pointer"
                          : "not-allowed",
                        opacity: permissions.includes("booking_edit") ? 1 : 0.5,
                      }}
                    />
                    <FaTrash
                      className="text-danger"
                      size={20}
                      title="Delete"
                      onClick={() => {
                        if (permissions.includes("booking_delete")) {
                          setSelectedRows([r.id]);
                          handleDelete();
                        }
                      }}
                      style={{
                        cursor: permissions.includes("booking_delete")
                          ? "pointer"
                          : "not-allowed",
                        opacity: permissions.includes("booking_delete") ? 1 : 0.5,
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
