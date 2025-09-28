import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PartyTypeAPI, PartyAPI, PartyCommissionAPI } from "../../../api/partyType";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import ActionBar from "../../../components/common/ActionBar";
import UserCompanySelector from "../../../components/UserCompanySelector";
import Swal from "sweetalert2";
import "../../../styles/Table.css";
import { useTranslation } from "../../../contexts/TranslationContext";

export default function PartyCommissionList() {
    const nav = useNavigate();
    const { t } = useTranslation();

    const [rows, setRows] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [currentUserId, setCurrentUserId] = useState(null);

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [selectedBusiness, setSelectedBusiness] = useState(null);
    const [selectedFactory, setSelectedFactory] = useState(null);

    const [partyTypes, setPartyTypes] = useState([]);
    const [parties, setParties] = useState([]);
    const [selectedPartyType, setSelectedPartyType] = useState(null);
    const [selectedParty, setSelectedParty] = useState(null);

    const [selectedRows, setSelectedRows] = useState([]);
    const [search, setSearch] = useState("");

    // ✅ Load current user
    const loadCurrentUser = async () => {
        try {
            const me = await UserAPI.me();
            setCurrentUserId(me.id);
            return me.id;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    // ✅ Load permissions
    const loadPermissions = async () => {
        const userId = currentUserId || (await loadCurrentUser());
        if (!userId) return;

        try {
            const userPerms = await UserPermissionAPI.getByUser(userId);
            const permsArr = [];
            userPerms.forEach((p) => {
                const modulePerms = p.party_type_module?.party_commission || {};
                Object.entries(modulePerms).forEach(([action, allowed]) => {
                    if (allowed) permsArr.push(`party_commission_${action}`);
                });
            });
            setPermissions(permsArr);
        } catch (err) {
            console.error(err);
        }
    };

    // ✅ Load Party Types
    const loadPartyTypes = async () => {
        try {
            const pts = await PartyTypeAPI.list();
            setPartyTypes(pts);
        } catch (err) {
            console.error(err);
        }
    };

    // ✅ Load Parties
    const loadParties = async () => {
        if (!selectedPartyType) return setParties([]);
        try {
            const ps = await PartyAPI.list({ party_type: selectedPartyType });
            setParties(ps);
        } catch (err) {
            console.error(err);
        }
    };

    // ✅ Load PartyCommissions
    const loadData = async () => {
        try {
            const data = await PartyCommissionAPI.list({
                party_type_id: selectedPartyType || undefined,
                party_id: selectedParty || undefined,
            });
            setRows(data);
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to load party commissions", "error");
        }
    };

    useEffect(() => {
        loadPermissions();
        loadPartyTypes();
    }, [currentUserId]);

    useEffect(() => {
        loadParties();
        setSelectedParty(null);
    }, [selectedPartyType]);

    useEffect(() => {
        loadData();
    }, [selectedPartyType, selectedParty, selectedCompany, selectedBusiness, selectedFactory]);

    const toggleSelectRow = (id) => {
        setSelectedRows((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const handleDelete = async () => {
        if (!selectedRows.length) return;
        if (!permissions.includes("party_commission_delete"))
            return Swal.fire("❌ Access Denied", "", "error");

        const confirm = await Swal.fire({
            title: `Delete ${selectedRows.length} commission(s)?`,
            icon: "warning",
            showCancelButton: true,
        });
        if (!confirm.isConfirmed) return;

        try {
            for (let id of selectedRows) await PartyCommissionAPI.remove(id);
            Swal.fire("Deleted!", "", "success");
            setSelectedRows([]);
            loadData();
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Delete failed", "error");
        }
    };

    // ✅ Filtering rows
    const filteredRows = rows.filter((r) => {
        const matchSearch =
            r.product?.name.toLowerCase().includes(search.toLowerCase()) ||
            r.category?.name?.toLowerCase().includes(search.toLowerCase());

        const matchPartyType =
            !selectedPartyType || r.party_type?.id === selectedPartyType;

        const matchParty = !selectedParty || r.party?.id === selectedParty;

        return matchSearch && matchPartyType && matchParty;
    });

    if (!permissions.includes("party_commission_view"))
        return <div className="alert alert-danger text-center mt-3">Access Denied</div>;

    return (
        <div className="container mt-3">
            <ActionBar
                title="Party Commissions"
                onCreate={
                    permissions.includes("party_commission_create")
                        ? () => nav("/admin/party-commissions/new")
                        : undefined
                }
                showCreate={permissions.includes("party_commission_create")}
                onDelete={handleDelete}
                showDelete={permissions.includes("party_commission_delete")}
                selectedCount={selectedRows.length}
                data={filteredRows}
                exportFileName="party_commissions"
                showExport={permissions.includes("party_commission_view")}
            />

            {/* Company Selector */}
            {/* <UserCompanySelector
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        selectedCompany={selectedCompany}
        setSelectedCompany={setSelectedCompany}
        selectedBusiness={selectedBusiness}
        setSelectedBusiness={setSelectedBusiness}
        selectedFactory={selectedFactory}
        setSelectedFactory={setSelectedFactory}
      /> */}

            {/* Search + PartyType + Party */}
            <div className="row g-2 mb-3 align-items-end">
                <div className="col-md-3 col-sm-6">
                    <input
                        className="form-control"
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="col-md-3 col-sm-6">
                    <select
                        className="form-select"
                        value={selectedPartyType || ""}
                        onChange={(e) =>
                            setSelectedPartyType(e.target.value ? parseInt(e.target.value) : null)
                        }
                    >
                        <option value="">-- Party Type --</option>
                        {partyTypes.map((pt) => (
                            <option key={pt.id} value={pt.id}>
                                {pt.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-3 col-sm-6">
                    <select
                        className="form-select"
                        value={selectedParty || ""}
                        onChange={(e) =>
                            setSelectedParty(e.target.value ? parseInt(e.target.value) : null)
                        }
                        disabled={!selectedPartyType}
                    >
                        <option value="">-- Party --</option>
                        {parties.map((p) => (
                            <option key={p.id} value={p.id}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-3 col-sm-6">
                    <button
                        className="btn btn-secondary w-100"
                        onClick={() => {
                            setSearch("");
                            setSelectedPartyType(null);
                            setSelectedParty(null);
                        }}
                    >
                        Clear
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
                <table className="table table-bordered table-striped">
                    <thead className="table-primary">
                        <tr>
                            <th>{t("serial")}</th>
                            <th>{t("party_type")}</th>
                            <th>{t("party_name")}</th>
                            <th>{t("categories")}</th>
                            <th>{t("products")}</th>
                            <th>{t("units")}</th>
                            <th>{t("unit_sizes")}</th>
                            <th>{t("commission_percentage")}</th>
                            <th>{t("commission_amount")}</th>
                            <th>{t("actions")}</th>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={
                                        selectedRows.length === filteredRows.length &&
                                        filteredRows.length > 0
                                    }
                                    onChange={(e) =>
                                        setSelectedRows(
                                            e.target.checked ? filteredRows.map((r) => r.id) : []
                                        )
                                    }
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRows.length ? (
                            filteredRows.map((r, i) => (
                                <tr key={r.id}>
                                    <td>{i + 1}</td>
                                    <td>{r.party_type?.name || "-"}</td>
                                    <td>{r.party?.name || "-"}</td>
                                    <td>{r.category?.name || "-"}</td>
                                    <td>{r.product?.name || "-"}</td>
                                    <td>{r.unit?.name || "-"}</td>
                                    <td>{r.unit_size?.size_name || "-"}</td>
                                    <td>{r.commission_percentage}</td>
                                    <td>{r.commission_amount}</td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-secondary me-1"
                                            onClick={() => nav(`/admin/party-commissions/${r.id}`)}
                                            disabled={!permissions.includes("party_commission_edit")}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => {
                                                setSelectedRows([r.id]);
                                                handleDelete();
                                            }}
                                            disabled={!permissions.includes("party_commission_delete")}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(r.id)}
                                            onChange={() => toggleSelectRow(r.id)}
                                        />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={11} className="text-center">
                                    No data
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
