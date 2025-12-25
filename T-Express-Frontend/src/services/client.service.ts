/**
 * Service Clients (Admin)
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { Client } from '@/types/api.types';

export const clientService = {
  /**
   * Récupérer le profil du client connecté
   */
  async getProfil(): Promise<Client> {
    const response = await apiClient.post<{ client: Client }>(
      API_CONFIG.endpoints.client.profile,
      {},
      { requiresAuth: true }
    );
    return response.client;
  },

  /**
   * Récupérer la liste des clients
   */
  async getListe(page: number = 1, perPage: number = 20, recherche?: string): Promise<any> {
    return apiClient.post(
      API_CONFIG.endpoints.admin.clients.liste,
      { page, per_page: perPage, recherche },
      { requiresAuth: true }
    );
  },

  /**
   * Récupérer le détail d'un client
   */
  async getDetail(id: number): Promise<Client> {
    const response = await apiClient.post<{ client: Client }>(
      API_CONFIG.endpoints.admin.clients.detail,
      { client_id: id },
      { requiresAuth: true }
    );
    return response.client;
  },

  /**
   * Créer un client
   */
  async creer(data: Partial<Client & { password: string }>): Promise<Client> {
    const response = await apiClient.post<{ client: Client }>(
      API_CONFIG.endpoints.admin.clients.creer,
      data,
      { requiresAuth: true }
    );
    return response.client;
  },

  /**
   * Modifier un client
   */
  async modifier(id: number, data: Partial<Client & { password?: string }>): Promise<Client> {
    const response = await apiClient.post<{ client: Client }>(
      API_CONFIG.endpoints.admin.clients.modifier,
      { client_id: id, ...data },
      { requiresAuth: true }
    );
    return response.client;
  },

  /**
   * Supprimer un client
   */
  async supprimer(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.admin.clients.supprimer,
      { client_id: id },
      { requiresAuth: true }
    );
  },
};
