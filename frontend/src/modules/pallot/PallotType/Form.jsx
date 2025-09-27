import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PallotAPI } from "../../../api/pallotApi";
import { CompanyAPI } from "../../../api/company";
import Swal from "sweetalert2";

export default function PallotTypeForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    company_id: "",
  });

  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const data = await CompanyAPI.list();
        setCompanies(data);
      } catch (err) {
        console.error("Error loading companies:", err);
        Swal.fire("Error", "Failed to load companies", "error");
      }
    };

    const loadPallotType = async () => {
      if (!id) return;
      try {
        const data = await PallotAPI.retrieve(id);
        setForm({
          name: data.name,
          company_id: data.company?.id || "",
        });
      } catch (err) {
        console.error("Error loading pallot type:", err);
        Swal.fire("Error", "Failed to load pallot type", "error");
      }
    };

    Promise.all([loadCompanies(), loadPallotType()]).finally(() =>
      setLoading(false)
    );
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_id) {
      return Swal.fire("Warning", "Select a company first", "warning");
    }

    try {
      if (id) await PallotAPI.update(id, form);
      else await PallotAPI.create(form);
      Swal.fire("Success", "Pallot type saved successfully!", "success");
      nav("/admin/pallet");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save pallot type", "error");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <div className="card shadow-sm">
        <div className="card-header bg-success text-white">
          <h5>{id ? "Edit Pallot Type" : "Create Pallot Type"}</h5>
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
                  setForm({ ...form, company_id: e.target.value })
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

            {/* Name */}
            <div className="mb-3">
              <label className="form-label">Pallot Type Name *</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-success">
                Save
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
