import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';
import "./i18n"; // ✅ Import i18n setup
import './index.css'
import "./styles/main.css";  // ✅ CSS ইমপোর্ট
import "./styles/table.css";  // ✅ CSS ইমপোর্ট
import "./styles/languageSwitcher.css"
import "./styles/kpicontainer.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
