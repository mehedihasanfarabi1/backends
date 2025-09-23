import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductAPI, ProductTypeAPI, CategoryAPI } from "../../../api/products";
import { CompanyAPI } from "../../../api/company";
import UserCompanySelector from "../../../components/UserCompanySelector";
import Swal from "sweetalert2";
import "../../../styles/Table.css";

export default function ProductForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);

  const [currentInput, setCurrentInput] = useState({
    product_type_id: null,
    category_id: null,
    name: "",
    short_name: "",
  });

  const [items, setItems] = useState([]);

  // Company dependent data load
  useEffect(() => {
    if (!selectedCompany) {
      setBusinessTypes([]);
      setFactories([]);
      setTypes([]);
      setCategories([]);
      setSelectedBusiness(null);
      setSelectedFactory(null);
      setCurrentInput({ product_type_id: null, category_id: null, name: "", short_name: "" });
      return;
    }

    CompanyAPI.details(selectedCompany)
      .then((data) => {
        setBusinessTypes(data.business_types || []);
        setFactories(data.factories || []);
      })
      .catch(console.error);

    ProductTypeAPI.list({ company: selectedCompany }).then(setTypes).catch(console.error);
  }, [selectedCompany]);

  // Load categories when product type changes
  useEffect(() => {
    if (currentInput.product_type_id) {
      CategoryAPI.list({ product_type: currentInput.product_type_id }).then(setCategories).catch(console.error);
    } else setCategories([]);
  }, [currentInput.product_type_id]);

  // Edit mode
  useEffect(() => {
    if (id) {
      ProductAPI.retrieve(id).then((data) => {
        setSelectedCompany(data.company?.id || null);
        setSelectedBusiness(data.business_type?.id || null);
        setSelectedFactory(data.factory?.id || null);

        setCurrentInput({
          product_type_id: data.product_type?.id || null,
          category_id: data.category?.id || null,
          name: data.name,
          short_name: data.short_name || "",
        });

        setItems([{
          ...data,
          product_type_id: data.product_type?.id || null,
          category_id: data.category?.id || null,
          company_id: data.company?.id || null,
          business_type_id: data.business_type?.id || null,
          factory_id: data.factory?.id || null,
        }]);
      });
    }
  }, [id]);

  const addItem = () => {
    if (!currentInput.name || !currentInput.product_type_id) {
      return Swal.fire("Error", "Product Name & Product Type are required", "error");
    }

    const selectedCategory = categories.find(c => c.id === currentInput.category_id) || null;

    const newItem = {
      ...currentInput,
      company_id: selectedCompany,
      business_type_id: selectedBusiness,
      factory_id: selectedFactory,
      category_obj: selectedCategory,
    };

    setItems([...items, newItem]);
    setCurrentInput({ product_type_id: null, category_id: null, name: "", short_name: "" });
  };

  const removeItem = (index) => setItems(items.filter((_, i) => i !== index));

  const onSubmit = async (e) => {
    e.preventDefault();

    let payloadItems = items.length > 0 ? items : [];

    // যদি multiple add না করা হয়, তবে single input push কর
    if (!id && payloadItems.length === 0) {
      if (!currentInput.name) return Swal.fire("Error", "Product Name দিতে হবে", "error");
      if (!currentInput.product_type_id) return Swal.fire("Error", "Product Type select করুন", "error");

      const selectedCategory = categories.find(c => c.id === currentInput.category_id) || null;
      payloadItems.push({
        ...currentInput,
        company_id: selectedCompany,
        business_type_id: selectedBusiness,
        factory_id: selectedFactory,
        category_id: currentInput.category_id || null,
        category_obj: selectedCategory,
      });
    }

    try {
      if (id) {
        await ProductAPI.update(id, payloadItems[0]); // edit
      } else {
        const payload = payloadItems.map(it => ({
          company_id: it.company_id || null,
          business_type_id: it.business_type_id || null,
          factory_id: it.factory_id || null,
          product_type_id: it.product_type_id,
          category_id: it.category_id || null,
          name: it.name,
          short_name: it.short_name || "",
        }));
        await ProductAPI.bulkCreate({ products: payload }); // multiple save
      }

      Swal.fire("Success!", "Products saved successfully!", "success");
      setItems([]);
      nav('/admin/products');
    } catch (err) {
      console.error("Save error:", err.response?.data || err);
      Swal.fire("Error", "Save failed", "error");
    }
  };

  return (
    <div className="container mt-3">
      <div className="card shadow-sm">
        <div className="card-header bg-primary text-white">
          <h5>{id ? "Edit Product" : "Multiple Product Create"}</h5>
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

            <div className="row g-2 align-items-end mt-3">
              <div className="col-md-3 col-sm-6">
                <label>Product Type *</label>
                <select
                  className="form-select"
                  value={currentInput.product_type_id || ""}
                  onChange={(e) =>
                    setCurrentInput({ ...currentInput, product_type_id: parseInt(e.target.value), category_id: null })
                  }
                  disabled={!selectedCompany}
                >
                  <option value="">-- Select Product Type --</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="col-md-3 col-sm-6">
                <label>Category</label>
                <select
                  className="form-select"
                  value={currentInput.category_id || ""}
                  onChange={(e) => setCurrentInput({ ...currentInput, category_id: parseInt(e.target.value) })}
                  disabled={!currentInput.product_type_id}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="col-md-3 col-sm-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Product Name *"
                  value={currentInput.name}
                  onChange={(e) => setCurrentInput({ ...currentInput, name: e.target.value })}
                />
              </div>

              <div className="col-md-3 col-sm-6">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Short Name"
                  value={currentInput.short_name}
                  onChange={(e) => setCurrentInput({ ...currentInput, short_name: e.target.value })}
                />
              </div>

              <div className="row mt-2">
                <div className="col-12 d-flex justify-content-center">
                  <button
                    type="button"
                    className="btn btn-success"
                    style={{ width: "25%" }}
                    onClick={addItem}
                  >
                    Add
                  </button>
                </div>
              </div>

            </div>

            {items.length > 0 && (
              <div className="table-responsive mt-3">
                <table className="table table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Product Name</th>
                      <th>Short Name</th>
                      <th>Product Type</th>
                      <th>Category</th>
                      <th className="text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => (
                      <tr key={idx}>
                        <td>{it.name}</td>
                        <td>{it.short_name}</td>
                        <td>{types.find(t => t.id === it.product_type_id)?.name || ""}</td>
                        <td>{it.category_obj?.name || "N/A"}</td>
                        <td className="text-center">
                          <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(idx)}>🗑</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="d-flex justify-content-end mt-3">
              <button type="submit" className="btn btn-primary">Save</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
