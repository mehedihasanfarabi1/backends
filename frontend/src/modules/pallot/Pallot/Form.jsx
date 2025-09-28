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
  const [floors, setFloors] = useState({});
  const [pockets, setPockets] = useState({});
  const [itemsTable, setItemsTable] = useState([]);

  const [form, setForm] = useState({
    pallot_type: "",
    date: new Date().toISOString().slice(0, 10),
    pallot_number: "",
    sr_number: "",
    sr_id: null,
    sr_quantity: "",
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
        setPallotTypes(types || []);
        setChambers(ch || []);
        // floors & pockets will be filtered later
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
            items: data.items.length
              ? data.items.map((it) => ({
                chamber: it.chamber?.id || "",
                floor: it.floor?.id || "",
                pocket: it.pocket?.id || "",
                quantity: it.quantity || "",
              }))
              : [emptyItem],
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

  // SR search auto-fill
  const onSRSearch = async () => {
    if (!form.sr_number)
      return Swal.fire("Warning", "SR Number লিখুন", "warning");
    try {
      const res = await PallotListAPI.get_sr_quantity({ sr_no: form.sr_number });
      setForm((prev) => ({
        ...prev,
        sr_id: res.sr_id,
        sr_quantity: res.sr_quantity,
        items: prev.items.map((it) => ({ ...it, quantity: res.sr_quantity })),
      }));
      Swal.fire("Found", `SR পাওয়া গেছে — Qty: ${res.sr_quantity}`, "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Not found", "SR পাওয়া যায়নি", "error");
    }
  };

  const updateItem = (idx, field, value) => {
    setForm((prev) => {
      const items = [...prev.items];
      items[idx][field] = value;

      if (field === "chamber") {
        items[idx].floor = "";
        items[idx].pocket = "";
        fetchFloors(value, idx);
      }
      if (field === "floor") {
        items[idx].pocket = "";
        fetchPockets(value, idx);
      }

      return { ...prev, items };
    });
  };

  const fetchFloors = async (chamberId, idx) => {
    if (!chamberId) return;
    try {
      const floorsData = await FloorAPI.list({ chamber_id: chamberId });
      setFloors((prev) => ({ ...prev, [idx]: floorsData }));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPockets = async (floorId, idx) => {
    if (!floorId) return;
    try {
      const pocketsData = await PocketAPI.list({ floor_id: floorId });
      setPockets((prev) => ({ ...prev, [idx]: pocketsData }));
    } catch (err) {
      console.error(err);
    }
  };

  const addRow = () =>
    setForm((prev) => ({ ...prev, items: [...prev.items, emptyItem] }));
  const removeRow = (idx) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.pallot_type) return Swal.fire("Warning", "Pallot Type দিন", "warning");

    try {
      for (let it of form.items) {
        if (!(it.chamber && it.floor && it.pocket && it.quantity)) continue;
        const payload = {
          pallot_type_id: form.pallot_type,
          date: form.date,
          pallot_number: form.pallot_number,
          sr_id: form.sr_id,
          sr_quantity: form.sr_quantity,
          comment: form.comment,
          chamber_id: it.chamber,
          floor_id: it.floor,
          pocket_id: it.pocket,
          quantity: it.quantity,
        };

        if (id) await PallotListAPI.update(id, payload);
        else await PallotListAPI.create(payload);
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
      <h3 className="text-center mb-4 bg-primary text-white border rounded">{id ? "Edit Pallot" : "Create Pallot"}</h3>
      <form onSubmit={onSubmit}>
        <div className="row g-3">
          {/* Left Side: 2 per row */}
          <div className="col-md-6">
            <div className="row g-3">
              {[
                { label: "Pallot Type", key: "pallot_type", type: "select", options: pallotTypes },
                { label: "Date", key: "date", type: "date" },
                { label: "Pallot Number", key: "pallot_number", type: "text" },
                { label: "SR Number", key: "sr_number", type: "sr" },
                { label: "SR Quantity", key: "sr_quantity", type: "number" },
                { label: "Comment", key: "comment", type: "text" },
              ].map((field, i) => (
                <div className="col-md-6" key={i}>
                  <label className="form-label fw-bold">{field.label}</label>
                  {field.type === "select" ? (
                    <select
                      className="form-select shadow-sm"
                      value={form[field.key]}
                      onChange={(e) =>
                        setForm({ ...form, [field.key]: e.target.value })
                      }
                    >
                      <option value="">Select</option>
                      {field.options?.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "sr" ? (
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control shadow-sm"
                        value={form.sr_number}
                        onChange={(e) =>
                          setForm({ ...form, sr_number: e.target.value })
                        }
                      />
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={onSRSearch}
                      >
                        Search
                      </button>
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      className="form-control shadow-sm"
                      value={form[field.key]}
                      onChange={(e) =>
                        setForm({ ...form, [field.key]: e.target.value })
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: 1 row = 4 items */}
          <div className="col-md-6">
            <h6 className="mb-2 text-white p-2 rounded" style={{ backgroundColor: "#0d6efd" }}>
              Items
            </h6>
            <div className="row g-2">
              {form.items.map((it, idx) => (
                <div className="row-3" key={idx}>
                  <div className="card p-2">
                    <select
                      className="form-select form-select-sm mb-1"
                      value={it.chamber}
                      onChange={(e) =>
                        updateItem(idx, "chamber", e.target.value ? parseInt(e.target.value) : "")
                      }
                    >
                      <option value="">Room</option>
                      {chambers.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>

                    <select
                      className="form-select form-select-sm mb-1"
                      value={it.floor}
                      onChange={(e) =>
                        updateItem(idx, "floor", e.target.value ? parseInt(e.target.value) : "")
                      }
                    >
                      <option value="">Floor</option>
                      {floors[idx]?.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>

                    <select
                      className="form-select form-select-sm mb-1"
                      value={it.pocket}
                      onChange={(e) =>
                        updateItem(idx, "pocket", e.target.value ? parseInt(e.target.value) : "")
                      }
                    >
                      <option value="">Pocket</option>
                      {pockets[idx]?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      className="form-control form-control-sm mb-1"
                      placeholder="Qty"
                      value={it.quantity}
                      onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger w-100"
                      onClick={() => removeRow(idx)}
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              {/* <div className="col-12 mt-2">
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm"
                  onClick={addRow}
                >
                  + Add Item
                </button>
              </div> */}
            </div>
          </div>
        </div>

        {/* Existing Items Table */}
        {itemsTable.length > 0 && (
          <div className="mt-4">
            <h6 className="text-secondary">Existing Items</h6>
            <table className="table table-bordered table-striped table-sm">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Room</th>
                  <th>Floor</th>
                  <th>Pocket</th>
                  <th>Quantity</th>
                </tr>
              </thead>
              <tbody>
                {itemsTable.map((it, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>{it.chamber?.name}</td>
                    <td>{it.floor?.name}</td>
                    <td>{it.pocket?.name}</td>
                    <td>{it.quantity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-center mt-3">
          <button type="submit" className="btn btn-success btn-lg">
            {id ? "Update Pallot" : "Save Pallot"}
          </button>
        </div>
      </form>
    </div>
  );
}
