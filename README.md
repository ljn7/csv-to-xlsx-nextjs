# 📊 CSV → XLSX Exporter

A modern **Next.js tool** to upload CSV files, preview, select columns, sort, and export them into Excel (`.xlsx`) format.  
Supports **drag & drop**, **lazy-loaded table rendering**, **column filters**, and **timestamped XLSX exports**.

---

## 🚀 Features
- 📂 Drag & Drop or Click to upload `.csv` files
- 🔍 Select specific columns before exporting
- ↕️ Sort data by clicking headers
- ⚡ Lazy-loading (virtualized list for large CSVs)
- 📥 Export to `.xlsx` with **compression enabled**
- 🕒 Auto-generated filenames with timestamps (e.g. `export_2025-08-19_09-15.xlsx`)

---

## 📦 Tech Stack
- **Next.js** (React framework)
- **Papaparse** → Parse CSV files
- **SheetJS (XLSX)** → Export XLSX
- **react-window** → Virtualized rendering for large datasets
- **TailwindCSS + modern UI styling**

---

## 🛠️ Installation

Clone the repo and install dependencies:

```bash
git clone https://github.com/yourusername/csv-to-xlsx-exporter.git
cd csv-to-xlsx-exporter
npm install
