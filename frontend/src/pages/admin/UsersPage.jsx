import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../../components/common/Pagination";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const UsersPage = () => {

  const navigate = useNavigate()

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const usersPerPage = 5;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const resUsers = await api.get("users/");
      const resRoles = await api.get("roles/");
      setUsers(resUsers.data);
      setRoles(resRoles.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (userId, newRoleId) => {
    try {
      await api.post(`users/${userId}/update-role/`, { role_id: newRoleId });
      toast.success("✅ Role updated successfully!", { autoClose: 2000 });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
              ...u,
              profile: {
                ...u.profile,
                role: roles.find((r) => r.id == newRoleId),
              },
            }
            : u
        )
      );
    } catch (err) {
      toast.error("❌ Failed to update role!", { autoClose: 2000 });
      console.error(err);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.post(`users/${userId}/toggle-active/`);
      const { is_active } = res.data;

      // 🔹 Force update state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active } : u))
      );

      if (is_active) {
        toast.success("✅ User activated!", { autoClose: 2000 });
      } else {
        toast.info("⚠️ User deactivated!", { autoClose: 2000 });
      }
    } catch (err) {
      toast.error("❌ Failed to update status!", { autoClose: 2000 });
      console.error(err);
    }
  };

  const handleDelete = (userId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`users/${userId}/`);
          setUsers((prev) => prev.filter((u) => u.id !== userId));
          toast.success("✅ User deleted successfully!", { autoClose: 2000 });
        } catch (err) {
          toast.error("❌ Failed to delete user!", { autoClose: 2000 });
        }
      }
    });
  };

  // 🔍 Filter + Search + Role Filter
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "all" || u.profile?.role?.id?.toString() === roleFilter;

    return matchesSearch && matchesRole;
  });

  // ↕️ Sort
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    const valA =
      a[sortField]?.toString().toLowerCase() ||
      a.profile?.[sortField]?.toString().toLowerCase() ||
      "";
    const valB =
      b[sortField]?.toString().toLowerCase() ||
      b.profile?.[sortField]?.toString().toLowerCase() ||
      "";

    if (valA < valB) return sortOrder === "asc" ? -1 : 1;
    if (valA > valB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  // 📄 Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  return (
    <div className="container py-1">
      {/* Page Title */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="fw-bold text-primary m-0">
          <i className="fa-solid fa-users me-2"></i> User Management
        </h2>
        <button
          className="btn btn-success"
          onClick={() => navigate("/admin/users/create")}
        >
          <i className="fa fa-user-plus me-2"></i> Create User
        </button>

      </div>

      {/* Search & Filter */}
      <div className="row mb-2">
        <div className="col-md-6 mb-2">
          <input
            type="text"
            placeholder="🔍 Search by name or email..."
            className="form-control"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="col-md-4 mb-2">
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">All Roles</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Card */}
      <div className="card shadow-lg border-0 rounded-3">
        <div className="card-body p-3">
          {/* Table */}
          <div className="table-responsive">
            <table className="table table-sm table-striped table-hover table-bordered align-middle text-center">
              <thead className="table-primary">
                <tr>
                  <th>SL</th>
                  
                  {/* <th>Avatar</th> */}
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>LoggedIn</th>
                  <th>Actions</th>
                  <th>
                    <input type="checkbox" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.length > 0 ? (
                  currentUsers.map((user, idx) => (
                    <tr key={user.id}>
                      <td>{indexOfFirstUser + idx + 1}</td>
                     
                      {/* <td>
                        <img
                          src={user.profile?.avatar}
                          alt="avatar"
                          className="rounded-circle shadow-sm"
                          style={{
                            width: "35px",
                            height: "35px",
                            objectFit: "cover",
                          }}
                        />
                      </td> */}
                      <td className="fw-semibold">{user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || "-"}</td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={user.profile?.role?.id || ""}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                        >
                          <option value="">Select Role</option>
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      {/* 🔹 Status Column (Custom Toggle Button instead of Switch) */}
                      <td>
                        <button
                          className={`btn btn-sm ${user.is_active ? "btn-primary" : "btn-secondary"}`}
                          onClick={() => handleToggleStatus(user.id)}
                        >
                          {user.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td>
                        {user.is_logged_in ? (
                          <span className="badge bg-success">Yes</span>
                        ) : (
                          <span className="badge bg-danger">No</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-sm btn-warning me-1">
                          <i className="fa fa-edit"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(user.id)}
                        >
                          <i className="fa fa-trash"></i>
                        </button>
                      </td>
                       <td>
                        <input type="checkbox" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-muted py-3">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        </div>
      </div>

      {/* Toastr */}
      <ToastContainer position="top-right" />
    </div>
  );
};

export default UsersPage;
