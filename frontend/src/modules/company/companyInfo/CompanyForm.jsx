import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CompanyAPI } from "../../../api/company";
import Swal from "sweetalert2";

export default function CompanyForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    code: "",
    email: "",
    phone: "",
    address: "",
    description: "",
    website: "",
    proprietor_name: "",
    is_active: true,
  });

  const load = () => {
    if (isEdit) {
      CompanyAPI.get(id).then((data) => setForm(data));
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await CompanyAPI.update(id, form);
        Swal.fire("Updated!", "Company updated successfully.", "success");
      } else {
        await CompanyAPI.create(form);
        Swal.fire("Created!", "Company created successfully.", "success");
      }
      nav("/admin/companies");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="container mt-3">
      <h3>{isEdit ? "Edit Company" : "Create Company"}</h3>
      <form className="row g-3" onSubmit={onSubmit}>
        <div className="col-md-6">
          <label className="form-label">Name *</label>
          <input
            type="text"
            className="form-control"
            name="name"
            value={form.name}
            onChange={onChange}
            required
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Code</label>
          <input
            type="text"
            className="form-control"
            name="code"
            value={form.code || ""}
            onChange={onChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            name="email"
            value={form.email || ""}
            onChange={onChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Phone</label>
          <input
            type="text"
            className="form-control"
            name="phone"
            value={form.phone || ""}
            onChange={onChange}
          />
        </div>

        <div className="col-md-12">
          <label className="form-label">Address</label>
          <textarea
            className="form-control"
            name="address"
            value={form.address || ""}
            onChange={onChange}
          />
        </div>

        <div className="col-md-12">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            name="description"
            value={form.description || ""}
            onChange={onChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Website</label>
          <input
            type="url"
            className="form-control"
            name="website"
            value={form.website || ""}
            onChange={onChange}
          />
        </div>

        <div className="col-md-6">
          <label className="form-label">Proprietor Name</label>
          <input
            type="text"
            className="form-control"
            name="proprietor_name"
            value={form.proprietor_name || ""}
            onChange={onChange}
          />
        </div>

        <div className="col-md-12">
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              name="is_active"
              checked={form.is_active}
              onChange={onChange}
            />
            <label className="form-check-label">Is Active?</label>
          </div>
        </div>

        <div className="col-12">
          <button type="submit" className="btn btn-primary me-2">
            {isEdit ? "Update" : "Create"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => nav("/admin/companies")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
