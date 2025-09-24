import React, { useEffect, useState } from "react";
import Select from "react-select";
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
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState({});

  useEffect(() => {
    UserAPI.list().then((data) => setUsers(data || []));
    CompanyAPI.list().then((data) => setCompanies(data || []));
  }, []);

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

  const handleUserChange = (option) => {
    setSelectedUser(option);
    setSelectedCompanies([]);
    setSelectedBusinessTypes({});
    setSelectedFactories({});
    setCompanyDetails({});
    setCompanyDropdownOpen({});
  };

  const toggleCompanyDropdown = async (companyId) => {
    const isOpen = companyDropdownOpen[companyId];
    setCompanyDropdownOpen({ ...companyDropdownOpen, [companyId]: !isOpen });
    if (!isOpen && !companyDetails[companyId]) {
      await loadCompanyDetails(companyId);
    }
  };

  const toggleCompanySelection = (companyId) => {
    const exists = selectedCompanies.includes(companyId);
    const updated = exists
      ? selectedCompanies.filter((id) => id !== companyId)
      : [...selectedCompanies, companyId];
    setSelectedCompanies(updated);
  };

  const toggleBusinessType = (companyId, btId) => {
    const currentBTs = selectedBusinessTypes[companyId] || [];
    const updatedBTs = currentBTs.includes(btId)
      ? currentBTs.filter((id) => id !== btId)
      : [...currentBTs, btId];
    setSelectedBusinessTypes({ ...selectedBusinessTypes, [companyId]: updatedBTs });

    if (!updatedBTs.includes(btId)) {
      const newF = { ...selectedFactories };
      newF[companyId] = (newF[companyId] || []).filter(f => f.business_type_id !== btId);
      setSelectedFactories(newF);
    }
  };

  const toggleFactory = (companyId, btId, fId) => {
    const currentF = selectedFactories[companyId] || [];
    const exists = currentF.find(f => f.business_type_id === btId && f.factory_id === fId);
    const updatedF = exists
      ? currentF.filter(f => !(f.business_type_id === btId && f.factory_id === fId))
      : [...currentF, { factory_id: fId, business_type_id: btId }];
    setSelectedFactories({ ...selectedFactories, [companyId]: updatedF });
  };

  return (
    <div className="user-company-selector">
      {/* User Select */}
      <div className="mb-3" style={{ maxWidth: 350 }}>
        <label className="fw-bold mb-1">Select User</label>
        <Select
          options={users.map(u => ({ value: u.id, label: `${u.name} (${u.email})` }))}
          value={selectedUser}
          onChange={handleUserChange}
          isClearable
          placeholder="-- Select User --"
        />
      </div>

      {/* Companies Grid */}
      <div className="company-grid">
        {companies.map((c) => {
          const { businessTypes = [], factories = [] } = companyDetails[c.id] || {};
          const selectedBTs = selectedBusinessTypes[c.id] || [];
          const selectedF = selectedFactories[c.id] || [];
          const isDropdownOpen = companyDropdownOpen[c.id] || false;
          const isSelected = selectedCompanies.includes(c.id);

          return (
            <div key={c.id} className="company-card shadow-sm">
              <div className="company-header">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleCompanySelection(c.id)}
                  id={`company-${c.id}`}
                  onClick={(e) => e.stopPropagation()} // prevent toggle on label click
                />
                <label
                  htmlFor={`company-${c.id}`}
                  className="ms-2 fw-semibold company-label"
                  onClick={() => toggleCompanyDropdown(c.id)}
                >
                  {c.name}
                  <span className="dropdown-arrow">{isDropdownOpen ? "▲" : "▼"}</span>
                </label>
              </div>

              {isDropdownOpen && (
                <div className="company-details">
                  {businessTypes.length > 0 && <h6 className="mt-2 separator">Business Types</h6>}
                  {businessTypes.map((b) => {
                    const selectedFactoriesForBT = selectedF.filter(f => f.business_type_id === b.id);
                    return (
                      <div key={b.id} className="bt-tree ms-3">
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
                          <div className="factory-list ms-4">
                            <h6 className="separator">Factories</h6>
                            {factories.map(f => (
                              <div key={f.id} className="factory-item ms-2">
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
