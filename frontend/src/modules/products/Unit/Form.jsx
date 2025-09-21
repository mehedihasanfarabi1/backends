import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UnitAPI } from "../../../api/products";
import { CompanyAPI } from "../../../api/company";
import UserCompanySelector from "../../../components/UserCompanySelector";
import Swal from "sweetalert2";

export default function UnitForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    short_name: "",
    company_id: "",
    business_type_id: "",
    factory_id: "",
  });

  const [companies, setCompanies] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);

  // ✅ Load companies initially
  useEffect(() => {
    CompanyAPI.list()
      .then(setCompanies)
      .catch((err) => console.error("Error loading companies:", err));
  }, []);

  // ✅ Load business types + factories when company changes
  useEffect(() => {
    if (selectedCompany) {
      CompanyAPI.details(selectedCompany)
        .then((details) => {
          setBusinessTypes(details.business_types || []);
          setFactories(details.factories || []);
        })
        .catch((err) => console.error("Error loading company details:", err));
    } else {
      setBusinessTypes([]);
      setFactories([]);
      setForm((prev) => ({
        ...prev,
        business_type_id: "",
        factory_id: "",
      }));
      setSelectedBusiness(null);
      setSelectedFactory(null);
    }
  }, [selectedCompany]);

  // ✅ Load unit if editing
  useEffect(() => {
    if (id) {
      UnitAPI.get(id).then((data) => {
        setForm({
          name: data.name,
          short_name: data.short_name || "",
          company_id: data.company?.id || "",
          business_type_id: data.business_type?.id || "",
          factory_id: data.factory?.id || "",
        });

        setSelectedCompany(data.company?.id || null);
        setSelectedBusiness(data.business_type?.id || null);
        setSelectedFactory(data.factory?.id || null);
      });
    }
  }, [id]);

  // ✅ Sync form when select changes
  useEffect(() => setForm((f) => ({ ...f, company_id: selectedCompany })), [selectedCompany]);
  useEffect(() => setForm((f) => ({ ...f, business_type_id: selectedBusiness })), [selectedBusiness]);
  useEffect(() => setForm((f) => ({ ...f, factory_id: selectedFactory })), [selectedFactory]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.company_id) return Swal.fire("Error", "Select a company", "error");
    if (!form.name) return Swal.fire("Error", "Enter unit name", "error");

    try {
      if (id) {
        await UnitAPI.update(id, form);
        Swal.fire("Success!", "Unit updated successfully", "success");
      } else {
        await UnitAPI.create(form);
        Swal.fire("Success!", "Unit created successfully", "success");
      }
      nav("/admin/units");
    } catch (err) {
      console.error(err.response?.data || err);
      Swal.fire("Error", "Failed to save unit", "error");
    }
  };

  return (
    <div className="container mt-3">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5>{id ? "Edit Unit" : "Create Unit"}</h5>
        </div>
        <div className="card-body">
          <form className="row g-3" onSubmit={onSubmit}>

            {/* ✅ Company / Business / Factory Selector */}
            <UserCompanySelector
              selectedUser={selectedUser} setSelectedUser={setSelectedUser}
              selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}
              selectedBusiness={selectedBusiness} setSelectedBusiness={setSelectedBusiness}
              selectedFactory={selectedFactory} setSelectedFactory={setSelectedFactory}
              setBusinessTypes={setBusinessTypes} setFactories={setFactories}
            />

            {/* ✅ Unit Name */}
            <div className="col-md-6">
              <label className="form-label">Unit Name *</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* ✅ Short Name */}
            <div className="col-md-6">
              <label className="form-label">Short Name</label>
              <input
                type="text"
                className="form-control"
                value={form.short_name}
                onChange={(e) => setForm({ ...form, short_name: e.target.value })}
              />
            </div>

            {/* ✅ Actions */}
            <div className="col-12 d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => nav(-1)}>Cancel</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
