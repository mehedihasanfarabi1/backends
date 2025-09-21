import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    fetchRoles,
    createRole,
    updateRole,
    deleteRole,
    fetchPermissions,
    fetchRolePermissions,
    assignRolePermissions,
} from "../../../api/roles"; // <-- তোমার API ফাইল

export default function RolesPage() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [selectedRole, setSelectedRole] = useState(null);
    const [rolePermissions, setRolePermissions] = useState([]);
    const [form, setForm] = useState({ id: null, name: "" });
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        loadRoles();
        loadPermissions();
    }, []);

    const loadRoles = async () => {
        const res = await fetchRoles();
        setRoles(res.data);
    };

    const loadPermissions = async () => {
        const res = await fetchPermissions();
        setPermissions(res.data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name) return;

        if (form.id) {
            await updateRole(form.id, { name: form.name });
            Swal.fire("Updated!", "Role updated successfully!", "success");
        } else {
            await createRole({ name: form.name });
            Swal.fire("Created!", "Role created successfully!", "success");
        }

        setForm({ id: null, name: "" });
        setShowForm(false);
        loadRoles();
    };

    const handleDeleteRole = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This role will be deleted permanently!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deleteRole(id);
                loadRoles();
                Swal.fire("Deleted!", "Role has been deleted.", "success");
            }
        });
    };

    const handleSelectRole = async (role) => {
        setSelectedRole(role);
        setForm({ id: role.id, name: role.name });
        setShowForm(true);

        const res = await fetchRolePermissions(role.id);
        setRolePermissions(res.data.map((p) => p.id));
    };

    const togglePermission = (permId) => {
        setRolePermissions((prev) =>
            prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
        );
    };

    const savePermissions = async () => {
        if (!selectedRole) return;
        await assignRolePermissions(selectedRole.id, rolePermissions);
        Swal.fire("Success", "Permissions updated successfully!", "success");
    };

    return (
        <div className="container mt-4">
            <h1 className="h4 mb-4">Roles Management</h1>

            {/* ✅ Create / Edit Role Form */}
            {showForm && (
                <div className="card mb-3 shadow-sm">
                    <div className="card-body">
                        <h5>{form.id ? "Edit Role" : "Create Role"}</h5>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Role Name"
                                className="form-control mb-2"
                                required
                            />
                            <button type="submit" className="btn btn-success me-2">
                                Save
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setForm({ id: null, name: "" });
                                    setShowForm(false);
                                }}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Roles List */}
            <div className="row">
                <div className="col-md-4">
                    <button
                        className="btn btn-primary mb-3"
                        onClick={() => {
                            setForm({ id: null, name: "" });
                            setShowForm(true);
                        }}
                    >
                        + Add Role
                    </button>
                    <ul className="list-group">
                        {roles.map((role) => (
                            <li
                                key={role.id}
                                className={`list-group-item d-flex justify-content-between align-items-center ${selectedRole?.id === role.id ? "active text-white" : ""
                                    }`}
                                onClick={() => handleSelectRole(role)}
                                style={{ cursor: "pointer" }}
                            >
                                <span>{role.name}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteRole(role.id);
                                    }}
                                    className="btn btn-sm btn-danger"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="col-md-8">
                    {selectedRole && (
                        <>
                            <h5>Permissions for {selectedRole.name}</h5>
                            <div className="row">
                                {permissions.map((perm) => (
                                    <div key={perm.id} className="col-md-6 mb-2">
                                        <div className="form-check">
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={rolePermissions.includes(perm.id)}
                                                onChange={() => togglePermission(perm.id)}
                                                id={`perm-${perm.id}`}
                                            />
                                            <label
                                                className="form-check-label"
                                                htmlFor={`perm-${perm.id}`}
                                            >
                                                {perm.name}
                                            </label>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={savePermissions} className="btn btn-success mt-3">
                                Save Permissions
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
