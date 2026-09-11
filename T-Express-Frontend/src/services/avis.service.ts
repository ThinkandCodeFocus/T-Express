/**
 * Service Avis (Admin, sauf getRecents qui est public)
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { Avis } from '@/types/api.types';
import type { Testimonial } from '@/types/testimonial';

export const avisService = {
  /**
   * Avis récents bien notés (4+) et commentés, pour la page d'accueil
   */
  async getRecents(limite: number = 6): Promise<Testimonial[]> {
    const response = await apiClient.post<{ avis: Testimonial[] }>(
      API_CONFIG.endpoints.avis.recents,
      { limite }
    );
    return response.avis ?? [];
  },

  /**
   * Récupérer la liste des avis
   */
  async getListe(page: number = 1, perPage: number = 20, filters?: {
    produit_id?: number;
    client_id?: number;
    note?: number;
  }): Promise<any> {
    return apiClient.post(
      API_CONFIG.endpoints.admin.avis.liste,
      { page, per_page: perPage, ...filters },
      { requiresAuth: true }
    );
  },

  /**
   * Récupérer le détail d'un avis
   */
  async getDetail(id: number): Promise<Avis> {
    const response = await apiClient.post<{ avis: Avis }>(
      API_CONFIG.endpoints.admin.avis.detail,
      { avis_id: id },
      { requiresAuth: true }
    );
    return response.avis;
  },

  /**
   * Modifier un avis
   */
  async modifier(id: number, data: Partial<Avis>): Promise<Avis> {
    const response = await apiClient.post<{ avis: Avis }>(
      API_CONFIG.endpoints.admin.avis.modifier,
      { avis_id: id, ...data },
      { requiresAuth: true }
    );
    return response.avis;
  },

  /**
   * Supprimer un avis
   */
  async supprimer(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.admin.avis.supprimer,
      { avis_id: id },
      { requiresAuth: true }
    );
  },
};
