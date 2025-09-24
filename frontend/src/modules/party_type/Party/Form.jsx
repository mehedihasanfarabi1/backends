import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PartyAPI, PartyTypeAPI } from "../../../api/partyType";
import {  UserPermissionAPI } from "../../../api/permissions";
import {   CompanyAPI } from "../../../api/company";
import Swal from "sweetalert2";

export default function PartyForm() {
    const { id } = useParams();
    const nav = useNavigate();

    const [form, setForm] = useState({
        company_id: null,
        party_type_id: null,
        code: "",
        name: "",
        father_name: "",
        village: "",
        post: "",
        thana: "",
        zila: "",
        mobile: "",
        nid: "",
        is_default: false,
        session: "",
        status: true,
        booking_bag: 0,
        bag_weight: 0,
        total_weight: 0,
        per_bag_rent: 0,
        total_rent: 0,
        per_kg_rent: 0,
        total_kg_rent: 0,
        rent_receive: 0,
        per_bag_commission: 0,
        interest_start_date: "",
        interest_rate: 0,
    });

    const [companies, setCompanies] = useState([]);
    const [partyTypes, setPartyTypes] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [companyData, partyTypeData] = await Promise.all([
                    CompanyAPI.list(),
                    PartyTypeAPI.list(),
                ]);
                setCompanies(companyData);
                setPartyTypes(partyTypeData);

                if (id) {
                    const data = await PartyAPI.retrieve(id);
                    setForm({
                        ...form,
                        company_id: data.company?.id || null,
                        party_type_id: data.party_type?.id || null,
                        code: data.code || "",
                        name: data.name || "",
                        father_name: data.father_name || "",
                        village: data.village || "",
                        post: data.post || "",
                        thana: data.thana || "",
                        zila: data.zila || "",
                        mobile: data.mobile || "",
                        nid: data.nid || "",
                        is_default: data.is_default || false,
                        session: data.session || "",
                        status: data.status || true,
                        booking_bag: data.booking_bag || 0,
                        bag_weight: data.bag_weight || 0,
                        total_weight: data.total_weight || 0,
                        per_bag_rent: data.per_bag_rent || 0,
                        total_rent: data.total_rent || 0,
                        per_kg_rent: data.per_kg_rent || 0,
                        total_kg_rent: data.total_kg_rent || 0,
                        rent_receive: data.rent_receive || 0,
                        per_bag_commission: data.per_bag_commission || 0,
                        interest_start_date: data.interest_start_date || "",
                        interest_rate: data.interest_rate || 0,
                    });
                }

                const userId = localStorage.getItem("userId");
                if (userId) {
                    const perms = await UserPermissionAPI.getByUser(userId);
                    const allowed = [];
                    perms.forEach((p) => {
                        const partyPerm = p.party_type_module || {};
                        Object.entries(partyPerm).forEach(([module, actions]) => {
                            Object.entries(actions).forEach(([action, allowedFlag]) => {
                                if (allowedFlag) allowed.push(`${module}_${action}`);
                            });
                        });
                    });
                    setPermissions(allowed);
                }
            } catch (err) {
                console.error(err);
                Swal.fire("Error", "Failed to load data", "error");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const onSubmit = async (e) => {
        e.preventDefault();
        try {
            if (id) {
                if (!permissions.includes("party_edit"))
                    return Swal.fire("Access Denied", "Cannot edit", "error");
                await PartyAPI.update(id, form);
            } else {
                if (!permissions.includes("party_create") && permissions.length > 0)
                    return Swal.fire("Access Denied", "Cannot create", "error");
                await PartyAPI.create(form);
            }
            Swal.fire("Success", "Saved successfully!", "success");
            nav("/admin/parties");
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Save failed", "error");
        }
    };

    if (loading) return <div className="text-center mt-5">Loading...</div>;

    return (
        <div className="container my-4 d-flex justify-content-center">
            <div className="card shadow-sm w-100" style={{ maxWidth: "950px" }}>
                <div className="card-header bg-primary text-white">
                    <h5 className="mb-0">{id ? "Edit Party" : "Create Party"}</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={onSubmit}>
                        <div className="row gx-3 gy-2">
                            {/* Left Column */}
                            <div className="col-lg-6 col-md-12">
                                {[
                                    { label: "Company *", name: "company_id", type: "select", options: companies, required: true },
                                    { label: "Party Type", name: "party_type_id", type: "select", options: partyTypes },
                                    { label: "Code", name: "code", type: "number" },
                                    { label: "Name *", name: "name", type: "text", required: true },
                                    { label: "Father Name", name: "father_name" },
                                    { label: "Village", name: "village" },
                                    { label: "Post", name: "post" },
                                    { label: "Thana", name: "thana" },
                                    { label: "Zila", name: "zila" },
                                    { label: "Mobile", name: "mobile" },
                                    { label: "NID", name: "nid" },
                                    { label: "Session", name: "session" },
                                    { label: "Is Default", name: "is_default", type: "checkbox" },
                                ].map((f) => (
                                    <div className="mb-2" key={f.name}>
                                        <label className="form-label">{f.label}</label>
                                        {f.type === "select" ? (
                                            <select
                                                className="form-select"
                                                value={form[f.name] || ""}
                                                onChange={(e) =>
                                                    setForm({ ...form, [f.name]: e.target.value })
                                                }
                                                required={f.required}
                                            >
                                                <option value="">-- Select --</option>
                                                {f.options &&
                                                    f.options.map((o) => (
                                                        <option key={o.id} value={o.id}>
                                                            {o.name}
                                                        </option>
                                                    ))}
                                            </select>
                                        ) : f.type === "checkbox" ? (
                                            <input
                                                type="checkbox"
                                                className="form-check-input"
                                                checked={form[f.name]}
                                                onChange={(e) =>
                                                    setForm({ ...form, [f.name]: e.target.checked })
                                                }
                                            />
                                        ) : (
                                            <input
                                                type={f.type || "text"}
                                                className="form-control"
                                                value={form[f.name]}
                                                onChange={(e) =>
                                                    setForm({ ...form, [f.name]: e.target.value })
                                                }
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Right Column */}
                            <div className="col-lg-6 col-md-12">
                                {[
                                    { label: "Status", name: "status", type: "select", options: [{ id: true, name: "Active" }, { id: false, name: "Inactive" }] },
                                    { label: "Booking Bag", name: "booking_bag", type: "number" },
                                    { label: "Bag Weight", name: "bag_weight", type: "number" },
                                    { label: "Total Weight", name: "total_weight", type: "number" },
                                    { label: "Per Bag Rent", name: "per_bag_rent", type: "number" },
                                    { label: "Total Rent", name: "total_rent", type: "number" },
                                    { label: "Per KG Rent", name: "per_kg_rent", type: "number" },
                                    { label: "Total KG Rent", name: "total_kg_rent", type: "number" },
                                    { label: "Rent Receive", name: "rent_receive", type: "number" },
                                    { label: "Per Bag Commission (%)", name: "per_bag_commission", type: "number" },
                                    { label: "Interest Start Date", name: "interest_start_date", type: "date" },
                                    { label: "Interest Rate (%)", name: "interest_rate", type: "number" },
                                ].map((f) => (
                                    <div className="mb-2" key={f.name}>
                                        <label className="form-label">{f.label}</label>
                                        {f.type === "select" ? (
                                            <select
                                                className="form-select"
                                                value={f.name === "status" ? form.status : form[f.name]}
                                                onChange={(e) =>
                                                    setForm({ ...form, [f.name]: e.target.value === "true" })
                                                }
                                            >
                                                {f.options.map((o) => (
                                                    <option key={o.id} value={o.id}>
                                                        {o.name}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input
                                                type={f.type || "text"}
                                                className="form-control"
                                                value={form[f.name]}
                                                onChange={(e) =>
                                                    setForm({ ...form, [f.name]: e.target.value })
                                                }
                                            />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="text-center mt-3">
                            <button className="btn btn-success btn-lg" type="submit">
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
