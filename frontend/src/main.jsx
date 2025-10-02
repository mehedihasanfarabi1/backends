import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes/index";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-free/css/all.min.css';

import './index.css'
import "./styles/main.css";  
import "./styles/table.css"; 
import "./styles/Admin/header.css";
import "./styles/Admin/sidebar.css";
import "./styles/Admin/mainContent.css";
import "./styles/Admin/footer.css";
import { TranslationProvider } from "./contexts/TranslationContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TranslationProvider>
      <RouterProvider router={router} />
    </TranslationProvider>

  </React.StrictMode>
);
