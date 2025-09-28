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
  columns = null, // specify columns if needed
  companyId = null, // ✅ ID of the company to show info
}) {
  const importRef = useRef();
  const [companyInfo, setCompanyInfo] = useState({});

  // Load company info once for print header
  useEffect(() => {
    const loadCompany = async () => {
      try {
        let res;
        if (companyId) {
          res = await CompanyAPI.details(companyId); // get single company details
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

  const getColumns = () => {
    if (!data.length) return [];
    if (columns && columns.length) return columns;
    return Object.keys(data[0]);
  };

  const handleExport = () => {
    if (!data.length) return Swal.fire("No data to export!", "", "warning");

    const cols = getColumns();
    const formattedData = data.map((row) => {
      const newRow = {};
      cols.forEach((k) => (newRow[k] = formatValue(row[k])));
      return newRow;
    });

    const worksheet = utils.json_to_sheet(formattedData);
    const workbook = utils.book_new();
    utils.book_append_sheet(workbook, worksheet, "Data");
    writeFile(workbook, `${exportFileName}.xlsx`);
  };

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
        body { font-family: Arial, sans-serif; margin: 20px; }
        
        .header-container {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .company-info {
          text-align: center; /* majkhane thakbe */
          flex: 1;
          margin-left: 210px;
        }

        .company-info h2 { margin:0; font-size:1.5rem; }
        .company-info div { font-size:0.9rem; }

        .print-time {
          font-size:0.85rem;
          text-align: right;
          white-space: nowrap;
          margin-left: 10px;
        }

        table { width:100%; border-collapse:collapse; }
        th, td { border:1px solid #dee2e6; padding:8px; }
        th { background-color:#f8f9fa; text-align:left; }
        tr:nth-child(even) { background-color:#f2f2f2; }
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
          Print Date: ${currentTime}
        </div>
      </div>

      <h3 class="mb-3 text-center">${title}</h3>

      <table class="table table-bordered table-striped">
        <thead class="table-dark text-white">
          <tr>${cols.map((c) => `<th>${c}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${data
        .map(
          (row) =>
            `<tr>${cols
              .map((c) => `<td>${formatValue(row[c])}</td>`)
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
    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
      <h4 className="m-0">{title}</h4>
      <div className="d-flex flex-wrap gap-2 mt-2 mt-md-0">
        {showCreate && <button className="btn btn-success" onClick={onCreate}>+ Create</button>}
        {showDelete && selectedCount > -1 && <button className="btn btn-danger" onClick={onDelete}>Delete ({selectedCount})</button>}
        {showImport && <button className="btn btn-warning text-white" onClick={() => importRef.current?.open()}>Import</button>}
        {showExport && data.length > 0 && <button className="btn btn-primary" onClick={handleExport}>Export</button>}
        {showPrint && data.length > 0 && <button className="btn btn-dark" onClick={handlePrint}>Print</button>}
      </div>

      <ImportModal ref={importRef} onImport={onImport} />
    </div>
  );
}
