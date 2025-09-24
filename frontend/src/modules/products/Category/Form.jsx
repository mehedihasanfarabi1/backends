import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CategoryAPI, ProductTypeAPI } from "../../../api/products";
import { CompanyAPI } from "../../../api/company";
import UserCompanySelector from "../../../components/UserCompanySelector";
import Swal from "sweetalert2";
import "../../../styles/Table.css";

export default function CategoryForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);
  const [types, setTypes] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);

  const [currentInput, setCurrentInput] = useState({
    name: "",
    description: "",
    product_type_id: "",
  });

  const [items, setItems] = useState([]);

  // Company dependent data load
  useEffect(() => {
    if (!selectedCompany) {
      setBusinessTypes([]);
      setFactories([]);
      setTypes([]);
      setSelectedBusiness(null);
      setSelectedFactory(null);
      setCurrentInput((prev) => ({ ...prev, product_type_id: "" }));
      return;
    }

    CompanyAPI.details(selectedCompany)
      .then((details) => {
        setBusinessTypes(details.business_types || []);
        setFactories(details.factories || []);
      })
      .catch(console.error);

    ProductTypeAPI.list({ company: selectedCompany }).then(setTypes).catch(console.error);
  }, [selectedCompany]);

  // Edit mode
  useEffect(() => {
    if (id) {
      CategoryAPI.retrieve(id).then((data) => {
        setSelectedCompany(data.company?.id || null);
        setSelectedBusiness(data.business_type?.id || null);
        setSelectedFactory(data.factory?.id || null);

        setCurrentInput({
          name: data.name,
          description: data.description || "",
          product_type_id: data.product_type?.id || "",
        });

        setItems([
          {
            ...data,
            product_type_id: data.product_type?.id || "",
            company_id: data.company?.id || null,
            business_type_id: data.business_type?.id || null,
            factory_id: data.factory?.id || null,
          },
        ]);
      });
    }
  }, [id]);

  // Add item to table (multiple support)
  const addItem = () => {
    if (!selectedCompany) return Swal.fire("Error", "Company select করুন", "error");
    if (!currentInput.product_type_id) return Swal.fire("Error", "Product Type select করুন", "error");
    if (!currentInput.name) return Swal.fire("Error", "Category নাম দিতে হবে", "error");

    const newItem = {
      ...currentInput,
      company_id: selectedCompany,
      business_type_id: selectedBusiness,
      factory_id: selectedFactory,
    };

    setItems([...items, newItem]);
    setCurrentInput({ name: "", description: "", product_type_id: "" });
  };

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  // Submit → single or multiple
  const onSubmit = async (e) => {
    e.preventDefault();

    let payloadItems = items.length > 0 ? items : [];

    if (!id && payloadItems.length === 0) {
      if (!currentInput.name) return Swal.fire("Error", "Category নাম দিতে হবে", "error");
      if (!currentInput.product_type_id) return Swal.fire("Error", "Product Type select করুন", "error");

      payloadItems.push({
        ...currentInput,
        company_id: selectedCompany,
        business_type_id: selectedBusiness,
        factory_id: selectedFactory,
      });
    }

    try {
      if (id) {
        await CategoryAPI.update(id, payloadItems[0]); // edit
      } else {
        await CategoryAPI.bulkCreate({ categories: payloadItems }); // multiple save
      }

      Swal.fire("Success!", "Category save হয়েছে", "success");
      nav("/admin/categories");
    } catch (err) {
      console.error("Save error:", err.response?.data || err);
      Swal.fire("Error", "Save করতে ব্যর্থ হয়েছে", "error");
    }
  };

  return (
    <div className="container mt-3">
      <div className="card shadow-sm">
        <div className="card-header bg-info text-white">
          <h5>{id ? "Edit Category" : "Multiple Category Create"}</h5>
        </div>
        <div className="card-body">
          <form onSubmit={onSubmit}>
            <UserCompanySelector
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
              selectedCompany={selectedCompany}
              setSelectedCompany={setSelectedCompany}
              selectedBusiness={selectedBusiness}
              setSelectedBusiness={setSelectedBusiness}
              selectedFactory={selectedFactory}
              setSelectedFactory={setSelectedFactory}
              setBusinessTypes={setBusinessTypes}
              setFactories={setFactories}
            />

            {/* Add Category Row */}
            <div className="row g-2 align-items-end mt-3">
              <div className="col-md-3 col-sm-6">
                <label className="form-label">Product Type *</label>
                <select
                  className="form-select"
                  value={currentInput.product_type_id}
                  onChange={(e) =>
                    setCurrentInput({ ...currentInput, product_type_id: parseInt(e.target.value) })
                  }
                  disabled={!selectedCompany}
                >
                  <option value="">-- Select Product Type --</option>
                  {types.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3 col-sm-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Category Name *"
                  value={currentInput.name}
                  onChange={(e) => setCurrentInput({ ...currentInput, name: e.target.value })}
                />
              </div>

              <div className="col-md-3 col-sm-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Description"
                  value={currentInput.description}
                  onChange={(e) =>
                    setCurrentInput({ ...currentInput, description: e.target.value })
                  }
                />
              </div>

              <div className="col-md-3 col-sm-6">
                <button type="button" className="btn btn-success w-100" onClick={addItem}>
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
                      <th>Product Type</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td>{types.find((t) => t.id === item.product_type_id)?.name || ""}</td>
                        <td>{item.name}</td>
                        <td>{item.description}</td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-sm btn-danger"
                            onClick={() => removeItem(idx)}
                          >
                            🗑
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="d-flex justify-content-end gap-2 mt-3">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => nav(-1)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
