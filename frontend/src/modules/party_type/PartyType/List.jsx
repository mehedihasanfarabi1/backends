import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PartyTypeAPI } from "../../../api/partyType";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import UserCompanySelector from "../../../components/UserCompanySelector";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
// import "../../../styles/Table.css";

import { useTranslation } from "../../../contexts/TranslationContext";

export default function PartyTypeList() {
  const nav = useNavigate();
  const { t } = useTranslation();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [permissions, setPermissions] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState("");

  // --------------------
  // Load current user
  // --------------------
  const loadCurrentUser = async () => {
    try {
      const me = await UserAPI.me();
      setCurrentUserId(me.id);
      return me.id;
    } catch (err) {
      console.error("Error fetching current user:", err.response?.data || err);
      return null;
    }
  };

  // --------------------
  // Load PartyType data
  // --------------------
  const loadData = async () => {
    setLoading(true);
    try {
      const allRows = await PartyTypeAPI.list();

      const userId = currentUserId || (await loadCurrentUser());
      if (!userId) return setLoading(false);

      const userPerms = await UserPermissionAPI.getByUser(userId);

      const allowedCompanyIds = new Set();
      const userPermissionsArr = [];

      userPerms.forEach((p) => {
        const partyModule = p.party_type_module || {};
        if (
          Object.values(partyModule).some(
            (v) => v.view || v.create || v.edit || v.delete
          )
        ) {
          (p.companies || []).forEach((cid) => allowedCompanyIds.add(Number(cid)));

          Object.entries(partyModule).forEach(([module, actions]) => {
            Object.entries(actions).forEach(([action, allowed]) => {
              if (allowed) userPermissionsArr.push(`${module}_${action}`);
            });
          });
        }
      });

      setPermissions(userPermissionsArr);

      // Filter rows by permission & company
      const filteredRows = allRows.filter((r) => {
        if (!r.company || !allowedCompanyIds.has(Number(r.company.id)))
          return false;

        return true;
      });

      setRows(filteredRows);
    } catch (err) {
      console.error("Error loading party types:", err.response?.data || err);
      Swal.fire("Error", "Failed to load party types", "error");
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
    if (!permissions.includes("party_type_delete"))
      return Swal.fire("❌ Access Denied", "", "error");

    const confirm = await Swal.fire({
      title: "Delete selected?",
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      for (let id of selectedRows) await PartyTypeAPI.remove(id);
      Swal.fire("Deleted!", "", "success");
      setSelectedRows([]);
      loadData();
    } catch (err) {
      let message = err?.response?.data?.detail || err?.message || "Something went wrong";

      if (typeof message === "object") {

        message = message.detail ? message.detail : Object.values(message).flat().join(", ");
      }

      Swal.fire("⚠️ Cannot Delete", "This PartyType has active party. Delete them first.", "warning");
    }
  };

  const filteredRows = rows.filter(
    (r) =>
      (!selectedCompany || r.company?.id === selectedCompany) &&
      (r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(search.toLowerCase()))
  );

  const handleImport = async (file) => {
    if (!file) return;
    try {
      await PartyTypeAPI.bulk_import(file); // ✅ শুধু FILE object
      Swal.fire("✅ Imported!", "Records saved successfully", "success");
      loadData();
    } catch (err) {
      console.error("Import error:", err);
      Swal.fire("❌ Failed", err.response?.data?.error || "Import failed", "error");
    }
  };


  if (loading) return <div className="text-center mt-5">Loading...</div>;
  if (!permissions.includes("party_type_view"))
    return (
      <div className="alert alert-danger text-center mt-3">Access Denied</div>
    );

  return (
    <div className="container mt-3">
      <ActionBar
        title="Party Types"
        onCreate={() => nav("/admin/party-types/new")}
        showCreate={permissions.includes("party_type_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("party_type_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        onImport={handleImport}
        columns={["name","description","company"]}
        exportFileName="party_types"
        showExport={permissions.includes("party_type_view")}
      />

      {/* <UserCompanySelector
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        selectedBusiness={null}
        setSelectedBusiness={null}
        selectedFactory={null}
        setSelectedFactory={null}
        setBusinessTypes={null}
        setFactories={null}
      /> */}

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
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th>{t("serial")}</th>
              <th>{t("company")}</th>
              <th>{t("party_type")}</th>
              <th>{t("description")}</th>
              <th>{t("actions")}</th>
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
                  <td>{r.company?.name}</td>
                  <td>{r.name}</td>
                  <td>{r.description || "-"}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => nav(`/admin/party-types/${r.id}`)}
                      disabled={!permissions.includes("party_type_edit")}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setSelectedRows([r.id]);
                        handleDelete();
                      }}
                      disabled={!permissions.includes("party_type_delete")}
                    >
                      Delete
                    </button>
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
                <td colSpan="6" className="text-center">
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
