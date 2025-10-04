// src/pages/pallot/PallotTypeList.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PallotAPI } from "../../../api/pallotApi";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import Select from "react-select"; // for search/select
import Swal from "sweetalert2";
import ActionBar from "../../../components/common/ActionBar";
import useFastData from "../../../hooks/useFetch";

export default function PallotTypeList() {
  const nav = useNavigate();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState("");

  // ----------------------------
  // Fetch current user
  // ----------------------------
  const { data: currentUser } = useFastData({
    key: "currentUser",
    apiFn: UserAPI.me,
    staleTime: 5 * 60 * 1000,
    initialData: {},
  });

  // ----------------------------
  // Fetch user permissions
  // ----------------------------
  const { data: userPerms = [] } = useFastData({
    key: ["userPermissions", currentUser?.id],
    apiFn: () => UserPermissionAPI.getByUser(currentUser.id),
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000,
    initialData: [],
  });

  // ----------------------------
  // Fetch Pallot Types
  // ----------------------------
  const { data: rows = [], refetch } = useFastData({
    key: ["pallotTypes", selectedCompany?.value],
    apiFn: () => PallotAPI.list({ company_id: selectedCompany?.value }),
    enabled: !!currentUser,
    staleTime: 1,
    initialData: [],
  });

  // ----------------------------
  // Process permissions
  // ----------------------------
  const permissions = [];
  userPerms.forEach((p) => {
    const pallotModule = p.pallot_module || {};
    Object.entries(pallotModule).forEach(([module, actions]) => {
      Object.entries(actions).forEach(([action, allowed]) => {
        if (allowed) permissions.push(`${module}_${action}`);
      });
    });
  });

  if (!permissions.includes("pallot_type_view"))
    return <div className="alert alert-danger text-center mt-3">Access Denied</div>;

  // ----------------------------
  // Filter rows by search
  // ----------------------------
  const filteredRows = rows.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
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
    if (!permissions.includes("pallot_type_delete"))
      return Swal.fire("❌ Access Denied", "", "error");

    const confirm = await Swal.fire({
      title: `Delete ${selectedRows.length} selected?`,
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      for (let id of selectedRows) await PallotAPI.remove(id);
      Swal.fire("Deleted!", "", "success");
      setSelectedRows([]);
      refetch(); // instantly refresh list
    } catch (err) {
      let message = err?.response?.data?.detail || err?.message || "Something went wrong";
      if (typeof message === "object") {
        message = message.detail ? message.detail : Object.values(message).flat().join(", ");
      }
      Swal.fire(
        "⚠️ Cannot Delete",
        "This Pallot has active child. Delete them first.",
        "warning"
      );
    }
  };

  return (
    <div className="container mt-3">
      <ActionBar
        title="Pallot Types"
        onCreate={() => nav("/admin/pallet/new")}
        onDelete={handleDelete}
        selectedCount={selectedRows.length}
      />

      <div className="d-flex gap-2 mb-3 flex-wrap">
        <Select
          placeholder="Select Company..."
          value={selectedCompany}
          onChange={setSelectedCompany}
          options={rows.map((r) => ({ label: r.company.name, value: r.company.id }))}
          isClearable
        />
        <input
          className="form-control"
          placeholder="Search..."
          style={{ maxWidth: 250 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Company</th>
              <th>Name</th>
              <th>Actions</th>
              <th>
                <input
                  type="checkbox"
                  checked={selectedRows.length === filteredRows.length && filteredRows.length > 0}
                  onChange={(e) =>
                    setSelectedRows(e.target.checked ? filteredRows.map((r) => r.id) : [])
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
                  <td>{r.company?.name}</td>
                  <td>{r.name}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-secondary me-1" onClick={() => nav(`/admin/pallet/${r.id}`)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => { setSelectedRows([r.id]); handleDelete(); }}>Delete</button>
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(r.id)}
                      onChange={() =>
                        setSelectedRows((prev) =>
                          prev.includes(r.id) ? prev.filter((x) => x !== r.id) : [...prev, r.id]
                        )
                      }
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">No data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
