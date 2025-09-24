import React, { useState, useEffect } from "react";
import { useTranslation } from "../../contexts/TranslationContext";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import { getSavedLang, saveLang } from "../../utils/languageHelper";
import Pagination from "../../components/common/Pagination";

const ListTranslations = () => {
    const { translations, loading, editTranslation, deleteTranslation } = useTranslation();
    const navigate = useNavigate();

    const [editing, setEditing] = useState({});
    const [lang, setLang] = useState(getSavedLang());
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    useEffect(() => {
        saveLang(lang);
    }, [lang]);

    const rows = Object.values(translations)
        .filter(r => r.key.toLowerCase().includes(search.toLowerCase()) ||
            r.english.toLowerCase().includes(search.toLowerCase()) ||
            r.bangla.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => (a.key > b.key ? 1 : -1));

    // Pagination logic
    const totalPages = Math.ceil(rows.length / itemsPerPage);
    const paginatedRows = rows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleLanguageChange = (e) => setLang(e.target.value);

    const handleChange = async (id, field, value) => {
        setEditing(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
        try {
            await editTranslation(id, { ...translations[id], [field]: value });
            toast.success("Updated successfully");
        } catch {
            toast.error("Update failed");
        }
    };

    if (loading) return <p>Loading translations...</p>;

    return (
        <div className="container my-4">
            <ToastContainer position="top-right" autoClose={2000} />

            {/* Header + Search + Language + Button */}
            <div className="d-flex justify-content-between align-items-center mb-4" style={{ gap: "10px", flexWrap: "nowrap" }}>
                <h2 className="mb-0">Translations</h2>

                <div className="d-flex align-items-center gap-2">
                    {/* Search box */}
                    <div className="input-group input-group-sm" style={{ minWidth: "350px" }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search translations..."
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setCurrentPage(1); // reset page
                            }}
                        />
                        <span className="input-group-text">
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </span>
                    </div>

                    {/* Language selector */}
                    <select
                        className="form-select form-select-sm"
                        value={lang}
                        onChange={handleLanguageChange}
                        style={{ minWidth: "100px" }}
                    >
                        <option value="en">English</option>
                        <option value="bn">Bangla</option>
                    </select>

                    {/* Add New button */}
                    <button
                        style={{ width: '140px' }}
                        className="btn btn-primary btn-sm"
                        onClick={() => navigate("/admin/translations/new")}
                    >
                        New
                    </button>
                </div>
            </div>


            {/* Table */}
            <div className="table-responsive shadow rounded">
                <table className="table table-bordered table-hover mb-0 align-middle">
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: "5%" }}>Sl</th>
                            <th style={{ width: "20%" }}>Key</th>
                            <th style={{ width: "35%" }}>English</th>
                            <th style={{ width: "35%" }}>Bangla</th>
                            <th style={{ width: "5%" }} className="text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRows.map((r, index) => (
                            <tr key={r.id}>
                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                <td>{r.key}</td>
                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={lang === "en" ? editing[r.id]?.english || r.english : editing[r.id]?.english || r.english}
                                        onChange={(e) =>
                                            setEditing(prev => ({ ...prev, [r.id]: { ...prev[r.id], english: e.target.value } }))
                                        }
                                        onBlur={async (e) => {
                                            const newValue = e.target.value;
                                            const oldValue = translations[r.id].english;
                                            if (newValue !== oldValue) { // ✅ কেবল value পরিবর্তন হলে update
                                                try {
                                                    await editTranslation(r.id, { ...translations[r.id], english: newValue });
                                                    toast.success("Updated successfully");
                                                } catch {
                                                    toast.error("Update failed");
                                                }
                                            }
                                        }}
                                    />
                                </td>

                                <td>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={lang === "bn" ? editing[r.id]?.bangla || r.bangla : editing[r.id]?.bangla || r.bangla}
                                        onChange={(e) =>
                                            setEditing(prev => ({ ...prev, [r.id]: { ...prev[r.id], bangla: e.target.value } }))
                                        }
                                        onBlur={async (e) => {
                                            const newValue = e.target.value;
                                            const oldValue = translations[r.id].bangla;
                                            if (newValue !== oldValue) { // ✅ কেবল value পরিবর্তন হলে update
                                                try {
                                                    await editTranslation(r.id, { ...translations[r.id], bangla: newValue });
                                                    toast.success("Updated successfully");
                                                } catch {
                                                    toast.error("Update failed");
                                                }
                                            }
                                        }}
                                    />
                                </td>


                                <td className="text-center">
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => {
                                            Swal.fire({
                                                title: "Are you sure?",
                                                text: "You won't be able to revert this!",
                                                icon: "warning",
                                                showCancelButton: true,
                                                confirmButtonColor: "#d33",
                                                cancelButtonColor: "#3085d6",
                                                confirmButtonText: "Yes, delete it!",
                                            }).then(async (result) => {
                                                if (result.isConfirmed) {
                                                    try {
                                                        await deleteTranslation(r.id);
                                                        Swal.fire("Deleted!", "Translation has been deleted.", "success");
                                                    } catch {
                                                        Swal.fire("Failed!", "Delete failed.", "error");
                                                    }
                                                }
                                            });
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
};

export default ListTranslations;
