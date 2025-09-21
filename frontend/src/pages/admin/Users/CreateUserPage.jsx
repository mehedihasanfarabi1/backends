import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CreateUserPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    confirm_password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirm_password) {
      toast.error("❌ Passwords do not match!", { autoClose: 2000 });
      return;
    }

    try {
      setLoading(true);
      await api.post("register/", form);
      toast.success("✅ User created successfully!", { autoClose: 2000 });

      setTimeout(() => navigate("/admin/users"), 1500);
    } catch (err) {
      toast.error("❌ Failed to create user!", { autoClose: 2000 });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-1">
      <div className="row justify-content-center">
        {/* col-lg-8 মানে বড় screen এ 8 grid নেবে, ছোট screen এ full নেবে */}
        <div className="col-lg-12 col-md-10 col-12">
          <div className="card shadow-lg border-0 rounded-4">
            <div className="card-body p-4 p-md-5">
              <h3 className="card-title text-center mb-4 fw-bold text-primary">
                <i className="fa fa-user-plus me-2"></i> Create New User
              </h3>

              <form onSubmit={handleSubmit} className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="Enter full name"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="Enter email"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Phone</label>
                  <input
                    type="text"
                    name="phone"
                    className="form-control"
                    placeholder="Enter phone number"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    placeholder="Enter address"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    placeholder="Enter password"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    className="form-control"
                    placeholder="Confirm password"
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-12">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <span>
                        <i className="fa fa-spinner fa-spin me-2"></i> Creating...
                      </span>
                    ) : (
                      "Create User"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateUserPage;
