import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CategoryAPI, ProductTypeAPI } from "../../../api/products";
import UserCompanySelector from "../../../components/UserCompanySelector";
import Swal from "sweetalert2";

export default function CategoryEdit() {
  const { id } = useParams();
  const nav = useNavigate();

  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);
  const [types, setTypes] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    product_type_id: "",
    company_id: null,
    business_type_id: null,
    factory_id: null,
  });

  // Load category data
  useEffect(() => {
    if (!id) return;

    const loadCategory = async () => {
      try {
        const data = await CategoryAPI.retrieve(id);

        setSelectedCompany(data.company?.id || null);
        setSelectedBusiness(data.business_type?.id || null);
        setSelectedFactory(data.factory?.id || null);

        setForm({
          name: data.name || "",
          description: data.description || "",
          product_type_id: data.product_type?.id || "",
          company_id: data.company?.id || null,
          business_type_id: data.business_type?.id || null,
          factory_id: data.factory?.id || null,
        });

        if (data.company?.id) {
          const productTypes = await ProductTypeAPI.list({ company: data.company.id });
          setTypes(productTypes);
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load category data", "error");
      }
    };

    loadCategory();
  }, [id]);

  // Update form on selector change
  useEffect(() => setForm(f => ({ ...f, company_id: selectedCompany })), [selectedCompany]);
  useEffect(() => setForm(f => ({ ...f, business_type_id: selectedBusiness })), [selectedBusiness]);
  useEffect(() => setForm(f => ({ ...f, factory_id: selectedFactory })), [selectedFactory]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) return Swal.fire("Error", "Category Name is required", "error");
    if (!form.product_type_id) return Swal.fire("Error", "Product Type is required", "error");
    if (!form.company_id) return Swal.fire("Error", "Company is required", "error");

    try {
      await CategoryAPI.update(id, form);
      Swal.fire("Success", "Category updated successfully", "success");
      nav("/admin/categories");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Update failed", "error");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-info text-white">
          <h5>Edit Category</h5>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
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

            <div className="row g-3 mt-3">
              <div className="col-md-6">
                <label className="form-label">Product Type *</label>
                <select
                  className="form-select"
                  value={form.product_type_id}
                  onChange={e => setForm({ ...form, product_type_id: parseInt(e.target.value) })}
                  disabled={!selectedCompany}
                >
                  <option value="">-- Select Product Type --</option>
                  {types.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="col-12">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button type="submit" className="btn btn-primary">Update</button>
              <button type="button" className="btn btn-secondary" onClick={() => nav(-1)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
