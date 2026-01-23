/**
 * Service Adresses
 */

import { apiClient } from '@/lib/api-client';
import { API_CONFIG } from '@/config/api.config';
import type { Adresse, AjouterAdresseData } from '@/types/api.types';

export const adresseService = {
  /**
   * Récupérer la liste des adresses du client
   */
  async getListe(): Promise<Adresse[]> {
    const response = await apiClient.post<{ adresses: Adresse[] }>(
      API_CONFIG.endpoints.adresses.liste,
      {},
      { requiresAuth: true }
    );
    return response.adresses;
  },

  /**
   * Ajouter une nouvelle adresse
   */
  async ajouter(data: AjouterAdresseData): Promise<Adresse> {
    // Transformer les noms de champs pour le backend Laravel
    const backendData = {
      type: data.type,
      nom_complet: data.nom_complet,
      telephone: data.telephone,
      ligne1: data.adresse_ligne_1,  // Backend attend ligne1
      ligne2: data.adresse_ligne_2,  // Backend attend ligne2
      ville: data.ville,
      region: data.region,
      code_postal: data.code_postal,
      pays: data.pays,
      par_defaut: data.par_defaut,
    };

    const response = await apiClient.post<{ message: string; adresse: Adresse }>(
      API_CONFIG.endpoints.adresses.ajouter,
      backendData,
      { requiresAuth: true }
    );
    return response.adresse;
  },

  /**
   * Supprimer une adresse
   */
  async supprimer(adresseId: number): Promise<void> {
    await apiClient.post(
      API_CONFIG.endpoints.adresses.supprimer,
      { adresse_id: adresseId },
      { requiresAuth: true }
    );
  },

  /**
   * Récupérer les adresses de livraison
   */
  async getAdressesLivraison(): Promise<Adresse[]> {
    const adresses = await this.getListe();
    return adresses.filter((a) => a.type === 'livraison');
  },

  /**
   * Récupérer les adresses de facturation
   */
  async getAdressesFacturation(): Promise<Adresse[]> {
    const adresses = await this.getListe();
    return adresses.filter((a) => a.type === 'facturation');
  },

  /**
   * Récupérer l'adresse par défaut
   */
  async getAdresseParDefaut(type?: 'livraison' | 'facturation'): Promise<Adresse | null> {
    const adresses = await this.getListe();
    const filtered = type ? adresses.filter((a) => a.type === type) : adresses;
    return filtered.find((a) => a.par_defaut) || null;
  },

  /**
   * Service Adresses (Admin)
   */

  /**
   * Liste des adresses (admin)
   */
  async getListeAdmin(): Promise<Adresse[]> {
    const response = await apiClient.post<{ adresses: Adresse[] }>(
      API_CONFIG.endpoints.admin.adresses.liste,
      {},
      { requiresAuth: true }
    );
    return response.adresses;
  },

  /**
   * Supprimer une adresse (admin)
   */
  async supprimerAdmin(id: number): Promise<{ message: string }> {
    return apiClient.post<{ message: string }>(
      API_CONFIG.endpoints.admin.adresses.supprimer,
      { id },
      { requiresAuth: true }
    );
  },
};
