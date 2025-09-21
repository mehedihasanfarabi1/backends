import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Sidebar({ collapsed, showMobile, closeMobile }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [open, setOpen] = useState({});

  const toggle = (key) => setOpen((s) => ({ ...s, [key]: !s[key] }));
  const linkClicked = () => { if (showMobile) closeMobile(); };

  return (
    <>
      <div
        className={`overlay ${showMobile ? "active" : ""}`}
        onClick={closeMobile}
      ></div>
      <div
        className={`sidebar ${collapsed ? "collapsed" : "expanded"} ${showMobile ? "show" : ""
          }`}
      >
        <ul>
          {/* Dashboard */}
          <li>
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `menu-link ${isActive ? "active" : ""}`
              }
              onClick={linkClicked}
            >
              <i className="fa-solid fa-house me-2"></i>{" "}
              <span>{t("dashboard")}</span>
            </NavLink>
          </li>

          {/* Products Settings */}
          {/* Products Settings */}
          <li onClick={() => toggle("products")}>
            <i className="fa-solid fa-box me-2"></i>
            <span>Products</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.products ? "" : "d-none"}`}>
            <li onClick={() => navigate("/admin/product-types")}>
              <i className="fa-solid fa-list me-2"></i> <span>Product Types</span>
            </li>
            <li onClick={() => navigate("/admin/categories")}>
              <i className="fa-solid fa-tags me-2"></i> <span>Categories</span>
            </li>
            <li onClick={() => navigate("/admin/products")}>
              <i className="fa-solid fa-boxes-stacked me-2"></i> <span>Products</span>
            </li>
            <li onClick={() => navigate("/admin/units")}>
              <i className="fa-solid fa-ruler me-2"></i> <span>Units</span>
            </li>
            <li onClick={() => navigate("/admin/unit-sizes")}>
              <i className="fa-solid fa-up-right-and-down-left-from-center me-2"></i>
              <span>Unit Sizes</span>
            </li>
            <li onClick={() => navigate("/admin/unit-conversions")}>
              <i className="fa-solid fa-right-left me-2"></i> <span>Unit Conversions</span>
            </li>
            <li onClick={() => navigate("/admin/product-size-settings")}>
              <i className="fa-solid fa-sliders me-2"></i> <span>Product Size Settings</span>
            </li>
          </ul>

          {/* Project Settings */}
          <li onClick={() => toggle("settings")}>
            <i className="fa-solid fa-gear me-2"></i>{" "}
            <span>{t("project_settings")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.settings ? "" : "d-none"}`}>
            <li>
              <i className="fa-solid fa-plus me-2"></i>{" "}
              <span>{t("add_project")}</span>
            </li>
            <li>
              <i className="fa-solid fa-list me-2"></i>{" "}
              <span>{t("project_list")}</span>
            </li>
          </ul>

          {/* Booking */}
          <li onClick={() => toggle("booking")}>
            <i className="fa-solid fa-calendar-check me-2"></i>{" "}
            <span>{t("booking")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.booking ? "" : "d-none"}`}>
            <li>
              <i className="fa-solid fa-plus me-2"></i>{" "}
              <span>{t("add_booking")}</span>
            </li>
            <li>
              <i className="fa-solid fa-list me-2"></i>{" "}
              <span>{t("booking_list")}</span>
            </li>
          </ul>

          {/* SR */}
          <li onClick={() => toggle("sr")}>
            <i className="fa-solid fa-user-tie me-2"></i>{" "}
            <span>{t("sr")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.sr ? "" : "d-none"}`}>
            <li>
              <i className="fa-solid fa-plus me-2"></i>{" "}
              <span>{t("add_sr")}</span>
            </li>
            <li>
              <i className="fa-solid fa-list me-2"></i>{" "}
              <span>{t("sr_list")}</span>
            </li>
          </ul>

          {/* Pallet */}
          <li onClick={() => toggle("pallet")}>
            <i className="fa-solid fa-box me-2"></i>{" "}
            <span>{t("pallet")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.pallet ? "" : "d-none"}`}>
            <li>
              <i className="fa-solid fa-plus me-2"></i>{" "}
              <span>{t("add_pallet")}</span>
            </li>
            <li>
              <i className="fa-solid fa-list me-2"></i>{" "}
              <span>{t("pallet_list")}</span>
            </li>
          </ul>

          {/* Loan */}
          <li onClick={() => toggle("loan")}>
            <i className="fa-solid fa-hand-holding-dollar me-2"></i>{" "}
            <span>{t("loan")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.loan ? "" : "d-none"}`}>
            <li>
              <i className="fa-solid fa-plus me-2"></i>{" "}
              <span>{t("add_loan")}</span>
            </li>
            <li>
              <i className="fa-solid fa-list me-2"></i>{" "}
              <span>{t("loan_list")}</span>
            </li>
          </ul>

          {/* Delivery */}
          <li onClick={() => toggle("delivery")}>
            <i className="fa-solid fa-truck me-2"></i>{" "}
            <span>{t("delivery")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.delivery ? "" : "d-none"}`}>
            <li>
              <i className="fa-solid fa-plus me-2"></i>{" "}
              <span>{t("add_delivery")}</span>
            </li>
            <li>
              <i className="fa-solid fa-list me-2"></i>{" "}
              <span>{t("delivery_list")}</span>
            </li>
          </ul>

          {/* Bank */}
          <li onClick={() => toggle("bank")}>
            <i className="fa-solid fa-building-columns me-2"></i>{" "}
            <span>{t("bank")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.bank ? "" : "d-none"}`}>
            <li>
              <i className="fa-solid fa-plus me-2"></i>{" "}
              <span>{t("add_bank")}</span>
            </li>
            <li>
              <i className="fa-solid fa-list me-2"></i>{" "}
              <span>{t("bank_list")}</span>
            </li>
          </ul>


          {/* Users & Company */}
          <li onClick={() => toggle("company_info")}>
            <i className="fa-solid fa-building me-2"></i>
            <span>Company Info</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.company_info ? "" : "d-none"}`}>
            <li onClick={() => navigate("/admin/companies")}>
              <i className="fa-solid fa-city me-2"></i>
              <span>Company</span>
            </li>
            <li onClick={() => navigate("/admin/business-types")}>
              <i className="fa-solid fa-briefcase me-2"></i>
              <span>Business Type</span>
            </li>
            <li onClick={() => navigate("/admin/factories")}>
              <i className="fa-solid fa-industry me-2"></i>
              <span>Factory</span>
            </li>
          </ul>


          {/* Users & Company  */}
          <li onClick={() => toggle("user_permissions")}>
            <i className="fa-solid fa-user me-2"></i>
            <span>{t("users_permissions")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.user_permissions ? "" : "d-none"}`}>
            <li onClick={() => navigate("/admin/permissions")}>
              <i className="fa-solid fa-file me-2"></i>
              <span>{t("users_permissions")}</span>
            </li>
            <li onClick={() => navigate("/admin/users")}>
              <i className="fa-solid fa-users me-2"></i>
              <span>{t("users")}</span>
            </li>
            <li onClick={() => navigate("/admin/users/roles")}>
              <i className="fa-brands fa-slack me-2"></i>
              <span>{t("roles")}</span>
            </li>
            <li onClick={() => navigate("/admin/users/permissions")}>
              <i className="fa-brands fa-gg-circle me-2"></i>
              <span>{t("permissions")}</span>
            </li>
            <li onClick={() => navigate("/admin/permission-designer")}>
              <i className="fa-brands fa-gg-circle me-2"></i>
              <span>{t("permissions_designer")}</span>
            </li>
          </ul>

          {/* Profile */}
          <li>
            <NavLink
              to="/admin/profile"
              className={({ isActive }) =>
                `menu-link ${isActive ? "active" : ""}`
              }
              onClick={linkClicked}
            >
              <i className="fa-solid fa-user me-2"></i>{" "}
              <span>{t("profile")}</span>
            </NavLink>
          </li>

          {/* Home Settings */}
          <li>
            <NavLink
              to="/admin/home-settings"
              className={({ isActive }) =>
                `menu-link ${isActive ? "active" : ""}`
              }
              onClick={linkClicked}
            >
              <i className="fa-solid fa-sliders me-2"></i>
              <span>{t("home_settings")}</span>
            </NavLink>
          </li>
        </ul>
      </div>
    </>
  );
}
