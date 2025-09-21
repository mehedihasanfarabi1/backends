import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UnitConversionAPI, UnitAPI } from "../../../api/products";
import Swal from "sweetalert2";
import UserCompanySelector from "../../../components/UserCompanySelector";

export default function UnitConversionForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({
    parent_unit_id: "",
    child_unit_id: "",
    qty: "",
    company_id: "",
    business_type_id: "",
    factory_id: "",
  });

  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  useEffect(() => {
    UnitAPI.list().then(setUnits).catch(console.error);
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const data = await UnitConversionAPI.retrieve(id);
      setForm({
        parent_unit_id: data.parent_unit?.id || "",
        child_unit_id: data.child_unit?.id || "",
        qty: data.qty || "",
        company_id: data.company?.id || "",
        business_type_id: data.business_type?.id || "",
        factory_id: data.factory?.id || "",
      });
      setSelectedCompany(data.company?.id || null);
      setSelectedBusiness(data.business_type?.id || null);
      setSelectedFactory(data.factory?.id || null);
    } catch (err) {
      console.error(err);
    }
  };

  // Sync selectors with form
  useEffect(() => setForm(f => ({ ...f, company_id: selectedCompany })), [selectedCompany]);
  useEffect(() => setForm(f => ({ ...f, business_type_id: selectedBusiness })), [selectedBusiness]);
  useEffect(() => setForm(f => ({ ...f, factory_id: selectedFactory })), [selectedFactory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        parent_unit_id: parseInt(form.parent_unit_id),
        child_unit_id: parseInt(form.child_unit_id),
        qty: parseFloat(form.qty),
      };
      if (id) {
        await UnitConversionAPI.update(id, payload);
        Swal.fire("Updated!", "Unit conversion updated successfully", "success");
      } else {
        await UnitConversionAPI.create(payload);
        Swal.fire("Created!", "Unit conversion created successfully", "success");
      }
      nav("/admin/unit-conversions");
    } catch (err) {
      Swal.fire("Error", JSON.stringify(err.response?.data || err.message), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5>{id ? "Edit Unit Conversion" : "New Unit Conversion"}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <UserCompanySelector
              selectedUser={selectedUser} setSelectedUser={setSelectedUser}
              selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}
              selectedBusiness={selectedBusiness} setSelectedBusiness={setSelectedBusiness}
              selectedFactory={selectedFactory} setSelectedFactory={setSelectedFactory}
              setBusinessTypes={setBusinessTypes} setFactories={setFactories}
            />

            <div className="mb-3">
              <label>Parent Unit</label>
              <select className="form-select" value={form.parent_unit_id} onChange={e => setForm({...form, parent_unit_id: e.target.value})} required>
                <option value="">-- Select Unit --</option>
                {units.filter(u => u.id !== parseInt(form.child_unit_id)).map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.short_name})</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label>Child Unit</label>
              <select className="form-select" value={form.child_unit_id} onChange={e => setForm({...form, child_unit_id: e.target.value})} required>
                <option value="">-- Select Unit --</option>
                {units.filter(u => u.id !== parseInt(form.parent_unit_id)).map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.short_name})</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label>Quantity</label>
              <input type="number" step="0.01" className="form-control" value={form.qty} onChange={e => setForm({...form, qty: e.target.value})} required/>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? "Saving..." : "Save"}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
