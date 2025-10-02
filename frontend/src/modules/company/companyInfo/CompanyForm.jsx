import React, { useEffect, useState } from "react";
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
    telephone:"",
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
    <div className="container mt-4 d-flex justify-content-center">
      <div className="card shadow-sm p-4" style={{ maxWidth: "650px", width: "100%" }}>
        <h3 className="mb-4 text-center text-primary fw-bold">
          {isEdit ? "Edit Company" : "Create Company"}
        </h3>

        <form className="row g-3" onSubmit={onSubmit}>
          {/* Row 1 */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Name *</label>
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
            <label className="form-label fw-semibold">Code</label>
            <input
              type="text"
              className="form-control"
              name="code"
              value={form.code || ""}
              onChange={onChange}
            />
          </div>

          {/* Row 2 */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={form.email || ""}
              onChange={onChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Phone</label>
            <input
              type="text"
              className="form-control"
              name="phone"
              value={form.phone || ""}
              onChange={onChange}
            />
          </div>

          {/* Row 3 */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Address</label>
            <textarea
              className="form-control"
              name="address"
              rows="2"
              value={form.address || ""}
              onChange={onChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Description</label>
            <textarea
              className="form-control"
              name="description"
              rows="2"
              value={form.description || ""}
              onChange={onChange}
            />
          </div>

          {/* Row 4 */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Website</label>
            <input
              type="url"
              className="form-control"
              name="website"
              value={form.website || ""}
              onChange={onChange}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-semibold">Proprietor Name</label>
            <input
              type="text"
              className="form-control"
              name="proprietor_name"
              value={form.proprietor_name || ""}
              onChange={onChange}
            />
          </div>


          <div className="col-md-6">
            <label className="form-label fw-semibold">Telephone</label>
            <input
              type="text"
              className="form-control"
              name="telephone"
              value={form.telephone || ""}
              onChange={onChange}
            />
          </div>

          {/* Row 5 */}
          <div className="col-md-6 d-flex align-items-center">
            <input
              type="checkbox"
              className="form-check-input me-2"
              name="is_active"
              checked={form.is_active}
              onChange={onChange}
              id="is_active"
            />
            <label className="form-check-label fw-semibold" htmlFor="is_active">
              Is Active?
            </label>
          </div>

          {/* Buttons */}
          <div className="col-12 text-center mt-3">
            <button type="submit" className="btn btn-primary px-4 me-2">
              {isEdit ? "Update" : "Create"}
            </button>
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={() => nav("/admin/companies")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
