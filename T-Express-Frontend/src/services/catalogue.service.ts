/**
 * Service Catalogue/Produits
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type {
  Produit,
  RechercheFilters,
  PaginatedResponse,
} from '@/types/api.types';

export const catalogueService = {
  /**
   * Récupérer la liste initiale des produits (page d'accueil)
   */
  async getIndex(perPage: number = 20): Promise<PaginatedResponse<Produit>> {
    return apiClient.post<PaginatedResponse<Produit>>(
      API_CONFIG.endpoints.catalogue.index,
      { per_page: perPage }
    );
  },

  /**
   * Rechercher des produits avec filtres
   */
  async rechercher(filters: RechercheFilters): Promise<PaginatedResponse<Produit>> {
    return apiClient.post<PaginatedResponse<Produit>>(
      API_CONFIG.endpoints.catalogue.rechercher,
      filters
    );
  },

  /**
   * Récupérer le détail d'un produit
   */
  async getDetail(produitId: number): Promise<Produit> {
    const response = await apiClient.post<{ produit: Produit }>(
      API_CONFIG.endpoints.catalogue.detail,
      { produit_id: produitId }
    );
    return response.produit;
  },

  /**
   * Récupérer les produits en vedette
   */
  async getFeatured(limit: number = 10): Promise<Produit[]> {
    const response = await this.rechercher({
      en_vedette: true,
      per_page: limit,
    });
    return response.data;
  },

  /**
   * Récupérer les nouveaux produits
   */
  async getNew(limit: number = 10): Promise<Produit[]> {
    const response = await this.rechercher({
      nouveau: true,
      tri: 'recent',
      per_page: limit,
    });
    return response.data;
  },

  /**
   * Récupérer les produits en promotion
   */
  async getPromo(limit: number = 10): Promise<Produit[]> {
    const response = await this.rechercher({
      en_promo: true,
      per_page: limit,
    });
    return response.data;
  },

  /**
   * Récupérer les produits par catégorie
   */
  async getByCategorie(
    categorieId: number,
    filters?: Partial<RechercheFilters>
  ): Promise<PaginatedResponse<Produit>> {
    return this.rechercher({
      categorie_id: categorieId,
      ...filters,
    });
  },
};
