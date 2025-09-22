import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UnitConversionAPI, UnitAPI } from "../../../api/products";
import Swal from "sweetalert2";
import UserCompanySelector from "../../../components/UserCompanySelector";

export default function UnitConversionEdit() {
  const { id } = useParams();
  const nav = useNavigate();

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);

  const [form, setForm] = useState({
    parent_unit_id: "",
    child_unit_id: "",
    qty: "",
    company_id: "",
    business_type_id: "",
    factory_id: "",
  });

  // Load all units
  useEffect(() => {
    UnitAPI.list().then(setUnits).catch(console.error);
  }, []);

  // Load unit conversion if editing
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      try {
        const data = await UnitConversionAPI.retrieve(id);

        setSelectedCompany(data.company?.id || null);
        setSelectedBusiness(data.business_type?.id || null);
        setSelectedFactory(data.factory?.id || null);

        setForm({
          parent_unit_id: data.parent_unit?.id || "",
          child_unit_id: data.child_unit?.id || "",
          qty: data.qty || "",
          company_id: data.company?.id || "",
          business_type_id: data.business_type?.id || "",
          factory_id: data.factory?.id || "",
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load unit conversion", "error");
      }
    };

    loadData();
  }, [id]);

  // Sync selectors with form
  useEffect(() => setForm(f => ({ ...f, company_id: selectedCompany })), [selectedCompany]);
  useEffect(() => setForm(f => ({ ...f, business_type_id: selectedBusiness })), [selectedBusiness]);
  useEffect(() => setForm(f => ({ ...f, factory_id: selectedFactory })), [selectedFactory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!form.company_id) return Swal.fire("Error", "Select a company", "error");
    if (!form.parent_unit_id) return Swal.fire("Error", "Select parent unit", "error");
    if (!form.child_unit_id) return Swal.fire("Error", "Select child unit", "error");
    if (!form.qty) return Swal.fire("Error", "Enter quantity", "error");

    try {
      const payload = {
        ...form,
        parent_unit_id: parseInt(form.parent_unit_id),
        child_unit_id: parseInt(form.child_unit_id),
        qty: parseFloat(form.qty),
      };

      await UnitConversionAPI.update(id, payload);
      Swal.fire("Success!", "Unit conversion updated successfully", "success");
      nav("/admin/unit-conversions");
    } catch (err) {
      console.error(err.response?.data || err);
      Swal.fire("Error", "Failed to update unit conversion", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5>Edit Unit Conversion</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>

            {/* Company / Business / Factory Selector */}
            <UserCompanySelector
              selectedUser={selectedUser} setSelectedUser={setSelectedUser}
              selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}
              selectedBusiness={selectedBusiness} setSelectedBusiness={setSelectedBusiness}
              selectedFactory={selectedFactory} setSelectedFactory={setSelectedFactory}
              setBusinessTypes={setBusinessTypes} setFactories={setFactories}
            />

            <div className="mb-3">
              <label>Parent Unit *</label>
              <select
                className="form-select"
                value={form.parent_unit_id}
                onChange={e => setForm({ ...form, parent_unit_id: e.target.value })}
              >
                <option value="">-- Select Unit --</option>
                {units.filter(u => u.id !== parseInt(form.child_unit_id)).map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.short_name})</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label>Child Unit *</label>
              <select
                className="form-select"
                value={form.child_unit_id}
                onChange={e => setForm({ ...form, child_unit_id: e.target.value })}
              >
                <option value="">-- Select Unit --</option>
                {units.filter(u => u.id !== parseInt(form.parent_unit_id)).map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.short_name})</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label>Quantity *</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={form.qty}
                onChange={e => setForm({ ...form, qty: e.target.value })}
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Saving..." : "Update"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => nav(-1)}>
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
