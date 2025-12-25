/**
 * Service Stock (Admin)
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { Stock } from '@/types/api.types';

export const stockService = {
  /**
   * Liste des stocks (admin)
   */
  async getListe(): Promise<Stock[]> {
    const response = await apiClient.post<{ stock: Stock[] }>(
      API_CONFIG.endpoints.admin.stock.liste,
      {},
      { requiresAuth: true }
    );
    return response.stock;
  },

  /**
   * Modifier un stock (admin)
   */
  async update(produitId: number, quantite: number): Promise<Stock> {
    return apiClient.post<Stock>(
      API_CONFIG.endpoints.admin.stock.update,
      {
        produit_id: produitId,
        quantite,
      },
      { requiresAuth: true }
    );
  },
};
