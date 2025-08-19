export const metadata = {
  title: 'CSV → Excel Exporter',
  description: 'Upload CSV, preview, pick columns, sort, and export to XLSX — all in the browser.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif', background: '#0b1020', color: '#e8ebf8' }}>
        {children}
      </body>
    </html>
  );
}
