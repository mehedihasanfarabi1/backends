import React, { useEffect, useState } from "react";
import { UserAPI } from "../../../../api/users";
import { CompanyAPI } from "../../../../api/company";
import "./styles/UserCompanySelector.css";

export default function UserCompanySelector({
  selectedUser,
  setSelectedUser,
  selectedCompanies = [],
  setSelectedCompanies,
  selectedBusinessTypes = {},
  setSelectedBusinessTypes,
  selectedFactories = {},
  setSelectedFactories,
}) {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [companyDetails, setCompanyDetails] = useState({});

  // Load users and companies
  useEffect(() => {
    UserAPI.list().then((data) => setUsers(data || []));
    CompanyAPI.list().then((data) => setCompanies(data || []));
  }, []);

  // Load company details
  const loadCompanyDetails = async (companyId) => {
    if (!companyId) return;
    try {
      const details = await CompanyAPI.details(companyId);
      setCompanyDetails((prev) => ({
        ...prev,
        [companyId]: {
          businessTypes: details.business_types || [],
          factories: details.factories || [],
        },
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // User selection
  const handleUserChange = (e) => {
    const userId = e.target.value;
    if (!userId) setSelectedUser(null);
    else {
      const u = users.find((u) => String(u.id) === String(userId));
      if (u) setSelectedUser({ value: u.id, label: `${u.name} (${u.email})` });
    }
    setSelectedCompanies([]);
    setSelectedBusinessTypes({});
    setSelectedFactories({});
    setCompanyDetails({});
  };

  // Toggle company (multi-select)
  const toggleCompany = async (companyId) => {
    const exists = selectedCompanies.includes(companyId);
    const updated = exists
      ? selectedCompanies.filter((id) => id !== companyId)
      : [...selectedCompanies, companyId];
    setSelectedCompanies(updated);

    if (!exists) await loadCompanyDetails(companyId);
  };

  // Toggle Business Type (multi-select per company)
  const toggleBusinessType = (companyId, btId) => {
    const currentBTs = selectedBusinessTypes[companyId] || [];
    const updatedBTs = currentBTs.includes(btId)
      ? currentBTs.filter((id) => id !== btId)
      : [...currentBTs, btId]; // <-- fixed multi-select
    setSelectedBusinessTypes({ ...selectedBusinessTypes, [companyId]: updatedBTs });

    // Remove deselected BT's factories
    if (!updatedBTs.includes(btId)) {
      const newF = { ...selectedFactories };
      newF[companyId] = (newF[companyId] || []).filter(f => f.business_type_id !== btId);
      setSelectedFactories(newF);
    }
  };

  // Toggle Factory (multi-select per BT per company)
  const toggleFactory = (companyId, btId, fId) => {
    const currentF = selectedFactories[companyId] || [];
    const exists = currentF.find(f => f.business_type_id === btId && f.factory_id === fId);
    const updatedF = exists
      ? currentF.filter(f => !(f.business_type_id === btId && f.factory_id === fId))
      : [...currentF, { factory_id: fId, business_type_id: btId }];
    setSelectedFactories({ ...selectedFactories, [companyId]: updatedF });
  };

  return (
    <div className="user-company-selector mb-3">
      {/* User select */}
      <div className="mb-2" style={{ maxWidth: 300 }}>
        <label className="fw-bold">Select User</label>
        <select
          className="form-select"
          value={selectedUser?.value || ""}
          onChange={handleUserChange}
        >
          <option value="">-- Select User --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name} ({u.email})
            </option>
          ))}
        </select>
      </div>

      {/* Companies grid */}
      <div className="company-grid">
        {companies.map((c) => {
          const { businessTypes = [], factories = [] } = companyDetails[c.id] || {};
          const selectedBTs = selectedBusinessTypes[c.id] || [];
          const selectedF = selectedFactories[c.id] || [];
          const isExpanded = selectedCompanies.includes(c.id);

          return (
            
            <div key={c.id} className="company-card">
              {/* Company Header */}
              <div className="company-header">
                <input
                  type="checkbox"
                  checked={isExpanded}
                  onChange={() => toggleCompany(c.id)}
                  id={`company-${c.id}`}
                />
                <label htmlFor={`company-${c.id}`} className="company-label">{c.name}</label>
              </div>

              {/* Business Types & Factories */}
              {isExpanded && (
                <div className="company-details expanded">
                  <h4 style={{ fontSize: '15px', marginLeft: "13px", textDecoration: "underline" }}>
                    Business Type
                  </h4>

                  {businessTypes.map((b) => {
                    const selectedFactoriesForBT = selectedF.filter(f => f.business_type_id === b.id);

                    return (
                      <div key={b.id} className="bt-tree">
                        <div className="bt-row">
                          <input
                            type="checkbox"
                            checked={selectedBTs.includes(b.id)}
                            onChange={() => toggleBusinessType(c.id, b.id)}
                            id={`bt-${c.id}-${b.id}`}
                          />
                          <label htmlFor={`bt-${c.id}-${b.id}`} className="ms-2">{b.name}</label>
                        </div>

                        {selectedBTs.includes(b.id) && factories.length > 0 && (
                          <div className="factory-list expanded">
                            <h4 style={{ fontSize: '15px', marginLeft: "13px", textDecoration: "underline" }}>
                              Factory List
                            </h4>
                            {factories.map(f => (
                              <div key={f.id} className="factory-item">
                                <input
                                  type="checkbox"
                                  checked={selectedFactoriesForBT.some(sf => sf.factory_id === f.id)}
                                  onChange={() => toggleFactory(c.id, b.id, f.id)}
                                  id={`ft-${c.id}-${b.id}-${f.id}`}
                                />
                                <label htmlFor={`ft-${c.id}-${b.id}-${f.id}`} className="ms-2">{f.name}</label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
