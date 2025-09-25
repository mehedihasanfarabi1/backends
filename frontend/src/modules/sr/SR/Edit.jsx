import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { SRAPI } from "../../../api/srApi";
import { PartyAPI } from "../../../api/partyType";
import { ProductTypeAPI } from "../../../api/products";

export default function SREditForm() {
  const { id } = useParams();
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
  const [partyData, setPartyData] = useState(null);

  // 🔹 Load parties, products and SR data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [partyList, productList, srData] = await Promise.all([
          PartyAPI.list(),
          ProductTypeAPI.list(),
          SRAPI.retrieve(id),
        ]);

        setParties(partyList);
        setProducts(productList);

        // Set SR data with correct ids for dropdowns
        setForm({
          ...srData,
          party_id: srData.party ? String(srData.party.id) : "",
          product_type_id: srData.product_type ? String(srData.product_type.id) : "",
          lot_number: `${srData.sr_no}/${srData.submitted_bag_quantity || 0}`,
        });

        // Load party data for right column
        if (srData.party?.id) {
          const pData = await PartyAPI.retrieve(srData.party.id);
          setPartyData(pData);
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load SR data", "error");
      }
    };
    loadData();
  }, [id]);

  // 🔹 Party select changes -> update right column
  const handlePartyChange = async (partyId) => {
    setForm((prev) => ({ ...prev, party_id: partyId }));
    if (partyId) {
      const data = await PartyAPI.retrieve(partyId);
      setPartyData(data);
    } else {
      setPartyData(null);
    }
  };

  // 🔹 Auto calculation & lot number
  useEffect(() => {
    const qty = parseFloat(form.submitted_bag_quantity) || 0;
    const rent = parseFloat(form.bag_rent) || 0;
    setForm((prev) => ({
      ...prev,
      total_rent: qty * rent,
      labour_charge: qty * 25,
      grand_total: qty * rent + qty * 25,
      lot_number: `${prev.sr_no}/${qty}`,
    }));
  }, [form.submitted_bag_quantity, form.bag_rent, form.sr_no]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await SRAPI.update(id, form);
      Swal.fire("Success", "SR updated successfully!", "success");
      nav("/admin/sr");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update SR", "error");
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

  const rightField = (label, value) => (
    <div className="mb-2 d-flex align-items-center">
      <label style={{ width: "40%", fontSize: "0.85rem" }}>{label}</label>
      <input
        type="text"
        className="form-control form-control-sm"
        style={{ width: "60%", fontSize: "0.85rem" }}
        value={value || ""}
        readOnly
      />
    </div>
  );

  return (
    <div className="container my-3">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white py-2">
          <h6 className="mb-0">Edit SR Information</h6>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <div className="row">
              {/* Left Column */}
              <div className="col-md-4">
                {field("Date", "date", "date")}
                {field("SR No", "sr_no", "number"
                  // , true
                )}
                <div className="mb-2 d-flex align-items-center">
                  <label style={{ width: "40%", fontSize: "0.85rem" }}>Agent</label>
                  <select
                    className="form-select form-select-sm"
                    value={form.party_id || ""}
                    onChange={(e) => handlePartyChange(e.target.value)}
                    style={{ width: "60%" }}
                  >
                    <option value="">Select</option>
                    {parties.map((p) => (
                      <option key={p.id} value={String(p.id)}>
                        {p.name}
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

              {/* Middle Column */}
              <div className="col-md-4">
                <div className="mb-2 d-flex align-items-center">
                  <label style={{ width: "40%", fontSize: "0.85rem" }}>Product Category</label>
                  <select
                    className="form-select form-select-sm"
                    value={form.product_type_id || ""}
                    onChange={(e) => setForm({ ...form, product_type_id: e.target.value })}
                    style={{ width: "60%" }}
                  >
                    <option value="">N/A</option>
                    {products.map((p) => (
                      <option key={p.id} value={String(p.id)}>
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

              {/* Right Column */}
              <div className="col-md-4 bg-light rounded p-2">
                <h6 className="text-center">Selected Party Info</h6>
                {rightField("Agent Name", partyData?.name)}
                {rightField("Father Name", partyData?.father_name)}
                {rightField("Village", partyData?.village)}
                {rightField("Post", partyData?.post)}
                {rightField("Thana", partyData?.thana)}
                {rightField("Zila", partyData?.zila)}
                {rightField("Mobile", partyData?.mobile)}
                {rightField("NID", partyData?.nid)}
              </div>
            </div>

            <div className="text-center mt-3">
              <button type="submit" className="btn btn-success btn-sm px-3">
                Update SR
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
