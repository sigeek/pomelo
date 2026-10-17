import type { Metadata, Viewport } from "next";
import { Itim, Mali } from "next/font/google";
import "./globals.css";

const itim = Itim({ subsets: ["latin"], weight: "400", variable: "--font-itim" });
const mali = Mali({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-mali" });

export const metadata: Metadata = {
  title: "AI Intern",
  description: "Onboard your AI intern like a new employee, and it starts sounding like your shop.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${itim.variable} ${mali.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
