import React, { useEffect, useState } from "react";
import { ProductSizeSettingAPI, ProductAPI, UnitSizeAPI, UnitAPI } from "../../../api/products";

export default function ProductSizeSettingForm() {
  const [form, setForm] = useState({
    product_id: "",
    size_id: "",
    unit_id: "",
    customize_name: "",
  });

  const [products, setProducts] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [units, setUnits] = useState([]);

  useEffect(() => {
    ProductAPI().then(setProducts);
    UnitSizeAPI().then(setSizes);
    UnitAPI().then(setUnits);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await ProductSizeSettingAPI(form);
    alert("Product size setting created!");
  };

  return (
    <form className="container mt-3" onSubmit={handleSubmit}>
      <h3>Create Product Size Setting</h3>

      <div className="mb-3">
        <label className="form-label">Product</label>
        <select
          className="form-control"
          value={form.product_id}
          onChange={(e) => setForm({ ...form, product_id: e.target.value })}
        >
          <option value="">-- Select Product --</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Size</label>
        <select
          className="form-control"
          value={form.size_id}
          onChange={(e) => setForm({ ...form, size_id: e.target.value })}
        >
          <option value="">-- Select Size --</option>
          {sizes.map((s) => (
            <option key={s.id} value={s.id}>{s.size_name}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Unit</label>
        <select
          className="form-control"
          value={form.unit_id}
          onChange={(e) => setForm({ ...form, unit_id: e.target.value })}
        >
          <option value="">-- Select Unit --</option>
          {units.map((u) => (
            <option key={u.id} value={u.id}>{u.unit_name}</option>
          ))}
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Custom Name</label>
        <input
          type="text"
          className="form-control"
          value={form.customize_name}
          onChange={(e) => setForm({ ...form, customize_name: e.target.value })}
        />
      </div>

      <button type="submit" className="btn btn-primary">Save</button>
    </form>
  );
}
