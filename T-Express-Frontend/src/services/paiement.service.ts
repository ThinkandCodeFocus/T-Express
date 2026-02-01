/**
 * Service Paiements (Admin)
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { Paiement } from '@/types/api.types';

export const paiementService = {
  /**
   * Récupérer la liste des paiements
   */
  async getListe(page: number = 1, perPage: number = 20, filters?: {
    statut?: string;
    methode?: string;
  }): Promise<any> {
    return apiClient.post(
      API_CONFIG.endpoints.admin.paiements.liste,
      { page, per_page: perPage, ...filters },
      { requiresAuth: true }
    );
  },

  /**
   * Récupérer le détail d'un paiement
   */
  async getDetail(id: number): Promise<Paiement> {
    const response = await apiClient.post<{ paiement: Paiement }>(
      API_CONFIG.endpoints.admin.paiements.detail,
      { paiement_id: id },
      { requiresAuth: true }
    );
    return response.paiement;
  },

  /**
   * Modifier le statut d'un paiement
   */
  async modifierStatut(id: number, statut: string): Promise<Paiement> {
    const response = await apiClient.post<{ paiement: Paiement }>(
      API_CONFIG.endpoints.admin.paiements.modifierStatut,
      { paiement_id: id, statut },
      { requiresAuth: true }
    );
    return response.paiement;
  },

  /**
   * Supprimer un paiement
   */
  async supprimer(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.admin.paiements.supprimer,
      { paiement_id: id },
      { requiresAuth: true }
    );
  },

  /**
   * Initier un paiement Wave
   */
  async initierWave(data: {
    commande_id: number;
    mode_paiement?: string;
    telephone?: string;
    return_url?: string;
    cancel_url?: string;
  }): Promise<{
    message: string;
    wave_launch_url?: string;
    payment_url?: string;
    ussd_code?: string;
    transaction_id?: string;
    client_reference?: string;
    paiement_id?: number;
    montant_base?: number;
    frais_service?: number;
    montant_total?: number;
    devise?: string;
  }> {
    return apiClient.post(
      '/wave/initier',
      data,
      { requiresAuth: true }
    );
  },

  /**
   * Vérifier le statut d'un paiement Wave
   */
  async verifierStatut(commandeId: number): Promise<{
    message: string;
    statut_paiement: string;
    statut_commande: string;
    wave_status?: string;
  }> {
    return apiClient.post(
      '/wave/verifier',
      { commande_id: commandeId },
      { requiresAuth: false }
    );
  },

  /**
   * Initier un paiement Orange Money
   */
  async initierOrangeMoney(data: {
    commande_id: number;
    mode_paiement: string;
    telephone?: string;
    return_url?: string;
    cancel_url?: string;
  }): Promise<{
    success: boolean;
    message?: string;
    payment_url?: string;
    ussd_code?: string;
    transaction_id?: string;
  }> {
    return apiClient.post(
      '/api/orange-money/initier',
      data,
      { requiresAuth: true }
    );
  },

  /**
   * Vérifier le statut d'un paiement
   */
  async verifierStatutParTransaction(transactionId: string): Promise<{
    success: boolean;
    statut: string;
    message?: string;
  }> {
    return apiClient.post(
      '/api/wave/verifier',
      { transaction_id: transactionId },
      { requiresAuth: false }
    );
  },

  /**
   * Récupérer les statistiques des paiements (admin)
   */
  async getStats(): Promise<{
    total_paiements: number;
    paiements_reussis: number;
    paiements_en_attente: number;
    paiements_echoues: number;
    montant_total: number;
    frais_total: number;
  }> {
    return apiClient.post(
      API_CONFIG.endpoints.admin.paiements.stats,
      {},
      { requiresAuth: true }
    );
  },
};
