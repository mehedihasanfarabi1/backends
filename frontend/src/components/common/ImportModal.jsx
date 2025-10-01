// components/common/ImportModal.jsx
import { forwardRef, useImperativeHandle, useState } from "react";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import Swal from "sweetalert2";

const ImportModal = forwardRef(({ onImport }, ref) => {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));

  const handleFile = async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setFileName(f.name);

    const ext = f.name.split(".").pop().toLowerCase();

    try {
      if (ext === "csv") {
        Papa.parse(f, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => setPreview(results.data),
          error: (err) => Swal.fire("Import failed", err.message, "error"),
        });
      } else if (ext === "xlsx") {
        const data = await f.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
        setPreview(json);
      } else {
        Swal.fire("Invalid file", "Please upload a CSV or XLSX file", "warning");
        setFile(null);
        setFileName("");
        setPreview([]);
      }
    } catch (err) {
      Swal.fire("Import failed", err.message || "Something went wrong", "error");
      setFile(null);
      setFileName("");
      setPreview([]);
    }
  };

  // handleConfirm function
  const handleConfirm = () => {
    if (!file) {
      Swal.fire("No file", "Please upload a file first", "warning");
      return;
    }
    onImport(file); // FILE object পাঠাচ্ছি, JSON নয়
    setPreview([]);
    setFileName("");
    setOpen(false);
  };


  if (!open) return null;

  return (
    <div
      className="modal d-flex mt-5"
      style={{ marginLeft: "10px", justifyContent: "right" }}
      tabIndex="1"
      role="dialog"
    >
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Import Data</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setOpen(false)}
            ></button>
          </div>
          <div className="modal-body">
            <input type="file" accept=".csv,.xlsx" onChange={handleFile} />
            {fileName && (
              <p className="mt-2">
                <strong>Selected File:</strong> {fileName}
              </p>
            )}

            {/* {preview.length > 0 && (
              <div
                className="mt-3 table-responsive"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      {Object.keys(preview[0]).map((h, i) => (
                        <th key={i}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((v, j) => (
                          <td key={j}>{v}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <small className="text-muted">Showing first 10 rows</small>
              </div>
            )} */}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleConfirm}
            >
              Upload 
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ImportModal;
