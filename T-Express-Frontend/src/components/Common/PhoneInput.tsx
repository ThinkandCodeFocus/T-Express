"use client";

import React, { useState, useEffect } from "react";
import { validatePhone, formatPhone } from "@/lib/utils";

interface PhoneInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
  showError?: boolean;
}

/**
 * Composant de saisie de téléphone avec validation pour le format sénégalais
 * Format accepté : +221 XX XXX XX XX ou 9 chiffres
 */
export default function PhoneInput({
  id,
  name,
  value,
  onChange,
  placeholder = "+221 77 123 45 67",
  required = false,
  disabled = false,
  className = "",
  label,
  showError = true,
}: PhoneInputProps) {
  const [error, setError] = useState<string>("");
  const [touched, setTouched] = useState(false);

  // Valider le numéro lors du changement
  useEffect(() => {
    if (touched && value) {
      // Nettoyer le numéro pour la validation (enlever espaces, +, etc.)
      const cleaned = value.replace(/\D/g, '');
      
      // Vérifier la longueur (9 chiffres pour le Sénégal)
      if (cleaned.length < 9) {
        setError("Le numéro doit contenir 9 chiffres");
      } else if (cleaned.length > 9 && !cleaned.startsWith('221')) {
        setError("Format invalide. Utilisez le format : +221 XX XXX XX XX (9 chiffres)");
      } else if (!validatePhone(value)) {
        setError("Format invalide. Utilisez le format : +221 XX XXX XX XX (9 chiffres)");
      } else {
        setError("");
      }
    } else if (touched && required && !value) {
      setError("Le numéro de téléphone est requis");
    } else {
      setError("");
    }
  }, [value, touched, required]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Permettre seulement les chiffres, espaces, + et -
    const cleaned = inputValue.replace(/[^\d+\s-]/g, "");
    
    // Limiter à 17 caractères max (+221 XX XXX XX XX)
    const limited = cleaned.slice(0, 17);
    
    onChange(limited);
  };

  const handleBlur = () => {
    setTouched(true);
    if (value) {
      // Formater automatiquement le numéro si valide
      if (validatePhone(value)) {
        const formatted = formatPhone(value);
        onChange(formatted);
      }
    }
  };

  const baseClassName = `rounded-md border ${
    error && touched
      ? "border-red focus:border-red focus:ring-red/20"
      : "border-gray-3 focus:border-transparent focus:ring-blue/20"
  } bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:shadow-input focus:ring-2 ${
    disabled ? "opacity-50 cursor-not-allowed" : ""
  } ${className}`;

  return (
    <div>
      {label && (
        <label htmlFor={id} className="block mb-2.5">
          {label} {required && <span className="text-red">*</span>}
        </label>
      )}
      <input
        type="tel"
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={17} // +221 XX XXX XX XX = 17 caractères max
        className={baseClassName}
        aria-invalid={error && touched ? "true" : "false"}
        aria-describedby={error && touched ? `${id}-error` : undefined}
      />
      {showError && error && touched && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

