import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PartyTypeAPI, PartyAPI, PartyCommissionAPI } from "../../../api/partyType";
import { CategoryAPI, ProductAPI, UnitAPI, UnitSizeAPI } from "../../../api/products";
import Swal from "sweetalert2";
import { useTranslation } from "../../../contexts/TranslationContext";

export default function PartyCommissionCreate() {
    const nav = useNavigate();
    const { t } = useTranslation();

    const [partyTypes, setPartyTypes] = useState([]);
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [units, setUnits] = useState([]);
    const [unitSizes, setUnitSizes] = useState([]);

    const [currentInput, setCurrentInput] = useState({
        party_type: "",
        party: "",
        category: "",
        product: "",
        unit: "",
        unit_size: "",
        commission_percentage: "",
        commission_amount: "",
        partyOptions: [],
    });

    const [items, setItems] = useState([]);

    // Load dropdown data
    const loadData = async () => {
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

    useEffect(() => {
        loadData();
    }, []);

    const loadParties = async (partyTypeId) => {
        if (!partyTypeId) return;
        try {
            const ps = await PartyAPI.list({ party_type: partyTypeId });
            setCurrentInput({ ...currentInput, party_type: partyTypeId, party: "", partyOptions: ps });
        } catch (err) {
            console.error(err);
        }
    };

    // Add Row
    const addItem = () => {
        if (!currentInput.party_type || !currentInput.party || !currentInput.product) {
            return Swal.fire("Error", "Party Type, Party এবং Product দিতে হবে", "error");
        }

        const selectedPartyType = partyTypes.find((pt) => pt.id === currentInput.party_type);
        const selectedParty = currentInput.partyOptions.find((p) => p.id === currentInput.party);
        const selectedCategory = categories.find((c) => c.id === currentInput.category);
        const selectedProduct = products.find((p) => p.id === currentInput.product);
        const selectedUnit = units.find((u) => u.id === currentInput.unit);
        const selectedUnitSize = unitSizes.find((us) => us.id === currentInput.unit_size);

        const newItem = {
            ...currentInput,
            partyTypeObj: selectedPartyType,
            partyObj: selectedParty,
            categoryObj: selectedCategory,
            productObj: selectedProduct,
            unitObj: selectedUnit,
            unitSizeObj: selectedUnitSize,
        };

        setItems([...items, newItem]);
        setCurrentInput({
            party_type: "",
            party: "",
            category: "",
            product: "",
            unit: "",
            unit_size: "",
            commission_percentage: "",
            commission_amount: "",
            partyOptions: [],
        });
    };

    const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

    // Submit
    const handleSubmit = async () => {
        try {
            let payload = items.map((it) => ({
                party_type: it.party_type,
                party: it.party,
                category: it.category || null,
                product: it.product,
                unit: it.unit || null,
                unit_size: it.unit_size || null,
                commission_percentage: it.commission_percentage || 0,
                commission_amount: it.commission_amount || 0,
            }));

            // Single save যদি add row ছাড়া হয়
            if (payload.length === 0 && currentInput.party_type && currentInput.party && currentInput.product) {
                payload.push({
                    party_type: currentInput.party_type,
                    party: currentInput.party,
                    category: currentInput.category || null,
                    product: currentInput.product,
                    unit: currentInput.unit || null,
                    unit_size: currentInput.unit_size || null,
                    commission_percentage: currentInput.commission_percentage || 0,
                    commission_amount: currentInput.commission_amount || 0,
                });
            }

            if (payload.length === 0) {
                return Swal.fire("Error", "কমপক্ষে ১টা Commission দিতে হবে", "error");
            }

            if (payload.length === 1) {
                await PartyCommissionAPI.create(payload[0]);
            } else {
                await PartyCommissionAPI.bulkCreate(payload);
            }

            Swal.fire("Success", "Party commissions saved!", "success");
            setItems([]);
            nav("/admin/party-commission");
        } catch (err) {
            console.error(err);
            Swal.fire("Error", "Failed to save commissions", "error");
        }
    };

    return (
        <div className="container mt-3">
            <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                    <h5>{t("create_party_commissions")}</h5>
                </div>
                <div className="card-body">
                    {/* Input Row */}
                    <div className="row g-2 align-items-end">
                        <div className="col-md-3 col-sm-6">
                            <label>Party Type *</label>
                            <select
                                className="form-select"
                                value={currentInput.party_type}
                                onChange={(e) => loadParties(parseInt(e.target.value) || "")}
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
                            <label>Party *</label>
                            <select
                                className="form-select"
                                value={currentInput.party}
                                onChange={(e) => setCurrentInput({ ...currentInput, party: parseInt(e.target.value) || "" })}
                                disabled={!currentInput.partyOptions?.length}
                            >
                                <option value="">-- Party --</option>
                                {currentInput.partyOptions?.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-3 col-sm-6">
                            <label>Category</label>
                            <select
                                className="form-select"
                                value={currentInput.category}
                                onChange={(e) => setCurrentInput({ ...currentInput, category: parseInt(e.target.value) || "" })}
                            >
                                <option value="">-- Category --</option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-3 col-sm-6">
                            <label>Product *</label>
                            <select
                                className="form-select"
                                value={currentInput.product}
                                onChange={(e) => setCurrentInput({ ...currentInput, product: parseInt(e.target.value) || "" })}
                            >
                                <option value="">-- Product --</option>
                                {products.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-3 col-sm-6 mt-2">
                            <label>Unit</label>
                            <select
                                className="form-select"
                                value={currentInput.unit}
                                onChange={(e) => setCurrentInput({ ...currentInput, unit: parseInt(e.target.value) || "" })}
                            >
                                <option value="">-- Unit --</option>
                                {units.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-3 col-sm-6 mt-2">
                            <label>Unit Size</label>
                            <select
                                className="form-select"
                                value={currentInput.unit_size}
                                onChange={(e) => setCurrentInput({ ...currentInput, unit_size: parseInt(e.target.value) || "" })}
                            >
                                <option value="">-- Unit Size --</option>
                                {unitSizes.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.size_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-3 col-sm-6 mt-2">
                            <label>Commission %</label>
                            <input
                                type="number"
                                className="form-control"
                                min="0"
                                max="100"
                                value={currentInput.commission_percentage}
                                onChange={(e) => {
                                    let val = parseFloat(e.target.value);
                                    if (val > 100) return Swal.fire("Error", "Value cannot exceed 100", "error");
                                    if (val < 0) val = 0;
                                    setCurrentInput({
                                        ...currentInput,
                                        commission_percentage: val || "",
                                    });
                                }}
                            />
                        </div>


                        <div className="col-md-3 col-sm-6 mt-2">
                            <label>Commission Amount</label>
                            <input
                                type="number"
                                className="form-control"
                                value={currentInput.commission_amount}
                                onChange={(e) => setCurrentInput({ ...currentInput, commission_amount: e.target.value })}
                            />
                        </div>

                        <div className="col-12 mt-3 d-flex justify-content-center">
                            <button type="button" className="btn btn-success" style={{ width: "25%" }} onClick={addItem}>
                                Add
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    {items.length > 0 && (
                        <div className="table-responsive mt-3">
                            <table className="table table-bordered align-middle">
                                <thead className="table-light">
                                    <tr>
                                        <th>Party Type</th>
                                        <th>Party</th>
                                        <th>Category</th>
                                        <th>Product</th>
                                        <th>Unit</th>
                                        <th>Unit Size</th>
                                        <th>%</th>
                                        <th>Amount</th>
                                        <th className="text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((it, idx) => (
                                        <tr key={idx}>
                                            <td>{it.partyTypeObj?.name || ""}</td>
                                            <td>{it.partyObj?.name || ""}</td>
                                            <td>{it.categoryObj?.name || ""}</td>
                                            <td>{it.productObj?.name || ""}</td>
                                            <td>{it.unitObj?.name || ""}</td>
                                            <td>{it.unitSizeObj?.size_name || ""}</td>
                                            <td>{it.commission_percentage}</td>
                                            <td>{it.commission_amount}</td>
                                            <td className="text-center">
                                                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(idx)}>
                                                    🗑
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Save Button */}
                    <div className="d-flex justify-content-end mt-3">
                        <button className="btn btn-primary" onClick={handleSubmit}>
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
