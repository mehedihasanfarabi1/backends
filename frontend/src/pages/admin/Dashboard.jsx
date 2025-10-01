import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../contexts/TranslationContext";
import "../../styles/dashboard.css";
import { UserAPI, UserPermissionAPI } from "../../api/permissions";

export default function Dashboard() {
  const { t } = useTranslation("dashboard"); // i18next hook

  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const user = await UserAPI.me();
        const userPerms = await UserPermissionAPI.getByUser(user.id);
        // console.log("✅ User Permissions:", userPerms);
        setPermissions(userPerms || []);

      } catch (err) {
        console.error("❌ Permission load error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPermissions();
  }, []);



  // Permission check helper
  const hasPermission = (module) => {
    if (!permissions.length) return false;

    return permissions.some((perm) => {
      const val = perm[module];
      // console.log("🔑 Checking permission for:", module, permissions[0][module]);

      if (!val) return false;

      // object হলে চেক করব খালি কিনা
      if (typeof val === "object") {
        return Object.keys(val).length > 0;
      }

      // array হলে চেক করব length > 0 কিনা
      if (Array.isArray(val)) {
        return val.length > 0;
      }


      // fallback: truthy হলে true
      return !!val;
    });
  };

  // Dashboard Cards
  const cards = [
    { title: t("departments"), icon: "fa-solid fa-home", link: "/admin/department", module: "department_module" },
    { title: t("product"), icon: "fa-solid fa-award", link: "/admin/products", module: "product_module" },
    { title: t("party-type"), icon: "fa-solid fa-table-cells-large", link: "/admin/party-types", module: "party_type_module" },
    { title: t("company"), icon: "fa-solid fa-city", link: "/admin/companies", module: "company_module" },
    { title: t("pallet"), icon: "fa-solid fa-list-check", link: "/admin/pallet", module: "pallot_module" },
    { title: t("sr"), icon: "fa-solid fa-money-bill", link: "/admin/sr", module: "sr_module" },
    { title: t("loan"), icon: "fa-solid fa-users", link: "/admin/loan-types", module: "loan_module" },
    { title: t("booking"), icon: "fa-solid fa-file", link: "/admin/bookings", module: "booking_module" },
    { title: t("accounts"), icon: "fa-solid fa-file", link: "/admin/account-head", module: "accounts_module" },
  ];

  return (
    <div className="pro-wrap">
      {/* ==== Dashboard Cards ==== */}
      <section className="dashboard-card-section">
        <div className="dashboard-card-grid">
          {cards.some((c) => hasPermission(c.module)) ? ( // ✅ যদি অন্তত একটা module থাকে
            cards.map((c, i) =>
              hasPermission(c.module) ? (
                <Link
                  to={c.link}
                  key={i}
                  className="dashboard-card"
                  style={{ textDecoration: "none" }} // underline remove ✅
                >
                  <i className={c.icon}></i>
                  <span>{c.title}</span>
                </Link>
              ) : null
            )
          ) : (
            <p style={{ gridColumn: "1 / -1", textAlign: "center", color: "red" }}>
              No permission available for you
            </p>
          )}
        </div>
      </section>
    </div>
  );


}
