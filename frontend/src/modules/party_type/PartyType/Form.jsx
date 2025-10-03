import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PartyTypeAPI } from "../../../api/partyType";
import { CompanyAPI } from "../../../api/company";
import Swal from "sweetalert2";
import useFastData from "../../../hooks/useFetch";

export default function PartyTypeForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    description: "",
    company_id: "",
  });

  // =========================
  // Fetch companies (fast + cached)
  // =========================
  const { data: companies = [], isLoading: loadingCompanies } = useFastData({
    key: "companies",
    apiFn: CompanyAPI.list,
  });

  // =========================
  // Fetch partyType if editing
  // =========================
  const { data: partyTypeData = {}, isLoading: loadingPartyType } = useFastData({
    key: id ? ["partyType", id] : null,
    apiFn: () => PartyTypeAPI.retrieve(id),
    enabled: !!id,
  });

  useEffect(() => {
    if (partyTypeData && id) {
      setForm({
        name: partyTypeData.name || "",
        description: partyTypeData.description || "",
        company_id: partyTypeData.company?.id || "",
      });
    }
  }, [partyTypeData, id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.company_id) {
      return Swal.fire("Warning", "Select a company first", "warning");
    }

    try {
      if (id) await PartyTypeAPI.update(id, form);
      else await PartyTypeAPI.create(form);
      Swal.fire("Success", "Party type saved successfully!", "success");

      // ✅ Optional: invalidate company/partyType cache if needed
      nav("/admin/party-types");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save party type", "error");
    }
  };

  if (loadingCompanies || loadingPartyType)
    return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5>{id ? "Edit Party Type" : "Create Party Type"}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
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

            <div className="mb-3">
              <label className="form-label">Party Type Name *</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-primary">
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
