import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import { loanTypeApi } from "../../../api/loanApi";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function LoanTypeList() {
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

  // Load LoanType data
  const loadData = async () => {
    setLoading(true);
    try {
      const allRows = await loanTypeApi.list();
      const userId = currentUserId || (await loadCurrentUser());
      if (!userId) return setLoading(false);

      const userPerms = await UserPermissionAPI.getByUser(userId);
      const userPermissionsArr = [];

      userPerms.forEach((p) => {
        const loanModule = p.loan_module || {};
        if (Object.values(loanModule).some((v) => v.view || v.create || v.edit || v.delete)) {
          Object.entries(loanModule).forEach(([module, actions]) => {
            Object.entries(actions).forEach(([action, allowed]) => {
              if (allowed) userPermissionsArr.push(`${module}_${action}`);
            });
          });
        }
      });

      setPermissions(userPermissionsArr);
      setRows(allRows);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load Loan Types", "error");
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
    if (!permissions.includes("loan_type_delete"))
      return Swal.fire("❌ Access Denied", "", "error");

    const confirm = await Swal.fire({
      title: "Delete selected?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      for (let id of selectedRows) await loanTypeApi.delete(id);
      Swal.fire("Deleted!", "", "success");
      setSelectedRows([]);
      loadData();
    } catch (err) {
      let message = err?.response?.data?.detail || err?.message || "Something went wrong";

      if (typeof message === "object") {

        message = message.detail ? message.detail : Object.values(message).flat().join(", ");
      }

      Swal.fire("⚠️ Cannot Delete", "This LoanType has active child. Delete them first.", "warning");
    }
  };

  const filteredRows = rows.filter(
    (r) =>
      (r.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.interest_rate || "").toString().includes(search) ||
      (r.interest_start_date || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!permissions.includes("loan_type_view"))
    return <div className="alert alert-danger text-center mt-3">Access Denied</div>;

  return (
    <div className="container mt-3">
      <ActionBar
        title="Loan Type List"
        onCreate={() => nav("/admin/loan-types/new")}
        showCreate={permissions.includes("loan_type_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("loan_type_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        exportFileName="loan_type_list"
        showExport={permissions.includes("loan_type_view")}
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
              <th>Name</th>
              <th>Interest Count</th>
              <th>Interest Rate</th>
              <th>Start Date</th>
              <th>End Date</th>
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
                  <td>{r.name || "-"}</td>
                  <td>{r.has_interest ? "Yes" : "No"}</td>
                  <td>{r.interest_rate}</td>
                  <td>{r.interest_start_date || "-"}</td>
                  <td>{r.interest_end_date || "-"}</td>
                  <td>
                    <FaEdit
                      className="text-primary me-3"
                      size={18}
                      title="Edit"
                      onClick={() => nav(`/admin/loan-types/${r.id}`)}
                      style={{
                        cursor: permissions.includes("loan_type_edit")
                          ? "pointer"
                          : "not-allowed",
                        opacity: permissions.includes("loan_type_edit") ? 1 : 0.5,
                      }}
                    />
                    <FaTrash
                      className="text-danger"
                      size={18}
                      title="Delete"
                      onClick={() => {
                        if (permissions.includes("loan_type_delete")) {
                          setSelectedRows([r.id]);
                          handleDelete();
                        }
                      }}
                      style={{
                        cursor: permissions.includes("loan_type_delete")
                          ? "pointer"
                          : "not-allowed",
                        opacity: permissions.includes("loan_type_delete") ? 1 : 0.5,
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
                <td colSpan="8" className="text-center">
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
