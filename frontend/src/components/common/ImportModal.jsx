import { forwardRef, useImperativeHandle, useState } from "react";
import Papa from "papaparse";
import Swal from "sweetalert2";

const ImportModal = forwardRef(({ onImport }, ref) => {
  const [open, setOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    open: () => setOpen(true),
  }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        if (onImport) onImport(results.data);
        Swal.fire("File imported!", "", "success");
        setOpen(false);
      },
      error: (err) => {
        Swal.fire("Import failed", err.message, "error");
      },
    });
  };

  if (!open) return null;

  return (
    <div className="modal d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Import CSV</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setOpen(false)}
            ></button>
          </div>
          <div className="modal-body">
            <input type="file" accept=".csv" onChange={handleFile} />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ImportModal;
