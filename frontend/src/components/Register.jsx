import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

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

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();

        // ✅ Password confirm check
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
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card shadow">
                        <div className="card-body">
                            <h3 className="card-title text-center mb-4">Register</h3>
                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}
                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-control"
                                        placeholder="Full Name"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="email"
                                        name="email"
                                        className="form-control"
                                        placeholder="Email"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        name="phone"
                                        className="form-control"
                                        placeholder="Phone Number"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        name="address"
                                        className="form-control"
                                        placeholder="Address"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="password"
                                        name="password"
                                        className="form-control"
                                        placeholder="Password"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="password"
                                        name="confirm_password"
                                        className="form-control"
                                        placeholder="Confirm Password"
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <button className="btn btn-success w-100">Register</button>
                            </form>
                            <p className="text-center mt-3">
                                Already have an account? <Link to="/">Login here</Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
