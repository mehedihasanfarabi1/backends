import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
    fetchPermissions,
    createPermission,
    updatePermission,
    deletePermission,
} from "../../../api/roles"; // <-- তোমার API ফাইল
import Pagination from "../../../components/common/Pagination";

export default function PermissionsPage() {
    const [permissions, setPermissions] = useState([]);
    const [form, setForm] = useState({ id: null, name: "", code: "" });
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        loadPermissions();
    }, []);

    const loadPermissions = async () => {
        const res = await fetchPermissions();
        setPermissions(res.data);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.code) return;

        if (form.id) {
            await updatePermission(form.id, {
                name: form.name,
                code: form.code,
            });
            Swal.fire("Updated!", "Permission updated successfully!", "success");
        } else {
            await createPermission({ name: form.name, code: form.code });
            Swal.fire("Created!", "Permission created successfully!", "success");
        }

        setForm({ id: null, name: "", code: "" });
        setShowForm(false);
        loadPermissions();
    };

    const handleEdit = (perm) => {
        setForm({ id: perm.id, name: perm.name, code: perm.code });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This permission will be deleted permanently!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await deletePermission(id);
                loadPermissions();
                Swal.fire("Deleted!", "Permission has been deleted.", "success");
            }
        });
    };

    // Pagination
    const totalPages = Math.ceil(permissions.length / itemsPerPage);
    const paginatedData = permissions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="container mt-4">
            <h1 className="h4 mb-4">Permissions Management</h1>

            {/* ✅ Create / Edit Form */}
            {showForm && (
                <div className="card mb-3 shadow-sm">
                    <div className="card-body">
                        <h5>{form.id ? "Edit Permission" : "Create Permission"}</h5>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Permission Name"
                                className="form-control mb-2"
                                required
                            />
                            <input
                                type="text"
                                name="code"
                                value={form.code}
                                onChange={handleChange}
                                placeholder="Permission Code"
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
                                    setForm({ id: null, name: "", code: "" });
                                    setShowForm(false);
                                }}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <button
                className="btn btn-primary mb-3"
                onClick={() => {
                    setForm({ id: null, name: "", code: "" });
                    setShowForm(true);
                }}
            >
                + Add Permission
            </button>

            {/* Permissions Table */}
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th className="bg-info" style={{color:"#fff"}}>Name</th>
                        <th className="bg-info" style={{color:"#fff"}}>Code</th>
                        <th style={{ width: "180px" ,color:"#fff"}} className="bg-info" >Action</th>
                    </tr>
                </thead>
                <tbody>
                    {paginatedData.map((perm) => (
                        <tr key={perm.id}>
                            <td>{perm.name}</td>
                            <td>{perm.code}</td>
                            <td>
                                <button
                                    onClick={() => handleEdit(perm)}
                                    className="btn btn-sm btn-info text-white me-2"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(perm.id)}
                                    className="btn btn-sm btn-danger"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ✅ Custom Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
            />
        </div>
    );
}
