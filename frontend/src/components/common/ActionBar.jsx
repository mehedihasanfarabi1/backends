// components/common/ActionBar.jsx
import React, { useRef, useEffect, useState } from "react";
import { utils, writeFile } from "xlsx";
import Swal from "sweetalert2";
import ImportModal from "./ImportModal";
import { formatValue } from "../../utils/formatterPrint";
import { CompanyAPI } from "../../api/company";

export default function ActionBar({
  title = "",
  onCreate,
  onDelete,
  selectedCount = 0,
  data = [],
  onImport,
  exportFileName = "export",
  showCreate = true,
  showDelete = true,
  showImport = true,
  showExport = true,
  showPrint = true,
  columns = null,
  companyId = null,
}) {
  const importRef = useRef();
  const [companyInfo, setCompanyInfo] = useState({});

  // ✅ Load company info for header
  useEffect(() => {
    const loadCompany = async () => {
      try {
        let res;
        if (companyId) {
          res = await CompanyAPI.details(companyId);
        } else {
          const list = await CompanyAPI.list();
          res = Array.isArray(list) && list.length ? list[0] : {};
        }
        setCompanyInfo(res);
      } catch (err) {
        console.error("Failed to load company info:", err);
      }
    };
    loadCompany();
  }, [companyId]);

  // ✅ Always include sr_no
  // ✅ Always include sr_no but exclude raw id
  const getColumns = () => {
    if (!data.length) return [];
    let cols = columns && columns.length ? columns : Object.keys(data[0]);

    // raw id বাদ দিব
    cols = cols.filter((c) => c.toLowerCase() !== "id");

    return ["sr_no", ...cols];
  };


  // ✅ Export to Excel
  const handleExport = () => {
    if (!data.length) return Swal.fire("No data to export!", "", "warning");

    const cols = getColumns();
    const formattedData = data.map((row, index) => {
      const newRow = { sr_no: index + 1 };
      cols.forEach((k) => {
        if (k !== "sr_no") newRow[k] = formatValue(row[k]);
      });
      return newRow;
    });

    const worksheet = utils.json_to_sheet(formattedData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Data");
    writeFile(workbook, `${exportFileName}.xlsx`);
  };

  // ✅ Print professional design
  const handlePrint = () => {
    if (!data.length) return Swal.fire("No data to print!", "", "warning");

    const cols = getColumns();
    const currentTime = new Date().toLocaleString();

    const html = `
  <html>
    <head>
      <title>${title}</title>
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet"/>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 30px; }
        
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }

        .company-info {
          text-align: center;
          margin-left:50px;
          flex: 1;
        }
        .company-info h2 { margin:0; font-size:1.6rem; font-weight:700; }
        .company-info div { font-size:0.95rem; }

        .print-time {
          font-size:0.85rem;
          text-align: right;
          white-space: nowrap;
          margin-left: 10px;
        }

        h3.title {
          text-align:center;
          margin:20px 0;
          font-weight:600;
          text-transform:uppercase;
        }

        table { width:100%; border-collapse:collapse; font-size:0.9rem; }
        th, td { border:1px solid #444; padding:6px 8px; }
        th { background-color:#f1f1f1; text-align:center; font-weight:600; }
        tr:nth-child(even) { background-color:#fafafa; }
        td { text-align:center; }
      </style>
    </head>
    <body>
      <div class="header-container">
        <div class="company-info">
          <h2>${companyInfo.name || "Company Name"}</h2>
          <div>${companyInfo.address || "Company Address"}</div>
          <div>Phone: ${companyInfo.phone || "-"} | Email: ${companyInfo.email || "-"}</div>
        </div>
        <div class="print-time">
          Print Date:<br/> ${currentTime}
        </div>
      </div>

      <h3 class="title">${title}</h3>

      <table>
        <thead>
          <tr>${cols.map((c) => `<th>${c.replace(/_/g, " ").toUpperCase()}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${data
        .map(
          (row, index) =>
            `<tr>
                  <td>${index + 1}</td>
                  ${cols
              .filter((c) => c !== "sr_no")
              .map((c) => `<td>${formatValue(row[c])}</td>`)
              .join("")}
                </tr>`
        )
        .join("")}
        </tbody>
      </table>
    </body>
  </html>
`;

    const w = window.open("", "blank");
    w.document.write(html);
    w.document.close();
    w.print();
  };

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
      <h4 className="m-0">{title}</h4>
      <div className="d-flex flex-wrap gap-2 mt-2 mt-md-0">
        {showCreate && <button className="btn btn-success" onClick={onCreate} style={{borderRadius:"3px"}}>+ Create</button>}
        {showDelete && selectedCount > -1 && <button className="btn btn-danger" onClick={onDelete} style={{borderRadius:"3px"}}>Delete ({selectedCount})</button>}
        {showImport && <button className="btn btn-warning text-white" onClick={() => importRef.current?.open()} style={{borderRadius:"3px"}}>Import</button>}
        {showExport && data.length > 0 && <button className="btn btn-primary" onClick={handleExport} style={{borderRadius:"3px"}}>Export</button>}
        {showPrint && data.length > 0 && <button className="btn btn-dark" onClick={handlePrint} style={{borderRadius:"3px"}}>Print</button>}
      </div>

      <ImportModal ref={importRef} onImport={onImport} />
    </div>
  );
}
