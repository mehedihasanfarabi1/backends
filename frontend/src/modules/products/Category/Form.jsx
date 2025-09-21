import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CategoryAPI, ProductTypeAPI } from "../../../api/products";
import { CompanyAPI } from "../../../api/company";
import UserCompanySelector from "../../../components/UserCompanySelector";
import Swal from "sweetalert2";
import "../../../styles/Table.css";

export default function CategoryForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    company_id: "",
    business_type_id: "",
    factory_id: "",
    product_type_id: "",
  });

  const [companies, setCompanies] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);
  const [types, setTypes] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);

  // Load companies initially
  useEffect(() => {
    CompanyAPI.list()
      .then(setCompanies)
      .catch((err) => console.error("Error loading companies:", err));
  }, []);

  // Load business types + factories + product types when company changes
  useEffect(() => {
    if (selectedCompany) {
      CompanyAPI.details(selectedCompany)
        .then((details) => {
          setBusinessTypes(details.business_types || []);
          setFactories(details.factories || []);
        })
        .catch((err) => console.error("Error loading company details:", err));

      ProductTypeAPI.list({ company: selectedCompany })
        .then(setTypes)
        .catch((err) => console.error("Error loading product types:", err));
    } else {
      setBusinessTypes([]);
      setFactories([]);
      setTypes([]);
      setForm((prev) => ({
        ...prev,
        business_type_id: "",
        factory_id: "",
        product_type_id: "",
      }));
      setSelectedBusiness(null);
      setSelectedFactory(null);
    }
  }, [selectedCompany]);

  // Load category if editing
  useEffect(() => {
    if (id) {
      CategoryAPI.retrieve(id).then((data) => {
        setForm({
          name: data.name,
          description: data.description || "",
          company_id: data.company?.id || "",
          business_type_id: data.business_type?.id || "",
          factory_id: data.factory?.id || "",
          product_type_id: data.product_type?.id || "",
        });

        setSelectedCompany(data.company?.id || null);
        setSelectedBusiness(data.business_type?.id || null);
        setSelectedFactory(data.factory?.id || null);
      });
    }
  }, [id]);

  // Sync form when select changes
  useEffect(() => setForm((f) => ({ ...f, company_id: selectedCompany })), [selectedCompany]);
  useEffect(() => setForm((f) => ({ ...f, business_type_id: selectedBusiness })), [selectedBusiness]);
  useEffect(() => setForm((f) => ({ ...f, factory_id: selectedFactory })), [selectedFactory]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.company_id) return Swal.fire("Error", "Select a company", "error");
    if (!form.product_type_id) return Swal.fire("Error", "Select a product type", "error");

    try {
      if (id) await CategoryAPI.update(id, form);
      else await CategoryAPI.create(form);
      Swal.fire("Success!", "Category saved.", "success");
      nav("/admin/categories");
    } catch (err) {
      console.error(err.response?.data || err);
      Swal.fire("Error", "Failed to save category", "error");
    }
  };

  return (
    <div className="container mt-3">
      <div className="card shadow-sm">
        <div className="card-header bg-info text-white">
          <h5>{id ? "Edit Category" : "Create Category"}</h5>
        </div>
        <div className="card-body">
          <form className="row g-3" onSubmit={onSubmit}>

            {/* Company / Business Type / Factory Selector */}
            <UserCompanySelector
              selectedUser={selectedUser} setSelectedUser={setSelectedUser}
              selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}
              selectedBusiness={selectedBusiness} setSelectedBusiness={setSelectedBusiness}
              selectedFactory={selectedFactory} setSelectedFactory={setSelectedFactory}
              setBusinessTypes={setBusinessTypes} setFactories={setFactories}
            />

            {/* Product Type */}
            <div className="col-md-6">
              <label className="form-label">Product Type *</label>
              <select
                className="form-select"
                value={form.product_type_id}
                onChange={(e) => setForm({ ...form, product_type_id: e.target.value ? parseInt(e.target.value) : "" })}
                disabled={!selectedCompany}
                required
              >
                <option value="">-- Select Product Type --</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Category Name */}
            <div className="col-md-6">
              <label className="form-label">Category Name *</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                rows={3}
                className="form-control"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            {/* Actions */}
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
