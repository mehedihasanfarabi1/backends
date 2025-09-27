import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ChamberAPI } from "../../../api/pallotApi";
import { CompanyAPI } from "../../../api/company";

export default function ChamberForm() {
  const nav = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    company_id: "",
    names: ["", "", "", ""], // 4 inputs for bulk create
  });

  // Load Companies for dropdown
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await CompanyAPI.list();
        setCompanies(data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load companies", "error");
      } finally {
        setLoading(false);
      }
    };
    loadCompanies();
  }, []);

  const handleInputChange = (index, value) => {
    const newNames = [...form.names];
    newNames[index] = value;
    setForm({ ...form, names: newNames });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.company_id)
      return Swal.fire("Warning", "Select a company first", "warning");

    const namesToCreate = form.names.filter((n) => n.trim() !== "");
    if (namesToCreate.length === 0)
      return Swal.fire("Warning", "Enter at least one chamber name", "warning");

    try {
      await ChamberAPI.create({ names: namesToCreate, company_id: form.company_id });
      Swal.fire("Success", "Chambers created successfully!", "success");
      nav("/admin/pallet_location");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create chambers", "error");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5>Create Chambers</h5>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            {/* Company Select */}
            <div className="mb-3">
              <label className="form-label">Company *</label>
              <select
                className="form-select"
                value={form.company_id}
                onChange={(e) => setForm({ ...form, company_id: e.target.value })}
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

            {/* Chamber Name Inputs */}
            {form.names.map((name, i) => (
              <div className="mb-3" key={i}>
                <label className="form-label">Chamber Name {i + 1}</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                />
              </div>
            ))}

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-primary">
                Create Chambers
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
