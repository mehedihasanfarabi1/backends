import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { ChamberAPI, FloorAPI, PocketAPI } from "../../../api/pallotApi";

export default function PallotLocationList() {
    const nav = useNavigate();
    const [chambers, setChambers] = useState([]);
    const [expandedChambers, setExpandedChambers] = useState({});
    const [expandedFloors, setExpandedFloors] = useState({});
    const [selectedRows, setSelectedRows] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const chamberList = await ChamberAPI.list();

            const chambersWithFloors = await Promise.all(
                chamberList.map(async (chamber) => {
                    const floors = await FloorAPI.list({ chamber_id: chamber.id });
                    const floorsWithPockets = await Promise.all(
                        floors.map(async (floor) => {
                            const pockets = await PocketAPI.list({ chamber_id: chamber.id, floor_id: floor.id });
                            return { ...floor, pockets };
                        })
                    );
                    return { ...chamber, floors: floorsWithPockets };
                })
            );

            setChambers(chambersWithFloors);
        } catch (err) {
            Swal.fire("Error", "Failed to load data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const toggleChamber = (id) => setExpandedChambers(prev => ({ ...prev, [id]: !prev[id] }));
    const toggleFloor = (id) => setExpandedFloors(prev => ({ ...prev, [id]: !prev[id] }));

    const handleDelete = async (type, id) => {
        const confirm = await Swal.fire({ title: `Delete this ${type}?`, icon: "warning", showCancelButton: true });
        if (!confirm.isConfirmed) return;
        try {
            if (type === "chamber") await ChamberAPI.remove(id);
            if (type === "floor") await FloorAPI.remove(id);
            if (type === "pocket") await PocketAPI.remove(id);
            Swal.fire("Deleted!", "", "success");
            loadData();
        } catch { Swal.fire("Error", "Delete failed", "error"); }
    };

    const handleSelectAll = (checked) => setSelectedRows(checked ? chambers.map(c => c.id) : []);
    const handleSelectRow = (id) => setSelectedRows(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    return (
        <div className="container mt-3">
            <div className="mb-3 d-flex gap-2 flex-wrap">
                <button className="btn btn-primary" onClick={() => nav("/admin/pallet_location/chamber/create")}>Create Chamber</button>
                <button className="btn btn-success" onClick={() => nav("/admin/pallet_location/floor/create")}>Create Floor</button>
                <button className="btn btn-warning" onClick={() => nav("/admin/pallet_location/pocket/create")}>Create Pocket</button>
            </div>

            <div className="table-responsive shadow rounded">
                <table className="table table-hover table-bordered align-middle">
                    <thead className="table-primary">
                        <tr>
                            <th style={{ width: "50px" }}>
                                <input type="checkbox" checked={selectedRows.length === chambers.length && chambers.length > 0} onChange={e => handleSelectAll(e.target.checked)} />
                            </th>
                            <th>Pallot Locations</th>
                            <th style={{ width: "220px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? <tr><td colSpan="3" className="text-center">Loading...</td></tr> :
                            chambers.length ? chambers.map((chamber, i) => (
                                <React.Fragment key={chamber.id}>
                                    <tr className="table-info fw-bold">
                                        <td>
                                            <input type="checkbox" checked={selectedRows.includes(chamber.id)} onChange={() => handleSelectRow(chamber.id)} />
                                        </td>
                                        <td><span style={{ cursor: "pointer" }} onClick={() => toggleChamber(chamber.id)}>{expandedChambers[chamber.id] ? "▼ " : "► "} {chamber.name}</span></td>
                                        <td>
                                            <button className="btn btn-sm btn-outline-primary me-1" onClick={() => nav(`/admin/chamber/${chamber.id}`)}>Edit</button>
                                            <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete("chamber", chamber.id)}>Delete</button>
                                        </td>
                                    </tr>

                                    {expandedChambers[chamber.id] && chamber.floors.map(floor => (
                                        <React.Fragment key={floor.id}>
                                            <tr className="bg-light">
                                                <td></td>
                                                <td className="ps-4"><span style={{ cursor: "pointer" }} onClick={() => toggleFloor(floor.id)}>{expandedFloors[floor.id] ? "▼ " : "► "} {floor.name}</span></td>
                                                <td>
                                                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => nav(`/admin/floor/${floor.id}`)}>Edit</button>
                                                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete("floor", floor.id)}>Delete</button>
                                                </td>
                                            </tr>

                                            {expandedFloors[floor.id] && floor.pockets.reduce((rows, pocket, index) => {
                                                if (index % 2 === 0) rows.push([pocket]);
                                                else rows[rows.length - 1].push(pocket);
                                                return rows;
                                            }, []).map((pair, rowIndex) => (
                                                <tr key={`${floor.id}-pocket-${rowIndex}`}>
                                                    <td></td>
                                                    <td className="ps-5 d-flex gap-3 flex-wrap">
                                                        {pair.map(pocket => (
                                                            <div key={pocket.id} className="d-flex align-items-center border rounded p-2">
                                                                <span>{pocket.name}</span>
                                                                <span className="badge bg-secondary ms-2">Cap: {pocket.capacity}</span>
                                                                <button className="btn btn-sm btn-outline-primary ms-2" onClick={() => nav(`/admin/pocket/${pocket.id}`)}>Edit</button>
                                                                <button className="btn btn-sm btn-outline-danger ms-1" onClick={() => handleDelete("pocket", pocket.id)}>Del</button>
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td></td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            )) :
                                <tr><td colSpan="3" className="text-center">No data available</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
