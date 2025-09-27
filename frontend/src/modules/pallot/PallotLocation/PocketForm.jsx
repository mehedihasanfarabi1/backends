import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ChamberAPI, FloorAPI, PocketAPI } from "../../../api/pallotApi";
import { CompanyAPI } from "../../../api/company";

export default function PocketForm() {
  const nav = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [chambers, setChambers] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    company_id: "",
    chamber_id: "",
    floor_id: "",
    pockets: [
      { name: "", capacity: "" },
      { name: "", capacity: "" },
      { name: "", capacity: "" },
      { name: "", capacity: "" },
    ], // ৪টি row
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
    setForm({ ...form, chamber_id: "", floor_id: "" });
  }, [form.company_id]);

  // Load floors when chamber changes
  useEffect(() => {
    if (!form.chamber_id) return setFloors([]);
    const loadFloors = async () => {
      try {
        const data = await FloorAPI.list({ chamber_id: form.chamber_id });
        setFloors(data);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load floors", "error");
      }
    };
    loadFloors();
    setForm({ ...form, floor_id: "" });
  }, [form.chamber_id]);

  // Handle pocket name and capacity change
  const handlePocketChange = (index, field, value) => {
    const newPockets = [...form.pockets];
    newPockets[index][field] = value;
    setForm({ ...form, pockets: newPockets });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.company_id) return Swal.fire("Warning", "Select company", "warning");
    if (!form.chamber_id) return Swal.fire("Warning", "Select chamber", "warning");
    if (!form.floor_id) return Swal.fire("Warning", "Select floor", "warning");

    const pocketsToCreate = form.pockets.filter((p) => p.name.trim() !== "");
    if (!pocketsToCreate.length)
      return Swal.fire("Warning", "Enter at least one pocket name", "warning");

    try {
      await PocketAPI.create({
        chamber_id: form.chamber_id,
        floor_id: form.floor_id,
        pockets: pocketsToCreate.map((p) => ({
          name: p.name,
          capacity: Number(p.capacity) || 0, // capacity numeric
        })),
      });
      Swal.fire("Success", "Pockets created successfully!", "success");
      nav("/admin/pallet_location");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create pockets", "error");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: 700 }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5>Create Pockets</h5>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            {/* Company */}
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
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Chamber */}
            <div className="mb-3">
              <label className="form-label">Chamber *</label>
              <select
                className="form-select"
                value={form.chamber_id}
                onChange={(e) => setForm({ ...form, chamber_id: e.target.value, floor_id: "" })}
                required
                disabled={!chambers.length}
              >
                <option value="">-- Select Chamber --</option>
                {chambers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Floor */}
            <div className="mb-3">
              <label className="form-label">Floor *</label>
              <select
                className="form-select"
                value={form.floor_id}
                onChange={(e) => setForm({ ...form, floor_id: e.target.value })}
                required
                disabled={!floors.length}
              >
                <option value="">-- Select Floor --</option>
                {floors.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Pocket Inputs with capacity */}
            {form.pockets.map((p, i) => (
              <div className="row mb-2" key={i}>
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control"
                    placeholder={`Pocket Name ${i + 1}`}
                    value={p.name}
                    onChange={(e) => handlePocketChange(i, "name", e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Capacity"
                    value={p.capacity}
                    onChange={(e) => handlePocketChange(i, "capacity", e.target.value)}
                    min={0}
                  />
                </div>
              </div>
            ))}

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button type="submit" className="btn btn-primary">Create Pockets</button>
              <button type="button" className="btn btn-secondary" onClick={() => nav(-1)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
