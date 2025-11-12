/**
 * Service Favoris/Wishlist
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { Favori, ToggleFavoriResponse } from '@/types/api.types';

export const favoriService = {
  /**
   * Ajouter ou retirer un produit des favoris
   */
  async toggle(produitId: number): Promise<ToggleFavoriResponse> {
    return apiClient.post<ToggleFavoriResponse>(
      API_CONFIG.endpoints.favoris.toggle,
      { produit_id: produitId },
      { requiresAuth: true }
    );
  },

  /**
   * Récupérer la liste des favoris
   */
  async getListe(): Promise<Favori[]> {
    const response = await apiClient.post<{ favoris: Favori[] }>(
      API_CONFIG.endpoints.favoris.liste,
      {},
      { requiresAuth: true }
    );
    return response.favoris;
  },

  /**
   * Liste des favoris (admin)
   */
  async getListeAdmin(): Promise<Favori[]> {
    const response = await apiClient.get<{ favoris: Favori[] }>(
      API_CONFIG.endpoints.admin.favoris.liste
    );
    return response.favoris;
  },

  /**
   * Supprimer un favori (admin)
   */
  async supprimerAdmin(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.admin.favoris.supprimer,
      { id }
    );
  },
};
