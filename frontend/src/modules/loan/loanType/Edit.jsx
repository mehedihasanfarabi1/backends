import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loanTypeApi } from "../../../api/loanApi";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function LoanTypeEdit() {
  const { id } = useParams(); // get loan type id from route
  const nav = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    has_interest: 1, // default Yes
    interest_rate: "",
    interest_start_date: null,
    interest_end_date: null,
  });

  const [loading, setLoading] = useState(true);

  // Load existing loan type
  const loadLoanType = async () => {
    try {
      const data = await loanTypeApi.retrieve(id); // ✅ res.data already extracted
      setFormData({
        name: data.name || "",
        has_interest: data.has_interest ? 1 : 0,
        interest_rate: data.interest_rate || "",
        interest_start_date: data.interest_start_date
          ? new Date(data.interest_start_date)
          : null,
        interest_end_date: data.interest_end_date
          ? new Date(data.interest_end_date)
          : null,
      });
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to load Loan Type", "error");
      // nav("/admin/loan-types");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadLoanType();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "has_interest" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      formData.has_interest === 1 &&
      formData.interest_start_date &&
      formData.interest_end_date &&
      formData.interest_start_date > formData.interest_end_date
    ) {
      return Swal.fire("Error", "Start Date cannot be after End Date", "error");
    }

    try {
      const payload = {
        ...formData,
        has_interest: Number(formData.has_interest),
        interest_rate: formData.has_interest === 1 ? formData.interest_rate : null,
        interest_start_date:
          formData.has_interest === 1 && formData.interest_start_date
            ? formData.interest_start_date.toISOString().split("T")[0]
            : null,
        interest_end_date:
          formData.has_interest === 1 && formData.interest_end_date
            ? formData.interest_end_date.toISOString().split("T")[0]
            : null,
      };

      await loanTypeApi.update(id, payload);
      Swal.fire("Success", "Loan Type Updated", "success");
      nav("/admin/loan-types");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update", "error");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4 d-flex justify-content-center">
      <div className="card shadow-sm" style={{ width: "350px" }}>
        <div className="card-header bg-primary text-white text-center">
          <h5 className="mb-0">Edit Loan Type</h5>
        </div>
        <div className="card-body">
          <form
            onSubmit={handleSubmit}
            className="d-flex flex-column align-items-center"
          >
            {/* Loan Type Name */}
            <div className="mb-3" style={{ width: "250px" }}>
              <label className="form-label">Loan Type Name</label>
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

            {/* Has Interest */}
            <div className="mb-3" style={{ width: "250px" }}>
              <label className="form-label">Has Interest</label>
              <div className="d-flex justify-content-between">
                <div className="form-check">
                  <input
                    type="radio"
                    id="hasYes"
                    name="has_interest"
                    value="1"
                    checked={formData.has_interest === 1}
                    onChange={handleChange}
                    className="form-check-input"
                  />
                  <label htmlFor="hasYes" className="form-check-label">
                    Yes
                  </label>
                </div>
                <div className="form-check">
                  <input
                    type="radio"
                    id="hasNo"
                    name="has_interest"
                    value="0"
                    checked={formData.has_interest === 0}
                    onChange={handleChange}
                    className="form-check-input"
                  />
                  <label htmlFor="hasNo" className="form-check-label">
                    No
                  </label>
                </div>
              </div>
            </div>

            {/* Interest Rate */}
            <div className="mb-3" style={{ width: "250px" }}>
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

            {/* Start Date */}
            <div className="mb-3" style={{ width: "250px" }}>
              <label className="form-label">Interest Start Date</label>
              <DatePicker
                selected={formData.interest_start_date}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, interest_start_date: date }))
                }
                className="form-control"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select start date"
                disabled={formData.has_interest === 0}
              />
            </div>

            {/* End Date */}
            <div className="mb-3" style={{ width: "250px" }}>
              <label className="form-label">Interest End Date</label>
              <DatePicker
                selected={formData.interest_end_date}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, interest_end_date: date }))
                }
                className="form-control"
                dateFormat="yyyy-MM-dd"
                placeholderText="Select end date"
                disabled={formData.has_interest === 0}
              />
            </div>

            {/* Buttons */}
            <div
              className="mt-3 d-flex justify-content-between"
              style={{ width: "250px" }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => nav("/admin/loan-types")}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
