import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "../../contexts/TranslationContext";
import "../../styles/dashboard.css";

export default function Dashboard() {
  const { t } = useTranslation("dashboard"); // i18next hook


  // Dashboard Cards
  const cards = [
    { title: t("departments"), icon: "fa-solid fa-home", link: "/admin/department" },
    { title: t("products"), icon: "fa-solid fa-award", link: "/admin/products" },
    { title: t("party-type"), icon: "fa-solid fa-table-cells-large", link: "/admin/party-types" },
    { title: t("company"), icon: "fa-solid fa-city", link: "/admin/companies" },
    { title: t("pallet"), icon: "fa-solid fa-list-check", link: "/admin/pallet" },
    { title: t("sr"), icon: "fa-solid fa-money-bill", link: "/admin/sr" },
    { title: t("loan"), icon: "fa-solid fa-users", link: "/admin/loan-types" },
    { title: t("booking"), icon: "fa-solid fa-file", link: "/admin/bookings" },
  ];



  return (
    <div className="pro-wrap">
      {/* ==== Dashboard Cards ==== */}
      <section className="dashboard-card-section">
        <div className="dashboard-card-grid">
          {cards.map((c, i) => (
            <Link to={c.link} key={i} className="dashboard-card">
              <i className={c.icon}></i>
              <span>{c.title}</span>
            </Link>
          ))}
        </div>
      </section>
        
     
    </div>
  );
}
