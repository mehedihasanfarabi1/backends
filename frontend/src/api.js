
import axios  from "axios";

const API_BASE = "http://localhost:8001";

// Permission function

export async function getPermissions() {
    const token = localStorage.getItem("token"); // login হলে save করা token
    if (!token) throw new Error("No token found, login required");

    const res = await axios.get("http://127.0.0.1:8001/api/users/permissions/", {
        headers: {
            Authorization: `Bearer ${token}` // ✅ একদম প্রয়োজন
        }
    });

    return res.data.permissions;
}

function getCookie(name) {
  // csrftoken কুকি পড়া
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  if (match) return match[2];
  return null;
}

export async function initCSRF() {
  // প্রথমে কল করলে Django csrftoken সেট করবে
  await fetch(`${API_BASE}/api/whoami/`, {
    credentials: "include",
  });
}

export async function getUsers() {
  const res = await fetch(`${API_BASE}/api/users/`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

export async function addUser(form) {
  const csrf = getCookie("csrftoken");
  const body = new URLSearchParams(form);
  const res = await fetch(`${API_BASE}/api/users/add/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "X-CSRFToken": csrf || "",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  if (!res.ok) throw new Error("Failed to add user");
  return res.json();
}
