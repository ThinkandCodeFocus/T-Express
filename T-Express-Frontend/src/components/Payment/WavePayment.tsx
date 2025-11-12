/**
 * Composant de traitement Wave
 */

'use client';

import React, { useState } from 'react';
import { paiementService } from '@/services/paiement.service';
import type { InitierPaiementData } from '@/types/api.types';
import toast from 'react-hot-toast';
import { formatPhone, validatePhone, normalizePhone } from '@/lib/utils';

interface WavePaymentProps {
  commandeId: number;
  montant: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function WavePayment({
  commandeId,
  montant,
  onSuccess,
  onCancel,
}: WavePaymentProps) {
  const [telephone, setTelephone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!validatePhone(telephone)) {
      toast.error('Numéro de téléphone invalide');
      return;
    }

    try {
      setLoading(true);

      const data: InitierPaiementData = {
        commande_id: commandeId,
        mode_paiement: 'wave',
        telephone: normalizePhone(telephone),
        return_url: `${window.location.origin}/commande/success`,
        cancel_url: `${window.location.origin}/checkout`,
      };

      const response = await paiementService.initierWave(data);

      if (response.success) {
        // Si on a une URL de paiement, rediriger
        if (response.payment_url) {
          window.location.href = response.payment_url;
        }
        // Si on a un code USSD, l'afficher
        else if (response.ussd_code) {
          toast.success(`Composez: ${response.ussd_code}`);
          // Attendre un peu avant de vérifier le statut
          setTimeout(() => {
            onSuccess();
          }, 5000);
        } else {
          onSuccess();
        }
      } else {
        toast.error(response.message || 'Erreur lors de l\'initialisation du paiement');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors du paiement Wave');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Paiement Wave</h2>
            <p className="text-sm text-gray-600">Montant à payer: {montant} FCFA</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone Wave
            </label>
            <input
              type="tel"
              id="telephone"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+221 XX XXX XX XX"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Entrez le numéro associé à votre compte Wave
            </p>
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Vous recevrez une notification Wave pour confirmer le paiement
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Payer'}
            </button>
          </div>
        </form>

        {/* Note */}
        <p className="mt-4 text-xs text-center text-gray-500">
          Paiement sécurisé par Wave • Vos données sont protégées
        </p>
      </div>
    </div>
  );
}
