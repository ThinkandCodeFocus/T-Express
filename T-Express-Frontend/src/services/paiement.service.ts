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
};
