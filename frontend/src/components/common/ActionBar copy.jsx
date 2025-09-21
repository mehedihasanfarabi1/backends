import { useRef } from "react";
import { utils, writeFile } from "xlsx";
import Swal from "sweetalert2";
import ImportModal from "./ImportModal";

export default function ActionBar({
  title,
  onCreate,
  onDelete,
  selectedCount,
  data = [],
  onImport,
  exportFileName = "export",
}) {
  const importRef = useRef();

  const handleExport = () => {
    if (!data.length) {
      Swal.fire("No data to export!", "", "warning");
      return;
    }
    const worksheet = utils.json_to_sheet(data);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Data");
    writeFile(workbook, `${exportFileName}.xlsx`);
  };

  const handlePrint = () => {
    if (!data.length) {
      Swal.fire("No data to print!", "", "warning");
      return;
    }
    // ✅ simple printable HTML
    let html = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            table { width:100%; border-collapse:collapse; }
            th, td { border:1px solid #ccc; padding:6px; text-align:left; }
            th { background:#f8f9fa; }
          </style>
        </head>
        <body>
          <h3>${title}</h3>
          <table>
            <thead>
              <tr>
                ${Object.keys(data[0])
                  .map((k) => `<th>${k}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${data
                .map(
                  (row) =>
                    `<tr>${Object.values(row)
                      .map((v) => `<td>${v ?? ""}</td>`)
                      .join("")}</tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.print();
  };

  return (
    <div className="d-flex justify-content-between align-items-center mb-3">
      <h4 className="m-0">{title}</h4>
      <div className="d-flex gap-2">
        <button className="btn btn-success" onClick={onCreate}>
          + Create
        </button>
        <button
          className="btn btn-danger"
          onClick={onDelete}
          disabled={!selectedCount}
        >
          Delete ({selectedCount})
        </button>
        <button
          className="btn btn-warning" style={{color:"#fff"}}
          onClick={() => importRef.current.open()}
        >
          Import
        </button>
        <button className="btn btn-primary" onClick={handleExport}>
          Export
        </button>
        <button className="btn btn-dark" onClick={handlePrint}>
          Print
        </button>
      </div>
      {/* Import Modal */}
      <ImportModal ref={importRef} onImport={onImport} />
    </div>
  );
}
