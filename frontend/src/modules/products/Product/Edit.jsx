import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductAPI, ProductTypeAPI, CategoryAPI } from "../../../api/products";
import UserCompanySelector from "../../../components/UserCompanySelector";
import Swal from "sweetalert2";

export default function ProductEdit() {
  const { id } = useParams();
  const nav = useNavigate();

  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);

  const [form, setForm] = useState({
    name: "",
    short_name: "",
    product_type_id: null,
    category_id: null,
    company_id: null,
    business_type_id: null,
    factory_id: null,
  });

  // Load product data
  useEffect(() => {
    if (!id) return;

    const loadProduct = async () => {
      try {
        const data = await ProductAPI.retrieve(id);
        setSelectedCompany(data.company?.id || null);
        setSelectedBusiness(data.business_type?.id || null);
        setSelectedFactory(data.factory?.id || null);

        setForm({
          name: data.name || "",
          short_name: data.short_name || "",
          product_type_id: data.product_type?.id || null,
          category_id: data.category?.id || null,
          company_id: data.company?.id || null,
          business_type_id: data.business_type?.id || null,
          factory_id: data.factory?.id || null,
        });

        if (data.company?.id) {
          const typesList = await ProductTypeAPI.list({ company: data.company.id });
          setTypes(typesList);

          if (data.product_type?.id) {
            const cats = await CategoryAPI.list({ product_type: data.product_type.id });
            setCategories(cats);
          }
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load product data", "error");
      }
    };

    loadProduct();
  }, [id]);

  // Update form when selectors change
  useEffect(() => setForm(f => ({ ...f, company_id: selectedCompany })), [selectedCompany]);
  useEffect(() => setForm(f => ({ ...f, business_type_id: selectedBusiness })), [selectedBusiness]);
  useEffect(() => setForm(f => ({ ...f, factory_id: selectedFactory })), [selectedFactory]);

  // Load categories when product type changes
  useEffect(() => {
    if (form.product_type_id) {
      CategoryAPI.list({ product_type: form.product_type_id })
        .then(setCategories)
        .catch(console.error);
    } else setCategories([]);
  }, [form.product_type_id]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) return Swal.fire("Error", "Product Name is required", "error");
    if (!form.product_type_id) return Swal.fire("Error", "Product Type is required", "error");
    if (!form.company_id) return Swal.fire("Error", "Company is required", "error");

    try {
      await ProductAPI.update(id, form);
      Swal.fire("Success", "Product updated successfully", "success");
      nav("/admin/products");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Update failed", "error");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5>Edit Product</h5>
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
                <label>Product Type *</label>
                <select
                  className="form-select"
                  value={form.product_type_id || ""}
                  onChange={(e) => setForm({ ...form, product_type_id: parseInt(e.target.value), category_id: null })}
                  disabled={!selectedCompany}
                >
                  <option value="">-- Select Product Type --</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="col-md-6">
                <label>Category</label>
                <select
                  className="form-select"
                  value={form.category_id || ""}
                  onChange={(e) => setForm({ ...form, category_id: parseInt(e.target.value) })}
                  disabled={!form.product_type_id}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="col-md-6">
                <label>Product Name *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="col-md-6">
                <label>Short Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.short_name}
                  onChange={(e) => setForm({ ...form, short_name: e.target.value })}
                />
              </div>

              <div className="col-12 d-flex justify-content-end mt-3">
                <button type="submit" className="btn btn-primary">Update</button>
                <button type="button" className="btn btn-secondary ms-2" onClick={() => nav(-1)}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
