import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UnitSizeAPI } from "../../../api/products";
import { PermissionAPI } from "../../../api/permissions";
import UserCompanySelector from "../../../components/UserCompanySelector";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import "../../../styles/Table.css";

export default function UnitSizeList() {
  const [sizes, setSizes] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);

  // ✅ Company Selector States
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  const nav = useNavigate();

  const load = async () => {
    try {
      // 🔹 Send company / business / factory as query params
      const params = {
        company: selectedCompany,
        business_type: selectedBusiness,
        factory: selectedFactory,
      };

      console.log("🔎 Fetching unit sizes with params:", params);

      const data = await UnitSizeAPI.list(params);
      setSizes(data);

      const perms = await PermissionAPI.list();
      setUserPermissions(perms.map((p) => p.code));
    } catch (err) {
      console.error("Error loading unit sizes:", err);
      Swal.fire("Error", "Failed to load data", "error");
    }
  };

  useEffect(() => {
    load();
  }, [selectedCompany, selectedBusiness, selectedFactory]);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const onDelete = async () => {
    if (!selected.length) return;

    if (!userPermissions.includes("unit_size_delete")) {
      return Swal.fire("❌ You do not have access for this feature", "", "error");
    }

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
        load();
        Swal.fire("Deleted!", "Selected unit size(s) removed.", "success");
      } catch (err) {
        Swal.fire("Error", err.message, "error");
      }
    }
  };

  const onImport = async (parsedData) => {
    if (!userPermissions.includes("unit_size_create")) {
      return Swal.fire("❌ You do not have access for this feature", "", "error");
    }

    try {
      for (let row of parsedData) {
        await UnitSizeAPI.create({
          unit: row.unit,          // unit id
          size_name: row.size_name,
          uom_weight: row.uom_weight,
        });
      }
      Swal.fire("Imported successfully!", "", "success");
      load();
    } catch (err) {
      Swal.fire("Import failed", err.message, "error");
    }
  };

  // 🔹 Filter by search + company/business/factory
  const filtered = sizes.filter((s) => {
    const matchesSearch =
      s.size_name?.toLowerCase().includes(search.toLowerCase()) ||
      (s.unit?.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.unit?.short_name || "").toLowerCase().includes(search.toLowerCase());

    const matchesCompany =
      (!selectedCompany || s.unit?.company?.id === selectedCompany) &&
      (!selectedBusiness || s.unit?.business_type?.id === selectedBusiness) &&
      (!selectedFactory || s.unit?.factory?.id === selectedFactory);

    return matchesSearch && matchesCompany;
  });

  if (!userPermissions.includes("unit_size_view")) {
    return <div className="alert alert-danger mt-3 text-center">Access Denied</div>;
  }

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
        data={filtered}
        onImport={onImport}
        exportFileName="unit_sizes"
        showExport={userPermissions.includes("unit_size_view")}
        showPrint={userPermissions.includes("unit_size_view")}
      />

      {/* ✅ Company Selector */}
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

      {/* ✅ Search */}
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

      {/* ✅ Table */}
      <div className="custom-table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th style={{ width: 50 }}>
                <input
                  type="checkbox"
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onChange={(e) =>
                    setSelected(e.target.checked ? filtered.map((s) => s.id) : [])
                  }
                />
              </th>
              <th style={{ width: 60 }}>#</th>
              <th>Unit</th>
              <th>Size Name</th>
              <th>Weight (UOM)</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((s, i) => (
                <tr key={s.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(s.id)}
                      onChange={() => toggleSelect(s.id)}
                    />
                  </td>
                  <td>{i + 1}</td>
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
    </div>
  );
}
