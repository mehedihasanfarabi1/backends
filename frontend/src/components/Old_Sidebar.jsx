import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function Sidebar({ collapsed, showMobile, closeMobile }) {
  const { t ,i18n} =  useTranslation(); // explicit namespace
  const [open, setOpen] = useState({
    settings: false,
    booking: false,
    sr: false,
    pallet: false,
    loan: false,
    delivery: false,
    bank: false,
    account_settings: false,
    lenden: false,
    account_closing: false,
    account_report: false,
    accounts: false,
    voucher: false,
    reports: false,
  });

  const toggle = (key) => setOpen((s) => ({ ...s, [key]: !s[key] }));
  const linkClicked = () => { if (showMobile) closeMobile(); };

  return (
    <>
      <div className={`overlay ${showMobile ? "active" : ""}`} onClick={closeMobile}></div>
      <div
        id="sidebar"
        className={`sidebar ${collapsed ? "collapsed" : "expanded"} ${showMobile ? "show" : ""}`}
      >
        <ul>
          {/* Dashboard */}
          <li>
            <NavLink to="/admin" end className={({ isActive }) => `menu-link ${isActive ? "active" : ""}`} onClick={linkClicked}>
              <i className="fa-solid fa-house me-2"></i> <span>{t("dashboard")}</span>
            </NavLink>
          </li>

          {/* Project Settings */}
          <li onClick={() => toggle("settings")}>
            <i className="fa-solid fa-gear me-2"></i> <span>{t("project_settings")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.settings ? "" : "d-none"}`}>
            <li><i className="fa-solid fa-plus me-2"></i> <span>{t("add_project")}</span></li>
            <li><i className="fa-solid fa-list me-2"></i> <span>{t("project_list")}</span></li>
          </ul>

          {/* Booking */}
          <li onClick={() => toggle("booking")}>
            <i className="fa-solid fa-calendar-check me-2"></i> <span>{t("booking")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.booking ? "" : "d-none"}`}>
            <li><i className="fa-solid fa-plus me-2"></i> <span>{t("add_booking")}</span></li>
            <li><i className="fa-solid fa-list me-2"></i> <span>{t("booking_list")}</span></li>
          </ul>

          {/* SR */}
          <li onClick={() => toggle("sr")}>
            <i className="fa-solid fa-user-tie me-2"></i> <span>{t("sr")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.sr ? "" : "d-none"}`}>
            <li><i className="fa-solid fa-plus me-2"></i> <span>{t("add_sr")}</span></li>
            <li><i className="fa-solid fa-list me-2"></i> <span>{t("sr_list")}</span></li>
          </ul>

          {/* Pallet */}
          <li onClick={() => toggle("pallet")}>
            <i className="fa-solid fa-box me-2"></i> <span>{t("pallet")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.pallet ? "" : "d-none"}`}>
            <li><i className="fa-solid fa-plus me-2"></i> <span>{t("add_pallet")}</span></li>
            <li><i className="fa-solid fa-list me-2"></i> <span>{t("pallet_list")}</span></li>
          </ul>

          {/* Loan */}
          <li onClick={() => toggle("loan")}>
            <i className="fa-solid fa-hand-holding-dollar me-2"></i> <span>{t("loan")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.loan ? "" : "d-none"}`}>
            <li><i className="fa-solid fa-plus me-2"></i> <span>{t("add_loan")}</span></li>
            <li><i className="fa-solid fa-list me-2"></i> <span>{t("loan_list")}</span></li>
          </ul>

          {/* Delivery */}
          <li onClick={() => toggle("delivery")}>
            <i className="fa-solid fa-truck me-2"></i> <span>{t("delivery")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.delivery ? "" : "d-none"}`}>
            <li><i className="fa-solid fa-plus me-2"></i> <span>{t("add_delivery")}</span></li>
            <li><i className="fa-solid fa-list me-2"></i> <span>{t("delivery_list")}</span></li>
          </ul>

          {/* Bank */}
          <li onClick={() => toggle("bank")}>
            <i className="fa-solid fa-building-columns me-2"></i> <span>{t("bank")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.bank ? "" : "d-none"}`}>
            <li><i className="fa-solid fa-plus me-2"></i> <span>{t("add_bank")}</span></li>
            <li><i className="fa-solid fa-list me-2"></i> <span>{t("bank_list")}</span></li>
          </ul>

          {/* Account Settings */}
          <li onClick={() => toggle("account_settings")}>
            <i className="fa-solid fa-gears me-2"></i> <span>{t("account_settings")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.account_settings ? "" : "d-none"}`}>
            <li><i className="fa-solid fa-plus me-2"></i> <span>{t("add_setting")}</span></li>
            <li><i className="fa-solid fa-list me-2"></i> <span>{t("settings_list")}</span></li>
          </ul>

          {/* Lenden */}
          <li onClick={() => toggle("lenden")}>
            <i className="fa-solid fa-right-left me-2"></i> <span>{t("lenden")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.lenden ? "" : "d-none"}`}>
            <li><i className="fa-solid fa-plus me-2"></i> <span>{t("add_lenden")}</span></li>
            <li><i className="fa-solid fa-list me-2"></i> <span>{t("lenden_list")}</span></li>
          </ul>

          {/* Account Closing */}
          <li onClick={() => toggle("account_closing")}>
            <i className="fa-solid fa-lock me-2"></i> <span>{t("account_closing")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.account_closing ? "" : "d-none"}`}>
            <li><i className="fa-solid fa-plus me-2"></i> <span>{t("add_closing")}</span></li>
            <li><i className="fa-solid fa-list me-2"></i> <span>{t("closing_list")}</span></li>
          </ul>

          {/* Account Report */}
          <li onClick={() => toggle("account_report")}>
            <i className="fa-solid fa-file-lines me-2"></i> <span>{t("account_report")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.account_report ? "" : "d-none"}`}>
            <li><i className="fa-solid fa-file me-2"></i> <span>{t("report_list")}</span></li>
          </ul>

          {/* Accounts */}
          <li onClick={() => toggle("accounts")}>
            <i className="fa-solid fa-book me-2"></i> <span>{t("accounts")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.accounts ? "" : "d-none"}`}>
            <li><i className="fa-solid fa-plus me-2"></i> <span>{t("add_account")}</span></li>
            <li><i className="fa-solid fa-list me-2"></i> <span>{t("accounts_list")}</span></li>
          </ul>

          {/* Voucher */}
          <li onClick={() => toggle("voucher")}>
            <i className="fa-solid fa-ticket me-2"></i> <span>{t("voucher")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.voucher ? "" : "d-none"}`}>
            <li><i className="fa-solid fa-plus me-2"></i> <span>{t("add_voucher")}</span></li>
            <li><i className="fa-solid fa-list me-2"></i> <span>{t("voucher_list")}</span></li>
          </ul>

          {/* Reports */}
          <li onClick={() => toggle("reports")}>
            <i className="fa-solid fa-chart-line me-2"></i> <span>{t("reports")}</span>
            <i className="fa-solid fa-chevron-down ms-auto"></i>
          </li>
          <ul className={`submenu ms-4 ${open.reports ? "" : "d-none"}`}>
            <li><i className="fa-solid fa-file me-2"></i> <span>{t("report_list")}</span></li>
          </ul>
        </ul>
      </div>
    </>
  );
}
