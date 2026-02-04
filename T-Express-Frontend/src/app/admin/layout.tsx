"use client";
import { ReactNode } from "react";
import AdminSidebar from "./components/AdminSidebar";
import AdminGuard from "@/components/Admin/AdminGuard";
import "../css/euclid-circular-a-font.css";
import "../css/style.css";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-gray-1 font-euclid-circular-a antialiased">
        <AdminSidebar />
        <main className="flex-1 overflow-x-hidden pt-16 lg:pt-0">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
