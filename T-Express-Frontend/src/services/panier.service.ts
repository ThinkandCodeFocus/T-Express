/**
 * Service Panier
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type {
  PanierContenu,
  AjouterPanierData,
  MettreAJourPanierData,
} from '@/types/api.types';

export const panierService = {
  /**
   * Récupérer le contenu du panier
   */
  async getContenu(): Promise<PanierContenu> {
    return apiClient.post<PanierContenu>(
      API_CONFIG.endpoints.panier.contenu,
      {},
      { requiresAuth: true }
    );
  },

  /**
   * Ajouter un produit au panier
   */
  async ajouter(data: AjouterPanierData): Promise<PanierContenu> {
    const response = await apiClient.post<{ message: string; panier: PanierContenu }>(
      API_CONFIG.endpoints.panier.ajouter,
      data,
      { requiresAuth: true }
    );
    return response.panier;
  },

  /**
   * Mettre à jour la quantité d'un article
   */
  async mettreAJour(data: MettreAJourPanierData): Promise<PanierContenu> {
    const response = await apiClient.post<{ message: string; panier: PanierContenu }>(
      API_CONFIG.endpoints.panier.mettreAJour,
      data,
      { requiresAuth: true }
    );
    return response.panier;
  },

  /**
   * Supprimer un article du panier
   */
  async supprimer(lignePanierId: number): Promise<PanierContenu> {
    const response = await apiClient.post<{ message: string; panier: PanierContenu }>(
      API_CONFIG.endpoints.panier.supprimer,
      { ligne_panier_id: lignePanierId },
      { requiresAuth: true }
    );
    return response.panier;
  },

  /**
   * Vider le panier (supprimer tous les articles)
   */
  async vider(): Promise<void> {
    const contenu = await this.getContenu();
    await Promise.all(
      contenu.lignes.map((ligne) => this.supprimer(ligne.id))
    );
  },
};
