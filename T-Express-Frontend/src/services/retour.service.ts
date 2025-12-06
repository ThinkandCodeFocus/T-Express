/**
 * Service Retours (Admin)
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { RetourCommande } from '@/types/api.types';

export const retourService = {
  /**
   * Récupérer la liste des retours
   */
  async getListe(page: number = 1, perPage: number = 20, statut?: string): Promise<any> {
    return apiClient.post(
      API_CONFIG.endpoints.admin.retours.liste,
      { page, per_page: perPage, statut },
      { requiresAuth: true }
    );
  },

  /**
   * Récupérer le détail d'un retour
   */
  async getDetail(id: number): Promise<RetourCommande> {
    const response = await apiClient.post<{ retour: RetourCommande }>(
      API_CONFIG.endpoints.admin.retours.detail,
      { retour_id: id },
      { requiresAuth: true }
    );
    return response.retour;
  },

  /**
   * Approuver un retour
   */
  async approuver(id: number): Promise<RetourCommande> {
    const response = await apiClient.post<{ retour: RetourCommande }>(
      API_CONFIG.endpoints.admin.retours.approuver,
      { retour_id: id },
      { requiresAuth: true }
    );
    return response.retour;
  },

  /**
   * Refuser un retour
   */
  async refuser(id: number, raison?: string): Promise<RetourCommande> {
    const response = await apiClient.post<{ retour: RetourCommande }>(
      API_CONFIG.endpoints.admin.retours.refuser,
      { retour_id: id, raison },
      { requiresAuth: true }
    );
    return response.retour;
  },

  /**
   * Supprimer un retour
   */
  async supprimer(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.admin.retours.supprimer,
      { retour_id: id },
      { requiresAuth: true }
    );
  },
};
