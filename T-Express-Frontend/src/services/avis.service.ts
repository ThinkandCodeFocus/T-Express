/**
 * Service Avis/Reviews
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { SoumettreAvisData, Avis } from '@/types/api.types';

export const avisService = {
  /**
   * Soumettre un avis sur un produit
   */
  async soumettre(data: SoumettreAvisData): Promise<Avis> {
    const response = await apiClient.post<{ message: string; avis: Avis }>(
      API_CONFIG.endpoints.avis.soumettre,
      data,
      { requiresAuth: true }
    );
    return response.avis;
  },

  /**
   * Liste des avis (admin)
   */
  async getListe(): Promise<Avis[]> {
    const response = await apiClient.get<{ avis: Avis[] }>(
      API_CONFIG.endpoints.admin.avis.liste
    );
    return response.avis;
  },

  /**
   * Supprimer un avis (admin)
   */
  async supprimer(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.admin.avis.supprimer,
      { id }
    );
  },
};
