/**
 * Service Admin
 * Gestion du dashboard administrateur
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type {
  AdminProduitData,
  AdminCategorieData,
  Produit,
  Categorie,
  Commande,
  DashboardStats,
  PaginatedResponse,
} from '@/types/api.types';

export const adminService = {
  // ========== Produits ==========
  
  /**
   * Récupérer la liste des produits (admin)
   */
  async getProduits(page: number = 1, perPage: number = 20): Promise<PaginatedResponse<Produit>> {
    return apiClient.post<PaginatedResponse<Produit>>(
      API_CONFIG.endpoints.admin.produits.liste,
      { page, per_page: perPage },
      { requiresAuth: true }
    );
  },

  /**
   * Créer un nouveau produit
   */
  async creerProduit(data: AdminProduitData): Promise<Produit> {
    const formData = this.buildProductFormData(data);
    
    const response = await apiClient.upload<{ message: string; produit: Produit }>(
      API_CONFIG.endpoints.admin.produits.creer,
      formData,
      { requiresAuth: true }
    );
    
    return response.produit;
  },

  /**
   * Modifier un produit
   */
  async modifierProduit(id: number, data: Partial<AdminProduitData>): Promise<Produit> {
    const formData = this.buildProductFormData(data);
    formData.append('produit_id', id.toString());
    
    const response = await apiClient.upload<{ message: string; produit: Produit }>(
      API_CONFIG.endpoints.admin.produits.modifier,
      formData,
      { requiresAuth: true }
    );
    
    return response.produit;
  },

  /**
   * Supprimer un produit
   */
  async supprimerProduit(id: number): Promise<void> {
    await apiClient.post(
      API_CONFIG.endpoints.admin.produits.supprimer,
      { produit_id: id },
      { requiresAuth: true }
    );
  },

  /**
   * Construire le FormData pour l'upload de produit
   */
  buildProductFormData(data: Partial<AdminProduitData>): FormData {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      
      if (key === 'images' && Array.isArray(value)) {
        (value as File[]).forEach((file) => {
          formData.append('images[]', file);
        });
      } else if (key === 'image_principale' && value instanceof File) {
        formData.append('image_principale', value);
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          formData.append(`${key}[]`, item.toString());
        });
      } else {
        formData.append(key, value.toString());
      }
    });
    
    return formData;
  },

  // ========== Catégories ==========
  
  /**
   * Récupérer la liste des catégories
   */
  async getCategories(): Promise<Categorie[]> {
    const response = await apiClient.post<{ categories: Categorie[] }>(
      API_CONFIG.endpoints.admin.categories.liste,
      {},
      { requiresAuth: true }
    );
    return response.categories;
  },

  /**
   * Créer une nouvelle catégorie
   */
  async creerCategorie(data: AdminCategorieData): Promise<Categorie> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    const response = await apiClient.upload<{ message: string; categorie: Categorie }>(
      API_CONFIG.endpoints.admin.categories.creer,
      formData,
      { requiresAuth: true }
    );
    
    return response.categorie;
  },

  /**
   * Modifier une catégorie
   */
  async modifierCategorie(id: number, data: Partial<AdminCategorieData>): Promise<Categorie> {
    const formData = new FormData();
    formData.append('categorie_id', id.toString());
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (value instanceof File) {
          formData.append(key, value);
        } else {
          formData.append(key, value.toString());
        }
      }
    });
    
    const response = await apiClient.upload<{ message: string; categorie: Categorie }>(
      API_CONFIG.endpoints.admin.categories.modifier,
      formData,
      { requiresAuth: true }
    );
    
    return response.categorie;
  },

  /**
   * Supprimer une catégorie
   */
  async supprimerCategorie(id: number): Promise<void> {
    await apiClient.post(
      API_CONFIG.endpoints.admin.categories.supprimer,
      { categorie_id: id },
      { requiresAuth: true }
    );
  },

  // ========== Commandes ==========
  
  /**
   * Récupérer la liste des commandes
   */
  async getCommandes(
    page: number = 1,
    perPage: number = 20,
    statut?: string
  ): Promise<PaginatedResponse<Commande>> {
    return apiClient.post<PaginatedResponse<Commande>>(
      API_CONFIG.endpoints.admin.commandes.liste,
      { page, per_page: perPage, statut },
      { requiresAuth: true }
    );
  },

  /**
   * Récupérer le détail d'une commande
   */
  async getCommandeDetail(id: number): Promise<Commande> {
    const response = await apiClient.post<{ commande: Commande }>(
      API_CONFIG.endpoints.admin.commandes.detail,
      { commande_id: id },
      { requiresAuth: true }
    );
    return response.commande;
  },

  /**
   * Mettre à jour le statut d'une commande
   */
  async updateCommandeStatus(
    id: number,
    statut: Commande['statut']
  ): Promise<Commande> {
    const response = await apiClient.post<{ message: string; commande: Commande }>(
      API_CONFIG.endpoints.admin.commandes.updateStatus,
      { commande_id: id, statut },
      { requiresAuth: true }
    );
    return response.commande;
  },

  // ========== Stock ==========
  
  /**
   * Récupérer la liste des stocks
   */
  async getStock(): Promise<any[]> {
    const response = await apiClient.post<{ stock: any[] }>(
      API_CONFIG.endpoints.admin.stock.liste,
      {},
      { requiresAuth: true }
    );
    return response.stock;
  },

  /**
   * Mettre à jour le stock d'un produit
   */
  async updateStock(produitId: number, quantite: number): Promise<void> {
    await apiClient.post(
      API_CONFIG.endpoints.admin.stock.update,
      { produit_id: produitId, quantite },
      { requiresAuth: true }
    );
  },

  // ========== Dashboard ==========
  
  /**
   * Récupérer les statistiques du dashboard
   */
  async getDashboardStats(): Promise<DashboardStats> {
    // TODO: Endpoint à créer côté backend
    const response = await apiClient.post<{ stats: DashboardStats }>(
      '/admin/dashboard/stats',
      {},
      { requiresAuth: true }
    );
    return response.stats;
  },
};
