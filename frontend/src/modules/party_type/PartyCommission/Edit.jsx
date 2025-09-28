import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PartyTypeAPI, PartyAPI, PartyCommissionAPI } from "../../../api/partyType";
import { CategoryAPI, ProductAPI, UnitAPI, UnitSizeAPI } from "../../../api/products";
import Swal from "sweetalert2";
import { useTranslation } from "../../../contexts/TranslationContext";

export default function PartyCommissionEdit() {
    const nav = useNavigate();
    const { id } = useParams(); // URL থেকে commission id
    const { t } = useTranslation();

    const [partyTypes, setPartyTypes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [units, setUnits] = useState([]);
    const [unitSizes, setUnitSizes] = useState([]);
    const [partyOptions, setPartyOptions] = useState([]);

    const [formData, setFormData] = useState({
        party_type: "",
        party: "",
        category: "",
        product: "",
        unit: "",
        unit_size: "",
        commission_percentage: "",
        commission_amount: "",
    });

    // সব ড্রপডাউন ডেটা লোড
    const loadDropdowns = async () => {
        try {
            const [pts, cs, ps, us, usizes] = await Promise.all([
                PartyTypeAPI.list(),
                CategoryAPI.list(),
                ProductAPI.list(),
                UnitAPI.list(),
                UnitSizeAPI.list(),
            ]);
            setPartyTypes(pts);
            setCategories(cs);
            setProducts(ps);
            setUnits(us);
            setUnitSizes(usizes);
        } catch (err) {
            console.error(err);
        }
    };

    // নির্দিষ্ট Party Commission ডেটা লোড
    const loadCommission = async () => {
        try {
            const data = await PartyCommissionAPI.get(id);

            // Party load করতে হবে PartyType দিয়ে
            if (data.party_type) {
                const parties = await PartyAPI.list({ party_type: data.party_type.id });
                setPartyOptions(parties);
            }

            setFormData({
                party_type: data.party_type?.id || "",
                party: data.party?.id || "",
                category: data.category?.id || "",
                product: data.product?.id || "",
                unit: data.unit?.id || "",
                unit_size: data.unit_size?.id || "",
                commission_percentage: data.commission_percentage || "",
                commission_amount: data.commission_amount || "",
            });
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to load data", "error");
            nav("/admin/party-commission");
        }
    };

    useEffect(() => {
        loadDropdowns();
        loadCommission();
    }, []);

    // PartyType change করলে Party load হবে
    const handlePartyTypeChange = async (partyTypeId) => {
        setFormData({ ...formData, party_type: partyTypeId, party: "" });
        if (!partyTypeId) return setPartyOptions([]);
        try {
            const ps = await PartyAPI.list({ party_type: partyTypeId });
            setPartyOptions(ps);
        } catch (err) {
            console.error(err);
        }
    };

    // Save / Update
    const handleSubmit = async () => {
        try {
            const payload = {
                party_type: formData.party_type,
                party: formData.party,
                category: formData.category || null,
                product: formData.product,
                unit: formData.unit || null,
                unit_size: formData.unit_size || null,
                commission_percentage: formData.commission_percentage || 0,
                commission_amount: formData.commission_amount || 0,
            };

            await PartyCommissionAPI.update(id, payload);
            Swal.fire("Success", "Party commission updated!", "success");
            nav("/admin/party-commission");
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to update commission", "error");
        }
    };

    return (
        <div className="container mt-3">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                    <h5>{t("edit_party_commissions")}</h5>
                </div>
                <div className="card-body">
                    <div className="row g-2 align-items-end">
                        {/* Party Type */}
                        <div className="col-md-3 col-sm-6">
                            <label>Party Type *</label>
                            <select
                                className="form-select"
                                value={formData.party_type}
                                onChange={(e) => handlePartyTypeChange(parseInt(e.target.value) || "")}
                            >
                                <option value="">-- Party Type --</option>
                                {partyTypes.map((pt) => (
                                    <option key={pt.id} value={pt.id}>
                                        {pt.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Party */}
                        <div className="col-md-3 col-sm-6">
                            <label>Party *</label>
                            <select
                                className="form-select"
                                value={formData.party}
                                onChange={(e) =>
                                    setFormData({ ...formData, party: parseInt(e.target.value) || "" })
                                }
                                disabled={!partyOptions.length}
                            >
                                <option value="">-- Party --</option>
                                {partyOptions.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category */}
                        <div className="col-md-3 col-sm-6">
                            <label>Category</label>
                            <select
                                className="form-select"
                                value={formData.category}
                                onChange={(e) =>
                                    setFormData({ ...formData, category: parseInt(e.target.value) || "" })
                                }
                            >
                                <option value="">-- Category --</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Product */}
                        <div className="col-md-3 col-sm-6">
                            <label>Product *</label>
                            <select
                                className="form-select"
                                value={formData.product}
                                onChange={(e) =>
                                    setFormData({ ...formData, product: parseInt(e.target.value) || "" })
                                }
                            >
                                <option value="">-- Product --</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Unit */}
                        <div className="col-md-3 col-sm-6 mt-2">
                            <label>Unit</label>
                            <select
                                className="form-select"
                                value={formData.unit}
                                onChange={(e) =>
                                    setFormData({ ...formData, unit: parseInt(e.target.value) || "" })
                                }
                            >
                                <option value="">-- Unit --</option>
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Unit Size */}
                        <div className="col-md-3 col-sm-6 mt-2">
                            <label>Unit Size</label>
                            <select
                                className="form-select"
                                value={formData.unit_size}
                                onChange={(e) =>
                                    setFormData({ ...formData, unit_size: parseInt(e.target.value) || "" })
                                }
                            >
                                <option value="">-- Unit Size --</option>
                                {unitSizes.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.size_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Commission % */}
                        <div className="col-md-3 col-sm-6 mt-2">
                            <label>Commission %</label>
                            <input
                                type="number"
                                className="form-control"
                                min="0"
                                max="100"
                                value={formData.commission_percentage}
                                onChange={(e) => {
                                    let val = parseFloat(e.target.value);
                                    if (val > 100) val = 100;
                                    if (val < 0) val = 0;
                                    setFormData({ ...formData, commission_percentage: val || "" });
                                }}
                            />
                        </div>

                        {/* Commission Amount */}
                        <div className="col-md-3 col-sm-6 mt-2">
                            <label>Commission Amount</label>
                            <input
                                type="number"
                                className="form-control"
                                value={formData.commission_amount}
                                onChange={(e) =>
                                    setFormData({ ...formData, commission_amount: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="d-flex justify-content-end mt-3">
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            Update
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
