import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {  transactionSettingsApi } from "../../../api/essentialSettingsApi";
import {  FactoryAPI } from "../../../api/company";
import Swal from "sweetalert2";

export default function TransactionSettingCreateForm() {

  const nav = useNavigate();
  const [factories, setFactories] = useState([]);
  const [form, setForm] = useState({
    factory_id: "",
    session: "",
    party_transaction: "Yes",
    advance_carrying_payment: "Yes",
    advance_carrying_receive: "Yes",
    advance_carrying_interest_receive: "No",
    advance_ebag_amount_receive: "Yes",
    advance_ebag_amount_interest_receive: "No",
    advance_loan_payment: "Yes",
    advance_loan_receive: "Yes",
    advance_loan_interest_receive: "Yes",
    sr_carrying_payment: "Yes",
    sr_carrying_receive: "Yes",
    sr_carrying_interest_receive: "No",
    sr_ebag_amount_payment: "Yes",
    sr_ebag_amount_receive: "Yes",
    sr_ebag_amount_interest_receive: "No",
    sr_loan_payment: "Yes",
    sr_loan_receive: "Yes",
    sr_loan_interest_receive: "Yes",
    delivery_transaction: "Yes",
  });

  const [errors, setErrors] = useState({});

  const requiredFields = [
    "factory_id",
    "session",
  ];

  // Load factories
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    let tempErrors = {};
    let hasError = false;

    // Validation for required fields
    for (let field of requiredFields) {
      if (!form[field]) {
        tempErrors[field] = true;
        toast.error(`Field "${field.replace(/_/g, " ")}" is required`);
        hasError = true;
      } else {
        tempErrors[field] = false;
      }
    }

    setErrors(tempErrors);
    if (hasError) return;

    // Submit form
    try {
      await transactionSettingsApi.create({
        ...form,
        factory_id: parseInt(form.factory_id),
      });
      toast.success("Transaction Setting saved!");
      Swal.fire("Success", "Transaction Setting saved!", "success");
      nav("/admin/transaction-settings");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save Transaction Setting");
    }
  };

  const renderInput = (label, name, type = "text", extra = {}) => {
    const isRequired = requiredFields.includes(name);
    const hasError = errors[name];

    if (type === "select")
      return (
        <div className="col-md-4 mb-2">
          <label className="form-label">{label} {isRequired && <span className="text-danger">*</span>}</label>
          <select
            className={`form-select form-select-sm ${hasError ? "is-invalid" : ""}`}
            value={form[name]}
            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
            {...extra}
          >
            <option value="">Select</option>
            {extra.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>
      );

    return (
      <div className="col-md-4 mb-2">
        <label className="form-label">{label} {isRequired && <span className="text-danger">*</span>}</label>
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
          <h6 className="mb-0">Create Transaction Setting</h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {renderInput("Factory", "factory_id", "select", { options: factories.map(f => ({ value: f.id, label: f.name })) })}
              {renderInput("Session", "session", "select", { options: [{value:"2025",label:"2025"},{value:"2026",label:"2026"},{value:"2027",label:"2027"}] })}
              {renderInput("Party Transaction", "party_transaction", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}

              {renderInput("Advance Carrying Payment", "advance_carrying_payment", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}
              {renderInput("Advance Carrying Receive", "advance_carrying_receive", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}
              {renderInput("Advance Carrying Interest Receive", "advance_carrying_interest_receive", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}

              {renderInput("Advance E-Bag Amount Receive", "advance_ebag_amount_receive", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}
              {renderInput("Advance E-Bag Amount Interest Receive", "advance_ebag_amount_interest_receive", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}
              {renderInput("Advance Loan Payment", "advance_loan_payment", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}

              {renderInput("Advance Loan Receive", "advance_loan_receive", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}
              {renderInput("Advance Loan Interest Receive", "advance_loan_interest_receive", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}
              {renderInput("SR Carrying Payment", "sr_carrying_payment", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}

              {renderInput("SR Carrying Receive", "sr_carrying_receive", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}
              {renderInput("SR Carrying Interest Receive", "sr_carrying_interest_receive", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}
              {renderInput("SR E-Bag Amount Payment", "sr_ebag_amount_payment", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}

              {renderInput("SR E-Bag Amount Receive", "sr_ebag_amount_receive", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}
              {renderInput("SR E-Bag Amount Interest Receive", "sr_ebag_amount_interest_receive", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}
              {renderInput("SR Loan Payment", "sr_loan_payment", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}

              {renderInput("SR Loan Receive", "sr_loan_receive", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}
              {renderInput("SR Loan Interest Receive", "sr_loan_interest_receive", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}
              {renderInput("Delivery Transaction", "delivery_transaction", "select", { options: [{value:"Yes", label:"Yes"}, {value:"No", label:"No"}] })}

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
