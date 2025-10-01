import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UnitAPI } from "../../../api/products";
import { PermissionAPI } from "../../../api/permissions";
import UserCompanySelector from "../../../components/UserCompanySelector";
import ActionBar from "../../../components/common/ActionBar";
import Swal from "sweetalert2";
import "../../../styles/Table.css";

export default function UnitList() {
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);
  // const [loading, setLoading] = useState(true);

  // ✅ Company Selector states
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  const nav = useNavigate();

  const load = async () => {
    // setLoading(true);
    try {
      const params = {
        company: selectedCompany,
        business_type: selectedBusiness,
        factory: selectedFactory,
      };

      // console.log("🔎 Fetching units with params:", params);

      const data = await UnitAPI.list(params);
      setUnits(data);

      const perms = await PermissionAPI.list();
      setUserPermissions(perms.map((p) => p.code));
    } catch (err) {
      console.error("Error loading units:", err);
      Swal.fire("Error", "Failed to load data", "error");
    } finally {
      // setLoading(false);
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

    if (!userPermissions.includes("unit_delete")) {
      return Swal.fire("❌ You do not have access for this feature", "", "error");
    }

    const result = await Swal.fire({
      title: `Delete ${selected.length} unit(s)?`,
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        for (let id of selected) {
          await UnitAPI.remove(id);
        }
        setSelected([]);
        load();
        Swal.fire("Deleted!", "Selected unit(s) removed.", "success");
      } catch (err) {
           // 🔹 Child থাকলে specific warning দেখাবে
              let message = err?.response?.data?.detail || err?.message || "Something went wrong";
        
              if (typeof message === "object") {
                // DRF ValidationError returns array
                message = message.detail ? message.detail : Object.values(message).flat().join(", ");
              }
        
            Swal.fire("⚠️ Cannot Delete", "This Unit has active UnitSize. Delete them first.", "warning");
      }
    }
  };

  const onImport = async (parsedData) => {
    if (!userPermissions.includes("unit_create")) {
      return Swal.fire("❌ You do not have access for this feature", "", "error");
    }

    try {
      for (let row of parsedData) {
        await UnitAPI.create({
          name: row.name,
          short_name: row.short_name || "",
        });
      }
      Swal.fire("Imported successfully!", "", "success");
      load();
    } catch (err) {
      Swal.fire("Import failed", err.message, "error");
    }
  };

  const filtered = units.filter(
    (u) =>
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      (u.short_name || "").toLowerCase().includes(search.toLowerCase())
  );

  // if (loading) {
  //   return (
  //     <div className="text-center mt-5">
  //       <div className="spinner-border text-primary" role="status"></div>
  //       <div className="mt-2">Loading data...</div>
  //     </div>
  //   );
  // }

  if (!userPermissions.includes("unit_view")) {
    return (
      <div className="alert alert-danger mt-3 text-center">
        ❌ Access Denied
      </div>
    );
  }

  return (
    <div className="container mt-3">
      <ActionBar
        title="Units"
        onCreate={
          userPermissions.includes("unit_create")
            ? () => nav("/admin/units/new")
            : undefined
        }
        showCreate={userPermissions.includes("unit_create")}
        onDelete={onDelete}
        showDelete={userPermissions.includes("unit_delete")}
        selectedCount={selected.length}
        data={filtered}
        onImport={onImport}
        exportFileName="units"
        showExport={userPermissions.includes("unit_view")}
        showPrint={userPermissions.includes("unit_view")}
      />

      {/* ✅ Company Selector on top */}
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
          initialCompanyId={selectedCompany}        // ✅ preselect
          initialBusinessId={selectedBusiness}      // ✅ preselect
          initialFactoryId={selectedFactory}        // ✅ preselect
        />
      </div>

      {/* ✅ Search */}
      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search units..."
          style={{ maxWidth: 250 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-danger" onClick={() => setSearch("")}>
          Clear
        </button>
      </div>

      {/* ✅ Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
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
                      e.target.checked ? filtered.map((u) => u.id) : []
                    )
                  }
                />
              </th>
              <th style={{ width: 60 }}>#</th>
              <th>Unit Name</th>
              <th>Short Name</th>
              <th style={{ width: 180 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((u, i) => (
                <tr key={u.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(u.id)}
                      onChange={() => toggleSelect(u.id)}
                    />
                  </td>
                  <td>{i + 1}</td>
                  <td>{u.name}</td>
                  <td>{u.short_name || "-"}</td>
                  <td className="custom-actions">
                    {userPermissions.includes("unit_edit") ? (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => nav(`/admin/units/${u.id}`)}
                      >
                        Edit
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() =>
                          Swal.fire("❌ You do not have access", "", "error")
                        }
                      >
                        Edit
                      </button>
                    )}

                    {userPermissions.includes("unit_delete") ? (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setSelected([u.id]);
                          onDelete();
                        }}
                      >
                        Delete
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() =>
                          Swal.fire("❌ You do not have access", "", "error")
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
                <td colSpan={5} className="text-center">
                  No units found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
