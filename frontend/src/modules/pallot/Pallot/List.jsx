// src/pages/pallot/PallotList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PallotListAPI } from "../../../api/pallotApi";
import Swal from "sweetalert2";
import ActionBar from "../../../components/common/ActionBar";

export default function PallotList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState("");

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const allRows = await PallotListAPI.list();
      setRows(allRows);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load Pallots", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  // Search filter (pallot number / comment / sr no)
  const filteredRows = rows.filter(
    (r) =>
      r.pallot_number.toString().includes(search) ||
      (r.comment || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.sr?.sr_no?.toString() || "").includes(search)
  );

  return (
    <div className="container mt-3">
      <ActionBar
        title="Pallots"
        onCreate={() => nav("/admin/pallet_list/new")}
        onDelete={handleDelete}
        data={filteredRows}
        selectedCount={selectedRows.length}
        columns = {["pallot_number", "chamber","floor", "quantity","date", "created_at"]} // শুধু এই columns যাবে
      />

      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input
          className="form-control"
          placeholder="Search by Pallot Number / SR No / Comment..."
          style={{ maxWidth: 350 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Pallot No</th>
              <th>Pallot Type</th>
              {/* <th>SR No</th> */}
              <th>SR Quantity</th>
              <th>Date</th>
              <th>Chamber</th>
              <th>Floor</th>
              <th>Pocket</th>
              <th>Quantity</th>
              <th>Comment</th>
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
                  <td>{r.pallot_number}</td>
                  <td>{r.pallot_type?.name}</td>
                  {/* <td>{r.sr?.sr_no}</td> */}
                  <td>{r.sr_quantity}</td>
                  <td>{r.date}</td>
                  <td>{r.chamber?.name}</td>
                  <td>{r.floor?.name}</td>
                  <td>{r.pocket?.name}</td>
                  <td>{r.quantity}</td>
                  <td>{r.comment}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => nav(`/admin/pallot/${r.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setSelectedRows([r.id]);
                        handleDelete();
                      }}
                    >
                      Delete
                    </button>
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
                <td colSpan="13" className="text-center">
                  {loading ? "Loading..." : "No data"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
