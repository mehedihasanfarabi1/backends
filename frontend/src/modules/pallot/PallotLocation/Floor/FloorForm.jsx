import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ChamberAPI, FloorAPI } from "../../../../api/pallotApi";
import { CompanyAPI } from "../../../../api/company";

export default function FloorForm() {
  const nav = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [chambers, setChambers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    company_id: "",
    chamber_id: "",
    floors: ["", "", "", ""], // 4 inputs for bulk create
  });

  // Load companies on mount
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

  // Load chambers when company changes
  useEffect(() => {
    if (!form.company_id) return setChambers([]);
    const loadChambers = async () => {
      try {
        const data = await ChamberAPI.list({ company_id: form.company_id });
        setChambers(data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load chambers", "error");
      }
    };
    loadChambers();
  }, [form.company_id]);

  const handleInputChange = (index, value) => {
    const newFloors = [...form.floors];
    newFloors[index] = value;
    setForm({ ...form, floors: newFloors });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.company_id)
      return Swal.fire("Warning", "Select a company first", "warning");
    if (!form.chamber_id)
      return Swal.fire("Warning", "Select a chamber first", "warning");

    const floorsToCreate = form.floors.filter((f) => f.trim() !== "");
    if (!floorsToCreate.length)
      return Swal.fire("Warning", "Enter at least one floor name", "warning");

    try {
      await FloorAPI.create({
        chamber_id: form.chamber_id,
        floors: floorsToCreate.map((name) => ({ name })),
      });
      Swal.fire("Success", "Floors created successfully!", "success");
      nav("/admin/pallet_location");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create floors", "error");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5>Create Floors</h5>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            {/* Company */}
            <div className="mb-3">
              <label className="form-label">Company *</label>
              <select
                className="form-select"
                value={form.company_id}
                onChange={(e) =>
                  setForm({ ...form, company_id: e.target.value, chamber_id: "" })
                }
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

            {/* Chamber */}
            <div className="mb-3">
              <label className="form-label">Chamber *</label>
              <select
                className="form-select"
                value={form.chamber_id}
                onChange={(e) => setForm({ ...form, chamber_id: e.target.value })}
                required
                disabled={!chambers.length}
              >
                <option value="">-- Select Chamber --</option>
                {chambers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Floor Inputs */}
            {form.floors.map((f, i) => (
              <div className="mb-3" key={i}>
                <label className="form-label">Floor Name {i + 1}</label>
                <input
                  type="text"
                  className="form-control"
                  value={f}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                />
              </div>
            ))}

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-primary">
                Create Floors
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
