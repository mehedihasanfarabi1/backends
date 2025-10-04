// src/essentialSettings/TransactionSettingsList.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import { transactionSettingsApi } from "../../../api/essentialSettingsApi";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";
import useFastData from "../../../hooks/useFetch";

export default function TransactionSettingsList() {
  const nav = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState("");

  const { data: currentUser } = useFastData({
    key: "currentUser",
    apiFn: UserAPI.me,
    staleTime: 5 * 60 * 1000,
    initialData: {},
  });

  const { data: userPerms = [] } = useFastData({
    key: ["userPermissions", currentUser?.id],
    apiFn: () => UserPermissionAPI.getByUser(currentUser.id),
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000,
    initialData: [],
  });

  const { data: allRows = [], refetch } = useFastData({
    key: "transactionSettings",
    apiFn: transactionSettingsApi.list,
    enabled: !!currentUser,
    staleTime: 1,
    initialData: [],
  });

  const permissions = [];
  userPerms.forEach((p) => {
    const settingsModule = p.settings_module || {};
    Object.entries(settingsModule).forEach(([module, actions]) => {
      Object.entries(actions).forEach(([action, allowed]) => {
        if (allowed) permissions.push(`${module}_${action}`);
      });
    });
  });

  if (!permissions.includes("transaction_settings_view"))
    return <div className="alert alert-danger text-center mt-3">Access Denied</div>;

  const filteredRows = allRows.filter((r) =>
    [
      r.session,
      r.party_transaction,
      r.advance_carrying_payment,
      r.advance_loan_receive,
      r.delivery_transaction,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const toggleSelectRow = (id) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleDelete = async () => {
    if (!selectedRows.length) return;
    if (!permissions.includes("transaction_settings_delete"))
      return Swal.fire("❌ Access Denied", "", "error");

    const confirm = await Swal.fire({
      title: "Delete selected?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      for (let id of selectedRows) await transactionSettingsApi.delete(id);
      Swal.fire("Deleted!", "", "success");
      setSelectedRows([]);
      refetch();
    } catch (err) {
      Swal.fire("⚠️ Cannot Delete", err?.response?.data?.detail || err.message, "warning");
    }
  };

  return (
    <div className="container mt-3">
      <ActionBar
        title="Transaction Settings List"
        onCreate={() => nav("/admin/transaction-settings/new")}
        showCreate={permissions.includes("transaction_settings_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("transaction_settings_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        exportFileName="transaction_settings_list"
        showExport={permissions.includes("transaction_settings_view")}
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
              <th>Session</th>
              <th>Party Transaction</th>
              <th>Advance Loan Receive</th>
              <th>Delivery Transaction</th>
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
                  <td>{r.session || "-"}</td>
                  <td>{r.party_transaction}</td>
                  <td>{r.advance_loan_receive}</td>
                  <td>{r.delivery_transaction}</td>
                  <td>
                    <FaEdit
                      className="text-primary me-3"
                      size={18}
                      title="Edit"
                      onClick={() => nav(`/admin/transaction-settings/${r.id}`)}
                      style={{
                        cursor: permissions.includes("transaction_settings_edit")
                          ? "pointer"
                          : "not-allowed",
                        opacity: permissions.includes("transaction_settings_edit") ? 1 : 0.5,
                      }}
                    />
                    <FaTrash
                      className="text-danger"
                      size={18}
                      title="Delete"
                      onClick={() => {
                        if (permissions.includes("transaction_settings_delete")) {
                          setSelectedRows([r.id]);
                          handleDelete();
                        }
                      }}
                      style={{
                        cursor: permissions.includes("transaction_settings_delete")
                          ? "pointer"
                          : "not-allowed",
                        opacity: permissions.includes("transaction_settings_delete") ? 1 : 0.5,
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
