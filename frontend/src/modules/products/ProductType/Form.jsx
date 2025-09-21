import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductTypeAPI } from "../../../api/products";
import { CompanyAPI } from "../../../api/company";
import UserCompanySelector from "../../../components/UserCompanySelector";
import Swal from "sweetalert2";

export default function PTForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    desc: "",
    company_id: "",
    business_type_id: "",
    factory_id: "",
  });

  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        if (id) {
          const data = await ProductTypeAPI.retrieve(id);
          setForm({
            name: data.name,
            desc: data.desc,
            company_id: data.company?.id || "",
            business_type_id: data.business_type?.id || "",
            factory_id: data.factory?.id || "",
          });

          setSelectedCompany(data.company?.id || null);
          setSelectedBusiness(data.business_type?.id || null);
          setSelectedFactory(data.factory?.id || null);

          if (data.company?.id) {
            const details = await CompanyAPI.details(data.company.id);
            setBusinessTypes(details.business_types || []);
            setFactories(details.factories || []);
          }
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load data", "error");
      }
    };
    loadData();
  }, [id]);

  // Update form when selects change
  useEffect(() => setForm(f => ({ ...f, company_id: selectedCompany })), [selectedCompany]);
  useEffect(() => setForm(f => ({ ...f, business_type_id: selectedBusiness })), [selectedBusiness]);
  useEffect(() => setForm(f => ({ ...f, factory_id: selectedFactory })), [selectedFactory]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) await ProductTypeAPI.update(id, form);
      else await ProductTypeAPI.create(form);
      Swal.fire("Success!", "Product type saved.", "success");
      nav("/admin/product-types");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-info text-white">
          <h5>{id ? "Edit Product Type" : "Create Product Type"}</h5>
        </div>
        <div className="card-body">
          <form className="row g-3" onSubmit={onSubmit}>

            <UserCompanySelector
              selectedUser={selectedUser} setSelectedUser={setSelectedUser}
              selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}
              selectedBusiness={selectedBusiness} setSelectedBusiness={setSelectedBusiness}
              selectedFactory={selectedFactory} setSelectedFactory={setSelectedFactory}
              setBusinessTypes={setBusinessTypes}
              setFactories={setFactories}
            />

            <div className="col-md-6">
              <label className="form-label">Product Type Name *</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="col-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
              />
            </div>

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
