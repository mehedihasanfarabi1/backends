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

export default function PallotEditForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const emptyItem = { chamber: "", floor: "", pocket: "", quantity: "" };

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    pallot_type: "",
    date: new Date().toISOString().slice(0, 10),
    pallot_number: "",
    sr_number: "",
    sr_id: null,
    sr_quantity: "",
    comment: "",
    item: { ...emptyItem },
  });

  const [items, setItems] = useState([]);
  const [pallotTypes, setPallotTypes] = useState([]);
  const [chambers, setChambers] = useState([]);
  const [floors, setFloors] = useState([]);
  const [pockets, setPockets] = useState([]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [types, ch] = await Promise.all([PallotAPI.list(), ChamberAPI.list()]);
        setPallotTypes(types || []);
        setChambers(ch || []);

        if (id) {
          const data = await PallotListAPI.retrieve(id);

          setForm({
            pallot_type: data.pallot_type?.id || "",
            date: data.date,
            pallot_number: data.pallot_number,
            sr_number: data.sr?.sr_no || "",
            sr_id: data.sr?.id || null,
            sr_quantity: data.sr_quantity || "",
            comment: data.comment || "",
            item: { ...emptyItem },
          });

          // Map items with floors & pockets preloaded
          const mappedItems = await Promise.all(data.items.map(async (it) => {
            const fls = await FloorAPI.list({ chamber_id: it.chamber?.id });
            const pcks = await PocketAPI.list({ floor_id: it.floor?.id });
            return {
              id: it.id,
              pallot_type: data.pallot_type?.id,
              pallot_type_name: data.pallot_type?.name,
              date: data.date,
              pallot_number: data.pallot_number,
              sr_id: data.sr?.id,
              sr_number: data.sr?.sr_no,
              sr_quantity: data.sr_quantity,
              comment: data.comment,
              chamber: it.chamber?.id || "",
              chamber_name: it.chamber?.name || "",
              floor: it.floor?.id || "",
              floor_name: it.floor?.name || "",
              pocket: it.pocket?.id || "",
              pocket_name: it.pocket?.name || "",
              quantity: it.quantity,
              floors: fls || [],
              pockets: pcks || [],
            };
          }));
          setItems(mappedItems);
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

  // Fetch floors when chamber changes
  const fetchFloors = async (chamberId) => {
    if (!chamberId) return;
    try {
      const data = await FloorAPI.list({ chamber_id: chamberId });
      setFloors(data || []);
    } catch (err) { console.error(err); }
  };

  // Fetch pockets when floor changes
  const fetchPockets = async (floorId) => {
    if (!floorId) return;
    try {
      const data = await PocketAPI.list({ floor_id: floorId });
      setPockets(data || []);
    } catch (err) { console.error(err); }
  };

  const updateItem = (field, value) => {
    const newItem = { ...form.item, [field]: value };
    if (field === "chamber") {
      newItem.floor = "";
      newItem.pocket = "";
      fetchFloors(value);
      setPockets([]);
    }
    if (field === "floor") {
      newItem.pocket = "";
      fetchPockets(value);
    }
    setForm(prev => ({ ...prev, item: newItem }));
  };

  const addRow = () => {
    const { item } = form;
    if (!item.chamber || !item.floor || !item.pocket || !item.quantity)
      return Swal.fire("Error", "সব তথ্য পূরণ করুন", "error");

    const newRow = {
      pallot_type: form.pallot_type,
      pallot_type_name: pallotTypes.find(pt => pt.id === form.pallot_type)?.name || "",
      date: form.date,
      pallot_number: form.pallot_number,
      sr_id: form.sr_id,
      sr_number: form.sr_number,
      sr_quantity: form.sr_quantity,
      comment: form.comment,
      chamber: item.chamber,
      chamber_name: chambers.find(c => c.id === item.chamber)?.name || "",
      floor: item.floor,
      floor_name: floors.find(f => f.id === item.floor)?.name || "",
      pocket: item.pocket,
      pocket_name: pockets.find(p => p.id === item.pocket)?.name || "",
      quantity: item.quantity,
    };

    setItems(prev => [...prev, newRow]);
    setForm(prev => ({ ...prev, item: { ...emptyItem } }));
    setFloors([]);
    setPockets([]);
  };

  const removeItem = (idx) => setItems(prev => prev.filter((_, i) => i !== idx));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.pallot_type) return Swal.fire("Warning", "Pallot Type দিন", "warning");

    const payloads = items.map(it => ({
      id: it.id,
      pallot_type_id: it.pallot_type,
      date: it.date,
      pallot_number: it.pallot_number,
      sr_id: it.sr_id,
      sr_quantity: it.sr_quantity,
      comment: it.comment,
      chamber_id: it.chamber,
      floor_id: it.floor,
      pocket_id: it.pocket,
      quantity: it.quantity,
    }));

    if (!payloads.length) return Swal.fire("Error", "কমপক্ষে ১টি Row যুক্ত করুন", "error");

    try {
      if (id) {
        for (let payload of payloads) await PallotListAPI.update(id, payload);
      } else {
        await PallotListAPI.bulk_create(payloads);
      }
      Swal.fire("Success", "Pallot(s) saved successfully", "success");
      navigate("/admin/pallet_list");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Save ব্যর্থ হয়েছে", "error");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-3">
      <h3 className="text-center mb-4 bg-primary text-white border rounded">
        {id ? "Edit Pallot" : "Create Pallot"}
      </h3>
      <form onSubmit={onSubmit}>
        <div className="row g-3">
          {/* Left side */}
          <div className="col-md-6 row">
            <div className="col-6 mb-2">
              <label>Pallot Type</label>
              <select className="form-select" value={form.pallot_type} onChange={e => setForm({ ...form, pallot_type: e.target.value })}>
                <option value="">Select</option>
                {pallotTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
              </select>
            </div>
            <div className="col-6 mb-2">
              <label>Date</label>
              <input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="col-6 mb-2">
              <label>Pallot Number</label>
              <input type="text" className="form-control" value={form.pallot_number} onChange={e => setForm({ ...form, pallot_number: e.target.value })} />
            </div>
            <div className="col-6 mb-2">
              <label>SR Number</label>
              <div className="input-group">
                <input type="text" className="form-control" value={form.sr_number} onChange={e => setForm({ ...form, sr_number: e.target.value })} />
                <button type="button" className="btn btn-primary" onClick={async () => {
                  if (!form.sr_number) return Swal.fire("Warning", "SR Number লিখুন", "warning");
                  try {
                    const res = await PallotListAPI.get_sr_quantity({ sr_no: form.sr_number });
                    setForm(prev => ({ ...prev, sr_id: res.sr_id, sr_quantity: res.sr_quantity }));
                    Swal.fire("Found", `SR পাওয়া গেছে — Qty: ${res.sr_quantity}`, "success");
                  } catch (err) { Swal.fire("Not found", "SR পাওয়া যায়নি", "error"); }
                }}>Search</button>
              </div>
            </div>
            <div className="col-6 mb-2">
              <label>SR Quantity</label>
              <input type="number" className="form-control" value={form.sr_quantity} onChange={e => setForm({ ...form, sr_quantity: e.target.value })} />
            </div>
            <div className="col-6 mb-2">
              <label>Comment</label>
              <input type="text" className="form-control" value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} />
            </div>
          </div>

          {/* Right side */}
          <div className="col-md-6">
            <h6 className="mb-2 text-white p-2 rounded" style={{ backgroundColor: "#0d6efd" }}>Add Location</h6>
            <table className="table table-bordered table-sm">
              <thead className="table-light">
                <tr><th>Chamber</th><th>Floor</th><th>Pocket</th><th>Quantity</th></tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <select className="form-select form-select-sm" value={form.item.chamber} onChange={e => updateItem("chamber", parseInt(e.target.value) || "")}>
                      <option value="">Select</option>
                      {chambers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="form-select form-select-sm" value={form.item.floor} onChange={e => updateItem("floor", parseInt(e.target.value) || "")}>
                      <option value="">Select</option>
                      {floors.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </td>
                  <td>
                    <select className="form-select form-select-sm" value={form.item.pocket} onChange={e => updateItem("pocket", parseInt(e.target.value) || "")}>
                      <option value="">Select</option>
                      {pockets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </td>
                  <td>
                    <input type="number" className="form-control form-control-sm" value={form.item.quantity} onChange={e => updateItem("quantity", e.target.value)} />
                  </td>
                </tr>
              </tbody>
            </table>
            <button type="button" className="btn btn-outline-success btn-sm" onClick={addRow}>+ Add Row</button>
          </div>
        </div>

        {/* Table Preview */}
        {items.length > 0 && (
          <div className="table-responsive mt-3">
            <table className="table table-bordered">
              <thead className="table-light">
                <tr>
                  <th>Pallot Type</th><th>Date</th><th>Pallot Number</th><th>SR Number</th><th>SR Quantity</th><th>Comment</th>
                  <th>Chamber</th><th>Floor</th><th>Pocket</th><th>Quantity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, idx) => (
                  <tr key={idx}>
                    <td>{it.pallot_type_name || "Pallot"}</td>
                    <td>{it.date}</td>
                    <td>{it.pallot_number}</td>
                    <td>{it.sr_number}</td>
                    <td>{it.sr_quantity}</td>
                    <td>{it.comment}</td>
                    <td>{it.chamber_name}</td>
                    <td>{it.floor_name}</td>
                    <td>{it.pocket_name}</td>
                    <td>{it.quantity}</td>
                    <td className="text-center">
                      <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(idx)}>🗑</button>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>
        )}

        <div className="d-flex justify-content-end mt-3">
          <button className="btn btn-primary" type="submit">Save</button>
        </div>
      </form>
    </div>
  );
}
