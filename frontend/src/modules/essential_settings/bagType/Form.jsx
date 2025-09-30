import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { bagTypeApi } from "../../../api/essentialSettingsApi";

export default function BagTypeCreate() {
  const nav = useNavigate();

  const [formData, setFormData] = useState({
    session: new Date().getFullYear(),
    name: "",
    per_bag_rent: "",
    per_kg_rent: "",
    agent_bag_rent: "",
    agent_kg_rent: "",
    party_bag_rent: "",
    party_kg_rent: "",
    per_bag_loan: "",
    empty_bag_rate: "",
    fan_charge: "",
    is_default: false,
    is_active: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        session: Number(formData.session),
        per_bag_rent: Number(formData.per_bag_rent || 0),
        per_kg_rent: Number(formData.per_kg_rent || 0),
        agent_bag_rent: Number(formData.agent_bag_rent || 0),
        agent_kg_rent: Number(formData.agent_kg_rent || 0),
        party_bag_rent: Number(formData.party_bag_rent || 0),
        party_kg_rent: Number(formData.party_kg_rent || 0),
        per_bag_loan: Number(formData.per_bag_loan || 0),
        empty_bag_rate: Number(formData.empty_bag_rate || 0),
        fan_charge: Number(formData.fan_charge || 0),
      };

      await bagTypeApi.create(payload);
      Swal.fire("Success", "Bag Type Created Successfully", "success");
      nav("/admin/bag-types");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to create Bag Type", "error");
    }
  };

  const years = Array.from({ length: 2 }, (_, i) => 2024 + i);

  return (
    <div className="container mt-4 d-flex justify-content-center" >
      <div className="card shadow-sm" style={{ width: "700px",}}>
        <div className="card-header bg-primary text-white text-center">
          <h5 className="mb-0">Create Bag Type</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Session</label>
                <select
                  name="session"
                  value={formData.session}
                  onChange={handleChange}
                  className="form-control"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter Bag Type Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Rent Fields */}
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Per Bag Rent</label>
                <input
                  type="number"
                  name="per_bag_rent"
                  className="form-control"
                  value={formData.per_bag_rent}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Per Kg Rent</label>
                <input
                  type="number"
                  name="per_kg_rent"
                  className="form-control"
                  value={formData.per_kg_rent}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Agent Bag Rent</label>
                <input
                  type="number"
                  name="agent_bag_rent"
                  className="form-control"
                  value={formData.agent_bag_rent}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Agent Kg Rent</label>
                <input
                  type="number"
                  name="agent_kg_rent"
                  className="form-control"
                  value={formData.agent_kg_rent}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Party Bag Rent</label>
                <input
                  type="number"
                  name="party_bag_rent"
                  className="form-control"
                  value={formData.party_bag_rent}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Party Kg Rent</label>
                <input
                  type="number"
                  name="party_kg_rent"
                  className="form-control"
                  value={formData.party_kg_rent}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Per Bag Loan</label>
                <input
                  type="number"
                  name="per_bag_loan"
                  className="form-control"
                  value={formData.per_bag_loan}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Empty Bag Rate</label>
                <input
                  type="number"
                  name="empty_bag_rate"
                  className="form-control"
                  value={formData.empty_bag_rate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label">Fan Charge</label>
                <input
                  type="number"
                  name="fan_charge"
                  className="form-control"
                  value={formData.fan_charge}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 d-flex align-items-center mt-4">
                <div className="form-check me-3">
                  <input
                    type="checkbox"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleChange}
                    className="form-check-input"
                  />
                  <label className="form-check-label">Is Default</label>
                </div>
                <div className="form-check">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="form-check-input"
                  />
                  <label className="form-check-label">Is Active</label>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-4 d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => nav("/admin/bag-types")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
