import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  PallotAPI,
  ChamberAPI,
  FloorAPI,
  PocketAPI,
  PallotListAPI,
} from "../../../api/pallotApi";
import Swal from "sweetalert2";

export default function CreatePallotForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const emptyItem = { chamber: "", floor: "", pocket: "", quantity: "" };

  const [loading, setLoading] = useState(true);
  const [pallotTypes, setPallotTypes] = useState([]);
  const [chambers, setChambers] = useState([]);
  const [floors, setFloors] = useState([]);
  const [pockets, setPockets] = useState([]);
  const [itemsTable, setItemsTable] = useState([]);

  const [form, setForm] = useState({
    pallot_type: "",
    date: new Date().toISOString().slice(0, 10),
    pallot_number: "",
    sr_number: "",
    sr_id: null,
    sr_quantity: "",
    quantity: "",
    comment: "",
    items: [emptyItem],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [types, ch, fl, pk] = await Promise.all([
          PallotAPI.list(),
          ChamberAPI.list(),
          FloorAPI.list(),
          PocketAPI.list(),
        ]);
        console.log("Dropdown Data:", { types, ch, fl, pk });
        setPallotTypes(types || []);
        setChambers(ch || []);
        setFloors(fl || []);
        setPockets(pk || []);

        if (id) {
          const data = await PallotListAPI.retrieve(id);
          console.log("Edit Data:", data);
          setForm({
            pallot_type: data.pallot_type?.id || "",
            date: data.date,
            pallot_number: data.pallot_number,
            sr_number: data.sr?.sr_no || "",
            sr_id: data.sr?.id || null,
            sr_quantity: data.sr_quantity || "",
            comment: data.comment || "",
            items: data.items.length ? data.items.map(it => ({
              chamber: it.chamber?.id || "",
              floor: it.floor?.id || "",
              pocket: it.pocket?.id || "",
              quantity: it.quantity || ""
            })) : [emptyItem],
          });
          setItemsTable(data.items || []);
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Data load ব্যর্থ হয়েছে", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // SR search auto-fill quantity
  const onSRSearch = async () => {
    if (!form.sr_number) return Swal.fire("Warning", "SR Number লিখুন", "warning");
    try {
      const res = await PallotListAPI.get_sr_quantity({ sr_no: form.sr_number });
      console.log("SR Result:", res);
      setForm(prev => ({
        ...prev,
        sr_id: res.sr_id,
        sr_quantity: res.sr_quantity,
        items: prev.items.map(it => ({ ...it, quantity: res.quantity })) // auto fill
      }));
      Swal.fire("Found", `SR পাওয়া গেছে — Qty: ${res.sr_quantity}`, "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Not found", "SR পাওয়া যায়নি", "error");
    }
  };


  const updateItem = (idx, field, value) => {
    setForm(prev => {
      const items = [...prev.items];
      items[idx][field] = value;
      return { ...prev, items };
    });
  };

  const addRow = () => setForm(prev => ({ ...prev, items: [...prev.items, emptyItem] }));
  const removeRow = (idx) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.pallot_type) return Swal.fire("Warning", "Pallot Type দিন", "warning");

    // Payload before save
    const payload = {
      pallot_type: form.pallot_type,
      date: form.date,
      pallot_number: form.pallot_number,
      sr: form.sr_id,
      sr_quantity: form.sr_quantity,
      comment: form.comment,
      items: form.items.filter(it => it.chamber && it.floor && it.pocket && it.quantity)
    };
    console.log("Payload to Save:", payload);
    try {
      if (id) await PallotListAPI.update(id, payload);
      else await PallotListAPI.create(payload);
      Swal.fire("Success", `Pallot ${id ? "update" : "created"} হয়েছে`, "success");
      navigate("pallot_list");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Save ব্যর্থ হয়েছে", "error");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-3">
      <h3 className="text-center mb-4">{id ? "Edit Pallot" : "Create Pallot"}</h3>
      <form onSubmit={onSubmit}>
        <div className="row g-3">
          {/* Left Side */}
          <div className="col-md-6">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-bold">Pallot Type</label>
                <select className="form-select shadow-sm" value={form.pallot_type} onChange={e => setForm({ ...form, pallot_type: e.target.value })}>
                  <option value="">Select</option>
                  {pallotTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Date</label>
                <input type="date" className="form-control shadow-sm" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Pallot Number</label>
                <input type="text" className="form-control shadow-sm" value={form.pallot_number} onChange={e => setForm({ ...form, pallot_number: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">SR Number</label>
                <div className="input-group">
                  <input type="text" className="form-control shadow-sm" value={form.sr_number} onChange={e => setForm({ ...form, sr_number: e.target.value })} />
                  <button type="button" className="btn btn-primary" onClick={onSRSearch}>Search</button>
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">SR Quantity</label>
                <input className="form-control shadow-sm" value={form.sr_quantity} onChange={e => setForm({ ...form, sr_quantity: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-bold">Comment</label>
                <input className="form-control shadow-sm" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="col-md-6">
            <h6 className="mb-2 text-white p-2 rounded" style={{ backgroundColor: "#0d6efd" }}>Items</h6>
            <table className="table table-sm table-bordered">
              <thead className="table-primary">
                <tr>
                  <th>Room</th>
                  <th>Floor</th>
                  <th>Pocket</th>
                  <th>Qty</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((it, idx) => (
                  <tr key={idx}>
                    <td>
                      <select className="form-select form-select-sm" value={it.chamber} onChange={e => updateItem(idx, "chamber", e.target.value)}>
                        <option value="">-</option>
                        {chambers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="form-select form-select-sm" value={it.floor} onChange={e => updateItem(idx, "floor", e.target.value)}>
                        <option value="">-</option>
                        {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <select className="form-select form-select-sm" value={it.pocket} onChange={e => updateItem(idx, "pocket", e.target.value)}>
                        <option value="">-</option>
                        {pockets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={it.quantity}
                        onChange={e => updateItem(idx, "quantity", e.target.value)}
                      />

                    </td>
                    <td>{form.items.length > 1 && <button type="button" className="btn btn-sm btn-danger" onClick={() => removeRow(idx)}>×</button>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" className="btn btn-outline-success btn-sm" onClick={addRow}>+ Add Row</button>
          </div>
        </div>

        {/* Existing Items Table */}
        {itemsTable.length > 0 && (
          <div className="mt-4">
            <h6 className="text-secondary">Existing Items</h6>
            <table className="table table-bordered table-striped table-sm">
              <thead className="table-light">
                <tr><th>#</th><th>Room</th><th>Floor</th><th>Pocket</th><th>Quantity</th></tr>
              </thead>
              <tbody>
                {itemsTable.map((it, i) => (
                  <tr key={i}><td>{i + 1}</td><td>{it.chamber?.name}</td><td>{it.floor?.name}</td><td>{it.pocket?.name}</td><td>{it.quantity}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-center mt-3">
          <button type="submit" className="btn btn-success btn-lg">{id ? "Update Pallot" : "Save Pallot"}</button>
        </div>
      </form>
    </div>
  );
}
