import React, { useEffect, useState } from "react";
import { useTranslation } from "../../contexts/TranslationContext";
import { useNavigate, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";

const TranslationForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { addTranslation, editTranslation, fetchTranslationById } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({ key: "", english: "", bangla: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      fetchTranslationById(id)
        .then((res) =>
          setForm({ key: res.key || "", english: res.english || "", bangla: res.bangla || "" })
        )
        .catch(() => {
          toast.error("Failed to load");
          navigate("/admin/translations");
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (isEdit) await editTranslation(id, form);
      else await addTranslation(form);

      // Toast show + navigate onClose
      toast.success(isEdit ? "Updated successfully" : "Created successfully"
        , {
        // onClose: () => navigate("/admin/translations"),
        autoClose: 200,
      });
    } catch {
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <ToastContainer position="top-right" autoClose={1500} />
      <div className="card shadow">
        <div className="card-body">
          <h3 className="card-title mb-4">{isEdit ? "Edit Translation" : "Add Translation"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <input
                  name="key"
                  className="form-control form-control-lg"
                  placeholder="Key (unique)"
                  value={form.key}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  name="english"
                  className="form-control form-control-lg"
                  placeholder="English"
                  value={form.english}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-4">
                <input
                  name="bangla"
                  className="form-control form-control-lg"
                  placeholder="Bangla"
                  value={form.bangla}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mt-4 d-flex gap-2">
              <button className="btn btn-success btn-lg" type="submit" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
              <button className="btn btn-secondary btn-lg" type="button" onClick={() => navigate(-1)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TranslationForm;
