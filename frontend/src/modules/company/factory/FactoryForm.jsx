import React, { useEffect, useState } from "react";
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
    company: "",
    business_type: "",
    name: "",
    short_name: "",
    address: "",
    is_active: true,
  });

  // Load companies and edit data
  useEffect(() => {
    // Load all companies
    CompanyAPI.list().then(setCompanies);

    if (isEdit) {
      FactoryAPI.get(id).then((data) => {
        const selectedCompany = data.company?.id || "";
        setForm({
          company: selectedCompany,
          business_type: data.business_type?.id || "",
          name: data.name || "",
          short_name: data.short_name || "",
          address: data.address || "",
          is_active: data.is_active,
        });

        // Load business types for selected company in edit mode
        if (selectedCompany) {
          BusinessTypeAPI.list({ company_id: selectedCompany }).then(setBusinessTypes);
        }
      });
    }
  }, [id, isEdit]);

  // Company change handler
  const handleCompanyChange = (e) => {
    const companyId = e.target.value;
    setForm((prev) => ({
      ...prev,
      company: companyId,
      business_type: "", // clear previous selection
    }));

    if (companyId) {
      // Send company_id param
      BusinessTypeAPI.list({ company_id: companyId }).then(setBusinessTypes);
    } else {
      setBusinessTypes([]);
    }
  };


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
      const payload = {
        name: form.name,
        short_name: form.short_name || "",
        address: form.address || "",
        is_active: form.is_active,
        company_id: form.company || null,
        business_type_id: form.business_type || null,
      };

      if (isEdit) {
        await FactoryAPI.update(id, payload);
        Swal.fire("Updated!", "Factory updated successfully.", "success");
      } else {
        await FactoryAPI.create(payload);
        Swal.fire("Created!", "Factory created successfully.", "success");
      }
      nav("/admin/factories");
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
          {isEdit ? "Edit Factory" : "Create Factory"}
        </h3>

        <form className="row g-3" onSubmit={onSubmit}>
          {/* Company */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Company *</label>
            <select
              className="form-select"
              name="company"
              value={form.company}
              onChange={handleCompanyChange}
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

          {/* Business Type */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Business Type *</label>
            <select
              className="form-select"
              name="business_type"
              value={form.business_type}
              onChange={onChange}
              required
              disabled={!form.company} // Disabled until company selected
            >
              <option value="">-- Select Business Type --</option>
              {businessTypes.map((bt) => (
                <option key={bt.id} value={bt.id}>
                  {bt.name}
                </option>
              ))}
            </select>
          </div>

          {/* Factory Name */}
          <div className="col-md-6">
            <label className="form-label fw-semibold">Factory Name *</label>
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
            <label className="form-label fw-semibold">Short Name</label>
            <input
              type="text"
              className="form-control"
              name="short_name"
              value={form.short_name}
              onChange={onChange}
            />
          </div>

          {/* Address */}
          <div className="col-md-12">
            <label className="form-label fw-semibold">Address</label>
            <textarea
              className="form-control"
              name="address"
              rows="2"
              value={form.address}
              onChange={onChange}
            />
          </div>

          {/* Active Checkbox */}
          <div className="col-md-12 d-flex align-items-center">
            <input
              type="checkbox"
              className="form-check-input me-2"
              name="is_active"
              checked={form.is_active}
              onChange={onChange}
              id="is_active"
            />
            <label className="form-check-label fw-semibold" htmlFor="is_active">
              Active
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
              onClick={() => nav("/admin/factories")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
