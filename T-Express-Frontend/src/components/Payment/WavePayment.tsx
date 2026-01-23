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
  telephone?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function WavePayment({
  commandeId,
  montant,
  telephone: telephoneProp = '',
  onSuccess,
  onCancel,
}: WavePaymentProps) {
  const [telephone, setTelephone] = useState(telephoneProp);
  const [loading, setLoading] = useState(false);
  const [autoInitiated, setAutoInitiated] = useState(false);

  // Si le téléphone est fourni, initier automatiquement le paiement
  React.useEffect(() => {
    if (telephoneProp && !autoInitiated && validatePhone(telephoneProp)) {
      setAutoInitiated(true);
      initierPaiement(telephoneProp);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [telephoneProp, autoInitiated]);

  const initierPaiement = async (tel: string) => {
    setLoading(true);

    try {
      const data: InitierPaiementData = {
        commande_id: commandeId,
        mode_paiement: 'wave',
        telephone: normalizePhone(tel),
        return_url: `${window.location.origin}/payment-success?commande_id=${commandeId}`,
        cancel_url: `${window.location.origin}/checkout`,
      };

      console.log('📱 Initiation paiement Wave:', data);
      const response = await paiementService.initierWave(data);

      console.log('📱 Réponse Wave:', response);

      // Le backend retourne wave_launch_url pour ouvrir l'app Wave
      if (response.wave_launch_url) {
        toast.success('Redirection vers Wave...');
        // Redirection automatique vers l'application Wave
        window.location.href = response.wave_launch_url;
      } 
      // Fallback: si on a payment_url (ancien format)
      else if (response.payment_url) {
        window.location.href = response.payment_url;
      }
      // Si on a un code USSD, l'afficher
      else if (response.ussd_code) {
        toast.success(`Composez: ${response.ussd_code}`);
        setTimeout(() => {
          onSuccess();
        }, 5000);
      } 
      // Si aucune URL, afficher erreur
      else {
        toast.error(response.message || 'Aucune URL de paiement retournée');
      }
    } catch (error: any) {
      console.error('❌ Erreur paiement Wave:', error);
      
      // Gestion améliorée des messages d'erreur
      let errorMessage = 'Erreur lors du paiement Wave';
      
      if (error && typeof error === 'object') {
        if (error.message) {
          errorMessage = error.message;
        } else if (error.errors) {
          // Laravel validation errors
          const firstError = Object.values(error.errors)[0];
          if (Array.isArray(firstError)) {
            errorMessage = firstError[0];
          }
        }
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!validatePhone(telephone)) {
      toast.error('Numéro de téléphone invalide');
      return;
    }

    await initierPaiement(telephone);
  };

  // Si chargement automatique, afficher un loader
  if (loading && autoInitiated) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Initialisation du paiement...</h2>
            <p className="text-gray-600 text-center">Redirection vers Wave en cours...</p>
            <p className="text-sm text-gray-500 mt-2">Téléphone: {telephone}</p>
          </div>
        </div>
      </div>
    );
  }

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
