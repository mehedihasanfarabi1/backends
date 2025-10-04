import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "../contexts/TranslationContext";
import { UserAPI, UserPermissionAPI } from "../api/permissions";
import "../styles/main.css";

export default function Sidebar({ collapsed, showMobile, closeMobile }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState({});

  // User permissions fetch
  useEffect(() => {
    (async () => {
      try {
        const user = await UserAPI.me();
        const userPerms = await UserPermissionAPI.getByUser(user.id);
        setPermissions(userPerms || []);
      } catch (err) {
        console.error("Permission load error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Open menu auto-detect
  useEffect(() => {
    const menuPaths = {
      essential_settings: ["/admin/bag-types", "/admin/loan-types", "/admin/conditions", "/admin/pc-settings", "/admin/shed-settings", "/admin/general-settings", "/admin/basic-settings", "/admin/transaction-settings",],
      products: ["/admin/products", "/admin/product-types", "/admin/categories", "/admin/units", "/admin/unit-sizes", "/admin/unit-conversions", "/admin/product-size-settings"],
      party_type: ["/admin/party-types", "/admin/party-list", "/admin/party-commissions", "/admin/party-ledger", "/admin/party-report"],
      settings: ["/admin/projects", "/admin/translations"],
      booking: ["/admin/bookings", "/admin/bookings/new"],
      sr: ["/admin/sr", "/admin/add-sr"],
      pallet: ["/admin/pallet", "/admin/pallet_location", "/admin/pallet_list"],
      loan: ["/admin/sloan", "/admin/sloan"],
      delivery: ["/admin/delivery", "/admin/add-delivery"],
      accounts: ["/admin/accounts", "/admin/account-head"],
      bank: ["/admin/bank", "/admin/add-bank"],
      company_info: ["/admin/companies", "/admin/business-types", "/admin/factories"],
      user_permissions: ["/admin/permissions", "/admin/users", "/admin/users/roles", "/admin/users/permissions", "/admin/permission-designer"],
    };

    const newOpen = {};
    for (const key in menuPaths) {
      newOpen[key] = menuPaths[key].some(p => location.pathname.startsWith(p));
    }
    setOpen(newOpen);
  }, [location.pathname]);

  const toggle = key => setOpen(s => ({ ...s, [key]: !s[key] }));
  const linkClicked = path => { navigate(path); showMobile && closeMobile(); };
  const isActive = path => location.pathname === path;
  const isSubmenuActive = paths => paths.some(p => location.pathname.startsWith(p));
  const hasPermission = module => permissions.some(perm => {
    if (!perm[module]) return false;
    if (typeof perm[module] === "object") return Object.keys(perm[module]).length > 0;
    if (Array.isArray(perm[module])) return perm[module].length > 0;
    return !!perm[module];
  });

  if (loading) return <div className="sidebar">Loading...</div>;

  // Menu configuration
  const menus = [
    { label: "dashboard", icon: "fa-house", path: "/admin" },
    {
      label: "essential_settings", icon: "fa-gear", key: "essential_settings", permission: "settings_module", sub: [
        { label: "bag_type", icon: "fa-ruler-combined", path: "/admin/bag-types" },
        { label: "loan_type", icon: "fa-list", path: "/admin/loan-types" },
        { label: "Conditions", icon: "fa-circle-check", path: "/admin/conditions" },
        { label: "PC Settings", icon: "fa-computer", path: "/admin/pc-settings" },
        { label: "Shed Settings", icon: "fa-warehouse", path: "/admin/shed-settings" },
        { label: "General Settings", icon: "fa-sliders", path: "/admin/general-settings" },
        { label: "Basic Settings", icon: "fa-cogs", path: "/admin/basic-settings" },
        { label: "Transaction Settings", icon: "fa-exchange-alt", path: "/admin/transaction-settings" },
      ]
    },
    {
      label: "party_type", icon: "fa-people-group", key: "party_type", permission: "party_type_module", sub: [
        { label: "party_type", icon: "fa-plus", path: "/admin/party-types" },
        { label: "party_list", icon: "fa-list", path: "/admin/party-list" },
        { label: "party_commission", icon: "fa-percent", path: "/admin/party-commissions" },
        { label: "party_ledger", icon: "fa-book", path: "/admin/party-ledger" },
        { label: "party_report", icon: "fa-chart-line", path: "/admin/party-report" },
      ]
    },
    {
      label: "products", icon: "fa-box", key: "products", permission: "product_module", sub: [
        { label: "products_type", icon: "fa-list", path: "/admin/product-types" },
        { label: "categories", icon: "fa-tags", path: "/admin/categories" },
        { label: "products", icon: "fa-boxes-stacked", path: "/admin/products" },
        { label: "units", icon: "fa-ruler", path: "/admin/units" },
        { label: "unit_sizes", icon: "fa-up-right-and-down-left-from-center", path: "/admin/unit-sizes" },
        { label: "unit_conversion", icon: "fa-right-left", path: "/admin/unit-conversions" },
        { label: "products_size_settings", icon: "fa-sliders", path: "/admin/product-size-settings" },
      ]
    },
    {
      label: "project_settings", icon: "fa-gear", key: "settings", sub: [
        { label: "add_project", icon: "fa-plus", path: "/admin/projects/add" },
        { label: "project_list", icon: "fa-list", path: "/admin/projects" },
        { label: "language_settings", icon: "fa-language", path: "/admin/translations" },
      ]
    },
    { label: "booking", icon: "fa-calendar-check", key: "booking", permission: "booking_module", sub: [{ label: "add_booking", icon: "fa-plus", path: "/admin/bookings" }] },
    { label: "sr", icon: "fa-user-tie", key: "sr", permission: "sr_module", sub: [{ label: "sr_list", icon: "fa-list", path: "/admin/sr" }] },
    {
      label: "pallet", icon: "fa-location-dot", key: "pallet", permission: "pallot_module", sub: [
        { label: "pallet_list", icon: "fa-list", path: "/admin/pallet" },
        { label: "pallet_location", icon: "fa-location-dot", path: "/admin/pallet_location" },
        { label: "pallet", icon: "fa-calendar-check", path: "/admin/pallet_list" },
      ]
    },
    { label: "loan", icon: "fa-hand-holding-dollar", key: "loan", permission: "loan_module", sub: [{ label: "loan_list", icon: "fa-list", path: "/admin/loan" }] },
    {
      label: "delivery", icon: "fa-truck", key: "delivery", sub: [
        { label: "add_delivery", icon: "fa-plus", path: "/admin/add-delivery" },
        { label: "delivery_list", icon: "fa-list", path: "/admin/delivery" },
      ]
    },
    { label: "accounts", icon: "fa-building-columns", key: "accounts", permission: "accounts_module", sub: [{ label: "account_head", icon: "fa-list", path: "/admin/account-head" }] },
    {
      label: "bank", icon: "fa-building-columns", key: "bank", sub: [
        { label: "add_bank", icon: "fa-plus", path: "/admin/add-bank" },
        { label: "bank_list", icon: "fa-list", path: "/admin/bank" },
      ]
    },
    {
      label: "company_info", icon: "fa-building", key: "company_info", permission: "company_module", sub: [
        { label: "company", icon: "fa-city", path: "/admin/companies" },
        { label: "business_type", icon: "fa-briefcase", path: "/admin/business-types" },
        { label: "factory", icon: "fa-industry", path: "/admin/factories" },
      ]
    },
    {
      label: "users_permissions", icon: "fa-user", key: "user_permissions", permission: "company_module", sub: [
        { label: "users_permissions", icon: "fa-file", path: "/admin/permissions" },
        { label: "users", icon: "fa-users", path: "/admin/users" },
        { label: "roles", icon: "fa-slack", path: "/admin/users/roles" },
      ]
    },
    { label: "profile", icon: "fa-user", path: "/admin/profile" },
    { label: "home_settings", icon: "fa-sliders", path: "/admin/home-settings" },
  ];

  return (
    <>
      <div className={`overlay ${showMobile ? "active" : ""}`} onClick={closeMobile}></div>
      <div className={`sidebar ${collapsed ? "collapsed" : "expanded"} ${showMobile ? "show" : ""}`}>
        <ul style={{ marginTop: "50px" }}>
          {menus.map((menu, i) => {
            if (menu.permission && !hasPermission(menu.permission)) return null;

            if (menu.sub) {
              return (
                <React.Fragment key={i}>
                  <li onClick={() => toggle(menu.key)} className={isSubmenuActive(menu.sub.map(s => s.path)) ? "active-parent" : ""}>
                    <i className={`fa-solid ${menu.icon} me-2`}></i>
                    <span>{t(menu.label)}</span>
                    <i className="fa-solid fa-chevron-down ms-auto"></i>
                  </li>
                  <ul className={`submenu ms-4 ${open[menu.key] ? "" : "d-none"}`}>
                    {menu.sub.map((sub, j) => {
                      if (sub.permission && !hasPermission(sub.permission)) return null;
                      return (
                        <li key={j} className={isActive(sub.path) ? "active" : ""} onClick={() => linkClicked(sub.path)}>
                          <i className={`fa-solid ${sub.icon} me-2`}></i> <span>{t(sub.label)}</span>
                        </li>
                      );
                    })}
                  </ul>
                </React.Fragment>
              );
            }

            return (
              <li key={i} className={isActive(menu.path) ? "active" : ""} onClick={() => linkClicked(menu.path)}>
                <i className={`fa-solid ${menu.icon} me-2`}></i> <span>{t(menu.label)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );
}
