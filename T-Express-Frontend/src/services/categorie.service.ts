/**
 * Service Catégories
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { Categorie } from '@/types/api.types';

export const categorieService = {
  /**
   * Récupérer la liste des catégories
   */
  async getListe(): Promise<Categorie[]> {
    const response = await apiClient.post<{ categories: Categorie[] }>(
      API_CONFIG.endpoints.categories.liste,
      {}
    );
    return response.categories || [];
  },

  /**
   * Récupérer le détail d'une catégorie
   */
  async getDetail(categorieId: number): Promise<Categorie> {
    const response = await apiClient.post<{ categorie: Categorie }>(
      API_CONFIG.endpoints.categories.detail,
      { categorie_id: categorieId }
    );
    return response.categorie;
  },

  /**
   * Créer une catégorie (Admin)
   */
  async creer(data: Partial<Categorie>): Promise<Categorie> {
    const response = await apiClient.post<{ categorie: Categorie }>(
      API_CONFIG.endpoints.admin.categories.creer,
      data,
      { requiresAuth: true }
    );
    return response.categorie;
  },

  /**
   * Modifier une catégorie (Admin)
   */
  async modifier(id: number, data: Partial<Categorie>): Promise<Categorie> {
    const response = await apiClient.post<{ categorie: Categorie }>(
      API_CONFIG.endpoints.admin.categories.modifier,
      { categorie_id: id, ...data },
      { requiresAuth: true }
    );
    return response.categorie;
  },

  /**
   * Supprimer une catégorie (Admin)
   */
  async supprimer(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.admin.categories.supprimer,
      { categorie_id: id },
      { requiresAuth: true }
    );
  },
};
