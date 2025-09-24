import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaUser, FaLock } from "react-icons/fa";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import "../styles/Login/login.css"
export function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8001/api/login/", form);
      const { access, refresh } = res.data;

      const decoded = parseJwt(access);

      localStorage.setItem("token", access);
      localStorage.setItem("refresh", refresh);
      localStorage.setItem("token_exp", decoded?.exp || 0);

      toast.success("Login successful!", {
        position: "top-right",
        autoClose: 2000,
      });
      setTimeout(() => navigate("/admin"), 1000);
    } catch (err) {
      console.error(err);
      toast.error("Invalid credentials", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-card">
        <h3 className="text-center mb-4">User Login</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-3 input-group">
            <span className="input-group-text">
              <FaUser />
            </span>
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
          <div className="form-check mb-3">
            <input
              type="checkbox"
              className="form-check-input"
              id="remember"
            />
            <label htmlFor="remember" className="form-check-label">
              Remember Me
            </label>
          </div>
          <button className="btn btn-primary w-100">Login</button>
        </form>
        <ToastContainer />
        <p className="text-center mt-3">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
