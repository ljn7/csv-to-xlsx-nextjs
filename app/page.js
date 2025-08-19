"use client";
import React, { useState, useRef, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { VariableSizeList as List } from "react-window";
import { useDropzone } from "react-dropzone";

export default function Home() {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedCols, setSelectedCols] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const listRef = useRef();

  const handleFile = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        setData(res.data);
        setColumns(Object.keys(res.data[0] || {}));
        setSelectedCols(Object.keys(res.data[0] || {}));
      },
    });
  };

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles[0]) {
      handleFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
  });

  const onHeaderClick = (col) => {
    let direction = "asc";
    if (sortConfig.key === col && sortConfig.direction === "asc") {
      direction = "desc";
    } else if (sortConfig.key === col && sortConfig.direction === "desc") {
      direction = null;
    }
    setSortConfig({ key: col, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sortConfig.key] || "";
      const bVal = b[sortConfig.key] || "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const exportXLSX = () => {
    const ws = XLSX.utils.json_to_sheet(
      sortedData.map((row) =>
        Object.fromEntries(selectedCols.map((c) => [c, row[c]]))
      )
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `export_${timestamp}.xlsx`;
    XLSX.writeFile(wb, filename, { compression: true });
  };

  const getRowHeight = useCallback(
    (index) => {
      const row = sortedData[index];
      if (!row) return 40;
      let maxLen = 0;
      selectedCols.forEach((col) => {
        const val = String(row[col] || "");
        if (val.length > maxLen) maxLen = val.length;
      });
      return Math.min(200, 40 + Math.floor(maxLen / 50) * 20);
    },
    [sortedData, selectedCols]
  );

  const Row = ({ index, style }) => {
    const row = sortedData[index];
    return (
      <div
        style={{
          ...style,
          display: "flex",
          padding: "4px",
          borderBottom: "1px solid #243056",
          background: index % 2 ? "#0e1431" : "#0b1027",
        }}
      >
        {selectedCols.map((col) => (
          <div
            key={col}
            style={{
              flex: 1,
              padding: "4px 8px",
              whiteSpace: "normal",
              wordBreak: "break-word",
            }}
          >
            {row[col]}
          </div>
        ))}
      </div>
    );
  };

  return (
    <main style={{ padding: 24 }}>
      <h1>CSV to Excel Exporter</h1>

      {/* Drag-and-drop upload zone */}
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #4a90e2",
          borderRadius: 12,
          padding: "40px",
          textAlign: "center",
          cursor: "pointer",
          background: isDragActive ? "#1a2a5a" : "#0f1833",
          color: "#cbd5e1",
          marginBottom: 20,
        }}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the CSV file here...</p>
        ) : (
          <p>Drag & drop a CSV file here, or click to choose</p>
        )}
      </div>

      {columns.length > 0 && (
        <div
          style={{
            margin: "16px 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Column checkboxes */}
          <div>
            {columns.map((col) => (
              <label key={col} style={{ marginRight: 12 }}>
                <input
                  type="checkbox"
                  checked={selectedCols.includes(col)}
                  onChange={() =>
                    setSelectedCols((prev) =>
                      prev.includes(col)
                        ? prev.filter((c) => c !== col)
                        : [...prev, col]
                    )
                  }
                />
                {col}
              </label>
            ))}
          </div>

          {/* Export button now aligned to the right of checkboxes */}
          {sortedData.length > 0 && (
            <button
              onClick={exportXLSX}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                background: "#2563eb",
                color: "white",
                border: "none",
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Export XLSX
            </button>
          )}
        </div>
      )}

      {sortedData.length > 0 && (
        <div style={{ border: "1px solid #243056", borderRadius: 12 }}>
          {/* Header row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#12183a",
              position: "sticky",
              top: 0,
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", flex: 1 }}>
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

          {/* Virtualized list */}
          <List
            ref={listRef}
            height={500}
            itemCount={sortedData.length}
            itemSize={getRowHeight}
            width="100%"
          >
            {Row}
          </List>
        </div>
      )}
    </main>
  );
}
