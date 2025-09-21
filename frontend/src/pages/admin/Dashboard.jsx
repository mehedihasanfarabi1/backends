import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "../../styles/dashboard.css";

export default function Dashboard() {
  const { t } = useTranslation("dashboard"); // i18next hook

  // KPI demo data (API দিলে এখানে বসিয়ে দিন)
  const kpis = [
    { id: "income", title: t("total_income"), value: "$ 15,000", period: t("weekly"), trend: +1.6, icon: "fa-solid fa-sack-dollar", tone: "rose" },
    { id: "orders", title: t("weekly_orders"), value: "45,634", period: t("weekly"), trend: -0.8, icon: "fa-solid fa-bag-shopping", tone: "sky" },
    { id: "visitors", title: t("visitors"), value: "95,741", period: t("monthly"), trend: +0.9, icon: "fa-solid fa-users", tone: "violet" },
    { id: "balance", title: t("my_balance"), value: "$ 8,420", period: t("yearly"), trend: +1.1, icon: "fa-solid fa-wallet", tone: "emerald" },
  ];

  // Dashboard Cards
  const cards = [
    { title: t("departments"), icon: "fa-solid fa-home", link: "/admin/department" },
    { title: t("designations"), icon: "fa-solid fa-award", link: "/admin/designations" },
    { title: t("sections"), icon: "fa-solid fa-table-cells-large", link: "/admin/sections" },
    { title: t("work_stations"), icon: "fa-solid fa-city", link: "/admin/workstations" },
    { title: t("employee_types"), icon: "fa-solid fa-list-check", link: "/admin/employees/types" },
    { title: t("salary_types"), icon: "fa-solid fa-money-bill", link: "/admin/salaries/types" },
    { title: t("employees"), icon: "fa-solid fa-users", link: "/admin/employees" },
    { title: t("reports"), icon: "fa-solid fa-file", link: "/admin/reports" },
  ];

  // Orders
  const orders = [
    { id: "#ORD-1001", customer: "Kristin Watson", total: "$138.40", status: "paid", date: "Aug 24" },
    { id: "#ORD-1002", customer: "Cody Fisher", total: "$98.00", status: "pending", date: "Aug 24" },
    { id: "#ORD-1003", customer: "Darlene Robertson", total: "$224.90", status: "shipped", date: "Aug 23" },
    { id: "#ORD-1004", customer: "Jacob Jones", total: "$45.15", status: "cancelled", date: "Aug 22" },
  ];

  // Actions
  const actions = [
    { icon: "fa-solid fa-plus", label: t("add_product") },
    { icon: "fa-solid fa-tags", label: t("create_coupon") },
    { icon: "fa-solid fa-user", label: t("add_customer") },
    { icon: "fa-solid fa-truck", label: t("new_shipment") },
  ];

  // Dummy Reports
  const dummyReports = [
    { title: t("monthly_hr_report"), desc: t("hr_summary_august") },
    { title: t("employee_performance"), desc: t("employee_kpi_summary") },
    { title: t("recruitment_overview"), desc: t("new_hires_analysis") },
  ];

  // Traffic demo
  const traffic = { direct: 48, organic: 32, referral: 20 };

  // Charts demo data
  const bars = [18, 60, 42, 55, 36, 62, 78, 48, 66, 52, 84, 58];
  const areaSeries = [30, 45, 36, 60, 85, 58, 92, 65, 110, 96, 115, 100];
  const salesSeries = [18, 30, 26, 42, 56, 48, 72, 44, 66, 52, 84, 58];

  const mkPaths = (data) => {
    const w = 300, h = 120;
    const max = Math.max(...data) * 1.2;
    const step = w / (data.length - 1);
    const pts = data.map((v, i) => `${(i * step).toFixed(1)},${(h - (v / max) * h).toFixed(1)}`).join(" ");
    const poly = `0,${h} ${pts} ${w},${h}`;
    return { line: pts, area: poly };
  };
  const views = mkPaths(areaSeries);
  const sales = mkPaths(salesSeries);

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

      {/* ==== Traffic & Overview Chart ==== */}
      <div className="row g-3 g-lg-4 mb-3">
        <div className="col-12 col-lg-8">
          <div className="card border-0 rounded-4 shadow-soft">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">{t("views_sales_overview")}</h5>
                <div className="d-flex align-items-center gap-3">
                  <div className="pd-legend">
                    <span className="dot dot-blue"></span> {t("views")}
                    <span className="ms-3"><span className="dot dot-pink"></span> {t("sales")}</span>
                  </div>
                  <div className="dropdown">
                    <button className="btn btn-sm btn-light rounded-3 dropdown-toggle" data-bs-toggle="dropdown">
                      {t("yearly")}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li><button className="dropdown-item">{t("weekly")}</button></li>
                      <li><button className="dropdown-item">{t("monthly")}</button></li>
                      <li><button className="dropdown-item">{t("yearly")}</button></li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="overview-chart">
                <div className="pd-bar-chart">
                  {bars.map((h, i) => (
                    <div className="pd-bar" key={i}>
                      <span className="bar1" style={{ height: `${h}%` }} />
                      <span className="bar2" style={{ height: `${Math.max(10, h - 20)}%` }} />
                    </div>
                  ))}
                </div>

                <svg className="area-svg" viewBox="0 0 300 120" preserveAspectRatio="none" aria-label={t("views_sales_overview")}>
                  <defs>
                    <linearGradient id="fillBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(59,130,246,.35)" />
                      <stop offset="100%" stopColor="rgba(59,130,246,0)" />
                    </linearGradient>
                    <linearGradient id="fillPink" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255,126,179,.35)" />
                      <stop offset="100%" stopColor="rgba(255,126,179,0)" />
                    </linearGradient>
                  </defs>
                  <polygon points={views.area} fill="url(#fillBlue)"></polygon>
                  <polyline points={views.line} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
                  <polygon points={sales.area} fill="url(#fillPink)"></polygon>
                  <polyline points={sales.line} fill="none" stroke="#ff7eb3" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="col-12 col-lg-4">
          <div className="card border-0 rounded-4 shadow-soft h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="m-0">{t("traffic_sources")}</h5>
              </div>

              <div className="d-flex align-items-center justify-content-between flex-wrap">
                <div className="pd-donut" style={{ ["--a"]: traffic.direct, ["--ab"]: traffic.direct + traffic.organic }}>
                  <div className="pd-donut-hole">
                    <div className="fw-semibold">{t("total")}</div>
                    <div className="fs-5">{traffic.direct + traffic.organic + traffic.referral}%</div>
                  </div>
                </div>

                <ul className="list-unstyled m-0 small">
                  <li className="d-flex align-items-center mb-2">
                    <span className="dot dot-blue me-2" /> {t("direct")} — <span className="ms-1 fw-semibold">{traffic.direct}%</span>
                  </li>
                  <li className="d-flex align-items-center mb-2">
                    <span className="dot dot-teal me-2" /> {t("organic")} — <span className="ms-1 fw-semibold">{traffic.organic}%</span>
                  </li>
                  <li className="d-flex align-items-center">
                    <span className="dot dot-pink me-2" /> {t("referral")} — <span className="ms-1 fw-semibold">{traffic.referral}%</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders + Actions + Activity */}
      <div className="row g-3 g-lg-4">
        <div className="col-12 col-xl-8">
          <div className="card border-0 rounded-4 shadow-soft">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="m-0">{t("recent_orders")}</h5>
                <a className="btn btn-sm btn-outline-secondary" href="#">{t("view_all")}</a>
              </div>
              <div className="table-responsive">
                <table className="table align-middle pro-table">
                  <thead>
                    <tr>
                      <th>{t("order")}</th>
                      <th>{t("customer")}</th>
                      <th>{t("total")}</th>
                      <th>{t("status")}</th>
                      <th>{t("date")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="fw-semibold">{o.id}</td>
                        <td>{o.customer}</td>
                        <td>{o.total}</td>
                        <td><span className={`status ${o.status}`}>{t(o.status)}</span></td>
                        <td>{o.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Dummy Reports */}
          <div className="card border-0 rounded-4 shadow-soft mt-4">
            <div className="card-body">
              <h5 className="m-0 mb-3">{t("hr_reports")}</h5>
              <div className="row row-cols-1 row-cols-md-3 g-3">
                {dummyReports.map((r, idx) => (
                  <div key={idx} className="col">
                    <div className="report-card p-3 rounded-3">
                      <h6>{r.title}</h6>
                      <p className="text-muted">{r.desc}</p>
                      <div className="mt-auto">
                        <button className="btn btn-sm btn-primary w-100">{t("view")}</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions + Activity */}
        <div className="col-12 col-xl-4">
          <div className="card border-0 rounded-4 shadow-soft mb-3">
            <div className="card-body">
              <h5 className="m-0 mb-3">{t("quick_actions")}</h5>
              <div className="row row-cols-2 g-2">
                {actions.map((a, idx) => (
                  <div key={idx} className="col">
                    <button className="action-card w-100">
                      <i className={a.icon}></i>
                      <span>{a.label}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card border-0 rounded-4 shadow-soft">
            <div className="card-body">
              <h5 className="m-0 mb-3">{t("activity")}</h5>
              <ul className="timeline list-unstyled m-0">
                {actions.map((e, i) => (
                  <li key={i} className="timeline-item">
                    <div className="time">{e.t}</div>
                    <div className="dot" />
                    <div className="text">{t(e.text)}</div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
