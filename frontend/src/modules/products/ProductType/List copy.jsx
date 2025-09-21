import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductTypeAPI } from "../../../api/products";
import { CompanyAPI } from "../../../api/company";
import { PermissionAPI } from "../../../api/permissions";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import "../../../styles/Table.css";

export default function PTList() {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [company, setCompany] = useState("");
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  // Load data and permissions
  const load = async () => {
    setLoading(true);
    try {
      // Product Type Load
      const data = await ProductTypeAPI.list();
      setRows(data);

      const comp = await CompanyAPI.list();
      setCompanies(comp);

      const perms = await PermissionAPI.list();
      setUserPermissions(perms.map((p) => p.code));
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const filtered = rows.filter(
    (r) =>
      (!company || r.company?.id === Number(company)) &&
      (r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.desc || "").toLowerCase().includes(search.toLowerCase()))
  );

  // Delete function
  const onDelete = async () => {
    if (!selected.length) return;

    if (!userPermissions.includes("product_type_delete")) {
      return Swal.fire(
        "❌ You do not have access for this feature",
        "",
        "error"
      );
    }

    const result = await Swal.fire({
      title: `Delete ${selected.length} item(s)?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        for (let id of selected) {
          await ProductTypeAPI.remove(id);
        }
        setSelected([]);
        load();
        Swal.fire("Deleted!", "Selected item(s) removed.", "success");
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="mt-2">Loading data...</div>
      </div>
    );
  }

  // View permission check
  if (!userPermissions.includes("product_type_view")) {
    return (
      <div className="alert alert-danger mt-3 text-center">
        Access Denied
      </div>
    );
  }

  return (
    <div className="container mt-3">
      {/* Action Bar */}
      <ActionBar
        title="Product Type List"
        onCreate={() => nav("/admin/product-types/new")}
        showCreate={userPermissions.includes("product_type_create")}
        onDelete={onDelete}
        showDelete={userPermissions.includes("product_type_delete")}
        selectedCount={selected.length}
        data={filtered}
        exportFileName="product_types"
        showExport={userPermissions.includes("product_type_view")}
        showPrint={userPermissions.includes("product_type_view")}
      />


      {/* Filters */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <select
          className="form-select"
          style={{ maxWidth: 250 }}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        >
          <option value="">-- All Companies --</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
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

        <button className="btn btn-danger" onClick={() => setSearch("")}>
          Clear
        </button>
      </div>

      {/* Table */}
      <div className="custom-table-wrapper table-responsive">
        <table className="custom-table table table-striped table-bordered">
          <thead className="table-primary">
            <tr>
              <th style={{ width: 50 }}>
                <input
                  type="checkbox"
                  checked={
                    selected.length === filtered.length && filtered.length > 0
                  }
                  onChange={(e) =>
                    setSelected(
                      e.target.checked ? filtered.map((r) => r.id) : []
                    )
                  }
                />
              </th>
              <th style={{ width: 60 }}>SN</th>
              <th>Company</th>
              <th>Product Type</th>
              <th>Description</th>
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
                    />
                  </td>
                  <td>{i + 1}</td>
                  <td>{r.company?.name || "-"}</td>
                  <td>{r.name}</td>
                  <td>{r.desc}</td>
                  <td className="custom-actions d-flex flex-wrap gap-1">
                    {/* Edit */}
                    {userPermissions.includes("product_type_edit") ? (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => nav(`/admin/product-types/${r.id}`)}
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() =>
                          Swal.fire(
                            "❌ You do not have access for this feature",
                            "",
                            "error"
                          )
                        }
                      >
                        Edit
                      </button>
                    )}

                    {/* Delete */}
                    {userPermissions.includes("product_type_delete") ? (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelected([r.id]);
                          onDelete();
                        }}
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          Swal.fire(
                            "❌ You do not have access for this feature",
                            "",
                            "error"
                          )
                        }
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
