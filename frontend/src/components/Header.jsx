import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useRef, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useTranslation } from "react-i18next";

export default function Header({ onHamburgerClick }) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // default translation.json use করবে

  // state
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showLangOptions, setShowLangOptions] = useState(false);
  const [lang, setLang] = useState("en"); // current language
  const [products, setProducts] = useState([]); // dynamic backend data

  const notifPanelRef = useRef(null);
  const msgPanelRef = useRef(null);
  const langRef = useRef(null);

  // Dummy Notifications
  const notifications = [
    { id: 1, title: "New message from Admin", details: "Hey! Please check your inbox." },
    { id: 2, title: "System Maintenance", details: "System will be down at 12 PM tonight." },
    { id: 3, title: "Profile Updated", details: "Your profile has been updated successfully." },
  ];

  // Dummy Messages
  const messages = [
    { id: 1, sender: "John Doe", text: "Hi! How are you?", time: "2m ago" },
    { id: 2, sender: "Sarah", text: "Don't forget the meeting.", time: "10m ago" },
    { id: 3, sender: "Boss", text: "Project deadline is tomorrow!", time: "1h ago" },
  ];

  // Outside Click Handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target) &&
        msgPanelRef.current && !msgPanelRef.current.contains(e.target) &&
        langRef.current && !langRef.current.contains(e.target)) {
        setShowNotifications(false);
        setShowMessages(false);
        setShowLangOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Logout
  // Header.jsx

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      const refresh = localStorage.getItem("refresh");

      if (!refresh) {
        toast.error("No refresh token found");
        return;
      }

      const res = await fetch("http://127.0.0.1:8001/api/logout/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Logout failed");
      }

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("refresh");
      localStorage.removeItem("token_exp");

      toast.success("Logout successful!", { position: "top-right", autoClose: 2000 });
      setTimeout(() => navigate("/"), 500);

    } catch (err) {
      console.error("Logout failed:", err);
      toast.error(err.message || "Logout failed");
    }
  };




  // const handleLogout = async () => {
  //   try {
  //     const token = localStorage.getItem("token");

  //     if (token) {
  //       await fetch("http://127.0.0.1:8001/api/logout/", {
  //         method: "POST",
  //         headers: {
  //           "Authorization": `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       });
  //     }

  //     localStorage.removeItem("token");
  //     toast.success("Logout successful!", { position: "top-right", autoClose: 3000 });
  //     setTimeout(() => navigate("/login"), 1000);

  //   } catch (err) {
  //     console.error("Logout failed:", err);
  //     toast.error("Logout failed!");
  //   }
  // };


  // Search Submit (Dummy API)
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchText.trim()) return;
    try {
      const response = await fetch(`https://jsonplaceholder.typicode.com/posts?q=${searchText}`);
      const data = await response.json();
      setSearchResults(data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  // Language Change
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLang(lng);
  };

  // Fetch backend products when language changes
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8001/api/products/by_lang/?lang=${lang}`);
        const data = await res.json();
        // console.log("API Response:", data); // এখন এটা array হবে
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProducts();
  }, [lang]);



  return (
    <div className="header d-flex align-items-center justify-content-between px-3 py-2 border-bottom bg-light position-relative">
      {/* Left: Logo & Hamburger */}
      <div className="d-flex align-items-center">
        <div className="logo fw-bold fs-4 me-4">Legend IT</div>
        <div className="hamburger me-3" onClick={onHamburgerClick} role="button">
          <i className="fa-solid fa-bars fs-4"></i>
        </div>
      </div>

      {/* Right: Search + Icons + User + Language */}
      <div className="d-flex align-items-center">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="d-flex align-items-center me-3 position-relative">
          <i className="fa-solid fa-magnifying-glass fs-5" style={{ cursor: "pointer" }}
            onClick={() => setSearchOpen(!searchOpen)}></i>
          <input type="text" placeholder={t("search_placeholder")}
            className={`form-control ms-2 ${searchOpen ? "show" : ""}`}
            style={{
              width: searchOpen ? "200px" : "0px",
              opacity: searchOpen ? 1 : 0,
              transition: "all 0.3s ease",
              padding: searchOpen ? "5px 10px" : "0px",
              fontSize: "14px",
            }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </form>

        {/* Notifications */}
        <div className="position-relative me-3">
          <i className="fa-solid fa-bell fs-5" style={{ cursor: "pointer" }}
            onClick={() => { setShowNotifications(!showNotifications); setShowMessages(false); }}></i>
        </div>

        {/* Language Switch */}
        {/* Language Switch */}
        <div className="position-relative me-3" ref={langRef}>
          <i
            className="fa-solid fa-globe fs-5"

            style={{ cursor: "pointer" }}
            onClick={() => setShowLangOptions(!showLangOptions)}
          ></i>
          {showLangOptions && (
            <div
              className="position-absolute top-100 end-0 bg-white shadow p-2 rounded"
              style={{ width: "120px", zIndex: 1050 }}
            >
              <div
                className={`lang-option ${i18n.language === "en" ? "active" : ""}`}
                onClick={() => changeLanguage("en")}
              >
                English
              </div>
              <div
                className={`lang-option ${i18n.language === "bn" ? "active" : ""}`}
                onClick={() => changeLanguage("bn")}
              >
                বাংলা
              </div>
            </div>
          )}
        </div>


        {/* Messages */}
        <div className="position-relative me-3">
          <i className="fa-solid fa-envelope fs-5" style={{ cursor: "pointer" }}
            onClick={() => { setShowMessages(!showMessages); setShowNotifications(false); }}></i>
        </div>

        {/* User Dropdown */}
        <div className="dropdown">
          <img src="https://placehold.co/37x37" className="rounded-circle me-2" style={{ width: 37, height: 37 }} alt="User" />
          <a href="#" className="dropdown-toggle text-dark text-decoration-none fw-semibold" data-bs-toggle="dropdown">Admin</a>
          <ul className="dropdown-menu dropdown-menu-end">
            <li><button className="dropdown-item" onClick={() => navigate("/admin/profile")}>{t("profile")}</button></li>
            <li><button className="dropdown-item" onClick={handleLogout}>{t("logout")}</button></li>
          </ul>
          <ToastContainer />
        </div>


      </div>

      {/* Notification Panel */}
      <div ref={notifPanelRef} className={`side-panel position-fixed top-0 end-0 h-100 bg-white shadow-lg p-3 ${showNotifications ? "show" : ""}`} style={{ width: "300px", zIndex: 1050 }}>
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <h5 className="mb-0">{t("notifications")}</h5>
          <i className="fa-solid fa-xmark fs-4" style={{ cursor: "pointer" }} onClick={() => setShowNotifications(false)}></i>
        </div>
        {notifications.map((notif) => (
          <div key={notif.id} className="d-flex justify-content-between align-items-center border-bottom py-2 mb-2">
            <div><p className="mb-1 fw-semibold">{notif.title}</p></div>
            <i className="fa-solid fa-eye text-primary" style={{ cursor: "pointer" }}
              title="View Details" onClick={() => alert(notif.details)}></i>
          </div>
        ))}
      </div>

      {/* Messages Panel */}
      <div ref={msgPanelRef} className={`side-panel position-fixed top-0 end-0 h-100 bg-white shadow-lg p-3 ${showMessages ? "show" : ""}`} style={{ width: "300px", zIndex: 1050 }}>
        <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
          <h5 className="mb-0">{t("messages")}</h5>
          <i className="fa-solid fa-xmark fs-4" style={{ cursor: "pointer" }} onClick={() => setShowMessages(false)}></i>
        </div>
        {messages.map((msg) => (
          <div key={msg.id} className="border-bottom py-2 mb-2">
            <p className="mb-1 fw-semibold">{msg.sender} <small className="text-muted">{msg.time}</small></p>
            <p className="mb-0">{msg.text}</p>
          </div>
        ))}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && searchOpen && (
        <div className="position-absolute bg-white shadow p-2 rounded" style={{ top: "60px", right: "150px", width: "220px", zIndex: 1100 }}>
          <h6 className="fw-bold">{t("search_results")}</h6>
          {searchResults.map((res) => <div key={res.id} className="border-bottom py-1">{res.title}</div>)}
        </div>
      )}

      {/* Backend Products (example) */}
      {/* <ul style={{ marginTop: "20px" }}>
        { products.map(p => (
          <li key={p.id}>{p.name} - {p.description} - ${p.price}</li>
        ))}
      </ul> */}


      {/* Panel Animation */}
      <style jsx>{`
        .side-panel {
          transform: translateX(100%);
          transition: transform 0.3s ease-in-out;
        }
        .side-panel.show {
          transform: translateX(0);
        }
      `}</style>
    </div>
  );
}
