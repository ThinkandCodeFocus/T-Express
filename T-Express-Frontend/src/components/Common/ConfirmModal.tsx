"use client";
import React, { useState, useEffect } from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  showInput?: boolean;
  inputLabel?: string;
  inputPlaceholder?: string;
  confirmLabel?: string;
  confirmColor?: "green" | "red";
  onConfirm: (inputValue?: string) => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  showInput = false,
  inputLabel,
  inputPlaceholder,
  confirmLabel = "Confirmer",
  confirmColor = "green",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (isOpen) setInputValue("");
  }, [isOpen]);

  if (!isOpen) return null;

  const confirmBtnClass =
    confirmColor === "red"
      ? "bg-red-600 hover:bg-red-700"
      : "bg-green-600 hover:bg-green-700";

  return (
    <div
      className="fixed top-0 left-0 z-99999 w-full h-screen bg-dark/70 flex items-center justify-center px-4"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white rounded-xl shadow-3 p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{message}</p>

        {showInput && (
          <div className="mb-4">
            {inputLabel && (
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {inputLabel}
              </label>
            )}
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inputPlaceholder}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        )}

       <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-600 rounded-lg hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={() => onConfirm(showInput ? inputValue : undefined)}
            style={{
              backgroundColor: confirmColor === "red" ? "#DC2626" : "#16A34A",
              color: "#FFFFFF",
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}