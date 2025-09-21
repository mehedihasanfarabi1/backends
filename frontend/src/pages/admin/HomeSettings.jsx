import React, { useEffect, useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

export default function HomeSettings() {
  const [title, setTitle] = useState("");
  const [logo, setLogo] = useState(null);
  const [preview, setPreview] = useState(null);
  const [id, setId] = useState(null);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    axios
      .get("http://localhost:8001/api/home-settings/")
      .then((res) => {
        if (res.data.length > 0) {
          const data = res.data[0];
          setTitle(data.title);
          setPreview(data.logo ? data.logo : null);
          setId(data.id);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    if (logo) formData.append("logo", logo);

    const url = id
      ? `http://localhost:8001/api/home-settings/${id}/`
      : "http://localhost:8001/api/home-settings/";
    const method = id ? "put" : "post";

    axios({
      method,
      url,
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(() => alert("Settings updated successfully!"))
      .catch((err) => console.error(err));
  };

  return (
    <div className="container my-3">
      <div className="card shadow-lg border-0">
        {/* <div className="card-header bg-primary text-white">
          <h4 className="mb-0">Website Settings</h4>
        </div> */}
        <div className="card-body">
          {/* Nav Tabs */}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "general" ? "active" : ""}`}
                onClick={() => setActiveTab("general")}
              >
                General
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "misc" ? "active" : ""}`}
                onClick={() => setActiveTab("misc")}
              >
                Miscellaneous
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "logos" ? "active" : ""}`}
                onClick={() => setActiveTab("logos")}
              >
                Logos
              </button>
            </li>
          </ul>

          <form onSubmit={handleSubmit}>
            {/* General Tab */}
            {activeTab === "general" && (
              <div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Project Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-control"
                    placeholder="Enter project title"
                    required
                  />
                </div>
              </div>
            )}

            {/* Misc Tab */}
            {activeTab === "misc" && (
              <div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea
                    className="form-control"
                    placeholder="Enter description..."
                  ></textarea>
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Contact Email</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter email address"
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            )}

            {/* Logos Tab */}
            {activeTab === "logos" && (
              <div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Project Logo</label>
                  {preview && (
                    <div className="mb-3">
                      <img
                        src={preview}
                        alt="Current Logo"
                        className="img-thumbnail"
                        style={{ width: "120px", height: "120px" }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    className="form-control"
                    onChange={(e) => {
                      setLogo(e.target.files[0]);
                      setPreview(URL.createObjectURL(e.target.files[0]));
                    }}
                  />
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-success px-4">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
