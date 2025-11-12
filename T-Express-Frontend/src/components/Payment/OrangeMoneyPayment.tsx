/**
 * Composant de traitement Orange Money
 */

'use client';

import React, { useState } from 'react';
import { paiementService } from '@/services/paiement.service';
import type { InitierPaiementData } from '@/types/api.types';
import toast from 'react-hot-toast';
import { validatePhone, normalizePhone } from '@/lib/utils';

interface OrangeMoneyPaymentProps {
  commandeId: number;
  montant: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function OrangeMoneyPayment({
  commandeId,
  montant,
  onSuccess,
  onCancel,
}: OrangeMoneyPaymentProps) {
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
        mode_paiement: 'orange_money',
        telephone: normalizePhone(telephone),
        return_url: `${window.location.origin}/commande/success`,
        cancel_url: `${window.location.origin}/checkout`,
      };

      const response = await paiementService.initierOrangeMoney(data);

      if (response.success) {
        // Si on a une URL de paiement, rediriger
        if (response.payment_url) {
          window.location.href = response.payment_url;
        }
        // Si on a un code USSD, l'afficher
        else if (response.ussd_code) {
          toast.success(`Composez: ${response.ussd_code}`);
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
      toast.error(error.message || 'Erreur lors du paiement Orange Money');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Paiement Orange Money</h2>
            <p className="text-sm text-gray-600">Montant à payer: {montant} FCFA</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
              Numéro de téléphone Orange Money
            </label>
            <input
              type="tel"
              id="telephone"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+221 XX XXX XX XX"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Entrez le numéro associé à votre compte Orange Money
            </p>
          </div>

          {/* Info */}
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              Vous recevrez une notification Orange Money pour confirmer le paiement
            </p>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-700">Instructions:</p>
            <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
              <li>Composez #144# sur votre téléphone</li>
              <li>Sélectionnez "Payer"</li>
              <li>Confirmez le paiement avec votre code secret</li>
            </ol>
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
              className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Traitement...' : 'Payer'}
            </button>
          </div>
        </form>

        {/* Note */}
        <p className="mt-4 text-xs text-center text-gray-500">
          Paiement sécurisé par Orange Money • Vos données sont protégées
        </p>
      </div>
    </div>
  );
}
