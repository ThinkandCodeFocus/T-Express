/**
 * Service Commandes
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type {
  Commande,
  CreerCommandeData,
  PaginatedResponse,
} from '@/types/api.types';

export const commandeService = {
  /**
   * Créer une nouvelle commande (checkout)
   */
  async creer(data: CreerCommandeData): Promise<{ id: number; montant_total: number; numero_commande?: string }> {
    const response = await apiClient.post<{ 
      message: string; 
      commande_id: number; 
      montant: number;
    }>(
      API_CONFIG.endpoints.commande.creer,
      data,
      { requiresAuth: true }
    );
    
    // Le backend retourne commande_id et montant, pas l'objet commande complet
    return {
      id: response.commande_id,
      montant_total: response.montant,
      numero_commande: `CMD-${response.commande_id}`, // Générer temporairement
    };
  },

  /**
   * Récupérer l'historique des commandes
   */
  async getHistorique(page: number = 1, perPage: number = 10): Promise<PaginatedResponse<Commande>> {
    return apiClient.post<PaginatedResponse<Commande>>(
      API_CONFIG.endpoints.commande.historique,
      { page, per_page: perPage },
      { requiresAuth: true }
    );
  },

  /**
   * Récupérer le détail d'une commande
   */
  async getDetail(commandeId: number): Promise<Commande> {
    const response = await apiClient.post<{ commande: Commande }>(
      API_CONFIG.endpoints.commande.detail,
      { commande_id: commandeId },
      { requiresAuth: true }
    );
    return response.commande;
  },

  /**
   * Liste des commandes (admin)
   */
  async getListe(): Promise<Commande[]> {
    const response = await apiClient.post<{ data: Commande[]; meta?: any }>(
      API_CONFIG.endpoints.admin.commandes.liste,
      {},
      { requiresAuth: true }
    );
    return response.data || [];
  },

  /**
   * Détail d'une commande (admin)
   */
  async getDetailAdmin(id: number): Promise<Commande> {
    const response = await apiClient.post<{ commande: Commande }>(
      API_CONFIG.endpoints.admin.commandes.detail,
      { commande_id: id },
      { requiresAuth: true }
    );
    return response.commande;
  },

  /**
   * Modifier le statut d'une commande (admin)
   */
  async updateStatus(id: number, statut: string): Promise<Commande> {
    const response = await apiClient.post<{ commande: Commande }>(
      API_CONFIG.endpoints.admin.commandes.updateStatus,
      { commande_id: id, statut },
      { requiresAuth: true }
    );
    return response.commande;
  },
};
