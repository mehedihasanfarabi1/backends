import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import axios from "axios";
import { router } from "./router";
import "./i18n"; // ✅ Import i18n setup
import 'simplebar-react/dist/simplebar.min.css';
import SimpleBar from 'simplebar-react';
import './App.css'
export default function App() {
  const [settings, setSettings] = useState(null);

  // API থেকে ডাটা আনা
  useEffect(() => {
    axios.get("http://localhost:8001/api/users/home-settings/") // full API path use
      .then((res) => {
        if (res.data.length > 0) {
          setSettings(res.data[0]);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  // Title এবং Favicon আপডেট
  useEffect(() => {
    if (settings) {
      document.title = settings.title || "My Website";

      if (settings.logo) {
        const faviconUrl = `${settings.logo}?v=${Date.now()}`; // cache-bust
        let favicon = document.querySelector("link[rel='icon']");
        if (!favicon) {
          favicon = document.createElement("link");
          favicon.rel = "icon";
          document.head.appendChild(favicon);
        }
        favicon.href = faviconUrl;
      }
    }
  }, [settings]);

  return <RouterProvider router={router} />;
}
