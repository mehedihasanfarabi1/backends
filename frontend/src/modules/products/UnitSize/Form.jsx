// ✅ UnitSizeForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UnitAPI, UnitSizeAPI } from "../../../api/products";
import { CompanyAPI } from "../../../api/company";
import Swal from "sweetalert2";
import UserCompanySelector from "../../../components/UserCompanySelector";

export default function UnitSizeForm() {
  const [form, setForm] = useState({
    unit_id: "",
    size_name: "",
    uom_weight: "",
    company_id: "",
    business_type_id: "",
    factory_id: "",
  });

  const [units, setUnits] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);

  const { id } = useParams();
  const nav = useNavigate();

  // ✅ Load all units initially
  useEffect(() => {
    UnitAPI.list().then(setUnits).catch(err => console.error("Error loading units:", err));
  }, []);

  // ✅ Company change হলে businessTypes + factories load করব
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
      setSelectedBusiness(null);
      setSelectedFactory(null);
      setForm((prev) => ({ ...prev, business_type_id: "", factory_id: "" }));
    }
  }, [selectedCompany]);

  // ✅ যদি edit mode হয় → unit size load করব
  useEffect(() => {
    if (id) {
      UnitSizeAPI.retrieve(id).then((data) => {
        setForm({
          unit_id: data.unit?.id || "",
          size_name: data.size_name,
          uom_weight: data.uom_weight,
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

  // ✅ Sync selectors → form
  useEffect(() => setForm((f) => ({ ...f, company_id: selectedCompany })), [selectedCompany]);
  useEffect(() => setForm((f) => ({ ...f, business_type_id: selectedBusiness })), [selectedBusiness]);
  useEffect(() => setForm((f) => ({ ...f, factory_id: selectedFactory })), [selectedFactory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        unit_id: parseInt(form.unit_id),
        uom_weight: parseFloat(form.uom_weight),
      };

      if (id) {
        await UnitSizeAPI.update(id, payload);
        Swal.fire("Updated!", "Unit size updated successfully", "success");
      } else {
        await UnitSizeAPI.create(payload);
        Swal.fire("Created!", "Unit size created successfully", "success");
      }
      nav("/admin/unit-sizes");
    } catch (err) {
      console.error("Error saving unit size:", err.response?.data || err);
      Swal.fire("Error", "Failed to save unit size", "error");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">{id ? "Edit Unit Size" : "Create Unit Size"}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">

            {/* ✅ Company/Business/Factory Selector */}
            <UserCompanySelector
              selectedUser={selectedUser} setSelectedUser={setSelectedUser}
              selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}
              selectedBusiness={selectedBusiness} setSelectedBusiness={setSelectedBusiness}
              selectedFactory={selectedFactory} setSelectedFactory={setSelectedFactory}
              setBusinessTypes={setBusinessTypes} setFactories={setFactories}
            />

            {/* ✅ Unit */}
            <div className="col-md-6">
              <label className="form-label">Unit</label>
              <select
                className="form-select"
                value={form.unit_id}
                onChange={(e) => setForm({ ...form, unit_id: e.target.value })}
                required
              >
                <option value="">-- Select Unit --</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.short_name})
                  </option>
                ))}
              </select>
            </div>

            {/* ✅ Size Name */}
            <div className="col-md-6">
              <label className="form-label">Size Name</label>
              <input
                type="text"
                className="form-control"
                value={form.size_name}
                onChange={(e) => setForm({ ...form, size_name: e.target.value })}
                required
              />
            </div>

            {/* ✅ UOM Weight */}
            <div className="col-md-6">
              <label className="form-label">Weight (UOM)</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={form.uom_weight}
                onChange={(e) => setForm({ ...form, uom_weight: e.target.value })}
                required
              />
            </div>

            <div className="col-12 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => nav("/admin/unit-sizes")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
