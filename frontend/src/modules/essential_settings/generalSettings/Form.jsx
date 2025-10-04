import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { generalSettingsApi } from "../../../api/essentialSettingsApi";
import { FactoryAPI } from "../../../api/company";

export default function GeneralSettingCreateForm() {
  const nav = useNavigate();
  const [factories, setFactories] = useState([]);
  const [form, setForm] = useState({
    factory_id: "",
    author: "",
    author_email: "",
    author_phone: "",
    author_mobile: "",
    author_address: "",
    title: "",
    description: "",
    address: "",
    contact: "",
    other_contacts: "",
    tag: "",
    loan_payment_form: "Multiple",
    loan_receive_form: "Single",
    delivery_form: "Single",
    sendmail: false,
    sendsms: false,
    page_size: 20,
    currency: "",
    theme: "",
    language: "",
    timezone: "",
    favicon: "",
    logo: "",
    screen_saver: "",

  });

  // Load factories
  useEffect(() => {
    const loadFactories = async () => {
      try {
        const data = await FactoryAPI.list();
        setFactories(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadFactories();
  }, []);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.factory_id) {
      Swal.fire("Error", "Please select a Factory", "error");
      return;
    }
    try {
      await generalSettingsApi.create({
        ...form,
        factory_id: parseInt(form.factory_id), // ensure integer
      });
      Swal.fire("Success", "General Setting saved!", "success");
      nav("/admin/general-settings");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save setting", "error");
    }
  };

  // Render input (supports text, email, number, textarea, select, checkbox)
  const renderInput = (label, name, type = "text", extra = {}) => {
    if (type === "textarea")
      return (
        <div className="col-md-4 mb-2">
          <label className="form-label" style={{ fontSize: "0.85rem" }}>{label}</label>
          <textarea
            className="form-control form-control-sm"
            value={form[name]}
            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
            {...extra}
          />
        </div>
      );

    if (type === "select")
      return (
        <div className="col-md-4 mb-2">
          <label className="form-label" style={{ fontSize: "0.85rem" }}>{label}</label>
          
          <select
            className="form-select form-select-sm"
            value={form[name]}
            onChange={(e) => setForm({ ...form, [name]: e.target.value })}
            {...extra}
          >
            <option>Select </option>
            {extra.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );

    if (type === "checkbox")
      return (
        <div className="col-md-4 d-flex align-items-center mb-2">
          <input
            type="checkbox"
            className="form-check-input me-2"
            checked={form[name]}
            onChange={(e) => setForm({ ...form, [name]: e.target.checked })}
          />
          <label className="form-label mb-0" style={{ fontSize: "0.85rem" }}>{label}</label>
        </div>
      );

    return (
      <div className="col-md-4 mb-2">
        <label className="form-label" style={{ fontSize: "0.85rem" }}>{label}</label>
        <input
          type={type}
          className="form-control form-control-sm"
          value={form[name]}
          onChange={(e) => setForm({ ...form, [name]: e.target.value })}
          {...extra}
        />
      </div>
    );
  };

  return (
    <div className="container my-3">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white py-2">
          <h6 className="mb-0">Create General Setting</h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Row with 3 fields */}
              {renderInput("Factory", "factory_id", "select", { options: factories.map(f => ({ value: f.id, label: f.name })) })}
              {renderInput("Author", "author")}
              {renderInput("Author Email", "author_email", "email")}

              {renderInput("Author Phone", "author_phone")}
              {renderInput("Author Mobile", "author_mobile")}
              {renderInput("Author Address", "author_address", "textarea")}

              {renderInput("Title", "title")}
              {renderInput("Description", "description", "textarea")}
              {renderInput("Address", "address", "textarea")}

              {renderInput("Contact", "contact", "textarea")}
              {renderInput("Other Contacts", "other_contacts", "textarea")}
              {renderInput("Tag", "tag")}

              {renderInput("Loan Payment Form", "loan_payment_form", "select", {
                options: [
                  { value: "Single", label: "Single" },
                  { value: "Multiple", label: "Multiple" }
                ]
              })}
              {renderInput("Loan Receive Form", "loan_receive_form", "select", {
                options: [
                  { value: "Single", label: "Single" },
                  { value: "Multiple", label: "Multiple" }
                ]
              })}
              {renderInput("Delivery Form", "delivery_form", "select", {
                options: [
                  { value: "Single", label: "Single" },
                  { value: "Multiple", label: "Multiple" }
                ]
              })}

              {renderInput("Send Mail", "sendmail", "checkbox")}
              {renderInput("Send SMS", "sendsms", "checkbox")}
              {renderInput("Page Size", "page_size", "number")}

              {renderInput("Currency", "currency")}
              {renderInput("Theme", "theme")}
              {renderInput("Language", "language")}

              {renderInput("Timezone", "timezone")}
              {renderInput("Favicon", "favicon")}
              {renderInput("Logo", "logo")}

              {renderInput("Screen Saver", "screen_saver")}
              {/* {renderInput("Key", "key")} */}
            </div>

            <div className="text-center mt-3">
              <button type="submit" className="btn btn-success btn-sm px-3">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
