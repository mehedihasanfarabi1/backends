import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaUser, FaLock } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import "../styles/Login/login.css"

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match!");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8001/api/register/", form);
      setSuccess("Registered successfully! Please login.");
      setError("");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      setError("Registration failed. Try again.");
      setSuccess("");
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h3 className="text-center mb-4">Register</h3>
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3 input-group">
            <span className="input-group-text">
              <FaUser />
            </span>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3 input-group">
            <span className="input-group-text">@</span>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Email"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3 input-group">
            <span className="input-group-text">📞</span>
            <input
              type="text"
              name="phone"
              className="form-control"
              placeholder="Phone Number"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3 input-group">
            <span className="input-group-text">🏠</span>
            <input
              type="text"
              name="address"
              className="form-control"
              placeholder="Address"
              onChange={handleChange}
              required
            />
          </div>
          <div className="mb-3 input-group">
            <span className="input-group-text">
              <FaLock />
            </span>
            <input
              type={showPass ? "text" : "password"}
              name="password"
              className="form-control"
              placeholder="Password"
              onChange={handleChange}
              required
            />
            <span
              className="input-group-text"
              style={{ cursor: "pointer" }}
              onClick={() => setShowPass(!showPass)}
            >
              {showPass ? <IoMdEyeOff /> : <IoMdEye />}
            </span>
          </div>
          <div className="mb-3 input-group">
            <span className="input-group-text">
              <FaLock />
            </span>
            <input
              type={showConfirm ? "text" : "password"}
              name="confirm_password"
              className="form-control"
              placeholder="Confirm Password"
              onChange={handleChange}
              required
            />
            <span
              className="input-group-text"
              style={{ cursor: "pointer" }}
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? <IoMdEyeOff /> : <IoMdEye />}
            </span>
          </div>
          <button className="btn btn-success w-100">Register</button>
        </form>
        <p className="text-center mt-3">
          Already have an account? <Link to="/">Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
