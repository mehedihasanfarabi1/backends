import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BookingAPI } from "../../../api/booking";
import Swal from "sweetalert2";

export default function BookingEditForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    desc: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBooking = async () => {
      try {
        const data = await BookingAPI.retrieve(id);
        setForm({
          name: data.name || "",
          desc: data.desc || "",
        });
      } catch (err) {
        console.error("Error loading booking:", err);
        Swal.fire("Error", "Failed to load booking", "error");
      } finally {
        setLoading(false);
      }
    };
    loadBooking();
  }, [id]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await BookingAPI.update(id, form);
      Swal.fire("Success", "Booking updated successfully!", "success");
      nav("/admin/bookings");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to update booking", "error");
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: 700 }}>
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5>Edit Booking</h5>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit} className="row g-3">
            {/* Name */}
            <div className="col-md-12">
              <label className="form-label">Booking Name *</label>
              <input
                type="text"
                className="form-control"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Description */}
            <div className="col-md-12">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.desc}
                onChange={(e) => setForm({ ...form, desc: e.target.value })}
              />
            </div>

            {/* Buttons */}
            <div className="col-12 d-flex justify-content-end gap-2">
              <button type="submit" className="btn btn-primary">
                Update
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
