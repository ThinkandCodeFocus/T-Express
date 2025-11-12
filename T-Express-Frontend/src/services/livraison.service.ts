/**
 * Service Livraisons (Admin)
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { Livraison } from '@/types/api.types';

export const livraisonService = {
  /**
   * Liste des livraisons (admin)
   */
  async getListe(): Promise<Livraison[]> {
    const response = await apiClient.get<{ livraisons: Livraison[] }>(
      API_CONFIG.endpoints.admin.livraisons.liste
    );
    return response.livraisons;
  },

  /**
   * Modifier le statut d'une livraison (admin)
   */
  async update(id: number, statut: string): Promise<Livraison> {
    const response = await apiClient.post<{ livraison: Livraison }>(
      API_CONFIG.endpoints.admin.livraisons.update,
      { id, statut }
    );
    return response.livraison;
  },
};
