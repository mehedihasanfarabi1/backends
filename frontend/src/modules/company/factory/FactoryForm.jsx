import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FactoryAPI, CompanyAPI, BusinessTypeAPI } from "../../../api/company";
import Swal from "sweetalert2";

export default function FactoryForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = Boolean(id);

  const [companies, setCompanies] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);

  const [form, setForm] = useState({
    company_id: "",
    business_type_id: "",
    name: "",
    short_name: "",
    address: "",
    is_active: true,
  });

  useEffect(() => {
    CompanyAPI.list().then(setCompanies);
    BusinessTypeAPI.list().then(setBusinessTypes);

    if (isEdit) {
      FactoryAPI.get(id).then((data) =>
        setForm({
          company: data.company?.id || "",
          business_type: data.business_type?.id || "",
          name: data.name || "",
          short_name: data.short_name || "",
          address: data.address || "",
          is_active: data.is_active,
        })
      );
    }
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        short_name: form.short_name || "",
        address: form.address || "",
        is_active: form.is_active,
        company_id: form.company || null,       // <- এখানে company_id
        business_type_id: form.business_type || null, // <- এখানে business_type_id
      };


      if (isEdit) {
        await FactoryAPI.update(id, payload);
        Swal.fire("Updated!", "Factory updated.", "success");
      } else {
        await FactoryAPI.create(payload);
        Swal.fire("Created!", "Factory created.", "success");
      }
      nav("/admin/factories");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="container mt-3">
      <h3>{isEdit ? "Edit Factory" : "Create Factory"}</h3>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Company</label>
          <select
            className="form-select"
            name="company"
            value={form.company}
            onChange={onChange}
          >
            <option value="">-- Select Company --</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Business Type</label>
          <select
            className="form-select"
            name="business_type"
            value={form.business_type}
            onChange={onChange}
          >
            <option value="">-- Select Business Type --</option>
            {businessTypes.map((bt) => (
              <option key={bt.id} value={bt.id}>
                {bt.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Factory Name *</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={form.name}
            onChange={onChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Short Name</label>
          <input
            type="text"
            className="form-control"
            name="short_name"
            value={form.short_name}
            onChange={onChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Address</label>
          <textarea
            className="form-control"
            name="address"
            value={form.address}
            onChange={onChange}
          />
        </div>

        <div className="form-check mb-3">
          <input
            type="checkbox"
            className="form-check-input"
            name="is_active"
            checked={form.is_active}
            onChange={onChange}
          />
          <label className="form-check-label">Active</label>
        </div>

        <button className="btn btn-primary me-2">{isEdit ? "Update" : "Create"}</button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => nav("/admin/factories")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
