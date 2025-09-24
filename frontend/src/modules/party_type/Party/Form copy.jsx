import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PartyAPI } from "../../../api/partyType";
import { PartyTypeAPI } from "../../../api/partyType";
import { CompanyAPI } from "../../../api/company";
import { UserPermissionAPI } from "../../../api/permissions";
import Swal from "sweetalert2";

export default function PartyForm() {
    const { id } = useParams(); // edit mode id
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

    // Load companies, party types, and current data if edit
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

                // Load user permissions
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <div className="container mt-4 d-flex justify-content-center">
            <div className="card shadow-sm w-100" style={{ maxWidth: "900px" }}>
                <div className="card-header bg-primary text-white">
                    <h5>{id ? "Edit Party" : "Create Party"}</h5>
                </div>
                <div className="card-body">
                    <form onSubmit={onSubmit}>
                        <div className="row">
                            {/* Left Column */}
                            <div className="col-md-4 col-sm-12">
                                <div className="mb-1">
                                    <label className="form-label">Company *</label>
                                    <select
                                        className="form-select"
                                        value={form.company_id || ""}
                                        onChange={(e) => setForm({ ...form, company_id: e.target.value })}
                                        required
                                    >
                                        <option value="">-- Select Company --</option>
                                        {companies.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Party Type</label>
                                    <select
                                        className="form-select"
                                        value={form.party_type_id || ""}
                                        onChange={(e) => setForm({ ...form, party_type_id: e.target.value })}
                                    >
                                        <option value="">-- Select Party Type --</option>
                                        {partyTypes.map((pt) => (
                                            <option key={pt.id} value={pt.id}>
                                                {pt.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Code</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.code}
                                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Father Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.father_name}
                                        onChange={(e) => setForm({ ...form, father_name: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Village</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.village}
                                        onChange={(e) => setForm({ ...form, village: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Post</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.post}
                                        onChange={(e) => setForm({ ...form, post: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Thana</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.thana}
                                        onChange={(e) => setForm({ ...form, thana: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Zila</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.zila}
                                        onChange={(e) => setForm({ ...form, zila: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Mobile</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.mobile}
                                        onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">NID</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.nid}
                                        onChange={(e) => setForm({ ...form, nid: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Session</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={form.session}
                                        onChange={(e) => setForm({ ...form, session: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Is Default</label>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={form.is_default}
                                        onChange={(e) => setForm({ ...form, is_default: e.target.checked })}
                                    />
                                </div>
                            </div>

                            {/* Right side fields */}
                            <div className="col-md-4 col-sm-12">
                                <div className="mb-3">
                                    <label className="form-label">Status</label>
                                    <select
                                        className="form-select"
                                        value={form.status}
                                        onChange={(e) =>
                                            setForm({ ...form, status: e.target.value === "true" })
                                        }
                                    >
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>

                                {/* Numeric & rent fields */}
                                <div className="mb-3">
                                    <label className="form-label">Booking Bag</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.booking_bag}
                                        onChange={(e) => setForm({ ...form, booking_bag: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Bag Weight</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.bag_weight}
                                        onChange={(e) => setForm({ ...form, bag_weight: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Total Weight</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.total_weight}
                                        onChange={(e) => setForm({ ...form, total_weight: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Per Bag Rent</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.per_bag_rent}
                                        onChange={(e) => setForm({ ...form, per_bag_rent: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Total Rent</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.total_rent}
                                        onChange={(e) => setForm({ ...form, total_rent: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Per KG Rent</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.per_kg_rent}
                                        onChange={(e) => setForm({ ...form, per_kg_rent: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Total KG Rent</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.total_kg_rent}
                                        onChange={(e) => setForm({ ...form, total_kg_rent: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Rent Receive</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.rent_receive}
                                        onChange={(e) => setForm({ ...form, rent_receive: e.target.value })}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Per Bag Commission (%)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.per_bag_commission}
                                        onChange={(e) =>
                                            setForm({ ...form, per_bag_commission: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Interest Start Date</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={form.interest_start_date}
                                        onChange={(e) =>
                                            setForm({ ...form, interest_start_date: e.target.value })
                                        }
                                    />
                                </div>

                                <div className="mb-3">
                                    <label className="form-label">Interest Rate (%)</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={form.interest_rate}
                                        onChange={(e) => setForm({ ...form, interest_rate: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-3">
                            <button className="btn btn-success" type="submit">
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
