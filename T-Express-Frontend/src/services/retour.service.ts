/**
 * Service Retours
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { DemanderRetourData, RetourCommande } from '@/types/api.types';

export const retourService = {
  /**
   * Demander un retour de commande
   */
  async demander(data: DemanderRetourData): Promise<RetourCommande> {
    const response = await apiClient.post<{ message: string; retour: RetourCommande }>(
      API_CONFIG.endpoints.retour.demander,
      data,
      { requiresAuth: true }
    );
    return response.retour;
  },

  /**
   * Liste des retours (admin)
   */
  async getListe(): Promise<RetourCommande[]> {
    const response = await apiClient.get<{ retours: RetourCommande[] }>(
      API_CONFIG.endpoints.admin.retours.liste
    );
    return response.retours;
  },

  /**
   * Valider un retour (admin)
   */
  async valider(id: number): Promise<RetourCommande> {
    const response = await apiClient.post<{ retour: RetourCommande }>(
      API_CONFIG.endpoints.admin.retours.valider,
      { id }
    );
    return response.retour;
  },

  /**
   * Refuser un retour (admin)
   */
  async refuser(id: number): Promise<RetourCommande> {
    const response = await apiClient.post<{ retour: RetourCommande }>(
      API_CONFIG.endpoints.admin.retours.refuser,
      { id }
    );
    return response.retour;
  },

  /**
   * Supprimer un retour (admin)
   */
  async supprimer(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.admin.retours.supprimer,
      { id }
    );
  },
};
