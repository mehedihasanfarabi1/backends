import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import { bagTypeApi } from "../../../api/essentialSettingsApi"; // তোমার api আলাদা করে নিতে হবে
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function BagTypeList() {
  const nav = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState("");

  // Current User Load
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

  // BagType Data Load
  const loadData = async () => {
    setLoading(true);
    try {
      const allRows = await bagTypeApi.list();
      const userId = currentUserId || (await loadCurrentUser());
      if (!userId) return setLoading(false);

      const userPerms = await UserPermissionAPI.getByUser(userId);
      const userPermissionsArr = [];

      userPerms.forEach((p) => {
        const settingsModule = p.settings_module || {};
        if (Object.values(settingsModule).some((v) => v.view || v.create || v.edit || v.delete)) {
          Object.entries(settingsModule).forEach(([module, actions]) => {
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
      Swal.fire("Error", "Failed to load Bag Types", "error");
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
    if (!permissions.includes("bag_type_delete"))
      return Swal.fire("❌ Access Denied", "", "error");

    const confirm = await Swal.fire({
      title: "Delete selected?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      for (let id of selectedRows) await bagTypeApi.delete(id);
      Swal.fire("Deleted!", "", "success");
      setSelectedRows([]);
      loadData();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const filteredRows = rows.filter((r) =>
    [
      r.name,
      r.session,
      r.per_bag_rent,
      r.per_kg_rent,
      r.agent_bag_rent,
      r.agent_kg_rent,
      r.party_bag_rent,
      r.party_kg_rent,
      r.per_bag_loan,
      r.empty_bag_rate,
      r.fan_charge,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!permissions.includes("bag_type_view"))
    return <div className="alert alert-danger text-center mt-3">Access Denied</div>;

  return (
    <div className="container mt-3">
      <ActionBar
        title="Bag Type List"
        onCreate={() => nav("/admin/bag-types/new")}
        showCreate={permissions.includes("bag_type_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("bag_type_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        exportFileName="bag_type_list"
        showExport={permissions.includes("bag_type_view")}
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
              <th>Session</th>
              <th>Name</th>
              <th>Per Bag Rent</th>
              <th>Per Kg Rent</th>
              <th>Agent Bag Rent</th>
              <th>Agent Kg Rent</th>
              <th>Party Bag Rent</th>
              <th>Party Kg Rent</th>
              <th>Per Bag Loan</th>
              <th>Empty Bag Rate</th>
              <th>Fan Charge</th>
              <th>Is Default</th>
              <th>Is Active</th>
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
                  <td>{r.session}</td>
                  <td>{r.name || "-"}</td>
                  <td>{r.per_bag_rent}</td>
                  <td>{r.per_kg_rent}</td>
                  <td>{r.agent_bag_rent}</td>
                  <td>{r.agent_kg_rent}</td>
                  <td>{r.party_bag_rent}</td>
                  <td>{r.party_kg_rent}</td>
                  <td>{r.per_bag_loan}</td>
                  <td>{r.empty_bag_rate}</td>
                  <td>{r.fan_charge}</td>
                  <td>{r.is_default ? "Yes" : "No"}</td>
                  <td>{r.is_active ? "Yes" : "No"}</td>
                  <td>
                    <FaEdit
                      className="text-primary me-3"
                      size={18}
                      title="Edit"
                      onClick={() => nav(`/admin/bag-types/${r.id}`)}
                      style={{
                        cursor: permissions.includes("bag_type_edit")
                          ? "pointer"
                          : "not-allowed",
                        opacity: permissions.includes("bag_type_edit") ? 1 : 0.5,
                      }}
                    />
                    <FaTrash
                      className="text-danger"
                      size={18}
                      title="Delete"
                      onClick={() => {
                        if (permissions.includes("bag_type_delete")) {
                          setSelectedRows([r.id]);
                          handleDelete();
                        }
                      }}
                      style={{
                        cursor: permissions.includes("bag_type_delete")
                          ? "pointer"
                          : "not-allowed",
                        opacity: permissions.includes("bag_type_delete") ? 1 : 0.5,
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
                <td colSpan="16" className="text-center">
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
