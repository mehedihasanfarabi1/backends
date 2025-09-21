import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductAPI, ProductTypeAPI, CategoryAPI } from "../../../api/products";
import { CompanyAPI } from "../../../api/company";
import "../../../styles/Table.css";

export default function ItemForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);
  const [types, setTypes] = useState([]);
  const [cats, setCats] = useState([]);

  const [form, setForm] = useState({
    company: "",
    business_type: "",
    factory: "",
    product_type: "",
    category: "",
    name: "",
    short_name: "",
    description: "",
  });

  // 🔹 Load companies
  useEffect(() => {
    CompanyAPI.list().then(setCompanies);
  }, []);

  // 🔹 Load business types & factories when company changes
  useEffect(() => {
    if (form.company) {
      CompanyAPI.details(form.company)
        .then((d) => {
          setBusinessTypes(d.business_types || []);
          setFactories(d.factories || []);
        })
        .catch(() => {
          setBusinessTypes([]);
          setFactories([]);
        });
    } else {
      setBusinessTypes([]);
      setFactories([]);
    }
    setForm((prev) => ({ ...prev, business_type: "", factory: "", product_type: "", category: "" }));
    setTypes([]);
    setCats([]);
  }, [form.company]);

  // 🔹 Load product types when company changes
  useEffect(() => {
    if (form.company) {
      ProductTypeAPI.list({ company: form.company }).then(setTypes);
    } else {
      setTypes([]);
    }
    setForm((prev) => ({ ...prev, product_type: "", category: "" }));
    setCats([]);
  }, [form.company]);

  // 🔹 Load categories when product type changes
  useEffect(() => {
    if (form.product_type) {
      CategoryAPI.list({ product_type: form.product_type }).then(setCats);
    } else {
      setCats([]);
    }
    setForm((prev) => ({ ...prev, category: "" }));
  }, [form.product_type]);

  // 🔹 Load existing product
  useEffect(() => {
    if (id) {
      ProductAPI.retrieve(id).then((d) => {
        setForm({
          company: d.company?.id || "",
          business_type: d.business_type?.id || "",
          factory: d.factory?.id || "",
          product_type: d.product_type?.id || "",
          category: d.category?.id || "",
          name: d.name || "",
          short_name: d.short_name || "",
          description: d.description || "",
        });
      });
    }
  }, [id]);

  // 🔹 Submit
  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      short_name: form.short_name,
      description: form.description,
      company_id: form.company || null,
      business_type_id: form.business_type || null,
      factory_id: form.factory || null,
      product_type_id: form.product_type || null,
      category_id: form.category || null,
    };

    try {
      if (id) await ProductAPI.update(id, payload);
      else await ProductAPI.create(payload);
      nav("/admin/products/");
    } catch (err) {
      console.error("Error saving product:", err.response?.data || err);
      alert("Failed to save product");
    }
  };

  return (
    <div className="container mt-3">
      <div className="custom-form">
        <h4>{id ? "Edit" : "Create"} Product</h4>
        <form onSubmit={onSubmit} noValidate>
          <div className="row g-3">

            {/* Company */}
            <div className="col-md-4">
              <label>Company</label>
              <select className="form-control" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })}>
                <option value="">-- select --</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Business Type */}
            <div className="col-md-4">
              <label>Business Type</label>
              <select className="form-control" value={form.business_type} onChange={(e) => setForm({ ...form, business_type: e.target.value })} disabled={!form.company}>
                <option value="">-- select --</option>
                {businessTypes.map(bt => <option key={bt.id} value={bt.id}>{bt.name}</option>)}
              </select>
            </div>

            {/* Factory */}
            <div className="col-md-4">
              <label>Factory</label>
              <select className="form-control" value={form.factory} onChange={(e) => setForm({ ...form, factory: e.target.value })} disabled={!form.company}>
                <option value="">-- select --</option>
                {factories.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            {/* Product Type */}
            <div className="col-md-6">
              <label>Product Type</label>
              <select className="form-control" value={form.product_type} onChange={(e) => setForm({ ...form, product_type: e.target.value })} disabled={!form.company}>
                <option value="">-- select --</option>
                {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>

            {/* Category */}
            <div className="col-md-6">
              <label>Category</label>
              <select className="form-control" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} disabled={!form.product_type}>
                <option value="">-- select --</option>
                {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Product Name */}
            <div className="col-md-6">
              <label>Product Name</label>
              <input className="form-control" type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>

            {/* Short Name */}
            <div className="col-md-6">
              <label>Short Name</label>
              <input className="form-control" type="text" value={form.short_name || ""} onChange={(e) => setForm({ ...form, short_name: e.target.value })} />
            </div>

            {/* Description */}
            <div className="col-12">
              <label>Description</label>
              <textarea className="form-control" rows={3} value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

          </div>

          <div className="actions mt-3">
            <button className="btn btn-primary">Save</button>
            <button className="btn btn-secondary" type="button" onClick={() => nav(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
