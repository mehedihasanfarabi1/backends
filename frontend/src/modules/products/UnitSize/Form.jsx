import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { UnitAPI, UnitSizeAPI } from "../../../api/products";
import { CompanyAPI } from "../../../api/company";
import UserCompanySelector from "../../../components/UserCompanySelector";
import Swal from "sweetalert2";

export default function UnitSizeForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const [units, setUnits] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);

  // ✅ Current Input for single row
  const [currentInput, setCurrentInput] = useState({
    unit_id: "",
    size_name: "",
    uom_weight: "",
  });

  // ✅ Items array for multiple rows
  const [items, setItems] = useState([]);

  // Load Units
  useEffect(() => {
    UnitAPI.list().then(setUnits).catch(console.error);
  }, []);

  // Company select হলে dependent business/factory load
  useEffect(() => {
    if (!selectedCompany) {
      setBusinessTypes([]);
      setFactories([]);
      setSelectedBusiness(null);
      setSelectedFactory(null);
      return;
    }
    CompanyAPI.details(selectedCompany)
      .then(details => {
        setBusinessTypes(details.business_types || []);
        setFactories(details.factories || []);
      })
      .catch(console.error);
  }, [selectedCompany]);

  // Edit mode হলে data load
  useEffect(() => {
    if (id) {
      UnitSizeAPI.retrieve(id).then(data => {
        setSelectedCompany(data.company?.id || null);
        setSelectedBusiness(data.business_type?.id || null);
        setSelectedFactory(data.factory?.id || null);
        setCurrentInput({
          unit_id: data.unit?.id || "",
          size_name: data.size_name,
          uom_weight: data.uom_weight,
        });
        setItems([{
          ...data,
          unit_id: data.unit?.id || "",
          company_id: data.company?.id || null,
          business_type_id: data.business_type?.id || null,
          factory_id: data.factory?.id || null
        }]);
      });
    }
  }, [id]);

  // Add Button → multiple row add
  const addItem = () => {
    if (!currentInput.unit_id) return Swal.fire("Error", "Unit select করুন", "error");
    if (!currentInput.size_name) return Swal.fire("Error", "Size Name দিতে হবে", "error");
    if (!currentInput.uom_weight) return Swal.fire("Error", "Weight দিতে হবে", "error");

    setItems([...items, {
      ...currentInput,
      company_id: selectedCompany,
      business_type_id: selectedBusiness,
      factory_id: selectedFactory,
    }]);

    setCurrentInput({ unit_id: "", size_name: "", uom_weight: "" });
  };

  const removeItem = index => setItems(items.filter((_, i) => i !== index));

  // ✅ Submit → single অথবা multiple support
  const handleSubmit = async e => {
    e.preventDefault();

    // যদি items খালি থাকে, currentInput include কর
    let payloadItems = items.length > 0 ? items : [];
    if (payloadItems.length === 0) {
      if (!currentInput.unit_id || !currentInput.size_name || !currentInput.uom_weight) {
        return Swal.fire("Error", "Unit, Size Name এবং Weight দিতে হবে", "error");
      }
      payloadItems.push({
        ...currentInput,
        company_id: selectedCompany,
        business_type_id: selectedBusiness,
        factory_id: selectedFactory,
      });
    }

    try {
      if (id) {
        // Edit single
        await UnitSizeAPI.update(id, payloadItems[0]);
      } else {
        // Bulk create
        await UnitSizeAPI.bulkCreate({ unit_sizes: payloadItems });
      }
      Swal.fire("Success", "Unit size(s) save হয়েছে!", "success");
      nav("/admin/unit-sizes");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Save করতে ব্যর্থ হয়েছে", "error");
    }
  };

  return (
    <div className="container mt-3">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5>{id ? "Edit Unit Size" : "Multiple Unit Size Create"}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <UserCompanySelector
              selectedUser={selectedUser} setSelectedUser={setSelectedUser}
              selectedCompany={selectedCompany} setSelectedCompany={setSelectedCompany}
              selectedBusiness={selectedBusiness} setSelectedBusiness={setSelectedBusiness}
              selectedFactory={selectedFactory} setSelectedFactory={setSelectedFactory}
              setBusinessTypes={setBusinessTypes} setFactories={setFactories}
            />

            <div className="row g-2 align-items-end mt-3">
              <div className="col-md-4">
                <label className="form-label">Unit *</label>
                <select className="form-select"
                        value={currentInput.unit_id}
                        onChange={e => setCurrentInput({ ...currentInput, unit_id: parseInt(e.target.value) })}>
                  <option value="">-- Select Unit --</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.name} ({u.short_name})</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <input type="text" className="form-control" placeholder="Size Name *"
                       value={currentInput.size_name}
                       onChange={e => setCurrentInput({ ...currentInput, size_name: e.target.value })} />
              </div>
              <div className="col-md-3">
                <input type="number" step="0.01" className="form-control" placeholder="Weight *"
                       value={currentInput.uom_weight}
                       onChange={e => setCurrentInput({ ...currentInput, uom_weight: e.target.value })} />
              </div>
              <div className="col-md-2">
                <button type="button" className="btn btn-success w-100" onClick={addItem}>Add</button>
              </div>
            </div>

            {/* Table */}
            {items.length > 0 && (
              <div className="table-responsive mt-3">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Unit</th>
                      <th>Size Name</th>
                      <th>Weight</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{units.find(u => u.id === item.unit_id)?.name || ""}</td>
                        <td>{item.size_name}</td>
                        <td>{item.uom_weight}</td>
                        <td className="text-center">
                          <button type="button" className="btn btn-sm btn-danger"
                                  onClick={() => removeItem(idx)}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button type="submit" className="btn btn-primary">Save</button>
              <button type="button" className="btn btn-secondary" onClick={() => nav(-1)}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
