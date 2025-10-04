import React, { useState, useEffect } from "react"; 
import { useNavigate } from "react-router-dom";
import { UnitSizeAPI } from "../../../api/products";
import { PermissionAPI } from "../../../api/permissions";
import UserCompanySelector from "../../../components/UserCompanySelector";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import useFastData from "../../../hooks/useFetch";
import "../../../styles/Table.css";

export default function UnitSizeList() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const nav = useNavigate();

  // ✅ Fetch data
  const { data: response = {}, refetch } = useFastData({
    key: ["unitSizes", selectedCompany, selectedBusiness, selectedFactory, page, pageSize],
    apiFn: async () => {
      const params = {
        company: selectedCompany || undefined,
        business_type: selectedBusiness || undefined,
        factory: selectedFactory || undefined,
        page,
        page_size: pageSize,
      };
      return UnitSizeAPI.list(params);
    },
    initialData: {},
  });

  // ✅ Always ensure array
  const unitSizesData = Array.isArray(response.results)
    ? response.results
    : Array.isArray(response)
    ? response
    : [];

  const total = response.count || unitSizesData.length || 0;
  const totalPages = Math.ceil(total / pageSize);

  // ✅ Load permissions
  useEffect(() => {
    const loadPerms = async () => {
      const perms = await PermissionAPI.list();
      setUserPermissions(perms.map((p) => p.code));
    };
    loadPerms();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onDelete = async () => {
    if (!selected.length) return;
    if (!userPermissions.includes("unit_size_delete"))
      return Swal.fire("❌ You do not have access for this feature", "", "error");

    const result = await Swal.fire({
      title: `Delete ${selected.length} unit size(s)?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        for (let id of selected) {
          await UnitSizeAPI.remove(id);
        }
        setSelected([]);
        refetch();
        Swal.fire("Deleted!", "Selected unit size(s) removed.", "success");
      } catch (err) {
        let message = err?.response?.data?.detail || err?.message || "Something went wrong";
        if (typeof message === "object") {
          message = message.detail ? message.detail : Object.values(message).flat().join(", ");
        }
        Swal.fire(
          "⚠️ Cannot Delete",
          "This UnitSize has active UnitSizeSetting. Delete them first.",
          "warning"
        );
      }
    }
  };

  const handleImport = async (file) => {
    if (!file) return;
    try {
      await UnitSizeAPI.bulk_import(file);
      Swal.fire("✅ Imported!", "Records saved successfully", "success");
      refetch();
    } catch (err) {
      Swal.fire("❌ Failed", err.response?.data?.error || "Import failed", "error");
    }
  };

  // 🔹 Search filter
  const filteredSizes = unitSizesData.filter((s) => {
    return (
      s.size_name?.toLowerCase().includes(search.toLowerCase()) ||
      (s.unit?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.unit?.short_name || "").toLowerCase().includes(search.toLowerCase())
    );
  });

  // if (!userPermissions.includes("unit_size_view")) {
  //   return <div className="alert alert-danger mt-3 text-center">Access Denied</div>;
  // }

  return (
    <div className="container mt-3">
      <ActionBar
        title="Unit Sizes"
        onCreate={
          userPermissions.includes("unit_size_create")
            ? () => nav("/admin/unit-sizes/new")
            : undefined
        }
        showCreate={userPermissions.includes("unit_size_create")}
        onDelete={onDelete}
        showDelete={userPermissions.includes("unit_size_delete")}
        selectedCount={selected.length}
        data={filteredSizes}
        onImport={handleImport}
        exportFileName="unit_sizes"
        showExport={userPermissions.includes("unit_size_view")}
        showPrint={userPermissions.includes("unit_size_view")}
      />

      <div className="mb-3">
        <UserCompanySelector
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          selectedBusiness={selectedBusiness}
          setSelectedBusiness={setSelectedBusiness}
          selectedFactory={selectedFactory}
          setSelectedFactory={setSelectedFactory}
          setBusinessTypes={setBusinessTypes}
          setFactories={setFactories}
        />
      </div>

      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search sizes..."
          style={{ maxWidth: 250 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-danger" onClick={() => setSearch("")}>
          Clear
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th style={{ width: 50 }}>
                <input
                  type="checkbox"
                  checked={selected.length === filteredSizes.length && filteredSizes.length > 0}
                  onChange={(e) =>
                    setSelected(e.target.checked ? filteredSizes.map((s) => s.id) : [])
                  }
                />
              </th>
              <th style={{ width: 60 }}>#</th>
              <th>Unit</th>
              <th>Size Name</th>
              <th>Value</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSizes.length ? (
              filteredSizes.map((s, i) => (
                <tr key={s.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(s.id)}
                      onChange={() => toggleSelect(s.id)}
                    />
                  </td>
                  <td>{(page - 1) * pageSize + i + 1}</td>
                  <td>{s.unit?.name || "-"}</td>
                  <td>{s.size_name}</td>
                  <td>{s.uom_weight}</td>
                  <td className="custom-actions">
                    {userPermissions.includes("unit_size_edit") ? (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => nav(`/admin/unit-sizes/${s.id}`)}
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() =>
                          Swal.fire("❌ You do not have access for this feature", "", "error")
                        }
                      >
                        Edit
                      </button>
                    )}
                    {userPermissions.includes("unit_size_delete") ? (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelected([s.id]);
                          onDelete();
                        }}
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          Swal.fire("❌ You do not have access for this feature", "", "error")
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
                  No unit sizes found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-end mt-3">
          <nav>
            <ul className="pagination">
              <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(page - 1)}>
                  Prev
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => (
                <li key={i} className={`page-item ${page === i + 1 ? "active" : ""}`}>
                  <button className="page-link" onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => setPage(page + 1)}>
                  Next
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
}
