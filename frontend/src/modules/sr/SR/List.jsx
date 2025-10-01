import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import { SRAPI } from "../../../api/srApi";   // ✅ SR API
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function SRList() {
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

  // Load SR data
  const loadData = async () => {
    setLoading(true);
    try {
      const allRows = await SRAPI.list();
      const userId = currentUserId || (await loadCurrentUser());
      if (!userId) return setLoading(false);

      const userPerms = await UserPermissionAPI.getByUser(userId);
      const userPermissionsArr = [];

      userPerms.forEach((p) => {
        const srModule = p.sr_module || {};
        if (Object.values(srModule).some((v) => v.view || v.create || v.edit || v.delete)) {
          Object.entries(srModule).forEach(([module, actions]) => {
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
      Swal.fire("Error", "Failed to load SRs", "error");
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
    if (!permissions.includes("sr_delete"))
      return Swal.fire("❌ Access Denied", "", "error");

    const confirm = await Swal.fire({
      title: "Delete selected?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      for (let id of selectedRows) await SRAPI.remove(id);
      Swal.fire("Deleted!", "", "success");
      setSelectedRows([]);
      loadData();
    } catch (err) {
      let message = err?.response?.data?.detail || err?.message || "Something went wrong";

      if (typeof message === "object") {

        message = message.detail ? message.detail : Object.values(message).flat().join(", ");
      }

      Swal.fire("⚠️ Cannot Delete", "This SR has active party/categories. Delete them first.", "warning");
    }
  };

  const filteredRows = rows.filter(
    (r) =>
      r.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      (r.father_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.mobile || "").toLowerCase().includes(search.toLowerCase()) ||
      (r.village || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!permissions.includes("sr_view"))
    return <div className="alert alert-danger text-center mt-3">Access Denied</div>;

  return (
    <div className="container mt-3">
      <ActionBar
        title="SR List"
        onCreate={() => nav("/admin/sr/new")}
        showCreate={permissions.includes("sr_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("sr_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        exportFileName="sr_list"
        showExport={permissions.includes("sr_view")}
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

      <div className="table-responsive" style={{ fontSize: "0.65rem" }}>
        <table className="table table-bordered table-hover table-striped mb-0">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>SR No</th>
              <th>Agent</th>
              <th>Customer</th>
              <th>Father Name</th>
              <th>Village</th>
              <th>Mobile</th>
              <th>NID</th>
              <th>Product Category</th>
              <th>Bag Type</th>
              <th>Lot</th>
              <th>Bag Qty</th>
              <th>Bag Rent</th>
              <th>Total Rent</th>
              <th>Labour</th>
              <th>Grand Total</th>
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
                  <td>{r.date}</td>
                  <td>{r.sr_no}</td>
                  <td>{r.party?.name || "-"}</td>
                  <td>{r.customer_name}</td>
                  <td>{r.father_name || "-"}</td>
                  <td>{r.village || "-"}</td>
                  <td>{r.mobile || "-"}</td>
                  <td>{r.nid || "-"}</td>
                  <td>{r.product_type?.name || "-"}</td>
                  <td>{r.bag_type}</td>
                  <td>{r.lot_number}</td>
                  <td>{r.submitted_bag_quantity}</td>
                  <td>{r.bag_rent}</td>
                  <td>{r.total_rent}</td>
                  <td>{r.labour_charge}</td>
                  <td>{r.grand_total}</td>
                  <td>
                    <FaEdit
                      className="text-primary me-3 cursor-pointer"
                      size={20}
                      title="Edit"
                      onClick={() => nav(`/admin/sr/${r.id}`)}
                      style={{
                        cursor: permissions.includes("sr_edit")
                          ? "pointer"
                          : "not-allowed",
                        opacity: permissions.includes("sr_edit") ? 1 : 0.5,
                      }}
                    />

                    <FaTrash
                      className="text-danger cursor-pointer mt-2"
                      size={20}
                      title="Delete"
                      onClick={() => {
                        if (permissions.includes("sr_delete")) {
                          setSelectedRows([r.id]);
                          handleDelete();
                        }
                      }}
                      style={{
                        cursor: permissions.includes("sr_delete")
                          ? "pointer"
                          : "not-allowed",
                        opacity: permissions.includes("sr_delete") ? 1 : 0.5,
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
                <td colSpan="19" className="text-center">
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
