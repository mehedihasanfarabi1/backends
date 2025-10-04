import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { basicSettingsApi } from "../../../api/essentialSettingsApi";
import { FactoryAPI } from "../../../api/company";
import Swal from "sweetalert2";
export default function BasicSettingCreateForm() {
  const nav = useNavigate();
  const [factories, setFactories] = useState([]);
  const [form, setForm] = useState({
    factory_id: "",
    session: "",
    interest_rate: "",
    period: "",
    min_day: "",
    empty_bag_price: "",
    max_loan_per_qty: "",
    max_rent_per_qty: "",
    max_rent_per_kg: "",
    fan_charge: "",
    labour_charge: "",
    labour_charge_per_kg: "",
    agent_commission: "",
    ebag_count: "No",
    carrying_count: "No",
    carrying_interest_rate: "",
    interest_start_date: "",
    transaction_date: "",
    delivery_type: "bag",
    less_weight: "",
    delivery_commission_rate: "",
    value_mode: "floor",
    monthly_interest: "",
    loantype_interest: "",
  });

  const [errors, setErrors] = useState({});

  const requiredFields = [
    "factory_id",
    "session",
    "interest_rate",
    "period",
    "min_day",
    "empty_bag_price",
    "fan_charge",
    "labour_charge",
    "labour_charge_per_kg",
    "agent_commission",
    "carrying_interest_rate",
    "max_loan_per_qty",
    "max_rent_per_qty",
    "max_rent_per_kg",
    "less_weight",
    "delivery_commission_rate",
  ];

  useEffect(() => {
    const loadFactories = async () => {
      try {
        const data = await FactoryAPI.list();
        setFactories(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load factories!");
      }
    };
    loadFactories();
  }, []);

  const isValidNumber = (value) => !isNaN(parseFloat(value)) && isFinite(value);
  const isValidDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let tempErrors = {};
    let hasError = false;

    // Validation
    for (let field of requiredFields) {
      if (!form[field]) {
        tempErrors[field] = true;
        toast.error(`Field "${field.replace(/_/g, " ")}" is required`);
        hasError = true;
      } else {
        tempErrors[field] = false;
      }
      if (
        [
          "session",
          "period",
          "min_day",
          "empty_bag_price",
          "fan_charge",
          "labour_charge",
          "labour_charge_per_kg",
          "agent_commission",
          "carrying_interest_rate",
          "max_loan_per_qty",
          "max_rent_per_qty",
          "max_rent_per_kg",
          "less_weight",
          "delivery_commission_rate",
          "interest_rate",
        ].includes(field)
      ) {
        if (!isValidNumber(form[field])) {
          tempErrors[field] = true;
          toast.error(`Field "${field.replace(/_/g, " ")}" must be a valid number`);
          hasError = true;
        }
      }
    }

    if (form.interest_start_date && !isValidDate(form.interest_start_date)) {
      tempErrors["interest_start_date"] = true;
      toast.error("Interest Start Date must be in YYYY-MM-DD format");
      hasError = true;
    }

    if (form.transaction_date && !isValidDate(form.transaction_date)) {
      tempErrors["transaction_date"] = true;
      toast.error("Transaction Date must be in YYYY-MM-DD format");
      hasError = true;
    }

    setErrors(tempErrors);
    if (hasError) return;

    // Submit form
    try {
      await basicSettingsApi.create({
        ...form,
        factory_id: parseInt(form.factory_id),
      });
      toast.success("Basic Setting saved!");
      Swal.fire("Success", "Basic Setting saved!", "success");
      nav("/admin/basic-settings");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save setting");
    }
  };

  const renderInput = (label, name, type = "text", extra = {}) => {
    const isRequired = requiredFields.includes(name);
    const hasError = errors[name];

    if (type === "textarea")
      return (
        <div className="col-md-4 mb-2">
          <label className="form-label">
            {label} {isRequired && <span className="text-danger">*</span>}
          </label>
          <textarea
            className={`form-control form-control-sm ${hasError ? "is-invalid" : ""}`}
            value={form[name]}
            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
            {...extra}
          />
        </div>
      );

    if (type === "select")
      return (
        <div className="col-md-4 mb-2">
          <label className="form-label">
            {label} {isRequired && <span className="text-danger">*</span>}
          </label>
          <select
            className={`form-select form-select-sm ${hasError ? "is-invalid" : ""}`}
            value={form[name]}
            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
            {...extra}
          >
            <option value="">Select</option>
            {extra.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    return (
      <div className="col-md-4 mb-2">
        <label className="form-label">
          {label} {isRequired && <span className="text-danger">*</span>}
        </label>
        <input
          type={type}
          className={`form-control form-control-sm ${hasError ? "is-invalid" : ""}`}
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          {...extra}
        />
      </div>
    );
  };

  return (
    <div className="container my-3">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white py-2">
          <h6 className="mb-0">Create Basic Setting</h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {renderInput("Factory", "factory_id", "select", { options: factories.map(f => ({ value: f.id, label: f.name })) })}
              {renderInput(
                "Session",
                "session",
                "select",
                { options: [{ value: "2025", label: "2025" }, { value: "2026", label: "2026" }, { value: "2027", label: "2027" }] }
              )}
              {renderInput("Interest Rate (%)", "interest_rate", "number")}
              {renderInput("Period", "period", "number")}
              {renderInput("Min Day", "min_day", "number")}
              {renderInput("Empty Bag Price", "empty_bag_price", "number")}
              {renderInput("Max Loan per Qty", "max_loan_per_qty", "number")}
              {renderInput("Max Rent per Qty", "max_rent_per_qty", "number")}
              {renderInput("Max Rent per Kg", "max_rent_per_kg", "number")}
              {renderInput("Fan Charge", "fan_charge", "number")}
              {renderInput("Labour Charge", "labour_charge", "number")}
              {renderInput("Labour Charge per Kg", "labour_charge_per_kg", "number")}
              {renderInput("Agent Commission", "agent_commission", "number")}
              {renderInput("E-Bag Count", "ebag_count", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}
              {renderInput("Carrying Count", "carrying_count", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}
              {renderInput("Carrying Interest Rate", "carrying_interest_rate", "number")}
              {renderInput("Interest Start Date", "interest_start_date", "date")}
              {renderInput("Transaction Date", "transaction_date", "date")}
              {renderInput("Delivery Type", "delivery_type")}
              {renderInput("Less Weight", "less_weight", "number")}
              {renderInput("Delivery Commission Rate", "delivery_commission_rate", "number")}
              {renderInput("Value Mode", "value_mode")}
              {renderInput("Monthly Interest", "monthly_interest", "textarea")}
              {renderInput("Loan Type Interest", "loantype_interest", "textarea")}
            </div>
            <div className="text-center mt-3">
              <button type="submit" className="btn btn-success btn-sm px-3">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
