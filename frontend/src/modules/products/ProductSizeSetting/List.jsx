import React, { useEffect, useState } from "react";
import { ProductSizeSettingAPI } from "../../../api/products";

export default function ProductSizeSettingList() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    ProductSizeSettingAPI().then(setItems);
  }, []);

  return (
    <div className="container mt-3">
      <h3>Product Size Settings</h3>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>ID</th>
            <th>Product</th>
            <th>Size</th>
            <th>Unit</th>
            <th>Custom Name</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.id}>
              <td>{i.id}</td>
              <td>{i.product?.name}</td>
              <td>{i.size?.size_name}</td>
              <td>{i.unit?.unit_name}</td>
              <td>{i.customize_name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
