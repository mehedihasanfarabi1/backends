import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CompanyAPI } from "../../../api/company";
import { PermissionAPI } from "../../../api/permissions";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";

export default function CompanyList() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  // 🟢 Load user permissions
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const perms = await PermissionAPI.list();
        setPermissions(perms.map((p) => p.code));
      } catch (err) {
        console.error("Permission load error:", err);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };
    loadPermissions();
  }, []);

  // 🟢 Determine permission flags
  const canCreate = permissions.includes("company_create");
  const canEdit = permissions.includes("company_edit");
  const canDelete = permissions.includes("company_delete");
  const canView = permissions.includes("company_view");

  // 🟢 Load companies only if view permission exists
  const loadCompanies = async () => {
    if (!canView) return;
    setLoading(true);
    try {
      const data = await CompanyAPI.list();
      setRows(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error("Load error:", err);
      Swal.fire("Error", "Failed to load companies", "error");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView]);

  // 🟢 Delete selected companies
  const onDelete = async () => {
    if (!selected.length) return;

    if (!canDelete) {
      return Swal.fire("❌ You do not have permission for this action", "", "error");
    }

    const result = await Swal.fire({
      title: `Delete ${selected.length} company(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        for (let id of selected) {
          await CompanyAPI.remove(id);
        }
        setSelected([]);
        loadCompanies();
        Swal.fire("Deleted!", "Companies removed.", "success");
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }
  };

  // 🟢 Toggle selection
  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // 🟢 Filtered rows by search
  const filtered = rows.filter(
    (r) =>
      r?.name?.toLowerCase().includes(search.toLowerCase()) ||
      (r?.email || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2">Loading companies...</div>
      </div>
    );
  }

  // 🟢 No view permission
  if (!canView) {
    return (
      <div className="container mt-3 text-center">
        <h5 className="text-danger">Access Denied</h5>
        <p>আপনার কোম্পানি দেখার অনুমতি নেই।</p>
      </div>
    );
  }

  return (
    <div className="container mt-3">
      <ActionBar
        title="Company List"
        onCreate={canCreate ? () => nav("/admin/companies/new") : () =>
          Swal.fire("❌ You do not have permission", "", "error")
        }
        showCreate={canCreate}
        onDelete={selected.length && canDelete ? onDelete : () =>
          Swal.fire("❌ You do not have permission", "", "error")
        }
        showDelete={canDelete}
        selectedCount={selected.length}
        data={filtered}
        exportFileName="companies"
        showExport={canView}
        showPrint={canView}
      />

      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search company..."
          style={{ maxWidth: 250 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-danger" onClick={() => setSearch("")}>
          Clear
        </button>
      </div>

      <table className="table table-striped table-bordered">
        <thead className="table-light">
          <tr className="bg-primary text-white">
            <th style={{ width: 50 }}>
              <input
                type="checkbox"
                checked={selected.length === filtered.length && filtered.length > 0}
                onChange={(e) =>
                  setSelected(e.target.checked ? filtered.map((r) => r.id) : [])
                }
                disabled={!canDelete}
              />
            </th>
            <th style={{ width: 60 }}>SN</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th style={{ width: 150 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length ? (
            filtered.map((r, i) => (
              <tr key={r.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selected.includes(r.id)}
                    onChange={() => toggleSelect(r.id)}
                    disabled={!canDelete}
                  />
                </td>
                <td>{i + 1}</td>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.phone}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-secondary me-2"
                    onClick={canEdit ? () => nav(`/admin/companies/${r.id}`) :
                      () => Swal.fire("❌ You do not have permission", "", "error")
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={canDelete ? () => {
                      setSelected([r.id]);
                      onDelete();
                    } : () => Swal.fire("❌ You do not have permission", "", "error")}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="text-center text-muted">
                No companies found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
