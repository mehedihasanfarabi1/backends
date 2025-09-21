import { useEffect, useState } from "react";
import { initCSRF, getUsers, addUser } from "./api";
import "./app.css";

export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [form, setForm] = useState({ name: "", email: "" });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // প্রথমে csrftoken সেট করাই
        await initCSRF();
        const data = await getUsers();
        setUsers(data);
      } catch (e) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setAdding(true);
    setErr("");
    try {
      const created = await addUser(form);
      setUsers((u) => [...u, created]);
      setForm({ name: "", email: "" });
    } catch (e) {
      setErr(e.message);
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <p style={{ padding: 16 }}>Loading…</p>;
  if (err) return <p style={{ padding: 16, color: "crimson" }}>{err}</p>;

  return (
    <div className="container">
      <header>
        <h1>Admin Dashboard (React + Django)</h1>
      </header>

      <section className="card">
        <h2>Users</h2>
        <table className="table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th></tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card">
        <h3>Add User</h3>
        <form onSubmit={handleSubmit} className="form">
          <input
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            required
          />
          <button disabled={adding}>{adding ? "Saving..." : "Add"}</button>
        </form>
      </section>
    </div>
  );
}
