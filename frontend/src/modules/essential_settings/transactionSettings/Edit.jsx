import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { transactionSettingsApi } from "../../../api/essentialSettingsApi";
import {  FactoryAPI } from "../../../api/company";
import Swal from "sweetalert2";

export default function TransactionSettingEditForm() {
  const nav = useNavigate();
  const { id } = useParams();
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
    key: "",
  });

  const [errors, setErrors] = useState({});
  const requiredFields = ["factory_id", "session"];

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

  // Load existing TransactionSetting
  useEffect(() => {
    const loadTransaction = async () => {
      try {
        const data = await transactionSettingsApi.retrieve(id);
        setForm({
          factory_id: data.factory.id,
          session: data.session,
          party_transaction: data.party_transaction,
          advance_carrying_payment: data.advance_carrying_payment,
          advance_carrying_receive: data.advance_carrying_receive,
          advance_carrying_interest_receive: data.advance_carrying_interest_receive,
          advance_ebag_amount_receive: data.advance_ebag_amount_receive,
          advance_ebag_amount_interest_receive: data.advance_ebag_amount_interest_receive,
          advance_loan_payment: data.advance_loan_payment,
          advance_loan_receive: data.advance_loan_receive,
          advance_loan_interest_receive: data.advance_loan_interest_receive,
          sr_carrying_payment: data.sr_carrying_payment,
          sr_carrying_receive: data.sr_carrying_receive,
          sr_carrying_interest_receive: data.sr_carrying_interest_receive,
          sr_ebag_amount_payment: data.sr_ebag_amount_payment,
          sr_ebag_amount_receive: data.sr_ebag_amount_receive,
          sr_ebag_amount_interest_receive: data.sr_ebag_amount_interest_receive,
          sr_loan_payment: data.sr_loan_payment,
          sr_loan_receive: data.sr_loan_receive,
          sr_loan_interest_receive: data.sr_loan_interest_receive,
          delivery_transaction: data.delivery_transaction,
          key: data.key || "",
        });
      } catch (err) {
        console.error(err);
        toast.error("Failed to load transaction setting!");
      }
    };
    if (id) loadTransaction();
  }, [id]);

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
    }

    setErrors(tempErrors);
    if (hasError) return;

    // Submit form
    try {
      await transactionSettingsApi.update(id, {
        ...form,
        factory_id: parseInt(form.factory_id),
      });
      toast.success("Transaction Setting updated!");
      Swal.fire("Success", "Transaction Setting updated!", "success");
      nav("/admin/transaction-settings");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update transaction setting");
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
          <h6 className="mb-0">Edit Transaction Setting</h6>
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

              {renderInput("Key", "key")}
            </div>
            <div className="text-center mt-3">
              <button type="submit" className="btn btn-success btn-sm px-3">Update</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
