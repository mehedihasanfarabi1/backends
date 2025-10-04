import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { generalSettingsApi } from "../../../api/essentialSettingsApi";
import { FactoryAPI } from "../../../api/company";

export default function GeneralSettingEditForm() {
  const nav = useNavigate();
  const { id } = useParams(); // Edit করার জন্য id
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

  // Load existing general setting
  useEffect(() => {
    const loadSetting = async () => {
      try {
        const data = await generalSettingsApi.retrieve(id);
        setForm({
          factory_id: data.factory?.id || "",
          author: data.author || "",
          author_email: data.author_email || "",
          author_phone: data.author_phone || "",
          author_mobile: data.author_mobile || "",
          author_address: data.author_address || "",
          title: data.title || "",
          description: data.description || "",
          address: data.address || "",
          contact: data.contact || "",
          other_contacts: data.other_contacts || "",
          tag: data.tag || "",
          loan_payment_form: data.loan_payment_form || "Multiple",
          loan_receive_form: data.loan_receive_form || "Single",
          delivery_form: data.delivery_form || "Single",
          sendmail: data.sendmail || false,
          sendsms: data.sendsms || false,
          page_size: data.page_size || 20,
          currency: data.currency || "",
          theme: data.theme || "",
          language: data.language || "",
          timezone: data.timezone || "",
          favicon: data.favicon || "",
          logo: data.logo || "",
          screen_saver: data.screen_saver || "",
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load general setting", "error");
      }
    };
    if (id) loadSetting();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.factory_id) {
      Swal.fire("Error", "Please select a Factory", "error");
      return;
    }
    try {
      await generalSettingsApi.update(id, {
        ...form,
        factory_id: parseInt(form.factory_id),
      });
      Swal.fire("Success", "General Setting updated!", "success");
      nav("/admin/general-settings");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update setting", "error");
    }
  };

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
            <option value="">Select</option>
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
          <h6 className="mb-0">Edit General Setting</h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
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
            </div>

            <div className="text-center mt-3">
              <button type="submit" className="btn btn-success btn-sm px-3">
                Update
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
