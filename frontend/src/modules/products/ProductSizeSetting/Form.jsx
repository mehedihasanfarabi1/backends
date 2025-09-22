import React, { useEffect, useState } from "react";
import Select from "react-select";
import {
  ProductSizeSettingAPI,
  ProductAPI,
  UnitSizeAPI,
  UnitAPI,
  CategoryAPI
} from "../../../api/products";
import { CompanyAPI } from "../../../api/company";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

export default function ProductSizeSettingForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const [form, setForm] = useState({
    company_id: "",
    business_type_id: "",
    factory_id: "",
    product_id: "",
    unit_id: "",
    size_id: "",
    category_id: "",
    customize_name: "",
    code: ""
  });

  const [categories, setCategories] = useState([]);

  const [products, setProducts] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [units, setUnits] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  // Load all dropdowns initially
  useEffect(() => {
    ProductAPI.list().then(setProducts);
    UnitSizeAPI.list().then(setSizes);
    UnitAPI.list().then(setUnits);
    CompanyAPI.list().then(setCompanies);
    CategoryAPI.list().then(setCategories); // ✅ Always load categories
  }, []);

  // Load data if edit mode
  useEffect(() => {
    if (!id) return;

    UnitAPI.list().then(setUnits);
    CategoryAPI.list().then(setCategories);

    ProductSizeSettingAPI.retrieve(id).then((data) => {
      setForm({
        company_id: data.company?.id || "",
        business_type_id: data.business_type?.id || "",
        factory_id: data.factory?.id || "",
        product_id: data.product?.id || "",
        unit_id: data.unit?.id || "",
        size_id: data.size?.id || "",
        category_id: data.category?.id || "",
        customize_name: data.customize_name || "",
        code: data.code || "",
      });

      if (data.company?.id) {
        CompanyAPI.details(data.company.id).then((details) => {
          setBusinessTypes(details.business_types || []);
          setFactories(details.factories || []);
        });
      }
    });
  }, [id]);

  // Company change → load business types and factories
  const handleCompanyChange = async (opt) => {
    const companyId = opt ? opt.value : null;
    setForm({
      ...form,
      company_id: companyId,
      business_type_id: "",
      factory_id: "",
    });
    setBusinessTypes([]);
    setFactories([]);

    if (!companyId) return;
    const details = await CompanyAPI.details(companyId);
    setBusinessTypes(details.business_types || []);
    setFactories(details.factories || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await ProductSizeSettingAPI.update(id, form);
        Swal.fire("Updated!", "Product size setting updated successfully", "success");
      } else {
        await ProductSizeSettingAPI.create(form);
        Swal.fire("Created!", "Product size setting created successfully", "success");
      }
      nav("/admin/product-size-settings");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save product size setting", "error");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5 className="mb-0">{id ? "Edit Product Size Setting" : "Create Product Size Setting"}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-3">

            {/* Company */}
            <div className="col-md-4">
              <label className="form-label">Company</label>
              <Select
                placeholder="Select Company"
                options={companies.map(c => ({ value: c.id, label: c.name }))}
                value={form.company_id ? { value: form.company_id, label: companies.find(c => c.id === form.company_id)?.name } : null}
                onChange={handleCompanyChange}
                isClearable
              />
            </div>

            {/* Business Type */}
            <div className="col-md-4">
              <label className="form-label">Business Type</label>
              <Select
                placeholder="Select Business Type"
                options={businessTypes.map(b => ({ value: b.id, label: b.name }))}
                value={form.business_type_id ? { value: form.business_type_id, label: businessTypes.find(b => b.id === form.business_type_id)?.name } : null}
                onChange={opt => setForm({ ...form, business_type_id: opt ? opt.value : "" })}
                isClearable
              />
            </div>

            {/* Factory */}
            <div className="col-md-4">
              <label className="form-label">Factory</label>
              <Select
                placeholder="Select Factory"
                options={factories.map(f => ({ value: f.id, label: f.name }))}
                value={form.factory_id ? { value: form.factory_id, label: factories.find(f => f.id === form.factory_id)?.name } : null}
                onChange={opt => setForm({ ...form, factory_id: opt ? opt.value : "" })}
                isClearable
              />
            </div>

            {/* Product */}
            <div className="col-md-4">
              <label className="form-label">Product</label>
              <select
                className="form-select"
                value={form.product_id}
                onChange={(e) => setForm({ ...form, product_id: e.target.value })}
                required
              >
                <option value="">-- Select Product --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            {/* ✅ Category */}
            <div className="col-md-4 mb-3">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category_id || ""}
                onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
              >
                <option value="">-- Select Category --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Unit */}
            <div className="col-md-4">
              <label className="form-label">Unit</label>
              <select
                className="form-select"
                value={form.unit_id}
                onChange={(e) => setForm({ ...form, unit_id: e.target.value })}
                required
              >
                <option value="">-- Select Unit --</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.short_name})</option>)}
              </select>
            </div>

            {/* Size */}
            <div className="col-md-4">
              <label className="form-label">Size</label>
              <select
                className="form-select"
                value={form.size_id}
                onChange={(e) => setForm({ ...form, size_id: e.target.value })}
                required
              >
                <option value="">-- Select Size --</option>
                {sizes.map(s => <option key={s.id} value={s.id}>{s.size_name}</option>)}
              </select>
            </div>

            {/* Customize Name */}
            <div className="col-md-6">
              <label className="form-label">Custom Name</label>
              <input
                type="text"
                className="form-control"
                value={form.customize_name}
                onChange={(e) => setForm({ ...form, customize_name: e.target.value })}
              />
            </div>
            {/* Customize Name */}
            <div className="col-md-6">
              <label className="form-label">Code</label>
              <input
                type="number"
                className="form-control"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>

            <div className="col-12 d-flex justify-content-end gap-2 mt-3">
              <button type="submit" className="btn btn-primary">{id ? "Update" : "Save"}</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
