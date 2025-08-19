"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import Papa from "papaparse";
import { VariableSizeList as List } from "react-window";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";

export default function Home() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [filters, setFilters] = useState({});
  const listRef = useRef();

  // File Upload
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        setData(results.data);
        setColumns(results.meta.fields);
        setSelectedCols(results.meta.fields);
      },
    });
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: ".csv",
  });

  // Sorting
  const sortedData = useMemo(() => {
    let sortable = [...data];

    // Filtering
    sortable = sortable.filter((row) => {
      return selectedCols.every((col) => {
        const filter = filters[col];
        if (!filter?.text) return true;
        const cellValue = row[col] || "";
        const filterText = filter.ignoreCase
          ? filter.text.toLowerCase()
          : filter.text;

        const compareValue = filter.ignoreCase
          ? cellValue.toLowerCase()
          : cellValue;

        if (filter.type === "exact") return compareValue === filterText;
        if (filter.type === "starts") return compareValue.startsWith(filterText);
        return compareValue.includes(filterText);
      });
    });

    // Sorting
    if (sortConfig.key) {
      sortable.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";

        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return sortable;
  }, [data, selectedCols, filters, sortConfig]);

  // Sorting handler
  const onHeaderClick = (col) => {
    setSortConfig((prev) => {
      if (prev.key === col) {
        if (prev.direction === "asc") return { key: col, direction: "desc" };
        if (prev.direction === "desc") return { key: null, direction: null };
      }
      return { key: col, direction: "asc" };
    });
  };

  // Row renderer
  const Row = ({ index, style }) => {
    const row = sortedData[index];
    return (
      <div
        style={{
          ...style,
          display: "flex",
          borderBottom: "1px solid #243056",
          background: index % 2 === 0 ? "#0f172a" : "#1e293b",
          color: "#e2e8f0",
        }}
      >
        {selectedCols.map((col) => (
          <div key={col} style={{ flex: 1, padding: "8px" }}>
            {row[col]}
          </div>
        ))}
      </div>
    );
  };

const getRowHeight = (index) => {
  const row = sortedData[index];
  if (!row) return 40;
  let maxLen = 0;
  selectedCols.forEach((col) => {
    const val = String(row[col] || "");
    if (val.length > maxLen) maxLen = val.length;
  });
  return Math.min(200, 40 + Math.floor(maxLen / 50) * 20);
};

  // Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sortedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "data.xlsx");
  };

  return (
    <main
      style={{
        background: "linear-gradient(to bottom right, #0f172a, #1e293b)",
        color: "white",
        minHeight: "100vh",
        padding: "2rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "1.8rem", fontWeight: "bold", marginBottom: 16 }}>
        CSV to XLSX Converter
      </h1>

      {/* File upload */}
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #334155",
          borderRadius: 12,
          padding: "2rem",
          textAlign: "center",
          cursor: "pointer",
          marginBottom: "2rem",
          background: "#0f1833",
        }}
      >
        <input {...getInputProps()} />
        <p>Drag & drop your CSV file here, or click to select</p>
      </div>

      {/* Column Selection */}
      {columns.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <h2 className="font-semibold">Select Columns:</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {columns.map((col) => (
              <label key={col} style={{ display: "flex", gap: 4 }}>
                <input
                  type="checkbox"
                  checked={selectedCols.includes(col)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedCols([...selectedCols, col]);
                    } else {
                      setSelectedCols(selectedCols.filter((c) => c !== col));
                    }
                  }}
                />
                {col}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Export Button */}
      {sortedData.length > 0 && (
        <button
          onClick={exportToExcel}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            background: "#2563eb",
            color: "white",
            fontWeight: "bold",
            marginBottom: "1rem",
          }}
        >
          Export to XLSX
        </button>
      )}

      {/* Table */}
      {columns.length > 0 && (
        <div style={{ border: "1px solid #243056", borderRadius: 12 }}>
          {/* Header row + filters */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              background: "#12183a",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            {/* Filter inputs */}
            <div style={{ display: "flex" }}>
              {selectedCols.map((col) => (
                <div key={col} style={{ flex: 1, padding: "4px" }}>
                  <input
                    type="text"
                    placeholder={`Filter ${col}`}
                    value={filters[col]?.text || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        [col]: {
                          ...(prev[col] || {
                            type: "contains",
                            ignoreCase: true,
                          }),
                          text: e.target.value,
                        },
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "4px",
                      borderRadius: 4,
                      border: "1px solid #334155",
                      background: "#0f1833",
                      color: "#fff",
                    }}
                  />
                  <select
                    value={filters[col]?.type || "contains"}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        [col]: { ...(prev[col] || {}), type: e.target.value },
                      }))
                    }
                    style={{ width: "100%", marginTop: 4 }}
                  >
                    <option value="contains">Contains</option>
                    <option value="exact">Exact</option>
                    <option value="starts">Starts With</option>
                  </select>
                  <label style={{ fontSize: 12, color: "#cbd5e1" }}>
                    <input
                      type="checkbox"
                      checked={filters[col]?.ignoreCase ?? true}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          [col]: {
                            ...(prev[col] || {}),
                            ignoreCase: e.target.checked,
                          },
                        }))
                      }
                    />
                    Ignore Case
                  </label>
                </div>
              ))}
            </div>

            {/* Column headers */}
            <div style={{ display: "flex" }}>
              {selectedCols.map((col) => (
                <div
                  key={col}
                  style={{
                    flex: 1,
                    padding: "8px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                  onClick={() => onHeaderClick(col)}
                >
                  {col}
                  {sortConfig.key === col &&
                    (sortConfig.direction === "asc"
                      ? " 🔼"
                      : sortConfig.direction === "desc"
                      ? " 🔽"
                      : "")}
                </div>
              ))}
            </div>
          </div>

          {/* Virtualized list OR "no results" */}
          {sortedData.length > 0 ? (
            <List
              ref={listRef}
              height={500}
              itemCount={sortedData.length}
              itemSize={getRowHeight}
              width="100%"
            >
              {Row}
            </List>
          ) : (
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "#94a3b8",
              }}
            >
              No results found
            </div>
          )}
        </div>
      )}
    </main>
  );
}
