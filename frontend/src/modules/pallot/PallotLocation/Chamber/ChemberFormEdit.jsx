import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { ChamberAPI } from "../../../../api/pallotApi";
import { CompanyAPI } from "../../../../api/company";

export default function ChamberEditForm() {
  const nav = useNavigate();
  const { id } = useParams(); // chamber id
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    company: "", // backend expects "company"
    name: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load companies first
        const companyData = await CompanyAPI.list();
        setCompanies(companyData);

        // Then load chamber if edit mode
        if (id) {
          const chamber = await ChamberAPI.get(id);

          // Only set form after companies loaded
          setForm({
            company: String(chamber.company_id),
            name: chamber.name || "",
          });
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.company)
      return Swal.fire("Warning", "Select a company first", "warning");
    if (!form.name.trim())
      return Swal.fire("Warning", "Chamber name cannot be empty", "warning");

    try {
      await ChamberAPI.update(id, {
        name: form.name,
        company: Number(form.company),
      });
      Swal.fire("Success", "Chamber updated successfully!", "success");
      nav("/admin/pallet_location");
    } catch (err) {
      console.error(err.response?.data || err);
      Swal.fire("Error", "Failed to update chamber", "error");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5>Edit Chamber</h5>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="mb-3">
              <label className="form-label">Company *</label>
              <select
                className="form-select"
                value={form.company}
                onChange={(e) =>
                  setForm({ ...form, company: e.target.value })
                }
                required
              >
                <option value="">-- Select Company --</option>
                {companies.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Chamber Name</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-primary">
                Update Chamber
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => nav(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
