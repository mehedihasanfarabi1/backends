import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UnitSizeAPI, UnitAPI } from "../../../api/products";
import UserCompanySelector from "../../../components/UserCompanySelector";
import Swal from "sweetalert2";

export default function UnitSizeEdit() {
  const { id } = useParams();
  const nav = useNavigate();

  const [units, setUnits] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);

  const [form, setForm] = useState({
    unit_id: null,
    size_name: "",
    uom_weight: "",
    company_id: null,
    business_type_id: null,
    factory_id: null,
  });

  // Load all units
  useEffect(() => {
    UnitAPI.list().then(setUnits).catch(console.error);
  }, []);

  // Load unit size for edit
  useEffect(() => {
    if (!id) return;

    const loadUnitSize = async () => {
      try {
        const data = await UnitSizeAPI.retrieve(id);

        setSelectedCompany(data.company?.id || null);
        setSelectedBusiness(data.business_type?.id || null);
        setSelectedFactory(data.factory?.id || null);

        setForm({
          unit_id: data.unit?.id || null,
          size_name: data.size_name || "",
          uom_weight: data.uom_weight || "",
          company_id: data.company?.id || null,
          business_type_id: data.business_type?.id || null,
          factory_id: data.factory?.id || null,
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load unit size", "error");
      }
    };

    loadUnitSize();
  }, [id]);

  // Sync form when selects change
  useEffect(() => setForm(f => ({ ...f, company_id: selectedCompany })), [selectedCompany]);
  useEffect(() => setForm(f => ({ ...f, business_type_id: selectedBusiness })), [selectedBusiness]);
  useEffect(() => setForm(f => ({ ...f, factory_id: selectedFactory })), [selectedFactory]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.company_id) return Swal.fire("Error", "Select a company", "error");
    if (!form.unit_id) return Swal.fire("Error", "Select a unit", "error");
    if (!form.size_name) return Swal.fire("Error", "Enter size name", "error");
    if (!form.uom_weight) return Swal.fire("Error", "Enter weight", "error");

    try {
      await UnitSizeAPI.update(id, form);
      Swal.fire("Success!", "Unit Size updated successfully", "success");
      nav("/admin/unit-sizes");
    } catch (err) {
      console.error(err.response?.data || err);
      Swal.fire("Error", "Failed to update unit size", "error");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5>Edit Unit Size</h5>
        </div>
        <div className="card-body">
          <form className="row g-3" onSubmit={handleSubmit}>

            {/* Company / Business / Factory Selector */}
            <UserCompanySelector
              selectedUser={selectedUser} setSelectedUser={setSelectedUser}
              selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}
              selectedBusiness={selectedBusiness} setSelectedBusiness={setSelectedBusiness}
              selectedFactory={selectedFactory} setSelectedFactory={setSelectedFactory}
              setBusinessTypes={setBusinessTypes} setFactories={setFactories}
              initialCompanyId={selectedCompany}
              initialBusinessId={selectedBusiness}
              initialFactoryId={selectedFactory}
            />

            {/* Unit */}
            <div className="col-md-4">
              <label className="form-label">Unit *</label>
              <select
                className="form-select"
                value={form.unit_id || ""}
                onChange={e => setForm({ ...form, unit_id: parseInt(e.target.value) })}
              >
                <option value="">-- Select Unit --</option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.short_name})
                  </option>
                ))}
              </select>
            </div>

            {/* Size Name */}
            <div className="col-md-4">
              <label className="form-label">Size Name *</label>
              <input
                type="text"
                className="form-control"
                value={form.size_name}
                onChange={e => setForm({ ...form, size_name: e.target.value })}
              />
            </div>

            {/* Weight */}
            <div className="col-md-4">
              <label className="form-label">Weight *</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={form.uom_weight}
                onChange={e => setForm({ ...form, uom_weight: e.target.value })}
              />
            </div>

            {/* Actions */}
            <div className="col-12 d-flex justify-content-end gap-2 mt-3">
              <button type="submit" className="btn btn-primary">Update</button>
              <button type="button" className="btn btn-secondary" onClick={() => nav(-1)}>Cancel</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
