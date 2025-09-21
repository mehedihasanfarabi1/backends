import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BusinessTypeAPI, CompanyAPI } from "../../../api/company";
import { PermissionAPI } from "../../../api/permissions";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";

export default function BusinessTypeList() {
  const nav = useNavigate();
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyFilter, setCompanyFilter] = useState("");
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🟢 Load permissions
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

  // const canCreate = permissions.includes("business_type_create");
  // const canEdit = permissions.includes("business_type_edit");
  // const canDelete = permissions.includes("business_type_delete");
  // const canView = permissions.includes("business_type_view");

  // এখন সব true ধরে নিই
const canCreate = true;
const canEdit = true;
const canDelete = true;
const canView = true;
  // 🟢 Load rows and companies if view permission
  const load = async () => {
    if (!canView) return;
    try {
      const res = await BusinessTypeAPI.list();
      setRows(res);
      const comp = await CompanyAPI.list();
      setCompanies(comp);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load data", "error");
    }
  };

  useEffect(() => {
    if (canView) load();
  }, [canView]);

  const onDelete = async () => {
    if (!selected.length) return;

    if (!canDelete) {
      return Swal.fire("❌ You do not have permission", "", "error");
    }

    const result = await Swal.fire({
      title: `Delete ${selected.length} item(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        for (let id of selected) {
          await BusinessTypeAPI.remove(id);
        }
        setSelected([]);
        load();
        Swal.fire("Deleted!", "Selected item(s) removed.", "success");
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }
  };

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filtered = rows.filter(
    (r) =>
      (!companyFilter || r.company?.id === Number(companyFilter)) &&
      (r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.description || "").toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2">Loading data...</div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="container mt-3 text-center">
        <h5 className="text-danger">Access Denied</h5>
        <p>আপনার business type দেখার অনুমতি নেই।</p>
      </div>
    );
  }

  return (
    <div className="container mt-3">
      <ActionBar
        title="Business Type List"
        onCreate={canCreate ? () => nav("/admin/business-types/new") : () => Swal.fire("❌ You do not have permission", "", "error")}
        onDelete={selected.length && canDelete ? onDelete : () => Swal.fire("❌ You do not have permission", "", "error")}
        selectedCount={selected.length}
        data={filtered}
        exportFileName="business_types"
        showCreate={canCreate}
        showDelete={canDelete}
        showExport={canView}
        showPrint={canView}
      />

      <div className="d-flex gap-2 mb-3">
        <select
          className="form-select"
          style={{ maxWidth: 250 }}
          value={companyFilter}
          onChange={(e) => setCompanyFilter(e.target.value)}
        >
          <option value="">-- All Companies --</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input
          type="text"
          className="form-control"
          placeholder="Search..."
          style={{ maxWidth: 250 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-danger" onClick={() => setSearch("")}>Clear</button>
      </div>

      <table className="table table-striped table-bordered">
        <thead className="table-light">
          <tr className="bg-primary text-white">
            <th style={{ width: 50 }}>
              <input
                type="checkbox"
                checked={selected.length === filtered.length && filtered.length > 0}
                onChange={(e) => setSelected(e.target.checked ? filtered.map((r) => r.id) : [])}
                disabled={!canDelete}
              />
            </th>
            <th style={{ width: 60 }}>SN</th>
            <th>Company</th>
            <th>Business Type</th>
            <th>Short Name</th>
            <th style={{ width: 150 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length ? filtered.map((r, i) => (
            <tr key={r.id}>
              <td>
                <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleSelect(r.id)} disabled={!canDelete} />
              </td>
              <td>{i + 1}</td>
              <td>{r.company?.name || "-"}</td>
              <td>{r.name}</td>
              <td>{r.short_name}</td>
              <td>
                <button className="btn btn-sm btn-outline-secondary me-2" onClick={canEdit ? () => nav(`/admin/business-types/${r.id}`) : () => Swal.fire("❌ You do not have permission", "", "error")}>Edit</button>
                <button className="btn btn-sm btn-outline-danger" onClick={canDelete ? () => { setSelected([r.id]); onDelete(); } : () => Swal.fire("❌ You do not have permission", "", "error")}>Delete</button>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan={6} className="text-center text-muted">No data</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
