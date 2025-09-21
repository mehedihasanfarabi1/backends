import { useEffect, useState } from "react";
import { PermissionAPI, UserPermissionAPI } from "../../api/permissions";
import { UserAPI } from "../../api/users";
import Swal from "sweetalert2";
// Final Permissionss
export default function PermissionPage() {
  const [permissions, setPermissions] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");

  // Load all permissions
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const data = await PermissionAPI.list();
        setPermissions(data);

        const groupedData = {};
        data.forEach((p) => {
          let mainGroup;
          // ✅ category products group এ যাবে
          if (
            p.module.includes("product") ||
            p.module.includes("unit") ||
            p.module.includes("category")
          ) {
            mainGroup = "products";
          } else {
            mainGroup = "company";
          }

          if (!groupedData[mainGroup]) groupedData[mainGroup] = {};
          if (!groupedData[mainGroup][p.module]) groupedData[mainGroup][p.module] = [];
          groupedData[mainGroup][p.module].push(p);
        });
        setGrouped(groupedData);
      } catch (err) {
        console.error("Error loading permissions:", err);
      }
    };
    loadPermissions();
  }, []);

  // Load all users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const data = await UserAPI.list();
        setUsers(data);
      } catch (err) {
        console.error("Error loading users:", err);
      }
    };
    loadUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  // Load selected user's permissions
  const handleUserChange = async (userId) => {
    setSelectedUser(userId);
    if (!userId) return setSelected([]);

    try {
      const up = await UserPermissionAPI.getByUser(userId);
      setSelected(up?.permissions || []);
    } catch (err) {
      console.error(err);
      setSelected([]);
    }
  };

  // Toggle individual permission
  const toggleOne = (code) =>
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );

  // Toggle submodule permissions
  const toggleSubModule = (module, perms, checked) => {
    const codes = perms.map((p) => p.code);
    setSelected((prev) =>
      checked
        ? Array.from(new Set([...prev, ...codes]))
        : prev.filter((c) => !codes.includes(c))
    );
  };

  // Toggle main group permissions
  const toggleMainGroup = (main, checked) => {
    const codes = [];
    Object.values(grouped[main] || {}).forEach((perms) =>
      perms.forEach((p) => codes.push(p.code))
    );
    setSelected((prev) =>
      checked
        ? Array.from(new Set([...prev, ...codes]))
        : prev.filter((c) => !codes.includes(c))
    );
  };

  // Save permissions
  const save = async () => {
    if (!selectedUser) {
      Swal.fire("⚠️ Error", "Please select a user first!", "warning");
      return;
    }
    try {
      await UserPermissionAPI.updateOrCreate(selectedUser, { permissions: selected });
      Swal.fire("✅ Saved", "Permissions updated successfully!", "success");
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire("❌ Error", "Failed to save permissions", "error");
    }
  };

  return (
    <div className="container py-3">
      {/* Header */}
      <div className="text-center bg-primary text-white py-3 rounded mb-4 shadow">
        <h2 className="mb-1">Permission Management</h2>
        <p className="mb-0">Assign module-wise permissions to users</p>
      </div>

      {/* User Search + Dropdown */}
      <div className="mb-4 d-flex flex-column flex-md-row gap-2 align-items-start">
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

      {/* Nested Accordions */}
      <div className="accordion" id="mainAccordion">
        {Object.keys(grouped).map((main, i) => {
          const allCodes = [];
          Object.values(grouped[main]).forEach((perms) =>
            perms.forEach((p) => allCodes.push(p.code))
          );
          const allSelected = allCodes.every((c) => selected.includes(c));
          const partialSelected =
            allCodes.some((c) => selected.includes(c)) && !allSelected;

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
                    <label className="form-check-label fw-bold ms-2">
                      {main.toUpperCase()}
                    </label>
                  </div>
                </button>
              </h2>

              <div id={`collapse-main-${i}`} className="accordion-collapse collapse">
                <div className="accordion-body">
                  <div className="accordion" id={`subAccordion-${i}`}>
                    {Object.keys(grouped[main]).map((module, j) => {
                      const perms = grouped[main][module];
                      const allSubSelected = perms.every((p) =>
                        selected.includes(p.code)
                      );
                      const partialSub =
                        perms.some((p) => selected.includes(p.code)) &&
                        !allSubSelected;

                      return (
                        <div
                          className="accordion-item mb-3 border rounded shadow-sm"
                          key={`${main}-${module}`}
                        >
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
                                  onChange={(e) =>
                                    toggleSubModule(module, perms, e.target.checked)
                                  }
                                />
                                <label className="form-check-label ms-2">
                                  {module.replaceAll("_", " ").toUpperCase()}
                                </label>
                              </div>
                            </button>
                          </h2>
                          <div
                            id={`collapse-sub-${i}-${j}`}
                            className="accordion-collapse collapse"
                          >
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
                                      <label className="form-check-label ms-2 fw-semibold">
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
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="text-center mt-4">
        <button className="btn btn-primary px-5 py-2 shadow-lg" onClick={save}>
          Save Changes
        </button>
      </div>
    </div>
  );
}
