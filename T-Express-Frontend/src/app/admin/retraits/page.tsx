"use client";
import React from "react";
import RetraitSection from "@/components/Admin/RetraitSection";

export default function AdminRetraitsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Demandes de retrait</h1>
        <p className="text-gray-600">Gérez vos demandes de retrait de fonds</p>
      </div>

      <RetraitSection />
    </div>
  );
}
