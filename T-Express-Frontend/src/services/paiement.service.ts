/**
 * Service Paiement (Wave & Orange Money)
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG, PAYMENT_CONFIG } from '@/config/api.config';
import type { InitierPaiementData, PaiementResponse, Paiement } from '@/types/api.types';

export const paiementService = {
  /**
   * Initier un paiement Wave
   */
  async initierWave(data: InitierPaiementData): Promise<PaiementResponse> {
    if (!PAYMENT_CONFIG.wave.enabled) {
      throw new Error('Le paiement Wave n\'est pas activé');
    }

    // TODO: Implémenter l'intégration Wave
    // Ceci est un placeholder qui devra être remplacé par l'équipe fintech
    return {
      success: false,
      message: 'Intégration Wave en cours de développement',
    };
  },

  /**
   * Initier un paiement Orange Money
   */
  async initierOrangeMoney(data: InitierPaiementData): Promise<PaiementResponse> {
    if (!PAYMENT_CONFIG.orangeMoney.enabled) {
      throw new Error('Le paiement Orange Money n\'est pas activé');
    }

    // TODO: Implémenter l'intégration Orange Money
    // Ceci est un placeholder qui devra être remplacé par l'équipe fintech
    return {
      success: false,
      message: 'Intégration Orange Money en cours de développement',
    };
  },

  /**
   * Vérifier le statut d'un paiement
   */
  async verifierStatut(transactionId: string): Promise<{
    statut: 'en_attente' | 'complete' | 'echoue';
    message?: string;
  }> {
    // TODO: Implémenter la vérification du statut
    // Ceci est un placeholder
    return {
      statut: 'en_attente',
      message: 'Vérification du statut en cours...',
    };
  },

  /**
   * Gérer le webhook de paiement
   */
  async handleWebhook(provider: 'wave' | 'orange_money', data: any): Promise<void> {
    // TODO: Implémenter la gestion des webhooks
    // Ceci sera géré côté backend, ce service est pour référence
    console.log(`Webhook ${provider} reçu:`, data);
  },

  /**
   * Service Paiement (Admin)
   */

  /**
   * Liste des paiements (admin)
   */
  async getListe(): Promise<Paiement[]> {
    const response = await apiClient.get<{ paiements: Paiement[] }>(
      API_CONFIG.endpoints.admin.paiements.liste
    );
    return response.paiements;
  },

  /**
   * Supprimer un paiement (admin)
   */
  async supprimer(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.admin.paiements.supprimer,
      { id }
    );
  },
};
