import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { ChamberAPI, FloorAPI, PocketAPI } from "../../../../api/pallotApi";

export default function PocketEditModal({ pocketId, onClose, onUpdated }) {
  const [loading, setLoading] = useState(true);
  const [chambers, setChambers] = useState([]);
  const [floors, setFloors] = useState([]);
  const [form, setForm] = useState({
    chamber_id: "",
    floor_id: "",
    name: "",
    capacity: "",
  });

  // --- Debug helper ---
  const debugForm = () => console.log("Current form state:", form);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const pocket = await PocketAPI.get(pocketId);
        console.log("Pocket loaded:", pocket);

        if (!pocket) throw new Error("Pocket not found");

        const chamberList = await ChamberAPI.list();
        console.log("Chambers loaded:", chamberList);
        setChambers(chamberList);

        let floorList = [];
        if (pocket.chamber?.id) {
          console.log("Fetching floors for chamber_id:", pocket.chamber.id);
          floorList = await FloorAPI.list({ chamber_id: pocket.chamber.id });
        }
        console.log("Floors loaded:", floorList);
        setFloors(floorList);

        setForm({
          chamber_id: pocket.chamber?.id ? String(pocket.chamber.id) : "",
          floor_id: pocket.floor?.id ? String(pocket.floor.id) : "",
          name: pocket.name || "",
          capacity: pocket.capacity || "",
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load pocket data", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [pocketId]);

  // Load floors when chamber changes
  useEffect(() => {
    if (!form.chamber_id) return setFloors([]);

    const loadFloors = async () => {
      try {
        console.log("Fetching floors after chamber change:", form.chamber_id);
        const data = await FloorAPI.list({ chamber_id: form.chamber_id });
        console.log("Floors after chamber change:", data);
        setFloors(data);

        // Reset floor_id only if previous floor doesn't exist in new list
        if (form.floor_id && !data.find(f => f.id === Number(form.floor_id))) {
          setForm(prev => ({ ...prev, floor_id: "" }));
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load floors", "error");
      }
    };

    loadFloors();
  }, [form.chamber_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    debugForm(); // debug current values
    if (!form.chamber_id) return Swal.fire("Warning", "Select chamber", "warning");
    if (!form.floor_id) return Swal.fire("Warning", "Select floor", "warning");
    if (!form.name.trim()) return Swal.fire("Warning", "Pocket name required", "warning");

    try {
      await PocketAPI.update(pocketId, {
        chamber_id: Number(form.chamber_id),
        floor_id: Number(form.floor_id),
        name: form.name,
        capacity: Number(form.capacity) || 0,
      });
      Swal.fire("Success", "Pocket updated successfully!", "success");
      onUpdated?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update pocket", "error");
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;

  return (
    <div className="modal fade show" style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header bg-primary text-white">
            <h5 className="modal-title">Edit Pocket</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row g-2 align-items-center">
                {/* Chamber */}
                <div className="col-3">
                  <select
                    className="form-select"
                    value={form.chamber_id}
                    onChange={(e) => setForm({ ...form, chamber_id: e.target.value })}
                    required
                  >
                    <option value="">-- Chamber --</option>
                    {chambers.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Floor */}
                <div className="col-3">
                  <select
                    className="form-select"
                    value={form.floor_id}
                    onChange={(e) => setForm({ ...form, floor_id: e.target.value })}
                    required
                    disabled={!floors.length}
                  >
                    <option value="">-- Floor --</option>
                    {floors.map(f => (
                      <option key={f.id} value={String(f.id)}>{f.name}</option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div className="col-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Pocket Name"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>

                {/* Capacity */}
                <div className="col-3">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Capacity"
                    value={form.capacity}
                    onChange={e => setForm({ ...form, capacity: e.target.value })}
                    min={0}
                  />
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2 mt-3">
                <button type="submit" className="btn btn-primary">Update</button>
                <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
