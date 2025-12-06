"use client";
import { ReactNode } from "react";
import AdminSidebar from "./components/AdminSidebar";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="font-euclid-circular-a antialiased">
        <div className="flex min-h-screen bg-gray-1">
          <AdminSidebar />
          <main className="flex-1 overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
