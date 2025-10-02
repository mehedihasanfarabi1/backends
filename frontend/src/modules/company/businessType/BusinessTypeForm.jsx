import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BusinessTypeAPI, CompanyAPI } from "../../../api/company";
import Swal from "sweetalert2";

export default function BusinessTypeForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    name: "",
    short_name: "",
    company: "",
  });
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    CompanyAPI.list().then(setCompanies);

    if (isEdit) {
      BusinessTypeAPI.get(id).then((data) => {
        setForm({
          name: data.name,
          short_name: data.short_name || "",
          company: data.company?.id || "",
        });
      });
    }
  }, [id, isEdit]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: form.name,
        short_name: form.short_name,
        company_id: form.company || null,
      };

      if (isEdit) {
        await BusinessTypeAPI.update(id, payload);
        Swal.fire("Updated!", "Business Type updated.", "success");
      } else {
        await BusinessTypeAPI.create(payload);
        Swal.fire("Created!", "Business Type created.", "success");
      }
      nav("/admin/business-types");
    } catch (err) {
      Swal.fire("Error", err.message, "error");
    }
  };

  return (
    <div className="container mt-4 d-flex justify-content-center">
      <div
        className="card shadow-sm p-4"
        style={{ maxWidth: "650px", width: "100%" }}
      >
        <h3 className="mb-4 text-center text-primary fw-bold">
          {isEdit ? "Edit Business Type" : "Create Business Type"}
        </h3>

        <form className="row g-3" onSubmit={onSubmit}>
          {/* Company Dropdown */}
          <div className="col-md-12">
            <label className="form-label fw-semibold">Company *</label>
            <select
              className="form-select"
              name="company"
              value={form.company}
              onChange={onChange}
              required
            >
              <option value="">-- Select Company --</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Business Type Name */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Business Type Name *</label>
            <input
              type="text"
              className="form-control"
              name="name"
              value={form.name}
              onChange={onChange}
              required
            />
          </div>

          {/* Short Name */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Short Name *</label>
            <input
              type="text"
              className="form-control"
              name="short_name"
              value={form.short_name}
              onChange={onChange}
              required
            />
          </div>

          {/* Buttons */}
          <div className="col-12 text-center mt-3">
            <button type="submit" className="btn btn-primary px-4 me-2">
              {isEdit ? "Update" : "Create"}
            </button>
            <button
              type="button"
              className="btn btn-secondary px-4"
              onClick={() => nav("/admin/business-types")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
