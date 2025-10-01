// src/pages/pallot/PallotTypeList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PallotAPI } from "../../../api/pallotApi";
import { UserPermissionAPI } from "../../../api/permissions";
import Select from "react-select"; // for select2 like search
import Swal from "sweetalert2";
import ActionBar from "../../../components/common/ActionBar";

export default function PallotTypeList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [search, setSearch] = useState("");

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const allRows = await PallotAPI.list({ company_id: selectedCompany?.value });
      setRows(allRows);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load Pallot Types", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCompany]);

  const handleDelete = async () => {
    if (!selectedRows.length) return;
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
      loadData();
    } catch (err) {
      let message = err?.response?.data?.detail || err?.message || "Something went wrong";

      if (typeof message === "object") {

        message = message.detail ? message.detail : Object.values(message).flat().join(", ");
      }

      Swal.fire("⚠️ Cannot Delete", "This Pallot has active child. Delete them first.", "warning");
    }
  };

  const filteredRows = rows.filter(
    (r) => r.name.toLowerCase().includes(search.toLowerCase())
  );

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
