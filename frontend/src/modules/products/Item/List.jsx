import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ProductAPI } from "../../../api/products";
import { UserAPI, UserPermissionAPI } from "../../../api/permissions";
import ActionBar from "../../../components/common/ActionBar";
import UserCompanySelector from "../../../components/UserCompanySelector";
import Swal from "sweetalert2";
import "../../../styles/Table.css";

export default function ProductList() {
  const nav = useNavigate();

  const [rows, setRows] = useState([]);
  // const [loading, setLoading] = useState(true);

  const [permissions, setPermissions] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedFactory, setSelectedFactory] = useState(null);

  const [businessTypes, setBusinessTypes] = useState([]);
  const [factories, setFactories] = useState([]);

  const [selectedRows, setSelectedRows] = useState([]);
  const [search, setSearch] = useState("");

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

  const loadPermissions = async () => {
    const userId = currentUserId || (await loadCurrentUser());
    if (!userId) return;

    try {
      const userPerms = await UserPermissionAPI.getByUser(userId);
      const permsArr = [];
      userPerms.forEach((p) => {
        const productModule = p.product_module?.product || {};
        Object.entries(productModule).forEach(([action, allowed]) => {
          if (allowed) permsArr.push(`product_${action}`);
        });
      });
      console.log("Permissions loaded:", permsArr);
      setPermissions(permsArr);
    } catch (err) {
      console.error(err);
    }
  };

  const loadData = async () => {
    try {
      const data = await ProductAPI.list({
        company: selectedCompany || undefined,
        business_type: selectedBusiness || undefined,
        factory: selectedFactory || undefined,
      });

      console.log("Products fetched:", data.map(p => ({
        id: p.id,
        company: p.company?.id,
        business_type: p.business_type?.id,
        factory: p.factory?.id,
        category: p.category?.id
      })));

      setRows(data);
    } catch (err) {
      console.error("Error fetching products:", err);
      Swal.fire("Error", "Failed to load products", "error");
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [currentUserId]);

  useEffect(() => {
    loadData();
  }, [currentUserId, selectedCompany, selectedBusiness, selectedFactory]);

  const toggleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (!selectedRows.length) return;
    if (!permissions.includes("product_delete"))
      return Swal.fire("❌ Access Denied", "", "error");

    const confirm = await Swal.fire({
      title: `Delete ${selectedRows.length} product(s)?`,
      icon: "warning",
      showCancelButton: true,
    });
    if (!confirm.isConfirmed) return;

    try {
      for (let id of selectedRows) await ProductAPI.remove(id);
      Swal.fire("Deleted!", "", "success");
      setSelectedRows([]);
      loadData();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  const filteredRows = rows.filter((r) => {
    // Debug log
    console.log("Filtering row:", r.id, {
      selectedCompany,
      selectedBusiness,
      selectedFactory,
      rCompany: r.company?.id,
      rBusiness: r.business_type?.id,
      rFactory: r.factory?.id,
    });

    return (
      (!selectedCompany || r.company?.id === selectedCompany) &&
      (!selectedBusiness || r.business_type?.id === selectedBusiness) &&
      (!selectedFactory || r.factory?.id === selectedFactory) &&
      (r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.short_name || "").toLowerCase().includes(search.toLowerCase()))
    );
  });

  if (!permissions.includes("product_view"))
    return <div className="alert alert-danger text-center mt-3">Access Denied</div>;

  return (
    <div className="container mt-3">
      <ActionBar
        title="Products"
        onCreate={permissions.includes("product_create") ? () => nav("/admin/products/new") : undefined}
        showCreate={permissions.includes("product_create")}
        onDelete={handleDelete}
        showDelete={permissions.includes("product_delete")}
        selectedCount={selectedRows.length}
        data={filteredRows}
        exportFileName="products"
        showExport={permissions.includes("product_view")}
      />

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

      <div className="d-flex gap-2 mb-3 flex-wrap">
        <input
          className="form-control"
          placeholder="Search..."
          style={{ maxWidth: 250 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-secondary" onClick={() => setSearch("")}>
          Clear
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-primary">
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedRows.length === filteredRows.length && filteredRows.length > 0}
                  onChange={(e) =>
                    setSelectedRows(e.target.checked ? filteredRows.map((r) => r.id) : [])
                  }
                />
              </th>
              <th>SN</th>
              <th>Company</th>
              <th>Business Type</th>
              <th>Factory</th>
              <th>Category</th>
              <th>Name</th>
              <th>Short Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length ? (
              filteredRows.map((r, i) => (
                <tr key={r.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(r.id)}
                      onChange={() => toggleSelectRow(r.id)}
                    />
                  </td>
                  <td>{i + 1}</td>
                  <td>{r.company?.name || "-"}</td>
                  <td>{r.business_type?.name || "-"}</td>
                  <td>{r.factory?.name || "-"}</td>
                  <td>{r.category?.name || "-"}</td>
                  <td>{r.name}</td>
                  <td>{r.short_name}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-1"
                      onClick={() => nav(`/admin/products/${r.id}`)}
                      disabled={!permissions.includes("product_edit")}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setSelectedRows([r.id]);
                        handleDelete();
                      }}
                      disabled={!permissions.includes("product_delete")}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="text-center">
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
