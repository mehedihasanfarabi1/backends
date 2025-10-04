import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import { accountHeadApi } from "../../../api/accountsApi";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function AccountHeadList() {
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

  // Load AccountHead data
  const loadData = async () => {
    setLoading(true);
    try {
      const allRows = await accountHeadApi.list();
      const userId = currentUserId || (await loadCurrentUser());
      if (!userId) return setLoading(false);

      const userPerms = await UserPermissionAPI.getByUser(userId);
      const userPermissionsArr = [];

      userPerms.forEach((p) => {
        const accModule = p.accounts_module || {};
        if (Object.values(accModule).some((v) => v.view || v.create || v.edit || v.delete)) {
          Object.entries(accModule).forEach(([module, actions]) => {
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
      Swal.fire("Error", "Failed to load Account Heads", "error");
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
    if (!permissions.includes("account_head_delete"))
      return Swal.fire("❌ Access Denied", "", "error");

    const confirm = await Swal.fire({
      title: "Delete selected?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      for (let id of selectedRows) await accountApi.delete(id);
      Swal.fire("Deleted!", "", "success");
      setSelectedRows([]);
      loadData();
    } catch (err) {
      let message = err?.response?.data?.detail || err?.message || "Something went wrong";

      if (typeof message === "object") {

        message = message.detail ? message.detail : Object.values(message).flat().join(", ");
      }

      Swal.fire("⚠️ Cannot Delete", "This AccountHead has active child. Delete them first.", "warning");
    }
  };

  const filteredRows = rows.filter((r) =>
    (r.head_name || "").toLowerCase().includes(search.toLowerCase())
  );

  // 🔹 Totals
  const totalDebit = filteredRows.reduce((sum, r) => sum + parseFloat(r.debit || 0), 0);
  const totalCredit = filteredRows.reduce((sum, r) => sum + parseFloat(r.credit || 0), 0);
  const totalBalance = filteredRows.reduce((sum, r) => sum + parseFloat(r.balance || 0), 0);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!permissions.includes("account_head_view"))
    return <div className="alert alert-danger text-center mt-3">Access Denied</div>;

  return (
    <div className="container mt-3">
      <ActionBar
        title="Account Head List"
        onCreate={() => nav("/admin/account-head/new")}
        showCreate={permissions.includes("account_head_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("account_head_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        exportFileName="account_head_list"
        showExport={permissions.includes("account_head_view")}
      />


      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input
          className="form-control"
          placeholder="Search by Head Name..."
          style={{ maxWidth: 250 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-secondary" onClick={() => setSearch("")}>
          Clear
        </button>
      </div>

      {/* 🔹 Table */}
      <div className="table-responsive">
        
        <div className="alert alert-info d-flex flex-wrap justify-content-around mb-3 fw-bold">
          <span>Debit: {totalDebit.toLocaleString()} TK</span>
          <span>Credit: {totalCredit.toLocaleString()} TK</span>
          <span>Total Balance: {totalBalance.toLocaleString()} TK</span>
        </div>
        <table className="table table-bordered table-hover table-striped mb-0">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Head Name</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
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
                  <td>{r.head_name}</td>
                  <td>{parseFloat(r.debit).toLocaleString()}</td>
                  <td>{parseFloat(r.credit).toLocaleString()}</td>
                  <td>{parseFloat(r.balance).toLocaleString()}</td>
                  <td>
                    <FaEdit
                      className="text-primary me-3"
                      size={18}
                      title="Edit"
                      onClick={() => nav(`/admin/account-head/${r.id}`)}
                      style={{
                        cursor: permissions.includes("account_head_edit")
                          ? "pointer"
                          : "not-allowed",
                        opacity: permissions.includes("account_head_edit") ? 1 : 0.5,
                      }}
                    />
                    <FaTrash
                      className="text-danger"
                      size={18}
                      title="Delete"
                      onClick={() => {
                        if (permissions.includes("account_head_delete")) {
                          setSelectedRows([r.id]);
                          handleDelete();
                        }
                      }}
                      style={{
                        cursor: permissions.includes("account_head_delete")
                          ? "pointer"
                          : "not-allowed",
                        opacity: permissions.includes("account_head_delete") ? 1 : 0.5,
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
                <td colSpan="7" className="text-center">
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
