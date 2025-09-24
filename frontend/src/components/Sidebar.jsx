import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "../contexts/TranslationContext";
import "../styles/main.css";

export default function Sidebar({ collapsed, showMobile, closeMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [open, setOpen] = useState({});

  // Initialize open menus based on current path
  useEffect(() => {
    const paths = {
      essential_settings: ["/admin/products", "/admin/product-types", "/admin/categories", "/admin/units", "/admin/unit-sizes", "/admin/unit-conversions", "/admin/product-size-settings"],
      products: ["/admin/products", "/admin/product-types", "/admin/categories", "/admin/units", "/admin/unit-sizes", "/admin/unit-conversions", "/admin/product-size-settings"],
      party_type: ["/admin/party-types", "/admin/party-list", "/admin/party-commission", "/admin/party-ledger", "/admin/party-report"],
      settings: ["/admin/projects", "/admin/translations"],
      booking: ["/admin/bookings", "/admin/add-booking"],
      sr: ["/admin/sr", "/admin/add-sr"],
      pallet: ["/admin/pallet", "/admin/add-pallet"],
      loan: ["/admin/loan", "/admin/add-loan"],
      delivery: ["/admin/delivery", "/admin/add-delivery"],
      bank: ["/admin/bank", "/admin/add-bank"],
      company_info: ["/admin/companies", "/admin/business-types", "/admin/factories"],
      user_permissions: ["/admin/permissions", "/admin/users", "/admin/users/roles", "/admin/users/permissions", "/admin/permission-designer"]
    };

    const newOpen = {};
    for (let key in paths) {
      newOpen[key] = paths[key].some(p => location.pathname.startsWith(p));
    }
    setOpen(newOpen);
  }, [location.pathname]);

  const toggle = (key) => setOpen((s) => ({ ...s, [key]: !s[key] }));
  const linkClicked = (path) => {
    navigate(path);
    if (showMobile) closeMobile();
  };

  const isActive = (path) => location.pathname === path;
  const isSubmenuActive = (paths) => paths.some(p => location.pathname.startsWith(p));

  return (
    <>
      {/* Mobile overlay */}
      <div className={`overlay ${showMobile ? "active" : ""}`} onClick={closeMobile}></div>

      {/* Sidebar */}
      <div className={`sidebar ${collapsed ? "collapsed" : "expanded"} ${showMobile ? "show" : ""}`}>
        <ul>
          {/* Dashboard */}
          <li className={isActive("/admin") ? "active" : ""} onClick={() => linkClicked("/admin")}>
            <i className="fa-solid fa-house me-2"></i> <span>{t("dashboard")}</span>
          </li>

          {/* Essential Settings */}
          <li
            onClick={() => toggle("essential_settings")}
            className={isSubmenuActive([
              "/admin/products",
              "/admin/product-types",
              "/admin/categories",
              "/admin/units",
              "/admin/unit-sizes",
              "/admin/unit-conversions",
              "/admin/product-size-settings",
            ]) ? "active-parent" : ""}
          >
            <i className="fa-solid fa-gear me-2"></i> {/* Main Icon */}
            <span>{t("essential_settings")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>

          <ul className={`submenu ms-4 ${open.essential_settings ? "" : "d-none"}`}>
            {/* Booking Type */}
            <li
              className={isActive("/admin/product-types") ? "active" : ""}
              onClick={() => linkClicked("/admin/product-types")}
            >
              <i className="fa-solid fa-layer-group me-2"></i>
              <span>{t("booking_type")}</span>
            </li>

            {/* Loan Type */}
            <li
              className={isActive("/admin/categories") ? "active" : ""}
              onClick={() => linkClicked("/admin/categories")}
            >
              <i className="fa-solid fa-folder-tree me-2"></i>
              <span>{t("loan_type")}</span>
            </li>

            {/* Product Type */}
            <li
              className={isActive("/admin/products") ? "active" : ""}
              onClick={() => linkClicked("/admin/products")}
            >
              <i className="fa-solid fa-box-open me-2"></i>
              <span>{t("product_type")}</span>
            </li>

            {/*Bag Type */}
            <li
              className={isActive("/admin/units") ? "active" : ""}
              onClick={() => linkClicked("/admin/units")}
            >
              <i className="fa-solid fa-ruler-combined me-2"></i>
              <span>{t("bag_type")}</span>
            </li>

            {/* Site Setting */}
            <li
              className={isActive("/admin/unit-sizes") ? "active" : ""}
              onClick={() => linkClicked("/admin/unit-sizes")}
            >
              <i className="fa-solid fa-maximize me-2"></i>
              <span>{t("site_setting")}</span>
            </li>

            {/*Basic Settings */}
            <li
              className={isActive("/admin/unit-conversions") ? "active" : ""}
              onClick={() => linkClicked("/admin/unit-conversions")}
            >
              <i className="fa-solid fa-arrows-rotate me-2"></i>
              <span>{t("basic_settings")}</span>
            </li>
          </ul>


          {/* Party Type */}
          <li onClick={() => toggle("party_type")} className={isSubmenuActive([
            "/admin/party-types", "/admin/party-list", "/admin/party-commission", "/admin/party-ledger", "/admin/party-report"
          ]) ? "active-parent" : ""}>
            <i className="fa-solid fa-people-group me-2"></i> <span>{t("party_type")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.party_type ? "" : "d-none"}`}>
            <li className={isActive("/admin/party-types") ? "active" : ""} onClick={() => linkClicked("/admin/party-types")}>
              <i className="fa-solid fa-plus me-2"></i> <span>{t("party_type")}</span>
            </li>
            <li className={isActive("/admin/party-list") ? "active" : ""} onClick={() => linkClicked("/admin/party-list")}>
              <i className="fa-solid fa-list me-2"></i> <span>{t("party_list")}</span>
            </li>
            <li className={isActive("/admin/party-commission") ? "active" : ""} onClick={() => linkClicked("/admin/party-commission")}>
              <i className="fa-solid fa-percent me-2"></i> <span>{t("party_commission")}</span>
            </li>
            <li className={isActive("/admin/party-ledger") ? "active" : ""} onClick={() => linkClicked("/admin/party-ledger")}>
              <i className="fa-solid fa-book me-2"></i> <span>{t("party_ledger")}</span>
            </li>
            <li className={isActive("/admin/party-report") ? "active" : ""} onClick={() => linkClicked("/admin/party-report")}>
              <i className="fa-solid fa-chart-line me-2"></i> <span>{t("party_report")}</span>
            </li>
          </ul>


          {/* Products */}
          <li onClick={() => toggle("products")} className={isSubmenuActive([
            "/admin/products", "/admin/product-types", "/admin/categories", "/admin/units",
            "/admin/unit-sizes", "/admin/unit-conversions", "/admin/product-size-settings"
          ]) ? "active-parent" : ""}>
            <i className="fa-solid fa-box me-2"></i> <span>{t("products")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.products ? "" : "d-none"}`}>
            <li className={isActive("/admin/product-types") ? "active" : ""} onClick={() => linkClicked("/admin/product-types")}>
              <i className="fa-solid fa-list me-2"></i> <span>{t("products_type")}</span>
            </li>
            <li className={isActive("/admin/categories") ? "active" : ""} onClick={() => linkClicked("/admin/categories")}>
              <i className="fa-solid fa-tags me-2"></i> <span>{t("categories")}</span>
            </li>
            <li className={isActive("/admin/products") ? "active" : ""} onClick={() => linkClicked("/admin/products")}>
              <i className="fa-solid fa-boxes-stacked me-2"></i> <span>{t("products")}</span>
            </li>
            <li className={isActive("/admin/units") ? "active" : ""} onClick={() => linkClicked("/admin/units")}>
              <i className="fa-solid fa-ruler me-2"></i> <span>{t("units")}</span>
            </li>
            <li className={isActive("/admin/unit-sizes") ? "active" : ""} onClick={() => linkClicked("/admin/unit-sizes")}>
              <i className="fa-solid fa-up-right-and-down-left-from-center me-2"></i> <span>{t("unit_sizes")}</span>
            </li>
            <li className={isActive("/admin/unit-conversions") ? "active" : ""} onClick={() => linkClicked("/admin/unit-conversions")}>
              <i className="fa-solid fa-right-left me-2"></i> <span>{t("unit_conversion")}</span>
            </li>
            <li className={isActive("/admin/product-size-settings") ? "active" : ""} onClick={() => linkClicked("/admin/product-size-settings")}>
              <i className="fa-solid fa-sliders me-2"></i> <span>{t("products_size_settings")}</span>
            </li>
          </ul>


          {/* Project Settings */}
          <li onClick={() => toggle("settings")} className={isSubmenuActive(["/admin/projects", "/admin/translations"]) ? "active-parent" : ""}>
            <i className="fa-solid fa-gear me-2"></i> <span>{t("project_settings")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.settings ? "" : "d-none"}`}>
            <li className={isActive("/admin/projects/add") ? "active" : ""} onClick={() => linkClicked("/admin/projects/add")}>
              <i className="fa-solid fa-plus me-2"></i> <span>{t("add_project")}</span>
            </li>
            <li className={isActive("/admin/projects") ? "active" : ""} onClick={() => linkClicked("/admin/projects")}>
              <i className="fa-solid fa-list me-2"></i> <span>{t("project_list")}</span>
            </li>
            <li className={isActive("/admin/translations") ? "active" : ""} onClick={() => linkClicked("/admin/translations")}>
              <i className="fa-solid fa-language me-2"></i> <span>{t("language_settings")}</span>
            </li>
          </ul>

          {/* Booking */}
          <li onClick={() => toggle("booking")} className={isSubmenuActive(["/admin/bookings", "/admin/add-booking"]) ? "active-parent" : ""}>
            <i className="fa-solid fa-calendar-check me-2"></i> <span>{t("booking")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.booking ? "" : "d-none"}`}>
            <li className={isActive("/admin/add-booking") ? "active" : ""} onClick={() => linkClicked("/admin/add-booking")}>
              <i className="fa-solid fa-plus me-2"></i> <span>{t("add_booking")}</span>
            </li>
            <li className={isActive("/admin/bookings") ? "active" : ""} onClick={() => linkClicked("/admin/bookings")}>
              <i className="fa-solid fa-list me-2"></i> <span>{t("booking_list")}</span>
            </li>
          </ul>

          {/* SR */}
          <li onClick={() => toggle("sr")} className={isSubmenuActive(["/admin/sr", "/admin/add-sr"]) ? "active-parent" : ""}>
            <i className="fa-solid fa-user-tie me-2"></i> <span>{t("sr")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.sr ? "" : "d-none"}`}>
            <li className={isActive("/admin/add-sr") ? "active" : ""} onClick={() => linkClicked("/admin/add-sr")}>
              <i className="fa-solid fa-plus me-2"></i> <span>{t("add_sr")}</span>
            </li>
            <li className={isActive("/admin/sr") ? "active" : ""} onClick={() => linkClicked("/admin/sr")}>
              <i className="fa-solid fa-list me-2"></i> <span>{t("sr_list")}</span>
            </li>
          </ul>

          {/* Pallet */}
          <li onClick={() => toggle("pallet")} className={isSubmenuActive(["/admin/pallet", "/admin/add-pallet"]) ? "active-parent" : ""}>
            <i className="fa-solid fa-box me-2"></i> <span>{t("pallet")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.pallet ? "" : "d-none"}`}>
            <li className={isActive("/admin/add-pallet") ? "active" : ""} onClick={() => linkClicked("/admin/add-pallet")}>
              <i className="fa-solid fa-plus me-2"></i> <span>{t("add_pallet")}</span>
            </li>
            <li className={isActive("/admin/pallet") ? "active" : ""} onClick={() => linkClicked("/admin/pallet")}>
              <i className="fa-solid fa-list me-2"></i> <span>{t("pallet_list")}</span>
            </li>
          </ul>

          {/* Loan */}
          <li onClick={() => toggle("loan")} className={isSubmenuActive(["/admin/loan", "/admin/add-loan"]) ? "active-parent" : ""}>
            <i className="fa-solid fa-hand-holding-dollar me-2"></i> <span>{t("loan")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.loan ? "" : "d-none"}`}>
            <li className={isActive("/admin/add-loan") ? "active" : ""} onClick={() => linkClicked("/admin/add-loan")}>
              <i className="fa-solid fa-plus me-2"></i> <span>{t("add_loan")}</span>
            </li>
            <li className={isActive("/admin/loan") ? "active" : ""} onClick={() => linkClicked("/admin/loan")}>
              <i className="fa-solid fa-list me-2"></i> <span>{t("loan_list")}</span>
            </li>
          </ul>

          {/* Delivery */}
          <li onClick={() => toggle("delivery")} className={isSubmenuActive(["/admin/delivery", "/admin/add-delivery"]) ? "active-parent" : ""}>
            <i className="fa-solid fa-truck me-2"></i> <span>{t("delivery")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.delivery ? "" : "d-none"}`}>
            <li className={isActive("/admin/add-delivery") ? "active" : ""} onClick={() => linkClicked("/admin/add-delivery")}>
              <i className="fa-solid fa-plus me-2"></i> <span>{t("add_delivery")}</span>
            </li>
            <li className={isActive("/admin/delivery") ? "active" : ""} onClick={() => linkClicked("/admin/delivery")}>
              <i className="fa-solid fa-list me-2"></i> <span>{t("delivery_list")}</span>
            </li>
          </ul>

          {/* Bank */}
          <li onClick={() => toggle("bank")} className={isSubmenuActive(["/admin/bank", "/admin/add-bank"]) ? "active-parent" : ""}>
            <i className="fa-solid fa-building-columns me-2"></i> <span>{t("bank")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.bank ? "" : "d-none"}`}>
            <li className={isActive("/admin/add-bank") ? "active" : ""} onClick={() => linkClicked("/admin/add-bank")}>
              <i className="fa-solid fa-plus me-2"></i> <span>{t("add_bank")}</span>
            </li>
            <li className={isActive("/admin/bank") ? "active" : ""} onClick={() => linkClicked("/admin/bank")}>
              <i className="fa-solid fa-list me-2"></i> <span>{t("bank_list")}</span>
            </li>
          </ul>

          {/* Company Info */}
          <li onClick={() => toggle("company_info")} className={isSubmenuActive(["/admin/companies", "/admin/business-types", "/admin/factories"]) ? "active-parent" : ""}>
            <i className="fa-solid fa-building me-2"></i> <span>{t("company_info")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.company_info ? "" : "d-none"}`}>
            <li className={isActive("/admin/companies") ? "active" : ""} onClick={() => linkClicked("/admin/companies")}>
              <i className="fa-solid fa-city me-2"></i> <span>{t("company")}</span>
            </li>
            <li className={isActive("/admin/business-types") ? "active" : ""} onClick={() => linkClicked("/admin/business-types")}>
              <i className="fa-solid fa-briefcase me-2"></i> <span>{t("business_type")}</span>
            </li>
            <li className={isActive("/admin/factories") ? "active" : ""} onClick={() => linkClicked("/admin/factories")}>
              <i className="fa-solid fa-industry me-2"></i> <span>{t("factory")}</span>
            </li>
          </ul>

          {/* User Permissions */}
          <li onClick={() => toggle("user_permissions")} className={isSubmenuActive(["/admin/permissions", "/admin/users", "/admin/users/roles", "/admin/users/permissions", "/admin/permission-designer"]) ? "active-parent" : ""}>
            <i className="fa-solid fa-user me-2"></i> <span>{t("users_permissions")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.user_permissions ? "" : "d-none"}`}>
            <li className={isActive("/admin/permissions") ? "active" : ""} onClick={() => linkClicked("/admin/permissions")}>
              <i className="fa-solid fa-file me-2"></i> <span>{t("users_permissions")}</span>
            </li>
            <li className={isActive("/admin/users") ? "active" : ""} onClick={() => linkClicked("/admin/users")}>
              <i className="fa-solid fa-users me-2"></i> <span>{t("users")}</span>
            </li>
            <li className={isActive("/admin/users/roles") ? "active" : ""} onClick={() => linkClicked("/admin/users/roles")}>
              <i className="fa-brands fa-slack me-2"></i> <span>{t("roles")}</span>
            </li>
            <li className={isActive("/admin/users/permissions") ? "active" : ""} onClick={() => linkClicked("/admin/users/permissions")}>
              <i className="fa-brands fa-gg-circle me-2"></i> <span>{t("permissions")}</span>
            </li>
            <li className={isActive("/admin/permission-designer") ? "active" : ""} onClick={() => linkClicked("/admin/permission-designer")}>
              <i className="fa-brands fa-gg-circle me-2"></i> <span>{t("permissions_designer")}</span>
            </li>
          </ul>

          {/* Profile */}
          <li className={isActive("/admin/profile") ? "active" : ""} onClick={() => linkClicked("/admin/profile")}>
            <i className="fa-solid fa-user me-2"></i> <span>{t("profile")}</span>
          </li>

          {/* Home Settings */}
          <li className={isActive("/admin/home-settings") ? "active" : ""} onClick={() => linkClicked("/admin/home-settings")}>
            <i className="fa-solid fa-sliders me-2"></i> <span>{t("home_settings")}</span>
          </li>

        </ul>
      </div>
    </>
  );
}
