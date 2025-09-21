import React, { useEffect, useState } from "react";
import Select from "react-select";
import {  UserPermissionAPI, UserAPI } from "../api/permissions";
import {  CompanyAPI, } from "../api/company";

export default function UserCompanySelector({
  selectedUser,
  setSelectedUser,
  selectedCompany,
  setSelectedCompany,
  selectedBusiness,
  setSelectedBusiness,
  selectedFactory,
  setSelectedFactory,
  setBusinessTypes,
  setFactories,
}) {
  const [users, setUsers] = useState([]);
  const [allCompanies, setAllCompanies] = useState([]); // keep full list
  const [companies, setCompanies] = useState([]);
  const [companyDetails, setCompanyDetails] = useState({ business_types: [], factories: [] });

  useEffect(() => {
    const loadUsers = async () => {
      const data = await UserAPI.list();
      setUsers(data);
    };
    loadUsers();

    const loadCompanies = async () => {
      const data = await CompanyAPI.list();
      setAllCompanies(data);
      setCompanies(data);
    };
    loadCompanies();
  }, []);

  const handleUserChange = async (opt) => {
    const userId = opt ? opt.value : null;
    setSelectedUser(userId);
    setSelectedCompany(null);
    setSelectedBusiness(null);
    setSelectedFactory(null);
    setBusinessTypes([]);
    setFactories([]);
    setCompanyDetails({ business_types: [], factories: [] });

    if (!userId) {
      setCompanies(allCompanies); // restore full list
      return;
    }

    const perms = await UserPermissionAPI.getByUser(userId);
    const allowedCompanies = new Set();
    perms.forEach(p => (p.companies || []).forEach(c => allowedCompanies.add(c)));
    setCompanies(allCompanies.filter(c => allowedCompanies.has(c.id)));
  };

  const handleCompanyChange = async (opt) => {
    const companyId = opt ? opt.value : null;
    setSelectedCompany(companyId);
    setSelectedBusiness(null);
    setSelectedFactory(null);
    setBusinessTypes([]);
    setFactories([]);
    setCompanyDetails({ business_types: [], factories: [] });

    if (!companyId) return;

    const details = await CompanyAPI.details(companyId);
    setCompanyDetails(details);
    setBusinessTypes(details.business_types || []);
    setFactories(details.factories || []);
  };

  return (
    <div className="d-flex flex-wrap gap-2 mb-3">
      <div style={{ minWidth: 200 }}>
        <Select
          placeholder="Select Company"
          options={companies.map(c => ({ value: c.id, label: c.name }))}
          value={selectedCompany ? { value: selectedCompany, label: companies.find(c => c.id === selectedCompany)?.name } : null}
          onChange={handleCompanyChange}
          isClearable
        />
      </div>

      <div style={{ minWidth: 180 }}>
        <Select
          placeholder="Select Business Type"
          options={companyDetails.business_types?.map(b => ({ value: b.id, label: b.name })) || []}
          value={selectedBusiness ? { value: selectedBusiness, label: companyDetails.business_types.find(b => b.id === selectedBusiness)?.name } : null}
          onChange={opt => setSelectedBusiness(opt ? opt.value : null)}
          isClearable
        />
      </div>

      <div style={{ minWidth: 180 }}>
        <Select
          placeholder="Select Factory"
          options={companyDetails.factories?.map(f => ({ value: f.id, label: f.name })) || []}
          value={selectedFactory ? { value: selectedFactory, label: companyDetails.factories.find(f => f.id === selectedFactory)?.name } : null}
          onChange={opt => setSelectedFactory(opt ? opt.value : null)}
          isClearable
        />
      </div>
    </div>
  );
}
