import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { ChamberAPI } from "../../../../api/pallotApi";
import { CompanyAPI } from "../../../../api/company";

export default function ChamberForm() {
  const nav = useNavigate();
  const { id } = useParams(); // chamber id for edit
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    company_id: "",
    names: ["", "", "", ""], // 4 inputs for bulk create
  });

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await CompanyAPI.list();
        setCompanies(data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load companies", "error");
      }
    };
    loadCompanies();
  }, []);

  // Load chamber data if edit mode
  useEffect(() => {
    if (!id) return;
    const loadChamber = async () => {
      try {
        const chamber = await ChamberAPI.get(id);
        setForm({
          company_id: chamber.company_id,
          names: [chamber.name, "", "", ""], // first input pre-filled
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load chamber", "error");
      } finally {
        setLoading(false);
      }
    };
    loadChamber();
  }, [id]);

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
      if (id) {
        // Edit mode: update first name only
        await ChamberAPI.update(id, { name: namesToCreate[0], company_id: form.company_id });
        Swal.fire("Success", "Chamber updated successfully!", "success");
      } else {
        // Create mode: bulk create
        await ChamberAPI.create({ names: namesToCreate, company_id: form.company_id });
        Swal.fire("Success", "Chambers created successfully!", "success");
      }
      nav("/admin/pallet_location");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save chamber", "error");
    }
  };

  // if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5>{id ? "Edit Chamber" : "Create Chambers"}</h5>
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
                <label className="form-label">{id ? "Chamber Name" : `Chamber Name ${i + 1}`}</label>
                <input
                  type="text"
                  className="form-control"
                  value={name}
                  onChange={(e) => handleInputChange(i, e.target.value)}
                  required={i === 0} // first input required
                />
              </div>
            ))}

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-primary">
                {id ? "Update Chamber" : "Create Chambers"}
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
