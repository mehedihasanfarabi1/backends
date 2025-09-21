import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Error.css"; // jodi custom CSS thake

export default function ErrorPages() {
  const navigate = useNavigate();

  return (
    <div className="error-page">
      <h1>Oops!</h1>
      <p>Page not found.</p>
      <button onClick={() => navigate("/admin")}>Go to Dashboard</button>
    </div>
  );
}
