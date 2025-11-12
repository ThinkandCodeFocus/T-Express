/**
 * Service Produits (Admin)
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { Produit } from '@/types/api.types';

export const produitService = {
  /**
   * Récupérer la liste des produits
   */
  async getListe(): Promise<Produit[]> {
    const response = await apiClient.get<{ produits: Produit[] }>(
      API_CONFIG.endpoints.admin.produits.liste
    );
    return response.produits;
  },

  /**
   * Récupérer le détail d'un produit
   */
  async getDetail(id: number): Promise<Produit> {
    const response = await apiClient.get<{ produit: Produit }>(
      `${API_CONFIG.endpoints.admin.produits.liste}/${id}`
    );
    return response.produit;
  },

  /**
   * Créer un produit
   */
  async creer(data: Partial<Produit>): Promise<Produit> {
    const response = await apiClient.post<{ produit: Produit }>(
      API_CONFIG.endpoints.admin.produits.creer,
      data
    );
    return response.produit;
  },

  /**
   * Modifier un produit
   */
  async modifier(id: number, data: Partial<Produit>): Promise<Produit> {
    const response = await apiClient.post<{ produit: Produit }>(
      API_CONFIG.endpoints.admin.produits.modifier,
      { id, ...data }
    );
    return response.produit;
  },

  /**
   * Supprimer un produit
   */
  async supprimer(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.admin.produits.supprimer,
      { id }
    );
  },
};
