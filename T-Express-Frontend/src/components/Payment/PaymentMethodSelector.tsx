/**
 * Composant de sélection du mode de paiement (Wave, Orange Money, Cash)
 */

'use client';

import React, { useState } from 'react';
import { PAYMENT_CONFIG } from '@/config/api.config';
import Image from 'next/image';

interface PaymentMethod {
  id: 'wave' | 'orange_money' | 'cash' | 'carte';
  name: string;
  logo?: string;
  description: string;
  enabled: boolean;
}

interface PaymentMethodSelectorProps {
  onSelect: (method: PaymentMethod['id']) => void;
  selected?: PaymentMethod['id'];
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'wave',
    name: 'Wave',
    logo: '/images/payment/wave.png',
    description: 'Paiement sécurisé via Wave',
    enabled: PAYMENT_CONFIG.wave.enabled,
  },
  {
    id: 'orange_money',
    name: 'Orange Money',
    logo: '/images/payment/orange-money.png',
    description: 'Paiement via Orange Money',
    enabled: PAYMENT_CONFIG.orangeMoney.enabled,
  },
  {
    id: 'cash',
    name: 'Paiement à la livraison',
    description: 'Payez en espèces à la réception',
    enabled: true,
  },
];

export default function PaymentMethodSelector({
  onSelect,
  selected,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod['id'] | undefined>(
    selected
  );

  const handleSelect = (methodId: PaymentMethod['id']) => {
    setSelectedMethod(methodId);
    onSelect(methodId);
  };

  const enabledMethods = PAYMENT_METHODS.filter((m) => m.enabled);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Mode de paiement</h3>
      
      <div className="grid gap-4">
        {enabledMethods.map((method) => (
          <button
            key={method.id}
            onClick={() => handleSelect(method.id)}
            className={`
              relative flex items-center gap-4 p-4 border-2 rounded-lg transition-all
              hover:border-blue-500 hover:shadow-md
              ${
                selectedMethod === method.id
                  ? 'border-blue-600 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white'
              }
            `}
          >
            {/* Radio button */}
            <div
              className={`
                flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${
                  selectedMethod === method.id
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300 bg-white'
                }
              `}
            >
              {selectedMethod === method.id && (
                <div className="w-2 h-2 rounded-full bg-white" />
              )}
            </div>

            {/* Logo */}
            {method.logo && (
              <div className="relative w-16 h-12 flex-shrink-0">
                <Image
                  src={method.logo}
                  alt={method.name}
                  fill
                  className="object-contain"
                />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-900">{method.name}</p>
              <p className="text-sm text-gray-600">{method.description}</p>
            </div>

            {/* Badge */}
            {method.id === 'wave' && (
              <div className="flex-shrink-0 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded">
                Rapide
              </div>
            )}
            {method.id === 'orange_money' && (
              <div className="flex-shrink-0 px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded">
                Populaire
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Info supplémentaire */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex gap-3">
          <svg
            className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Paiement 100% sécurisé</p>
            <p className="text-blue-700">
              Vos informations de paiement sont cryptées et sécurisées.
              Nous ne stockons aucune information bancaire.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
