import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { SRAPI } from "../../../api/srApi";
import { PartyAPI } from "../../../api/partyType";
import { ProductTypeAPI } from "../../../api/products";

export default function SRForm() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    sr_no: "",
    party_id: "",
    customer_name: "",
    father_name: "",
    village: "",
    post: "",
    thana: "",
    zila: "",
    mobile: "",
    nid: "",
    product_type_id: "",
    bag_type: "",
    lot_number: "",
    submitted_bag_quantity: 0,
    bag_rent: 0,
    total_rent: 0,
    labour_charge: 0,
    grand_total: 0,
  });

  const [parties, setParties] = useState([]);
  const [products, setProducts] = useState([]);

  // 🔹 Load Parties + Product Types + Next SR No
  useEffect(() => {
    const loadData = async () => {
      try {
        const [partyData, productData, nextSR] = await Promise.all([
          PartyAPI.list(),
          ProductTypeAPI.list(),
          SRAPI.nextSRNo(),
        ]);
        setParties(partyData);
        setProducts(productData);
        setForm((prev) => ({
          ...prev,
          sr_no: nextSR?.sr_no || "",
          lot_number: `${nextSR?.sr_no || ""}/0`,
        }));
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load data", "error");
      }
    };
    loadData();
  }, []);

  // 🔹 Party select করলে auto fill (Right Column only)
  const handlePartyChange = async (partyId) => {
    try {
      const data = await PartyAPI.retrieve(partyId);
      setForm((prev) => ({
        ...prev,
        party_id: partyId,
        // শুধু Right Column এ auto-fill
        customer_name_right: data.name || "",
        father_name_right: data.father_name || "",
        village_right: data.village || "",
        post_right: data.post || "",
        thana_right: data.thana || "",
        zila_right: data.zila || "",
        mobile_right: data.mobile || "",
        nid_right: data.nid || "",
      }));
    } catch (err) {
      console.error(err);
    }
  };

  // 🔹 Auto calculation
  useEffect(() => {
    const qty = parseFloat(form.submitted_bag_quantity) || 0;
    const rent = parseFloat(form.bag_rent) || 0;

    const total_rent = qty * rent;
    const labour_charge = qty * 25;
    const grand_total = total_rent + labour_charge;

    // Lot Number auto-update
    const lot_number = `${form.sr_no}/${qty}`;

    setForm((prev) => ({
      ...prev,
      total_rent,
      labour_charge,
      grand_total,
      lot_number,
    }));
  }, [form.submitted_bag_quantity, form.bag_rent, form.sr_no]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await SRAPI.create(form);
      Swal.fire("Success", "SR Created successfully!", "success");
      nav("/admin/sr");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save SR", "error");
    }
  };

  const field = (label, name, type = "text", readOnly = false, onChangeOverride) => (
    <div className="mb-2 d-flex align-items-center">
      <label style={{ width: "40%", fontSize: "0.85rem" }}>{label}</label>
      <input
        type={type}
        className="form-control form-control-sm"
        style={{ width: "60%", fontSize: "0.85rem" }}
        value={form[name] || ""}
        onChange={onChangeOverride ? onChangeOverride : (e) => setForm({ ...form, [name]: e.target.value })}
        readOnly={readOnly}
      />
    </div>
  );

  return (
    <div className="container my-3">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white py-2">
          <h6 className="mb-0">Enter SR Information</h6>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="row">
              {/* Left Column (Manual Input) */}
              <div className="col-md-4">
                {field("Date", "date", "date")}
                {field("SR No", "sr_no", "number")}
                <div className="mb-2 d-flex align-items-center">
                  <label style={{ width: "40%", fontSize: "0.85rem" }}>Agent</label>
                  <select
                    className="form-select form-select-sm"
                    value={form.party_id}
                    onChange={(e) => handlePartyChange(e.target.value)}
                    style={{ width: "60%" }}
                  >
                    <option value="">Select</option>
                    {parties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
                {field("Customer Name", "customer_name")}
                {field("Father Name", "father_name")}
                {field("Village", "village")}
                {field("Post", "post")}
                {field("Thana", "thana")}
                {field("Zila", "zila")}
                {field("Mobile", "mobile")}
                {field("NID", "nid")}
              </div>

              {/* Middle Column (Manual Input) */}
              <div className="col-md-4">
                <div className="mb-2 d-flex align-items-center">
                  <label style={{ width: "40%", fontSize: "0.85rem" }}>Product Category</label>
                  <select
                    className="form-select form-select-sm"
                    value={form.product_type_id}
                    onChange={(e) => setForm({ ...form, product_type_id: e.target.value })}
                    style={{ width: "60%" }}
                  >
                    <option value="">N/A</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                {field("Bag Type", "bag_type")}
                {field("Lot Number", "lot_number", "text", true)}
                {field("Submitted Bag Quantity", "submitted_bag_quantity", "number")}
                {field("Bag Rent", "bag_rent", "number")}
                {field("Total Rent", "total_rent", "number", true)}
                {field("Labour Charge", "labour_charge", "number", true)}
                {field("Grand Total", "grand_total", "number", true)}
              </div>

              {/* Right Column (Readonly Auto-fill) */}
              <div className="col-md-4 bg-light rounded p-2">
                <h6 className="text-center">Auto Filled Info</h6>
                {field("Agent Name", "customer_name_right", "text", true)}
                {field("Father Name", "father_name_right", "text", true)}
                {field("Village", "village_right", "text", true)}
                {field("Post", "post_right", "text", true)}
                {field("Thana", "thana_right", "text", true)}
                {field("Zila", "zila_right", "text", true)}
                {field("Mobile", "mobile_right", "text", true)}
                {field("NID", "nid_right", "text", true)}
                {field("Booking Bag", "submitted_bag_quantity", "number", true)}
                {field("Grand Total", "grand_total", "number", true)}
                {field("Lot Number", "lot_number", "text", true)}
              </div>
            </div>

            <div className="text-center mt-3">
              <button type="submit" className="btn btn-success btn-sm px-3">
                Save And Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
