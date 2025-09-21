import { useEffect, useState } from "react";
import axios from "axios";

function Footers() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get("http://127.0.0.1:8001/api/protected/", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setMessage("Welcome to Dashboard!"))
    .catch(() => setMessage("Unauthorized"));
  }, []);

  return <h2>{message}</h2>;
}

export default Footers;
