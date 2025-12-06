/**
 * Service Livraisons (Admin)
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { Livraison } from '@/types/api.types';

export const livraisonService = {
  /**
   * Récupérer la liste des livraisons
   */
  async getListe(page: number = 1, perPage: number = 20, statut?: string): Promise<any> {
    return apiClient.post(
      API_CONFIG.endpoints.admin.livraisons.liste,
      { page, per_page: perPage, statut },
      { requiresAuth: true }
    );
  },

  /**
   * Récupérer le détail d'une livraison
   */
  async getDetail(id: number): Promise<Livraison> {
    const response = await apiClient.post<{ livraison: Livraison }>(
      API_CONFIG.endpoints.admin.livraisons.detail,
      { livraison_id: id },
      { requiresAuth: true }
    );
    return response.livraison;
  },

  /**
   * Modifier le statut d'une livraison
   */
  async modifierStatut(
    id: number,
    statut: string,
    numeroSuivi?: string,
    dateLivraisonPrevue?: string
  ): Promise<Livraison> {
    const response = await apiClient.post<{ livraison: Livraison }>(
      API_CONFIG.endpoints.admin.livraisons.modifierStatut,
      {
        livraison_id: id,
        statut,
        numero_suivi: numeroSuivi,
        date_livraison_prevue: dateLivraisonPrevue,
      },
      { requiresAuth: true }
    );
    return response.livraison;
  },

  /**
   * Supprimer une livraison
   */
  async supprimer(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.admin.livraisons.supprimer,
      { livraison_id: id },
      { requiresAuth: true }
    );
  },
};
