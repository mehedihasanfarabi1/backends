import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import { PartyAPI } from "../../../api/partyType";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import { FaEdit, FaTrash } from "react-icons/fa";
import useFastData from "../../../hooks/useFetch";

export default function PartyList() {
  const nav = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(null);

  // --------------------------
  // Load current user
  // --------------------------
  const { data: currentUser, isLoading: loadingUser } = useFastData({
    key: "currentUser",
    apiFn: UserAPI.me,
  });

  // --------------------------
  // Load user permissions
  // --------------------------
  const { data: userPerms, isLoading: loadingPerms } = useFastData({
    key: ["userPermissions", currentUser?.id],
    apiFn: () => UserPermissionAPI.getByUser(currentUser.id),
    enabled: !!currentUser,
  });

  // --------------------------
  // Load Party data
  // --------------------------
  const { data: allRows = [], isLoading: loadingRows, refetch } = useFastData({
    key: "partyList",
    apiFn: PartyAPI.list,
    enabled: !!currentUser,
  });

  const loading = loadingUser || loadingPerms || loadingRows;

  // --------------------------
  // Process permissions & allowed company ids
  // --------------------------
  const { permissions, allowedCompanyIds } = useMemo(() => {
    const perms = [];
    const allowedIds = new Set();

    userPerms?.forEach((p) => {
      const partyModule = p.party_type_module || {};
      if (Object.values(partyModule).some((v) => v.view || v.create || v.edit || v.delete)) {
        (p.companies || []).forEach((cid) => allowedIds.add(Number(cid)));
        Object.entries(partyModule).forEach(([module, actions]) =>
          Object.entries(actions).forEach(([action, allowed]) => {
            if (allowed) perms.push(`${module}_${action}`);
          })
        );
      }
    });

    return { permissions: perms, allowedCompanyIds: allowedIds };
  }, [userPerms]);

  if (loading) return <div className="text-center mt-5">Loading...</div>;
//   if (!permissions.includes("party_view"))
//     return <div className="alert alert-danger text-center mt-3">Access Denied</div>;

  // --------------------------
  // Filter rows by company & search
  // --------------------------
  const filteredRows = allRows
    .filter((r) => allowedCompanyIds.has(Number(r.company?.id)))
    .filter(
      (r) =>
        (!selectedCompany || r.company?.id === selectedCompany) &&
        (r.name.toLowerCase().includes(search.toLowerCase()) ||
          (r.father_name || "").toLowerCase().includes(search.toLowerCase()) ||
          (r.village || "").toLowerCase().includes(search.toLowerCase()) ||
          (r.mobile || "").toLowerCase().includes(search.toLowerCase()))
    );

  // --------------------------
  // Row selection
  // --------------------------
  const toggleSelectRow = (id) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // --------------------------
  // Delete handler
  // --------------------------
  const handleDelete = async () => {
    if (!selectedRows.length) return;
    if (!permissions.includes("party_delete"))
      return Swal.fire("❌ Access Denied", "", "error");

    const confirm = await Swal.fire({
      title: "Delete selected?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      for (let id of selectedRows) await PartyAPI.remove(id);
      Swal.fire("Deleted!", "", "success");
      setSelectedRows([]);
      refetch();
    } catch (err) {
      Swal.fire(
        "⚠️ Cannot Delete",
        "This Party has active party commission. Delete them first.",
        "warning"
      );
    }
  };

  // --------------------------
  // Import handler
  // --------------------------
  const handleImport = async (file) => {
    if (!file) return;
    try {
      await PartyAPI.bulk_import(file);
      Swal.fire("✅ Imported!", "Records saved successfully", "success");
      refetch();
    } catch (err) {
      Swal.fire("❌ Failed", err.response?.data?.error || "Import failed", "error");
    }
  };

  // --------------------------
  // Render
  // --------------------------
  return (
    <div className=" mt-3" style={{marginLeft:"0px"}}>
      <ActionBar
        title="Parties"
        onCreate={() => nav("/admin/party-list/new")}
        showCreate={permissions.includes("party_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("party_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        onImport={handleImport}
        exportFileName="parties"
        showExport={permissions.includes("party_view")}
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

      <div className="table-responsive" style={{ overflowX: "auto", fontSize: "0.65rem" }}>
        <table className="table table-bordered table-hover table-striped mb-0">
          <thead className="table-primary">
            <tr>
              <th>#</th>
              <th>Company</th>
              <th>Party Type</th>
              <th>Booking Type</th>
              <th>Code</th>
              <th>Name</th>
              <th>Father Name</th>
              <th>Village</th>
              <th>Mobile</th>
              <th>Booking Bag</th>
              <th>Bag Weight</th>
              <th>Total Weight</th>
              <th>Per Bag Rent</th>
              <th>Total Rent</th>
              <th>Per KG Rent</th>
              <th>Total KG Rent</th>
              <th>Rent Receive</th>
              <th>Per Bag Commission</th>
              <th>Interest Start Date</th>
              <th>Interest Rate</th>
              <th>Status</th>
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
                  <td>{r.company?.name}</td>
                  <td>{r.party_type?.name}</td>
                  <td>{r.booking?.name}</td>
                  <td>{r.code}</td>
                  <td>{r.name}</td>
                  <td>{r.father_name || "-"}</td>
                  <td>{r.village || "-"}</td>
                  <td>{r.mobile || "-"}</td>
                  <td>{r.booking_bag}</td>
                  <td>{r.bag_weight}</td>
                  <td>{r.total_weight}</td>
                  <td>{r.per_bag_rent}</td>
                  <td>{r.total_rent}</td>
                  <td>{r.per_kg_rent}</td>
                  <td>{r.total_kg_rent}</td>
                  <td>{r.rent_receive}</td>
                  <td>{r.per_bag_commission}</td>
                  <td>{r.interest_start_date || "-"}</td>
                  <td>{r.interest_rate}</td>
                  <td>{r.status ? "Active" : "Inactive"}</td>
                  <td>
                    <FaEdit
                      className="text-secondary me-3 cursor-pointer"
                      size={24}
                      title="Edit"
                      onClick={() => nav(`/admin/party-list/${r.id}`)}
                      style={{
                        cursor: permissions.includes("party_edit") ? "pointer" : "not-allowed",
                        opacity: permissions.includes("party_edit") ? 1 : 0.5,
                      }}
                    />
                    <FaTrash
                      className="text-danger cursor-pointer mt-2"
                      size={24}
                      title="Delete"
                      onClick={() => {
                        if (permissions.includes("party_delete")) {
                          setSelectedRows([r.id]);
                          handleDelete();
                        }
                      }}
                      style={{
                        cursor: permissions.includes("party_delete") ? "pointer" : "not-allowed",
                        opacity: permissions.includes("party_delete") ? 1 : 0.5,
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
                <td colSpan="22" className="text-center">
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
