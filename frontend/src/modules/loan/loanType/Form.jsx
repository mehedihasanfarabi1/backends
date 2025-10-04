import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loanTypeApi } from "../../../api/loanApi";
import { FactoryAPI } from "../../../api/company";
import { accountHeadApi } from "../../../api/accountsApi";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function LoanTypeCreate() {
  const nav = useNavigate();

  const [factories, setFactories] = useState([]);
  const [heads, setHeads] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    session: "",
    branch_id: "",
    head_id: "",
    has_interest: 1, // default Yes
    interest_rate: "",
    interest_start_date: null,
    interest_end_date: null,
    is_default: 0,
    _key: "",
  });

  useEffect(() => {
    const loadFactories = async () => {
      try {
        const data = await FactoryAPI.list(); // API to get factories
        setFactories(data);
      } catch (err) {
        console.error(err);
      }
    };
    const loadHeads = async () => {
      try {
        const data = await accountHeadApi.list(); // API to get heads
        setHeads(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadFactories();
    loadHeads();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "has_interest" || name === "is_default" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name) return Swal.fire("Error", "Loan Type Name is required", "error");
    if (!formData.session) return Swal.fire("Error", "Session is required", "error");
    if (!formData.branch_id) return Swal.fire("Error", "Branch is required", "error");
    if (!formData.head_id) return Swal.fire("Error", "Account Head is required", "error");

    if (formData.has_interest === 1) {
      if (!formData.interest_rate) return Swal.fire("Error", "Interest Rate required", "error");
      if (!formData.interest_start_date) return Swal.fire("Error", "Start Date required", "error");
      if (!formData.interest_end_date) return Swal.fire("Error", "End Date required", "error");
      if (formData.interest_start_date > formData.interest_end_date) {
        return Swal.fire("Error", "Start Date cannot be after End Date", "error");
      }
    }

    try {
      const payload = {
        ...formData,
        interest_rate: formData.has_interest ? formData.interest_rate : null,
        interest_start_date:
          formData.has_interest && formData.interest_start_date
            ? formData.interest_start_date.toISOString().split("T")[0]
            : null,
        interest_end_date:
          formData.has_interest && formData.interest_end_date
            ? formData.interest_end_date.toISOString().split("T")[0]
            : null,
      };
      await loanTypeApi.create(payload);
      Swal.fire("Success", "Loan Type Created", "success");
      nav("/admin/loan-types");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save", "error");
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white text-center">
          <h5 className="mb-0">Create Loan Type</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              {/* Loan Type Name */}
              <div className="col-md-6">
                <label className="form-label">Loan Type Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="Enter loan type"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Session */}
              <div className="col-md-6">
                <label className="form-label">Session *</label>
                <select
                  name="session"
                  className="form-select"
                  value={formData.session}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Session</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              {/* Branch / Factory */}
              <div className="col-md-6">
                <label className="form-label">Branch / Factory *</label>
                <select
                  name="branch_id"
                  className="form-select"
                  value={formData.branch_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Branch</option>
                  {factories.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Account Head */}
              <div className="col-md-6">
                <label className="form-label">Account Head *</label>
                <select
                  name="head_id"
                  className="form-select"
                  value={formData.head_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Head</option>
                  {heads.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Has Interest */}
              <div className="col-md-6">
                <label className="form-label">Has Interest</label>
                <div className="d-flex gap-3 mt-1">
                  <div className="form-check">
                    <input
                      type="radio"
                      name="has_interest"
                      value={1}
                      checked={formData.has_interest === 1}
                      onChange={handleChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Yes</label>
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      name="has_interest"
                      value={0}
                      checked={formData.has_interest === 0}
                      onChange={handleChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">No</label>
                  </div>
                </div>
              </div>

              {/* Interest Rate */}
              <div className="col-md-6">
                <label className="form-label">Interest Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  name="interest_rate"
                  className="form-control"
                  placeholder="Enter rate"
                  value={formData.interest_rate}
                  onChange={handleChange}
                  disabled={formData.has_interest === 0}
                />
              </div>

              {/* Interest Start Date */}
              <div className="col-md-6">
                <label className="form-label">Interest Start Date</label>
                <DatePicker
                  selected={formData.interest_start_date}
                  onChange={(date) => setFormData({ ...formData, interest_start_date: date })}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select start date"
                  disabled={formData.has_interest === 0}
                />
              </div>

              {/* Interest End Date */}
              <div className="col-md-6">
                <label className="form-label">Interest End Date</label>
                <DatePicker
                  selected={formData.interest_end_date}
                  onChange={(date) => setFormData({ ...formData, interest_end_date: date })}
                  className="form-control"
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select end date"
                  disabled={formData.has_interest === 0}
                />
              </div>

              {/* Is Default */}
              <div className="col-md-6">
                <label className="form-label">Default Loan Type</label>
                <div className="d-flex gap-3 mt-1">
                  <div className="form-check">
                    <input
                      type="radio"
                      name="is_default"
                      value={1}
                      checked={formData.is_default === 1}
                      onChange={handleChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">Yes</label>
                  </div>
                  <div className="form-check">
                    <input
                      type="radio"
                      name="is_default"
                      value={0}
                      checked={formData.is_default === 0}
                      onChange={handleChange}
                      className="form-check-input"
                    />
                    <label className="form-check-label">No</label>
                  </div>
                </div>
              </div>

              {/* Key */}
              <div className="col-md-6">
                <label className="form-label">Key</label>
                <input
                  type="text"
                  name="_key"
                  className="form-control"
                  placeholder="Optional key"
                  value={formData._key}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-4 d-flex justify-content-between">
              <button type="button" className="btn btn-secondary" onClick={() => nav("/admin/loan-types")}>
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
