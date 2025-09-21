import React, { useEffect, useState } from "react";
import { PermissionAPI } from "../../api/permissions";
import Swal from "sweetalert2";

export default function PermissionPage() {
  const [permissions, setPermissions] = useState([]);
  const [selected, setSelected] = useState([]);

  // ✅ Load permissions
  useEffect(() => {
    const load = async () => {
      try {
        const data = await PermissionAPI.list();
        setPermissions(data);
      } catch (err) {
        console.error("Error loading permissions:", err);
      }
    };
    load();
  }, []);

  // ✅ Toggle single permission
  const toggleOne = (code) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // ✅ Toggle full module
  const toggleModule = (module, checked) => {
    const codes = permissions.filter((p) => p.module === module).map((p) => p.code);
    setSelected((prev) => {
      if (checked) {
        return Array.from(new Set([...prev, ...codes]));
      } else {
        return prev.filter((c) => !codes.includes(c));
      }
    });
  };

  // ✅ Group by module
  const grouped = permissions.reduce((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  const save = () => {
    Swal.fire("✅ Saved", JSON.stringify(selected, null, 2), "success");
  };

  // 🔥 Render permissions inside a module
  const renderPermissions = (module, perms) => {
    const allSelected = perms.every((p) => selected.includes(p.code));
    const partiallySelected =
      perms.some((p) => selected.includes(p.code)) && !allSelected;

    return (
      <div className="accordion-item" key={module}>
        <h2 className="accordion-header" id={`heading-${module}`}>
          <button
            className="accordion-button collapsed fw-semibold"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#collapse-${module}`}
            aria-expanded="false"
            aria-controls={`collapse-${module}`}
          >
            <input
              type="checkbox"
              className="form-check-input me-2"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = partiallySelected;
              }}
              onChange={(e) => toggleModule(module, e.target.checked)}
            />
            {module.replaceAll("_", " ").toUpperCase()}
            {partiallySelected && (
              <span className="badge bg-warning text-dark ms-2">Partial</span>
            )}
          </button>
        </h2>
        <div
          id={`collapse-${module}`}
          className="accordion-collapse collapse"
          aria-labelledby={`heading-${module}`}
        >
          <div className="accordion-body">
            <div className="row">
              {perms.map((p) => (
                <div className="col-md-4 mb-2" key={p.code}>
                  <div className="form-check border rounded p-2 shadow-sm">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id={`p-${p.code}`}
                      checked={selected.includes(p.code)}
                      onChange={() => toggleOne(p.code)}
                    />
                    <label
                      className="form-check-label ms-2"
                      htmlFor={`p-${p.code}`}
                    >
                      {p.action.toUpperCase()}
                    </label>
                    <div className="small text-muted ms-4">{p.code}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🔥 Render nested accordion (like Company → inside → actions)
  const renderNested = (parentName, moduleList) => {
    return (
      <div className="accordion-item">
        <h2 className="accordion-header" id={`heading-${parentName}`}>
          <button
            className="accordion-button collapsed bg-light fw-bold"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target={`#collapse-${parentName}`}
            aria-expanded="false"
            aria-controls={`collapse-${parentName}`}
          >
            {parentName}
          </button>
        </h2>
        <div
          id={`collapse-${parentName}`}
          className="accordion-collapse collapse"
          aria-labelledby={`heading-${parentName}`}
        >
          <div className="accordion-body">
            <div className="accordion" id={`accordion-${parentName}`}>
              {moduleList.map((m) =>
                grouped[m] ? renderPermissions(m, grouped[m]) : null
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container py-4">
      <div className="text-center bg-primary text-white py-3 rounded mb-4 shadow">
        <h2 className="mb-1">Permission Management</h2>
        <p className="mb-0">Assign module-wise permissions</p>
      </div>

      {/* 🔥 Product Modules */}
      <div className="card mb-4 shadow">
        <div className="card-header bg-info text-white fw-bold">
          All Product Modules
        </div>
        <div className="accordion" id="accordionProducts">
          {renderNested("Products", [
            "product_type",
            "category",
            "product",
            "unit",
            "unit_size",
            "unit_conversion",
            "product_size_setting",
          ])}
        </div>
      </div>

      {/* 🔥 Company Modules (nested) */}
      <div className="card mb-4 shadow">
        <div className="card-header bg-success text-white fw-bold">
          All Company Modules
        </div>
        <div className="accordion" id="accordionCompany">
          {renderNested("Company", ["company", "business_type", "factory"])}
        </div>
      </div>

      <div className="text-center">
        <button className="btn btn-primary px-5 shadow" onClick={save}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
