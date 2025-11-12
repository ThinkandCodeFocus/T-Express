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
  async creer(data: CreerCommandeData): Promise<Commande> {
    const response = await apiClient.post<{ message: string; commande: Commande }>(
      API_CONFIG.endpoints.commande.creer,
      data,
      { requiresAuth: true }
    );
    return response.commande;
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
    const response = await apiClient.get<{ commandes: Commande[] }>(
      API_CONFIG.endpoints.admin.commandes.liste
    );
    return response.commandes;
  },

  /**
   * Détail d'une commande (admin)
   */
  async getDetailAdmin(id: number): Promise<Commande> {
    const response = await apiClient.get<{ commande: Commande }>(
      `${API_CONFIG.endpoints.admin.commandes.detail}/${id}`
    );
    return response.commande;
  },

  /**
   * Modifier le statut d'une commande (admin)
   */
  async updateStatus(id: number, statut: string): Promise<Commande> {
    const response = await apiClient.post<{ commande: Commande }>(
      API_CONFIG.endpoints.admin.commandes.updateStatus,
      { id, statut }
    );
    return response.commande;
  },
};
