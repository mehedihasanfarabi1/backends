import { useState, useEffect } from "react";
import api from "../../api/axios";
import Swal from "sweetalert2";
import "bootstrap/dist/css/bootstrap.min.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Pagination from "../../components/common/Pagination"; // ✅ তোমার pagination import

export default function DepartmentPage() {
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({ id: null, name: "", description: "" });
    const [showForm, setShowForm] = useState(false);

    // ✅ Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(5);

    // Fetch departments
    const fetchDepartments = async () => {
        try {
            const res = await api.get("departments/");
            setDepartments(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    // Search filter
    const filteredDepartments = departments.filter((d) =>
        d.name.toLowerCase().includes(search.toLowerCase())
    );

    // ✅ Slice data for current page
    const totalPages = Math.ceil(filteredDepartments.length / pageSize);
    const paginatedDepartments = filteredDepartments.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    // Form input change
    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    // Create or Update
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (form.id) {
                await api.put(`departments/${form.id}/`, form);
                Swal.fire("✅ Updated!", "Department updated successfully", "success");
            } else {
                await api.post("departments/", form);
                Swal.fire("✅ Created!", "Department added successfully", "success");
            }
            setForm({ id: null, name: "", description: "" });
            setShowForm(false);
            fetchDepartments();
        } catch (err) {
            Swal.fire("❌ Error", "Something went wrong", "error");
        }
    };

    // Edit
    const handleEdit = (dep) => {
        setForm(dep);
        setShowForm(true);
    };

    // Delete
    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will delete the department!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
            if (result.isConfirmed) {
                await api.delete(`departments/${id}/`);
                Swal.fire("Deleted!", "Department has been deleted.", "success");
                fetchDepartments();
            }
        });
    };

    // ✅ Export Excel
    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(filteredDepartments);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Departments");
        const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "departments.xlsx");
    };

    // ✅ Export PDF
    const handleDownload = () => {
        const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "A4" });
        doc.setFontSize(12);
        doc.text("Department List", doc.internal.pageSize.getWidth() / 2, 40, { align: "center" });

        const tableColumn = ["#", "Name", "Description"];
        const tableRows = filteredDepartments.map((d, index) => [
            index + 1,
            d.name,
            d.description,
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 60,
            theme: "grid",
            styles: { fontSize: 10, halign: "center", cellPadding: 3 },
        });

        doc.save("departments.pdf");
    };

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between mb-3">
                <button className="btn btn-success" onClick={() => setShowForm(true)}>
                    ➕ Create Department
                </button>

                <div className="d-flex">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCurrentPage(1);
                        }}
                        className="form-control me-2"
                    />
                    <button className="btn btn-info btn-outline-danger" style={{ color: "#fff" }}>Search</button>
                </div>

                <div>
                    <button onClick={handleExportExcel} className="btn btn-warning text-white me-2">
                        📤 Export
                    </button>
                    <button onClick={handleDownload} className="btn btn-warning text-white">
                        🖨 Print
                    </button>
                </div>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="card mb-3 shadow-sm">
                    <div className="card-body">
                        <h5>{form.id ? "Edit Department" : "Create Department"}</h5>
                        <form onSubmit={handleSubmit}>
                            <input
                                type="text"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                placeholder="Name"
                                className="form-control mb-2"
                                required
                            />
                            <input
                                type="text"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="Description"
                                className="form-control mb-2"
                            />
                            <button type="submit" className="btn btn-success me-2">
                                Save
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => {
                                    setForm({ id: null, name: "", description: "" });
                                    setShowForm(false);
                                }}
                            >
                                Cancel
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="card shadow-sm">
                <div className="card-header bg-info text-white fw-bold">Department List</div>
                <div className="table-responsive">
                    <table className="table table-striped table-bordered mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Description</th>
                                <th style={{ width: "200px" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedDepartments.length > 0 ? (
                                paginatedDepartments.map((d, index) => (
                                    <tr key={d.id}>
                                        <td>{(currentPage - 1) * pageSize + index + 1}</td>
                                        <td>{d.name}</td>
                                        <td>{d.description}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-info text-white me-2"
                                                onClick={() => handleEdit(d)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(d.id)}
                                            >
                                                🗑 Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="text-center">
                                        No departments found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ✅ Custom Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            </div>
        </div>
    );
}
