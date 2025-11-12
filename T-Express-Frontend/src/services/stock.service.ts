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
    const response = await apiClient.get<{ stocks: Stock[] }>(
      API_CONFIG.endpoints.admin.stock.liste
    );
    return response.stocks;
  },

  /**
   * Modifier un stock (admin)
   */
  async update(id: number, quantite_disponible: number): Promise<Stock> {
    const response = await apiClient.post<{ stock: Stock }>(
      API_CONFIG.endpoints.admin.stock.update,
      { id, quantite_disponible }
    );
    return response.stock;
  },
};
