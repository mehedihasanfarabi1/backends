import { useEffect, useState, useRef } from "react";
import { PermissionAPI, UserPermissionAPI, CompanyAPI } from "../../api/permissions";
import { UserAPI } from "../../api/users";
import Swal from "sweetalert2";

export default function PermissionPage() {
  const [permissions, setPermissions] = useState([]);
  const [userPermissions, setUserPermissions] = useState([]);

  const [grouped, setGrouped] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);

  const indeterminateRefs = useRef({});

  // ---------------- Load Permissions ----------------
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const data = await PermissionAPI.list();
        setPermissions(data);

        const groupedData = {};
        data.forEach((p) => {
          const mainGroup = ["product", "unit", "category"].some((x) =>
            p.module.includes(x)
          )
            ? "products"
            : "company";
          if (!groupedData[mainGroup]) groupedData[mainGroup] = {};
          if (!groupedData[mainGroup][p.module]) groupedData[mainGroup][p.module] = [];
          groupedData[mainGroup][p.module].push(p);
        });

        setGrouped(groupedData);
      } catch (err) {
        console.error("❌ Load permissions error:", err);
      }
    };
    loadPermissions();
  }, []);

  // ---------------- Load Users ----------------
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await UserAPI.list();
        setUsers(data);
      } catch (err) {
        console.error("❌ Load users error:", err);
      }
    };
    loadUsers();
  }, []);

  // ---------------- Load Companies ----------------
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await CompanyAPI.list();
        setCompanies(data);
      } catch (err) {
        console.error("❌ Load companies error:", err);
      }
    };
    loadCompanies();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // ---------------- Load Filtered Permissions ----------------
  const loadFilteredPermissions = async () => {
    if (!selectedUser || !selectedCompany) {
      setSelected([]);
      return;
    }

    try {
      const params = {
        user: selectedUser,
        company: selectedCompany,
        business_type: selectedBusiness || "",
        factory: selectedFactory || "",
      };

      const res = await UserPermissionAPI.getByUserCompany(params);

      if (res.length > 0) {
        const data = res[0];
        setSelected(data.permissions.map((p) => p.trim()));
        setSelectedBusiness(data.business_type || null);
        setSelectedFactory(data.factory || null);
      } else {
        setSelected([]);
      }
    } catch (err) {
      console.error("❌ Load filtered permissions error: ", err);
      setSelected([]);
    }
  };

  // ---------------- Handle User Change ----------------
  const handleUserChange = async (userId) => {
    setSelectedUser(userId);
    setSelectedCompany(null);
    setSelectedBusiness(null);
    setSelectedFactory(null);
    setSelected([]);

    if (!userId) return;

    try {
      const res = await UserPermissionAPI.getByUser(userId);
      setUserPermissions(res);
    } catch (err) {
      console.error("❌ Handle user change error:", err);
      setSelected([]);
    }
  };

  // ---------------- Handle Company Change ----------------
  const handleCompanyChange = async (companyId) => {
    setSelectedCompany(companyId);
    setSelectedBusiness(null);
    setSelectedFactory(null);

    if (!companyId) {
      setBusinessTypes([]);
      setFactories([]);
      setSelected([]);
      return;
    }

    try {
      const details = await CompanyAPI.details(companyId);
      setBusinessTypes(details.business_types || []);
      setFactories(details.factories || []);

      await loadFilteredPermissions();
    } catch (err) {
      console.error("❌ Handle company change error:", err);
      setBusinessTypes([]);
      setFactories([]);
      setSelected([]);
    }
  };

  const handleBusinessTypeChange = async (businessTypeId) => {
    setSelectedBusiness(businessTypeId);
    await loadFilteredPermissions();
  };

  const handleFactoryChange = async (factoryId) => {
    setSelectedFactory(factoryId);
    await loadFilteredPermissions();
  };

  // ---------------- Permission Toggle ----------------
  const toggleOne = (code) => {
    setSelected((prev) => {
      const updated = prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code];
      return updated;
    });
  };

  const toggleSubModule = (module, perms, checked) => {
    const codes = perms.map((p) => p.code);
    setSelected((prev) => {
      const updated = checked
        ? Array.from(new Set([...prev, ...codes]))
        : prev.filter((c) => !codes.includes(c));
      return updated;
    });
  };

  const toggleMainGroup = (main, checked) => {
    const codes = Object.values(grouped[main] || {}).flat().map((p) => p.code);
    setSelected((prev) => {
      const updated = checked
        ? Array.from(new Set([...prev, ...codes]))
        : prev.filter((c) => !codes.includes(c));
      return updated;
    });
  };

  // ---------------- Save ----------------
  const save = async () => {
    if (!selectedUser || !selectedCompany) {
      Swal.fire("⚠️ Error", "Please select user and company first!", "warning");
      return;
    }

    try {
      await UserPermissionAPI.updateOrCreate(selectedUser, {
        company: selectedCompany,
        business_type: selectedBusiness,
        factory: selectedFactory,
        permissions: selected,
      });

      Swal.fire("✅ Saved", "Permissions updated successfully!", "success");
    } catch (err) {
      console.error("❌ Save error:", err);
      Swal.fire("❌ Error", "Failed to save permissions", "error");
    }
  };

  return (
    <div className="container py-3">
      <div className="text-center bg-primary text-white py-3 rounded mb-4 shadow">
        <h2 className="mb-1">Permission Management</h2>
        <p className="mb-0">Assign module-wise permissions to users</p>
      </div>

      <div className="mb-4 d-flex flex-column flex-md-row gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          value={selectedUser || ""}
          onChange={(e) => handleUserChange(e.target.value)}
        >
          <option value="">-- Select User --</option>
          {filteredUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <select
          className="form-select mb-2"
          value={selectedCompany || ""}
          onChange={(e) => handleCompanyChange(e.target.value)}
        >
          <option value="">-- Select Company --</option>
          {companies.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {businessTypes.length > 0 && (
          <select
            className="form-select mb-2"
            value={selectedBusiness || ""}
            onChange={(e) => handleBusinessTypeChange(e.target.value)}
          >
            <option value="">-- Select Business Type --</option>
            {businessTypes.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        )}

        {factories.length > 0 && (
          <select
            className="form-select mb-2"
            value={selectedFactory || ""}
            onChange={(e) => handleFactoryChange(e.target.value)}
          >
            <option value="">-- Select Factory --</option>
            {factories.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="accordion" id="mainAccordion">
        {Object.keys(grouped).map((main, i) => {
          const allCodes = Object.values(grouped[main]).flat().map((p) => p.code);
          const allSelected = allCodes.every((c) => selected.includes(c));
          const partialSelected = allCodes.some((c) => selected.includes(c)) && !allSelected;

          return (
            <div className="accordion-item mb-3 shadow-sm" key={main}>
              <h2 className="accordion-header" id={`main-${i}`}>
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapse-main-${i}`}
                >
                  <div className="form-check m-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => el && (el.indeterminate = partialSelected)}
                      onChange={(e) => toggleMainGroup(main, e.target.checked)}
                    />
                    <label className="form-check-label fw-bold ms-2">{main.toUpperCase()}</label>
                  </div>
                </button>
              </h2>

              <div id={`collapse-main-${i}`} className="accordion-collapse collapse">
                <div className="accordion-body">
                  {Object.entries(grouped[main]).map(([module, perms], j) => {
                    const allSubSelected = perms.every((p) => selected.includes(p.code));
                    const partialSub = perms.some((p) => selected.includes(p.code)) && !allSubSelected;

                    return (
                      <div className="accordion-item mb-3 border rounded shadow-sm" key={`${main}-${module}`}>
                        <h2 className="accordion-header" id={`sub-${i}-${j}`}>
                          <button
                            className="accordion-button collapsed small"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#collapse-sub-${i}-${j}`}
                          >
                            <div className="form-check m-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={allSubSelected}
                                ref={(el) => el && (el.indeterminate = partialSub)}
                                onChange={(e) => toggleSubModule(module, perms, e.target.checked)}
                              />
                              <label className="form-check-label ms-2">{module.replaceAll("_", " ").toUpperCase()}</label>
                            </div>
                          </button>
                        </h2>
                        <div id={`collapse-sub-${i}-${j}`} className="accordion-collapse collapse">
                          <div className="accordion-body">
                            <div className="row">
                              {perms.map((p) => (
                                <div className="col-md-3 mb-2" key={p.code}>
                                  <div className="form-check border rounded p-3 shadow-sm bg-light">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      checked={selected.includes(p.code)}
                                      onChange={() => toggleOne(p.code)}
                                    />
                                    <label className="form-check-label ms-2 fw-semibold">{p.action.toUpperCase()}</label>
                                    <div className="small text-muted ms-4">{p.code}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-4">
        <button className="btn btn-primary px-5 py-2 shadow-lg" onClick={save}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
