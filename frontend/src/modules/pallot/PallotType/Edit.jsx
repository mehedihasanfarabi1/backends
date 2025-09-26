import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PartyAPI, PartyTypeAPI } from "../../../api/partyType";
import { UserPermissionAPI } from "../../../api/permissions";
import { CompanyAPI } from "../../../api/company";
import { BookingAPI } from "../../../api/booking";
import Swal from "sweetalert2";

export default function PartyEditForm() {
  const { id } = useParams();
  const nav = useNavigate();

  const [form, setForm] = useState({
    company_id: "",
    party_type_id: "",
    booking_id: "",
    code: "",
    name: "",
    father_name: "",
    village: "",
    post: "",
    thana: "",
    zila: "",
    mobile: "",
    nid: "",
    is_default: false,
    session: "",
    status: true,
    booking_bag: 0,
    bag_weight: 0,
    total_weight: 0,
    per_bag_rent: 0,
    total_rent: 0,
    per_kg_rent: 0,
    total_kg_rent: 0,
    rent_receive: 0,
    per_bag_commission: 0,
    interest_start_date: "",
    interest_rate: 0,
  });

  const [companies, setCompanies] = useState([]);
  const [partyTypes, setPartyTypes] = useState([]);
  const [booking, setBooking] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load companies, party types, bookings & party data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [companyData, allPartyTypes, allBookings] = await Promise.all([
          CompanyAPI.list(),
          PartyTypeAPI.list(),
          BookingAPI.list(),
        ]);
        setCompanies(companyData);
        setPartyTypes(allPartyTypes);
        setBooking(allBookings);

        if (id) {
          const data = await PartyAPI.retrieve(id);
          setForm({
            company_id: data.company?.id ? String(data.company.id) : "",
            party_type_id: data.party_type?.id ? String(data.party_type.id) : "",
            booking_id: data.booking?.id ? String(data.booking.id) : "",
            code: data.code || "",
            name: data.name || "",
            father_name: data.father_name || "",
            village: data.village || "",
            post: data.post || "",
            thana: data.thana || "",
            zila: data.zila || "",
            mobile: data.mobile || "",
            nid: data.nid || "",
            is_default: data.is_default || false,
            session: data.session || "",
            status: data.status !== undefined ? data.status : true,
            booking_bag: data.booking_bag || 0,
            bag_weight: data.bag_weight || 0,
            total_weight: data.total_weight || 0,
            per_bag_rent: data.per_bag_rent || 0,
            total_rent: data.total_rent || 0,
            per_kg_rent: data.per_kg_rent || 0,
            total_kg_rent: data.total_kg_rent || 0,
            rent_receive: data.rent_receive || 0,
            per_bag_commission: data.per_bag_commission || 0,
            interest_start_date: data.interest_start_date || "",
            interest_rate: data.interest_rate || 0,
          });
        }

        // Load permissions
        const userId = localStorage.getItem("userId");
        if (userId) {
          const perms = await UserPermissionAPI.getByUser(userId);
          const allowed = [];

          perms.forEach((p) => {
            if (p.party_type_module) {
              Object.entries(p.party_type_module).forEach(([module, actions]) => {
                Object.entries(actions).forEach(([action, allowedFlag]) => {
                  if (allowedFlag) allowed.push(`${module}_${action}`);
                });
              });
            }
          });

          setPermissions(allowed);
        }
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to load data", "error");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  // Company wise party type load
  useEffect(() => {
    if (form.company_id) {
      PartyTypeAPI.list({ company_id: form.company_id }).then((data) => {
        setPartyTypes(data);
      });
    }
  }, [form.company_id]);

  // Auto calculations
  useEffect(() => {
    const booking_bag = parseFloat(form.booking_bag) || 0;
    const bag_weight = parseFloat(form.bag_weight) || 0;
    const per_bag_rent = parseFloat(form.per_bag_rent) || 0;
    const per_kg_rent = parseFloat(form.per_kg_rent) || 0;

    setForm((prev) => ({
      ...prev,
      total_weight: booking_bag * bag_weight,
      total_rent: booking_bag * per_bag_rent,
      total_kg_rent: booking_bag * bag_weight * per_kg_rent,
    }));
  }, [form.booking_bag, form.bag_weight, form.per_bag_rent, form.per_kg_rent]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        company_id: form.company_id ? parseInt(form.company_id, 10) : null,
        party_type_id: form.party_type_id ? parseInt(form.party_type_id, 10) : null,
        booking_id: form.booking_id ? parseInt(form.booking_id, 10) : null,
      };

      if (id) {
        await PartyAPI.update(id, payload);
      } else {
        if (!permissions.includes("party_create")) {
          return Swal.fire("Access Denied", "Cannot create", "error");
        }
        await PartyAPI.create(payload);
      }
      Swal.fire("Success", "Saved successfully!", "success");
      nav("/admin/party-list");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Save failed", "error");
    }
  };

  const fieldStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "6px",
  };

  const labelStyle = {
    flex: "0 0 40%",
    fontSize: "0.85rem",
    fontWeight: "500",
    marginRight: "8px",
  };

  const inputStyle = {
    flex: "0 0 58%",
    height: "29px",
    fontSize: "0.85rem",
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="container my-3 d-flex justify-content-center">
      <div className="card shadow-sm w-100" style={{ maxWidth: "800px" }}>
        <div className="card-header bg-primary text-white py-2">
          <h6 className="mb-0">{id ? "Edit Party" : "Create Party"}</h6>
        </div>
        <div className="card-body" style={{ fontSize: "0.85rem" }}>
          <form onSubmit={onSubmit}>
            <div className="row gx-5 gy-1">
              {/* Left Column */}
              <div className="col-lg-6 col-md-12">
                {[
                  { label: "Company *", name: "company_id", type: "select", options: companies, required: true },
                  { label: "Party Type", name: "party_type_id", type: "select", options: partyTypes },
                  { label: "Booking", name: "booking_id", type: "select", options: booking },
                  { label: "Code", name: "code", type: "number" },
                  { label: "Name *", name: "name", type: "text", required: true },
                  { label: "Father Name", name: "father_name" },
                  { label: "Village", name: "village" },
                  { label: "Post", name: "post" },
                  { label: "Thana", name: "thana" },
                  { label: "Zila", name: "zila" },
                  { label: "Mobile", name: "mobile" },
                  { label: "NID", name: "nid" },
                  { label: "Session", name: "session" },
                  { label: "Is Default", name: "is_default", type: "checkbox" },
                ].map((f) => (
                  <div style={fieldStyle} key={f.name}>
                    <label style={labelStyle}>{f.label}</label>
                    {f.type === "select" ? (
                      <select
                        style={inputStyle}
                        className="form-select form-select-sm"
                        value={form[f.name] || ""}
                        onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                        required={f.required}
                      >
                        <option value="">-- Select --</option>
                        {f.options?.map((o) => (
                          <option key={o.id} value={String(o.id)}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                    ) : f.type === "checkbox" ? (
                      <input
                        type="checkbox"
                        style={{ marginLeft: "5px" }}
                        checked={form[f.name] || false}
                        onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
                      />
                    ) : (
                      <input
                        style={inputStyle}
                        type={f.type || "text"}
                        className="form-control form-control-sm"
                        value={form[f.name] || ""}
                        onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Right Column */}
              <div className="col-lg-6 col-md-12">
                {[
                  { label: "Status", name: "status", type: "select", options: [{ id: true, name: "Active" }, { id: false, name: "Inactive" }] },
                  { label: "Booking Bag", name: "booking_bag", type: "number" },
                  { label: "Bag Weight", name: "bag_weight", type: "number" },
                  { label: "Total Weight", name: "total_weight", type: "number" },
                  { label: "Per Bag Rent", name: "per_bag_rent", type: "number" },
                  { label: "Total Rent", name: "total_rent", type: "number" },
                  { label: "Per KG Rent", name: "per_kg_rent", type: "number" },
                  { label: "Total KG Rent", name: "total_kg_rent", type: "number" },
                  { label: "Rent Receive", name: "rent_receive", type: "number" },
                  { label: "Per Bag Commission (%)", name: "per_bag_commission", type: "number" },
                  { label: "Interest Start Date", name: "interest_start_date", type: "date" },
                  { label: "Interest Rate (%)", name: "interest_rate", type: "number" },
                ].map((f) => (
                  <div style={fieldStyle} key={f.name}>
                    <label style={labelStyle}>{f.label}</label>
                    {f.type === "select" ? (
                      <select
                        style={inputStyle}
                        className="form-select form-select-sm"
                        value={form[f.name] || ""}
                        onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                      >
                        {f.options.map((o) => (
                          <option key={o.id} value={String(o.id)}>
                            {o.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        style={inputStyle}
                        type={f.type}
                        className="form-control form-control-sm"
                        value={form[f.name] || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setForm((prev) => ({
                            ...prev,
                            [f.name]: f.type === "number" ? parseFloat(val) || 0 : val,
                          }));
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-3">
              <button className="btn btn-success btn-sm px-4" type="submit">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
