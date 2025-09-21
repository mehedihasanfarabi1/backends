import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import pageTitles from "../utils/pageTitle";

const BREAKPOINT = 768;

export default function AdminLayout() {

  const [collapsed, setCollapsed] = useState(false);
  const [showMobile, setShowMobile] = useState(false);


  const onHamburgerClick = () => {
    if (window.innerWidth < BREAKPOINT) {
      setShowMobile((v) => !v);
    } else {
      setCollapsed((v) => !v);
    }
  };

  // উইন্ডো বড় হলে mobile drawer auto-close
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= BREAKPOINT) setShowMobile(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMobile = () => setShowMobile(false);

  const [title, setTitle] = useState("");
  const [bgColor, setBgColor] = useState("#3498db"); // default color
  const location = useLocation();

  useEffect(() => {
    // Get current page title
    setTitle(document.title);

    // Optional: change background based on path
    if (location.pathname === "/about") setBgColor("#e74c3c");
    else if (location.pathname === "/contact") setBgColor("#2ecc71");
    else setBgColor("#3498db");
  }, [location]);

  // const pageTitle = "HR Dashboard";

  const navigate = useNavigate(); // 🔥 Back navigation এর জন্য

  // 🔥 Back button handler
  const handleBack = () => {
    navigate(-1); // আগের route এ যাবে
  };

  // 🔥 Refresh button handler
  const handleRefresh = () => {
    window.location.reload(); 
  };

  // Page title dynamic kora


  const [pageTitle, setPageTitle] = useState("Dashboard");
  // const location = useLocation();

  // Dynamic Title Setter
  useEffect(() => {
    const title = pageTitles[location.pathname] || "Admin Panel"; // Default title
    setPageTitle(title);
    document.title = title;
  }, [location]);



  return (
    <div className="container-fluid p-0" style={{marginTop:"2px"}}>
      <Header onHamburgerClick={onHamburgerClick} />

      <div className="d-flex">
        <Sidebar
          collapsed={collapsed}
          showMobile={showMobile}
          closeMobile={closeMobile}
        />

        <div className="flex-grow-1 main-content">
          {/* Content Topbar */}
          {/* <div style={{ width: "100%", backgroundColor: "#8dadffff" }}>
            <h3>{title || "Loading..."} </h3>
          </div> */}
          {/* Topbar */}
          <div className="header-bar">
            <div className="left-buttons">
              <button
                onClick={handleBack}
                className="btn btn-sm btn-secondary me-2"
              >
                Back
              </button>
              <button
                onClick={handleRefresh}
                className="btn btn-sm btn-info text-white me-2"
              >
                Refresh
              </button>
            </div>
            <h2 className="page-title">{pageTitle}</h2>
            <div className="right-text">Dashboard</div>
          </div>

          <Outlet />
          <div className="footer mt-3">© {new Date().getFullYear()} Legend IT Solution.</div>
        </div>
      </div>
    </div>
  );
}
