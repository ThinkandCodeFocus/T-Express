/**
 * Service Client/Profil
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { Client, UpdateClientData } from '@/types/api.types';

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
   * Mettre à jour le profil
   */
  async updateProfil(data: UpdateClientData): Promise<Client> {
    const response = await apiClient.post<{ client: Client; message: string }>(
      API_CONFIG.endpoints.client.update,
      data,
      { requiresAuth: true }
    );
    return response.client;
  },

  /**
   * Liste des clients (admin)
   */
  async getListe(): Promise<Client[]> {
    const response = await apiClient.get<{ clients: Client[] }>(
      API_CONFIG.endpoints.admin.clients.liste
    );
    return response.clients;
  },

  /**
   * Créer un client (admin)
   */
  async creer(data: Partial<Client>): Promise<Client> {
    const response = await apiClient.post<{ client: Client }>(
      API_CONFIG.endpoints.admin.clients.creer,
      data
    );
    return response.client;
  },

  /**
   * Modifier un client (admin)
   */
  async modifier(id: number, data: Partial<Client>): Promise<Client> {
    const response = await apiClient.post<{ client: Client }>(
      API_CONFIG.endpoints.admin.clients.modifier,
      { id, ...data }
    );
    return response.client;
  },

  /**
   * Supprimer un client (admin)
   */
  async supprimer(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.admin.clients.supprimer,
      { id }
    );
  },
};
