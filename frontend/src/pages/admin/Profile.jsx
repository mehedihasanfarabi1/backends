import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      // No token, redirect to login
      navigate("/login");
      return;
    }

    axios.get("http://127.0.0.1:8001/api/users/me/", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((res) => setUser(res.data))
    .catch((err) => {
      console.error("Error fetching profile:", err);
      toast.error("Session expired. Please login again.", {
        position: "top-right",
        autoClose: 3000,
      });

      // Token expired or invalid → redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      navigate("/login");
    })
    .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <p className="text-center mt-4">Loading profile...</p>;

  if (!user) return <p className="text-center mt-4">No user data found.</p>;

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <div className="d-flex align-items-center">
          <img
            src={user.profile?.avatar || "https://placehold.co/100x100"}
            alt="avatar"
            className="rounded-circle me-3"
            style={{ width: "100px", height: "100px", objectFit: "cover" }}
          />
          <div>
            <h4>{user.name}</h4>
            <p className="mb-1"><strong>Email:</strong> {user.email}</p>
            <p className="mb-1"><strong>Phone:</strong> {user.phone || "N/A"}</p>
            <p className="mb-1"><strong>Address:</strong> {user.address || "N/A"}</p>
            <p className="mb-1">
              <strong>Role:</strong> {user.profile?.role?.name || "General User"}
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}
