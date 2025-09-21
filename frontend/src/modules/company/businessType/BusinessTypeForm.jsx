import { useEffect, useState } from "react";
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
        company_id: form.company || null, // backend এ company_id লাগবে
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
    <div className="container mt-3">
      <h3>{isEdit ? "Edit Business Type" : "Create Business Type"}</h3>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="form-label">Company *</label>
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

        <div className="mb-3">
          <label className="form-label">Business Type Name *</label>
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
          <label className="form-label">Short Name *</label>
          <input
            type="text"
            className="form-control"
            name="short_name"
            value={form.short_name}
            onChange={onChange}
            required
          />
        </div>

        <button className="btn btn-primary me-2" type="submit">
          {isEdit ? "Update" : "Create"}
        </button>
        <button
          className="btn btn-secondary"
          type="button"
          onClick={() => nav("/admin/business-types")}
        >
          Cancel
        </button>
      </form>
    </div>
  );
}
