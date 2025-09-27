import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import { ChamberAPI, FloorAPI } from "../../../../api/pallotApi";

export default function FloorEditForm() {
  const nav = useNavigate();
  const { id } = useParams(); // floor id
  const [chambers, setChambers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    chamber: "",
    name: "",
  });

  // Load floor data and chambers
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        console.log("Loading floor data for id:", id);
        const floor = await FloorAPI.get(id);
        console.log("Floor data raw:", floor);

        // Determine chamber id
        const chamberId =
          floor.chamber?.id !== undefined ? floor.chamber.id : floor.chamber;

        // Load all chambers (or you can filter by company if needed)
        const chamberData = await ChamberAPI.list({});
        setChambers(chamberData);
        console.log("Chambers loaded:", chamberData);

        // Set form values
        setForm({
          chamber: String(chamberId),
          name: floor.name || "",
        });
        console.log("Form set to:", {
          chamber: String(chamberId),
          name: floor.name || "",
        });
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!form.chamber)
      return Swal.fire("Warning", "Select a chamber first", "warning");
    if (!form.name.trim())
      return Swal.fire("Warning", "Floor name cannot be empty", "warning");

    try {
      await FloorAPI.update(id, {
        name: form.name,
        chamber: Number(form.chamber), // backend expects chamber id
      });
      Swal.fire("Success", "Floor updated successfully!", "success");
      nav("/admin/pallet_location");
    } catch (err) {
      console.error(err.response?.data || err);
      Swal.fire("Error", "Failed to update floor", "error");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: 600 }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5>Edit Floor</h5>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            {/* Chamber */}
            <div className="mb-3">
              <label className="form-label">Chamber *</label>
              <select
                className="form-select"
                value={form.chamber}
                onChange={(e) => setForm({ ...form, chamber: e.target.value })}
                required
                disabled={!chambers.length}
              >
                <option value="">-- Select Chamber --</option>
                {chambers.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Floor Name */}
            <div className="mb-3">
              <label className="form-label">Floor Name</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-primary">
                Update Floor
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => nav(-1)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
