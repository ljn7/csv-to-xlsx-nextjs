import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'CSV → Excel Exporter',
  description: 'Upload CSV, preview, pick columns, sort, and export to XLSX — all in the browser.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ margin: 0, fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif', background: '#0b1020', color: '#e8ebf8' }}
      >
        {children}
      </body>
    </html>
  );
}
