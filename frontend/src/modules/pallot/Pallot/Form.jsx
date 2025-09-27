// src/pages/pallot/CreatePallotForm.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PallotAPI } from "../../../api/pallotApi";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";

export default function CreatePallotForm() {
  const nav = useNavigate();

  const emptyItems = Array.from({ length: 6 }, () => ({
    chamber: "",
    floor: "",
    pocket: "",
    quantity: "",
    checked: false,
  }));

  const [loading, setLoading] = useState(true);
  const [pallotTypes, setPallotTypes] = useState([]);
  const [chambers, setChambers] = useState([]);
  const [floors, setFloors] = useState([]);
  const [pockets, setPockets] = useState([]);
  const [nextPallotNumber, setNextPallotNumber] = useState(""); 

  const [form, setForm] = useState({
    pallot_type: "",
    pallot_date: new Date().toISOString().slice(0, 10),
    sr_number: "",
    sr_id: null,
    pallot_number: "",
    quantity: "",
    comment: "",
    items: emptyItems,
  });

  useEffect(() => {
    // load dropdowns
    const load = async () => {
      try {
        const [pt, ch, fl, pk] = await Promise.all([
          PallotAPI.listPallotTypes(),
          PallotAPI.listChambers(),
          PallotAPI.listFloors(),
          PallotAPI.listPockets(),
        ]);
        setPallotTypes(pt || []);
        setChambers(ch || []);
        setFloors(fl || []);
        setPockets(pk || []);
        // try get next pallot number if backend supports it
        try {
          const next = await PallotAPI.getNextPallotNumber();
          if (next && (next.next || next.pallot_number)) {
            setNextPallotNumber(next.next || next.pallot_number);
            setForm(prev => ({ ...prev, pallot_number: next.next || next.pallot_number }));
          }
        } catch (err) {
          // ignore if endpoint not available
        }
      } catch (err) {
        console.error("Error loading dropdowns:", err);
        Swal.fire("Error", "Failed to load initial data", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line
  }, []);

  const onSRSearch = async () => {
    const sr = form.sr_number?.trim();
    if (!sr) {
      Swal.fire("Warning", "SR Number লিখুন", "warning");
      return;
    }
    try {
      const data = await PallotAPI.getSR(sr);
      // ধরে নিচ্ছি backend থেকে { id, sr_number, available_quantity, ... } এভাবে আসে
      setForm(prev => ({
        ...prev,
        sr_id: data.id,
        sr_number: data.sr_number,
        quantity: data.available_quantity != null ? String(data.available_quantity) : prev.quantity,
      }));
      Swal.fire("Found", `SR পাওয়া গেছে — available: ${data.available_quantity}`, "success");
    } catch (err) {
      console.error(err);
      setForm(prev => ({ ...prev, sr_id: null }));
      Swal.fire("Not found", "SR পাওয়া যায়নি", "error");
    }
  };

  const updateItem = (idx, field, value) => {
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], [field]: value };
      return { ...prev, items };
    });
  };

  const toggleItemChecked = (idx) => {
    setForm(prev => {
      const items = [...prev.items];
      items[idx] = { ...items[idx], checked: !items[idx].checked };
      return { ...prev, items };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!form.pallot_type) return Swal.fire("Warning", "Pallot Type সিলেক্ট করুন", "warning");
    if (!form.quantity || Number(form.quantity) <= 0) return Swal.fire("Warning", "Quantity দিন", "warning");

    const itemsToSave = form.items
      .filter(it => it.chamber && it.floor && it.pocket && it.quantity)
      .map(it => ({
        chamber: it.chamber,
        floor: it.floor,
        pocket: it.pocket,
        quantity: Number(it.quantity),
      }));

    if (itemsToSave.length === 0) return Swal.fire("Warning", "কমপক্ষে একটি location row পূরণ করুন", "warning");

    // Example: ensure sum(items.quantity) <= form.quantity (optional rule)
    const sumItems = itemsToSave.reduce((s, it) => s + it.quantity, 0);
    if (sumItems > Number(form.quantity)) {
      const ok = await Swal.fire({
        title: "Warning",
        text: `Location গুলোতে মোট ${sumItems} বসেছে, কিন্তু Pallot Quantity ${form.quantity}. চলবে?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Save",
      });
      if (!ok.isConfirmed) return;
    }

    const payload = {
      pallot_type: form.pallot_type,
      pallot_date: form.pallot_date,
      sr: form.sr_id, // backend expects id (nullable)
      quantity: Number(form.quantity),
      comment: form.comment,
      items: itemsToSave,
    };

    try {
      setLoading(true);
      const res = await PallotAPI.createPallot(payload);
      Swal.fire("Success", "Pallot সফলভাবে তৈরি হয়েছে", "success");
      // আপনি চাইলে নেভিগেট করে list page-এ নিয়ে যেতে পারেন
      nav("/pallots"); // adjust route as needed
    } catch (err) {
      console.error("Create error:", err);
      Swal.fire("Error", "Pallot তৈরি করতে ব্যর্থ", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container-fluid mt-3">
      <h3 className="text-center mb-3">Pallot Information</h3>
      <form onSubmit={onSubmit}>
        <div className="row">
          {/* LEFT SIDE */}
          <div className="col-md-6">
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Pallot Type</label>
                <select
                  className="form-select"
                  value={form.pallot_type}
                  onChange={(e) => setForm(prev => ({ ...prev, pallot_type: e.target.value }))}
                >
                  <option value="">Select</option>
                  {pallotTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Pallot Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.pallot_date}
                  onChange={(e) => setForm(prev => ({ ...prev, pallot_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Pallot Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.pallot_number || nextPallotNumber || "auto"}
                  readOnly
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-bold">Quantity *</label>
                <input
                  type="number"
                  min="0"
                  className="form-control"
                  value={form.quantity}
                  onChange={(e) => setForm(prev => ({ ...prev, quantity: e.target.value }))}
                />
              </div>
            </div>

            <div className="row mb-3 align-items-end">
              <div className="col-md-8">
                <label className="form-label fw-bold">SR Number *</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.sr_number}
                  onChange={(e) => setForm(prev => ({ ...prev, sr_number: e.target.value }))}
                />
              </div>
              <div className="col-md-4">
                <button type="button" className="btn btn-outline-secondary w-100" onClick={onSRSearch}>
                  <i className="fa fa-search me-2"></i>Search
                </button>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-bold">Comment</label>
              <input
                className="form-control"
                value={form.comment}
                onChange={(e) => setForm(prev => ({ ...prev, comment: e.target.value }))}
              />
            </div>

            <div className="mt-4">
              <h6 className="fw-bold">Present Location :</h6>
              <table className="table table-bordered">
                <thead style={{ background: "#d9edf7" }}>
                  <tr>
                    <th>Date</th>
                    <th>Pallot Number</th>
                    <th>Room</th>
                    <th>Floor</th>
                    <th>Pocket</th>
                    <th>Quantity</th>
                    <th>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={7} className="text-center">Create mode - Present location data show হবে edit mode এ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="col-md-6">
            <div className="border p-2">
              <h5 className="mb-3">New Location :</h5>
              <table className="table table-bordered align-middle">
                <thead style={{ background: "#d9edf7" }}>
                  <tr>
                    <th style={{ width: "4%" }}>#</th>
                    <th style={{ width: "28%" }}>Room</th>
                    <th style={{ width: "28%" }}>Floor</th>
                    <th style={{ width: "28%" }}>Pocket</th>
                    <th style={{ width: "12%" }}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {form.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="text-center">
                        <input type="checkbox" checked={it.checked} onChange={() => toggleItemChecked(idx)} />
                      </td>
                      <td>
                        <select className="form-select" value={it.chamber} onChange={(e) => updateItem(idx, "chamber", e.target.value)}>
                          <option value="">Select</option>
                          {chambers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </td>
                      <td>
                        <select className="form-select" value={it.floor} onChange={(e) => updateItem(idx, "floor", e.target.value)}>
                          <option value="">Select</option>
                          {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                        </select>
                      </td>
                      <td>
                        <select className="form-select" value={it.pocket} onChange={(e) => updateItem(idx, "pocket", e.target.value)}>
                          <option value="">Select</option>
                          {pockets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td>
                        <input
                          className="form-control"
                          value={it.quantity}
                          onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                          type="number"
                          min="0"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="d-grid">
                <button type="submit" className="btn btn-primary btn-lg">Save</button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
